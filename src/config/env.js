/**
 * Environment configuration
 * Reads from Vite environment variables
 */

export const env = {
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || '',
  API_TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000', 10),
  ENABLE_API_LOGGING: import.meta.env.VITE_ENABLE_API_LOGGING === 'true' || false,
  
  // Environment
  MODE: import.meta.env.MODE, // 'development' | 'production'
  DEV: import.meta.env.DEV,
  PROD: import.meta.env.PROD,
};

// Log environment status
if (env.ENABLE_API_LOGGING) {
  console.info('%c🌐 API Mode Enabled', 'color: #10b981; font-weight: bold; font-size: 14px;');
  console.info(`%cAPI Base URL: ${env.API_BASE_URL}`, 'color: #666; font-size: 12px;');
}

export default env;

