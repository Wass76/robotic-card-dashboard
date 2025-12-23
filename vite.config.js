import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * PROXY LOGGING CHECKLIST
 * ========================
 * When debugging proxy issues, check these logs in order:
 * 
 * 1. [PROXY-INIT] - Startup logs showing:
 *    - Mode (dev/prod)
 *    - Raw API base URL from env
 *    - Normalized API base URL (trailing slash removed)
 *    - Whether base URL already contains /api suffix
 * 
 * 2. [PROXY-IN] - Incoming browser request:
 *    - Method and original URL from browser
 *    - Sanitized request headers (tokens/passwords redacted)
 * 
 * 3. [PROXY-OUT] - Outgoing proxy request:
 *    - Computed final target URL (after rewrite)
 *    - Sanitized outgoing headers
 *    - Check for double /api paths here
 * 
 * 4. [PROXY-RES] - Backend response:
 *    - Status code (400+ are error responses)
 *    - Sanitized response headers
 * 
 * 5. [PROXY-ERR] - Proxy layer errors:
 *    - Error code and message
 *    - Stack trace
 *    - Returns 502 to distinguish from backend 500
 * 
 * COMMON ISSUES TO CHECK:
 * - Double /api: Look for /api/api/ in [PROXY-OUT] target URL
 * - Wrong target: Compare [PROXY-OUT] target with Postman URL
 * - TLS errors: Check [PROXY-ERR] for ECONNREFUSED, ENOTFOUND, etc.
 * - Backend 500: Check [PROXY-RES] status code (not [PROXY-ERR])
 */

/**
 * Sanitizes headers by redacting sensitive values
 * @param {Object} headers - Headers object to sanitize
 * @returns {Object} - New object with redacted sensitive values
 */
function sanitizeHeaders(headers) {
  const sensitiveKeys = ['authorization', 'cookie', 'set-cookie', 'x-api-key'];
  const sanitized = { ...headers };
  
  for (const key in sanitized) {
    const lowerKey = key.toLowerCase();
    // Check if key matches sensitive patterns
    if (
      sensitiveKeys.some(sk => lowerKey.includes(sk)) ||
      lowerKey.includes('token')
    ) {
      sanitized[key] = '[REDACTED]';
    }
  }
  
  return sanitized;
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // eslint-disable-next-line no-undef
  const env = loadEnv(mode, process.cwd(), '')
  
  // Get API base URL from environment or use default
  const rawBaseUrl = env.VITE_API_BASE_URL || 'https://api-cards-robotic-club.tech-sauce.com'
  
  // Normalize: remove trailing slash
  const apiBaseUrl = rawBaseUrl.replace(/\/$/, '')
  
  // Check if base URL already contains /api suffix
  const baseHasApiSuffix = apiBaseUrl.endsWith('/api')
  
  // Print startup configuration
  console.log('\n[PROXY-INIT] Vite Proxy Configuration:')
  console.log('  Mode:', mode)
  console.log('  Raw API Base URL:', rawBaseUrl)
  console.log('  Normalized API Base URL:', apiBaseUrl)
  console.log('  Base has /api suffix:', baseHasApiSuffix)
  console.log('')
  
  return {
    plugins: [react()],
    server: {
      port: 3000,
      host: '0.0.0.0',
      strictPort: false,
      proxy: {
        '/api': {
          target: apiBaseUrl,
          changeOrigin: true,
          secure: true,
          // Rewrite logic: if base already has /api, strip it from incoming path
          // Otherwise, keep the path as-is
          rewrite: (path) => {
            if (baseHasApiSuffix) {
              // Base URL already has /api, so strip /api from incoming path
              const rewritten = path.replace(/^\/api/, '')
              console.log(`[PROXY-REWRITE] Stripping /api prefix: ${path} -> ${rewritten}`)
              return rewritten
            }
            // Base URL doesn't have /api, keep path unchanged
            return path
          },
          configure: (proxy, _options) => {
            // Handle proxy errors (connection failures, TLS errors, etc.)
            proxy.on('error', (err, req, res) => {
              console.error('\n[PROXY-ERR] Proxy Error Occurred:')
              console.error('  Error Message:', err.message)
              console.error('  Error Code:', err.code)
              console.error('  Request URL:', req.url)
              if (err.stack) {
                console.error('  Stack Trace:', err.stack)
              }
              
              // Send explicit 502 response to distinguish from backend 500
              if (!res.headersSent) {
                res.writeHead(502, { 'Content-Type': 'text/plain' })
                res.end(`Proxy error: ${err.message}`)
              }
            })
            
            // Log incoming browser request
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              // Compute final target URL
              const rewrittenPath = baseHasApiSuffix 
                ? req.url.replace(/^\/api/, '')
                : req.url
              const finalTargetUrl = `${apiBaseUrl}${rewrittenPath}`
              
              // Get sanitized headers
              const outgoingHeaders = sanitizeHeaders(proxyReq.getHeaders())
              
              console.log('\n[PROXY-IN] Incoming Browser Request:')
              console.log('  Method:', req.method)
              console.log('  Original URL:', req.url)
              console.log('  Sanitized Request Headers:', JSON.stringify(sanitizeHeaders(req.headers), null, 2))
              
              console.log('\n[PROXY-OUT] Outgoing Proxy Request:')
              console.log('  Computed Target URL:', finalTargetUrl)
              console.log('  Rewritten Path:', rewrittenPath)
              console.log('  Sanitized Outgoing Headers:', JSON.stringify(outgoingHeaders, null, 2))
              
              // Optional: Make proxy behave more like Postman
              // Remove Origin header (browser-specific)
              proxyReq.removeHeader('origin')
              
              // Set Accept to */* (like Postman)
              proxyReq.setHeader('accept', '*/*')
              
              // Ensure Content-Type is application/json if body exists
              if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
                const contentType = proxyReq.getHeader('content-type')
                if (!contentType || !contentType.includes('application/json')) {
                  proxyReq.setHeader('content-type', 'application/json')
                }
              }
              
              // Log body info (but not actual content)
              if (req.body) {
                console.log('  Body: [REDACTED - contains request payload]')
              }
            })
            
            // Log backend response
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              const sanitizedResHeaders = sanitizeHeaders(proxyRes.headers)
              
              console.log('\n[PROXY-RES] Backend Response:')
              console.log('  Status Code:', proxyRes.statusCode)
              console.log('  Request URL:', req.url)
              console.log('  Sanitized Response Headers:', JSON.stringify(sanitizedResHeaders, null, 2))
              
              if (proxyRes.statusCode >= 400) {
                console.error('  ⚠️ ERROR RESPONSE (Status >= 400)')
              }
            })
            
            // Handle WebSocket proxy requests
            proxy.on('proxyReqWs', (proxyReq, req, socket) => {
              console.log('[PROXY-WS] WebSocket proxy request:', req.url)
            })
          },
        },
      },
    },
  }
})
