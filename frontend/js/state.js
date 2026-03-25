/**
 * State Management - Global application state with reactive updates
 * Implements a simple publish-subscribe pattern for reactive updates
 * Persists to localStorage for session persistence
 */

class StateManager {
  constructor() {
    // Global state object
    this.state = {
      // Candidates
      candidates: [],
      selectedCandidate: null,

      // Employees
      employees: [],
      selectedEmployee: null,

      // Devices
      devices: [],
      selectedDevice: null,

      // Assignments
      assignments: [],
      selectedAssignment: null,

      // Onboarding
      onboarding: [],
      selectedOnboarding: null,

      // Admin data
      templates: [],
      workflows: [],
      settings: {},

      // UI State
      ui: {
        loading: false,
        error: null,
        filters: {},
        sortBy: 'name',
        sortDirection: 'asc',
        expandedRows: {},
        modals: {}
      },

      // Session data
      session: {
        userId: null,
        userRole: null,
        token: null,
        lastActivity: null
      },

      // Cache metadata
      meta: {
        lastFetch: {},
        cacheExpiry: 5 * 60 * 1000 // 5 minutes
      }
    };

    // Subscribers for reactive updates
    this.subscribers = new Map();

    // Initialize from localStorage
    this.loadFromStorage();
  }

  /**
   * Get entire state or specific path
   * @param {string} path - Dot-notation path (e.g., 'candidates', 'ui.loading')
   * @returns {any}
   */
  get(path = null) {
    if (!path) return this.state;

    const parts = path.split('.');
    let current = this.state;

    for (const part of parts) {
      if (current === null || current === undefined) return undefined;
      current = current[part];
    }

    return current;
  }

  /**
   * Set state at path and notify subscribers
   * @param {string} path - Dot-notation path
   * @param {any} value - New value
   */
  set(path, value) {
    const parts = path.split('.');
    const key = parts.pop();

    // Navigate to parent object
    let current = this.state;
    for (const part of parts) {
      if (!(part in current)) {
        current[part] = {};
      }
      current = current[part];
    }

    // Set value
    const oldValue = current[key];
    current[key] = value;

    // Save to storage
    this.saveToStorage();

    // Notify subscribers
    this.notify(path, value, oldValue);
  }

  /**
   * Update object properties (merge instead of replace)
   * @param {string} path - Dot-notation path
   * @param {Object} updates - Properties to merge
   */
  update(path, updates) {
    const current = this.get(path);

    if (typeof current !== 'object' || current === null) {
      this.set(path, updates);
      return;
    }

    const merged = { ...current, ...updates };
    this.set(path, merged);
  }

  /**
   * Push item to array
   * @param {string} path - Dot-notation path to array
   * @param {any} item - Item to push
   */
  push(path, item) {
    const array = this.get(path);

    if (!Array.isArray(array)) {
      console.warn(`State.push: ${path} is not an array`);
      return;
    }

    array.push(item);
    this.saveToStorage();
    this.notify(path, array, array);
  }

  /**
   * Remove item from array by index or predicate
   * @param {string} path - Dot-notation path to array
   * @param {number|Function} predicate - Index or filter function
   */
  remove(path, predicate) {
    const array = this.get(path);

    if (!Array.isArray(array)) {
      console.warn(`State.remove: ${path} is not an array`);
      return;
    }

    if (typeof predicate === 'number') {
      // Remove by index
      array.splice(predicate, 1);
    } else if (typeof predicate === 'function') {
      // Remove by predicate
      const index = array.findIndex(predicate);
      if (index !== -1) {
        array.splice(index, 1);
      }
    }

    this.saveToStorage();
    this.notify(path, array, array);
  }

  /**
   * Find item in array
   * @param {string} path - Dot-notation path to array
   * @param {Function} predicate - Filter function
   * @returns {any}
   */
  find(path, predicate) {
    const array = this.get(path);

    if (!Array.isArray(array)) {
      console.warn(`State.find: ${path} is not an array`);
      return undefined;
    }

    return array.find(predicate);
  }

