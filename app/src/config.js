/**
 * API Client Configuration
 *
 * Uses the API_BASE_URL from config.js at the root of the frontend.
 * Change that single line to switch between local and deployed backends.
 *
 * Import flow:
 * config.js (app root) → src/config.js → used throughout app
 */

import { API_BASE_URL } from '../config.js';

export const getApiBaseUrl = () => {
  // For development with Vite proxy or production with deployed backend
  return API_BASE_URL;
};

export const apiClient = {
  async get(endpoint, options = {}) {
    const url = `${getApiBaseUrl()}/api${endpoint}`;
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      ...options,
    });

    if (!response.ok) {
      const error = new Error(`API Error: ${response.statusText}`);
      error.status = response.status;
      throw error;
    }

    return response.json();
  },

  async post(endpoint, body = {}, options = {}) {
    const url = `${getApiBaseUrl()}/api${endpoint}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(body),
      ...options,
    });

    if (!response.ok) {
      const error = new Error(`API Error: ${response.statusText}`);
      error.status = response.status;
      throw error;
    }

    return response.json();
  },

  async put(endpoint, body = {}, options = {}) {
    const url = `${getApiBaseUrl()}/api${endpoint}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(body),
      ...options,
    });

    if (!response.ok) {
      const error = new Error(`API Error: ${response.statusText}`);
      error.status = response.status;
      throw error;
    }

    return response.json();
  },

  async delete(endpoint, options = {}) {
    const url = `${getApiBaseUrl()}/api${endpoint}`;
    const response = await fetch(url, {
      method: 'DELETE',
      credentials: 'include',
      ...options,
    });

    if (!response.ok) {
      const error = new Error(`API Error: ${response.statusText}`);
      error.status = response.status;
      throw error;
    }

    return response.json();
  },

  async patch(endpoint, body = {}, options = {}) {
    const url = `${getApiBaseUrl()}/api${endpoint}`;
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(body),
      ...options,
    });

    if (!response.ok) {
      const error = new Error(`API Error: ${response.statusText}`);
      error.status = response.status;
      throw error;
    }

    return response.json();
  },
};

export default apiClient;
