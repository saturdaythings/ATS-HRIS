# Frontend API Configuration Setup

## Overview
The frontend API base URL is now centralized in a single configuration file at the root of the application. This allows switching between local development and production backends with a single line change.

## Configuration Structure

### 1. Root Level Configuration
**File:** `/frontend/config.js` (at app root)

```javascript
// ===== CONFIGURATION =====
// CHANGE THIS LINE TO SWITCH BETWEEN LOCAL AND DEPLOYED
const API_BASE_URL = 'http://localhost:3001';  // Local development
// const API_BASE_URL = 'https://your-deployed-backend.com';  // Production

export { API_BASE_URL };
```

**Purpose:** Single source of truth for the API base URL. Comment/uncomment to switch environments.

### 2. Source Configuration
**File:** `/frontend/src/config.js`

```javascript
import { API_BASE_URL } from '../config.js';

export const getApiBaseUrl = () => {
  return API_BASE_URL;
};

export const apiClient = {
  async get(endpoint, options = {}) { ... },
  async post(endpoint, body = {}, options = {}) { ... },
  async put(endpoint, body = {}, options = {}) { ... },
  async delete(endpoint, options = {}) { ... },
  async patch(endpoint, body = {}, options = {}) { ... },
};
```

**Purpose:**
- Imports API_BASE_URL from root config.js
- Exports `getApiBaseUrl()` function for use throughout the app
- Provides `apiClient` utility with standardized HTTP methods

## Usage

### In Components and Hooks
Import and use the `getApiBaseUrl()` function:

```javascript
import { getApiBaseUrl } from '../../config';

async function loadData() {
  const response = await fetch(`${getApiBaseUrl()}/api/endpoint`);
  const data = await response.json();
}
```

### Using apiClient Utility
For standardized API calls with error handling:

```javascript
import { apiClient } from '../../config';

const data = await apiClient.get('/endpoint');
await apiClient.post('/endpoint', { field: 'value' });
```

## Files Updated

### Configuration Files
- `/frontend/config.js` (NEW - created)
- `/frontend/src/config.js` (MODIFIED - simplified to use root config)

### Components
- `/frontend/src/components/modals/AssignDeviceModal.jsx`
- `/frontend/src/components/modals/ReturnDeviceModal.jsx`
- `/frontend/src/components/panels/DeviceDetailPanel.jsx`
- `/frontend/src/App.jsx`
- `/frontend/src/App-simple.jsx`

### Hooks
- `/frontend/src/hooks/useTracks.js`

## Switching Environments

### To use local development backend:
Edit `/frontend/config.js`:
```javascript
const API_BASE_URL = 'http://localhost:3001';
```

### To use production backend:
Edit `/frontend/config.js`:
```javascript
// const API_BASE_URL = 'http://localhost:3001';  // Local development
const API_BASE_URL = 'https://your-deployed-backend.com';  // Production
```

## Import Paths

**From components/hooks in `src/` directory:**
```javascript
import { getApiBaseUrl } from '../config';
import { getApiBaseUrl } from '../../config';  // if nested deeper
```

**From root:**
```javascript
import { API_BASE_URL } from './config.js';
```

## Benefits

1. **Single Point of Change:** Only one line needs to be modified to switch environments
2. **Clear and Obvious:** Configuration is at the top of a clearly-named file
3. **No Hunting:** No need to search through multiple files for API URLs
4. **Standardized:** All API calls use consistent `getApiBaseUrl()` function
5. **Error Handling:** Optional apiClient utility provides consistent error handling
6. **Build Success:** Application compiles and builds successfully with new configuration

## Verification

Build output confirms successful compilation:
```
✓ 100 modules transformed.
✓ built in 844ms
```

All hardcoded `http://localhost:3001` URLs have been removed from the codebase.
