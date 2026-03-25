/**
 * Frontend Configuration
 * CHANGE THIS ONE LINE to switch between local and deployed backends
 */

// Create global config object
window.APP_CONFIG = {
  // Local development (default)
  API_BASE_URL: 'http://localhost:3001/api',

  // Production deployment (uncomment to use)
  // API_BASE_URL: 'https://your-deployed-backend.com/api',

  // Add more config as needed
  DEBUG: false
};
