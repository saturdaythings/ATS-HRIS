/**
 * API - Centralized fetch wrapper for all backend API calls
 * Handles loading states, error handling, and response parsing
 * Supports GET, POST, PATCH, DELETE with auth headers
 */

class API {
  constructor() {
    // Base URL for API (use global config or fallback)
    this.baseUrl = (window.APP_CONFIG && window.APP_CONFIG.API_BASE_URL) || 'http://localhost:3001/api';
    this.timeout = 30000; // 30 seconds
    this.cache = new Map();
  }

  /**
   * Perform HTTP request
   * @param {string} method - HTTP method (GET, POST, PATCH, DELETE)
   * @param {string} endpoint - API endpoint (without /api prefix)
   * @param {Object} options - Request options
   * @returns {Promise<any>}
   */
  async request(method, endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      signal: AbortSignal.timeout(this.timeout)
    };

    // Add auth token if available
    const token = state.get('session.token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // Add body for POST/PATCH
    if (options.body && (method === 'POST' || method === 'PATCH')) {
      config.body = JSON.stringify(options.body);
    }

    // Set loading state
    state.set('ui.loading', true);
    state.set('ui.error', null);

    try {
      const response = await fetch(url, config);

      // Handle errors
      if (!response.ok) {
        const error = new Error(`API Error: ${response.status} ${response.statusText}`);
        error.status = response.status;

        try {
          const data = await response.json();
          error.data = data;
          error.message = data.message || error.message;
        } catch (e) {
          // Response wasn't JSON
        }

        throw error;
      }

      // Parse response
      let data;
      try {
        data = await response.json();
      } catch (e) {
        // Empty response is OK for some endpoints
        data = {};
      }

      // Clear loading/error state
      state.set('ui.loading', false);

      return data;
    } catch (error) {
      state.set('ui.loading', false);
      state.set('ui.error', error.message);
      throw error;
    }
  }

  /**
   * GET request
   * @param {string} endpoint
   * @param {Object} options
   * @returns {Promise<any>}
   */
  async get(endpoint, options = {}) {
    // Check cache if enabled
    if (options.cache) {
      const cached = this.cache.get(endpoint);
      if (cached && Date.now() - cached.time < (options.cacheTime || 60000)) {
        return cached.data;
      }
    }

    const data = await this.request('GET', endpoint, options);

    // Store in cache if enabled
    if (options.cache) {
      this.cache.set(endpoint, { data, time: Date.now() });
    }

    return data;
  }

  /**
   * POST request
   * @param {string} endpoint
   * @param {Object} body
   * @param {Object} options
   * @returns {Promise<any>}
   */
  async post(endpoint, body, options = {}) {
    return this.request('POST', endpoint, { ...options, body });
  }

  /**
   * PATCH request
   * @param {string} endpoint
   * @param {Object} body
   * @param {Object} options
   * @returns {Promise<any>}
   */
  async patch(endpoint, body, options = {}) {
    return this.request('PATCH', endpoint, { ...options, body });
  }

  /**
   * DELETE request
   * @param {string} endpoint
   * @param {Object} options
   * @returns {Promise<any>}
   */
  async delete(endpoint, options = {}) {
    return this.request('DELETE', endpoint, options);
  }

  /**
   * Generic call method (GET/POST/PATCH/DELETE)
   * @param {string} method
   * @param {string} endpoint
   * @param {Object} body
   * @returns {Promise<any>}
   */
  async call(method, endpoint, body = null) {
    if (method === 'GET') {
      return this.get(endpoint);
    } else if (method === 'POST') {
      return this.post(endpoint, body);
    } else if (method === 'PATCH') {
      return this.patch(endpoint, body);
    } else if (method === 'DELETE') {
      return this.delete(endpoint);
    }
    throw new Error(`Unsupported method: ${method}`);
  }

  /**
   * Fetch all candidates
   * @returns {Promise<Array>}
   */
  async getCandidates() {
    const data = await this.get('/candidates', { cache: true });
    state.set('candidates', data.data || []);
    state.set('meta.lastFetch.candidates', Date.now());
    return data.data || [];
  }

  /**
   * Fetch single candidate
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async getCandidate(id) {
    return this.get(`/candidates/${id}`);
  }

  /**
   * Create candidate
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async createCandidate(data) {
    const result = await this.post('/candidates', data);
    state.push('candidates', result.data);
    return result.data;
  }

  /**
   * Update candidate
   * @param {string} id
   * @param {Object} updates
   * @returns {Promise<Object>}
   */
  async updateCandidate(id, updates) {
    const result = await this.patch(`/candidates/${id}`, updates);
    this.cache.delete('/candidates');
    return result.data;
  }

  /**
   * Delete candidate
   * @param {string} id
   * @returns {Promise<any>}
   */
  async deleteCandidate(id) {
    await this.delete(`/candidates/${id}`);
    state.remove('candidates', item => item.id === id);
    this.cache.delete('/candidates');
  }