  /**
   * Filter array and return new array
   * @param {string} path - Dot-notation path to array
   * @param {Function} predicate - Filter function
   * @returns {Array}
   */
  filter(path, predicate) {
    const array = this.get(path);

    if (!Array.isArray(array)) {
      console.warn(`State.filter: ${path} is not an array`);
      return [];
    }

    return array.filter(predicate);
  }

  /**
   * Subscribe to state changes
   * @param {string} path - Dot-notation path (e.g., 'candidates', 'ui.loading')
   * @param {Function} callback - Called with (newValue, oldValue)
   * @returns {Function} - Unsubscribe function
   */
  subscribe(path, callback) {
    if (!this.subscribers.has(path)) {
      this.subscribers.set(path, []);
    }

    this.subscribers.get(path).push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(path);
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    };
  }

  /**
   * Notify subscribers of state change
   * @private
   */
  notify(path, newValue, oldValue) {
    // Notify exact path subscribers
    if (this.subscribers.has(path)) {
      this.subscribers.get(path).forEach(callback => {
        try {
          callback(newValue, oldValue);
        } catch (error) {
          console.error(`Error in subscriber for ${path}:`, error);
        }
      });
    }

    // Notify parent path subscribers (for broad updates)
    const parts = path.split('.');
    if (parts.length > 1) {
      const parentPath = parts.slice(0, -1).join('.');
      if (this.subscribers.has(parentPath)) {
        this.subscribers.get(parentPath).forEach(callback => {
          try {
            callback(this.get(parentPath), null);
          } catch (error) {
            console.error(`Error in subscriber for ${parentPath}:`, error);
          }
        });
      }
    }
  }

  /**
   * Clear all state
   */
  clear() {
    Object.keys(this.state).forEach(key => {
      if (Array.isArray(this.state[key])) {
        this.state[key] = [];
      } else if (typeof this.state[key] === 'object') {
        this.state[key] = {};
      } else {
        this.state[key] = null;
      }
    });

    localStorage.removeItem('vtwoOpsState');
    this.notify('*', null, null);
  }

  /**
   * Save state to localStorage
   * @private
   */
  saveToStorage() {
    try {
      // Don't persist session data or temporary UI state
      const persistable = {
        candidates: this.state.candidates,
        employees: this.state.employees,
        devices: this.state.devices,
        assignments: this.state.assignments,
        onboarding: this.state.onboarding,
        templates: this.state.templates,
        workflows: this.state.workflows,
        settings: this.state.settings,
        meta: this.state.meta
      };

      localStorage.setItem('vtwoOpsState', JSON.stringify(persistable));
    } catch (error) {
      console.warn('Failed to save state to localStorage:', error);
    }
  }

  /**
   * Load state from localStorage
   * @private
   */
  loadFromStorage() {
    try {
      const stored = localStorage.getItem('vtwoOpsState');
      if (stored) {
        const data = JSON.parse(stored);

        // Check if cache has expired
        if (data.meta && data.meta.lastFetch) {
          const now = Date.now();
          for (const [key, timestamp] of Object.entries(data.meta.lastFetch)) {
            if (now - timestamp > data.meta.cacheExpiry) {
              // Cache expired, clear this category
              if (Array.isArray(this.state[key])) {
                data[key] = [];
              }
            }
          }
        }

        // Merge loaded data into state
        Object.keys(data).forEach(key => {
          if (key in this.state) {
            this.state[key] = data[key];
          }
        });
      }
    } catch (error) {
      console.warn('Failed to load state from localStorage:', error);
    }
  }

  /**
   * Reset to initial state but keep session
   */
  reset() {
    const session = this.state.session;
    this.clear();
    this.state.session = session;
    localStorage.removeItem('vtwoOpsState');
  }
}

// Export as singleton
const state = new StateManager();
