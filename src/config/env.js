/**
 * Environment configuration
 * Reads from Vite environment variables
 */

export const env = {
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || '',
  USE_MOCK_DATA: import.meta.env.VITE_USE_MOCK_DATA === 'true' || false,
  MOCK_DELAY: parseInt(import.meta.env.VITE_MOCK_DELAY || '500', 10),
  API_TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000', 10),
  ENABLE_API_LOGGING: import.meta.env.VITE_ENABLE_API_LOGGING === 'true' || false,
  
  // Environment
  MODE: import.meta.env.MODE, // 'development' | 'production'
  DEV: import.meta.env.DEV,
  PROD: import.meta.env.PROD,
};

// Log environment status
if (env.ENABLE_API_LOGGING) {
  if (env.USE_MOCK_DATA) {
    console.info('%c🔧 Mock Data Mode Enabled', 'color: #4A90E2; font-weight: bold; font-size: 14px;');
    console.info('%cYou can login with any email and password', 'color: #666; font-size: 12px;');
  } else {
    console.info('%c🌐 API Mode Enabled', 'color: #10b981; font-weight: bold; font-size: 14px;');
    console.info(`%cAPI Base URL: ${env.API_BASE_URL}`, 'color: #666; font-size: 12px;');
  }
}

export default env;