  /**
   * Fetch all employees
   * @returns {Promise<Array>}
   */
  async getEmployees() {
    const data = await this.get('/employees', { cache: true });
    state.set('employees', data.data || []);
    state.set('meta.lastFetch.employees', Date.now());
    return data.data || [];
  }

  /**
   * Fetch single employee
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async getEmployee(id) {
    return this.get(`/employees/${id}`);
  }

  /**
   * Create employee
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async createEmployee(data) {
    const result = await this.post('/employees', data);
    state.push('employees', result.data);
    return result.data;
  }

  /**
   * Update employee
   * @param {string} id
   * @param {Object} updates
   * @returns {Promise<Object>}
   */
  async updateEmployee(id, updates) {
    const result = await this.patch(`/employees/${id}`, updates);
    this.cache.delete('/employees');
    return result.data;
  }

  /**
   * Delete employee
   * @param {string} id
   * @returns {Promise<any>}
   */
  async deleteEmployee(id) {
    await this.delete(`/employees/${id}`);
    state.remove('employees', item => item.id === id);
    this.cache.delete('/employees');
  }

  /**
   * Fetch all devices
   * @returns {Promise<Array>}
   */
  async getDevices() {
    const data = await this.get('/devices', { cache: true });
    state.set('devices', data.data || []);
    state.set('meta.lastFetch.devices', Date.now());
    return data.data || [];
  }

  /**
   * Fetch single device
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async getDevice(id) {
    return this.get(`/devices/${id}`);
  }

  /**
   * Create device
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async createDevice(data) {
    const result = await this.post('/devices', data);
    state.push('devices', result.data);
    return result.data;
  }

  /**
   * Update device
   * @param {string} id
   * @param {Object} updates
   * @returns {Promise<Object>}
   */
  async updateDevice(id, updates) {
    const result = await this.patch(`/devices/${id}`, updates);
    this.cache.delete('/devices');
    return result.data;
  }

  /**
   * Delete device
   * @param {string} id
   * @returns {Promise<any>}
   */
  async deleteDevice(id) {
    await this.delete(`/devices/${id}`);
    state.remove('devices', item => item.id === id);
    this.cache.delete('/devices');
  }

  /**
   * Fetch all assignments
   * @returns {Promise<Array>}
   */
  async getAssignments() {
    const data = await this.get('/assignments', { cache: true });
    state.set('assignments', data.data || []);
    state.set('meta.lastFetch.assignments', Date.now());
    return data.data || [];
  }

  /**
   * Fetch single assignment
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async getAssignment(id) {
    return this.get(`/assignments/${id}`);
  }

  /**
   * Create assignment
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async createAssignment(data) {
    const result = await this.post('/assignments', data);
    state.push('assignments', result.data);
    return result.data;
  }

  /**
   * Update assignment
   * @param {string} id
   * @param {Object} updates
   * @returns {Promise<Object>}
   */
  async updateAssignment(id, updates) {
    const result = await this.patch(`/assignments/${id}`, updates);
    this.cache.delete('/assignments');
    return result.data;
  }

  /**
   * Delete assignment
   * @param {string} id
   * @returns {Promise<any>}
   */
  async deleteAssignment(id) {
    await this.delete(`/assignments/${id}`);
    state.remove('assignments', item => item.id === id);
    this.cache.delete('/assignments');
  }

  /**
   * Fetch onboarding records
   * @returns {Promise<Array>}
   */
  async getOnboarding() {
    const data = await this.get('/onboarding', { cache: true });
    state.set('onboarding', data.data || []);
    state.set('meta.lastFetch.onboarding', Date.now());
    return data.data || [];
  }

  /**
   * Get onboarding workflows (admin endpoint)
   * @returns {Promise<Array>}
   */
  async getWorkflows() {
    const data = await this.get('/admin/workflows', { cache: true });
    state.set('workflows', data.data || []);
    return data.data || [];
  }

  /**
   * Get email templates (admin endpoint)
   * @returns {Promise<Array>}
   */
  async getTemplates() {
    const data = await this.get('/admin/templates', { cache: true });
    state.set('templates', data.data || []);
    return data.data || [];
  }

  /**
   * Get system settings (admin endpoint)
   * @returns {Promise<Object>}
   */
  async getSettings() {
    const data = await this.get('/admin/settings', { cache: true });
    state.set('settings', data.data || {});
    return data.data || {};
  }

  /**
   * Update settings (admin endpoint)
   * @param {Object} updates
   * @returns {Promise<Object>}
   */
  async updateSettings(updates) {
    const result = await this.patch('/admin/settings', updates);
    this.cache.delete('/admin/settings');
    state.set('settings', result.data);
    return result.data;
  }

  /**
   * Clear all caches
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get cache info
   * @returns {Object}
   */
  getCacheInfo() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Export as singleton
const api = new API();
