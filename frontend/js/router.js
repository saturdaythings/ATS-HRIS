/**
 * Router - Client-side routing engine for single-page application
 * Uses hash-based routing (#) for compatibility and simplicity
 * Supports 16+ pages with dynamic template loading and event binding
 *
 * NOTE: innerHTML is used here for trusted, application-generated HTML only.
 * For user-submitted content, use textContent or a sanitization library.
 */

class Router {
  constructor() {
    this.routes = new Map();
    this.currentRoute = null;
    this.currentParams = {};
    this.pageContainer = null;
    this.templates = new Map();
    this.initialized = false;
  }

  /**
   * Initialize router with container element
   * @param {string} containerId - ID of element where pages will be rendered
   */
  init(containerId) {
    console.log('Router: initializing with container ID:', containerId);
    this.pageContainer = document.getElementById(containerId);
    if (!this.pageContainer) {
      console.error(`Container #${containerId} not found`);
      return;
    }

    console.log('Router: container found, setting up hash change listener');
    this.initialized = true;

    // Listen for hash changes
    window.addEventListener('hashchange', () => this.handleRoute());

    // Don't handle initial route here - let the caller do it after routes are registered
    console.log('Router: initialized and ready');
  }

  // Handle initial route after routes are registered
  start() {
    console.log('Router: starting and handling initial route');
    this.handleRoute();
  }

  /**
   * Register a route with its handler
   * @param {string} path - Route path (e.g., '/dashboard', '/candidates/:id')
   * @param {Function} handler - Async function that returns HTML string
   */
  register(path, handler) {
    this.routes.set(path, handler);
  }

  /**
   * Register multiple routes at once
   * @param {Object} routeMap - Map of path -> handler
   */
  registerBatch(routeMap) {
    const routeCount = Object.keys(routeMap).length;
    console.log('Router: registering routes...', routeCount, 'routes');
    Object.entries(routeMap).forEach(([path, handler]) => {
      this.register(path, handler);
    });
    console.log('Router: routes registered. Total routes in map:', this.routes.size);

    // Add visual indicator
    const indicator = document.createElement('div');
    indicator.style.cssText = 'position: fixed; top: 10px; right: 10px; background: #0a0; color: white; padding: 4px 8px; font-size: 10px; border-radius: 3px; z-index: 9998;';
    indicator.textContent = `Routes: ${this.routes.size}`;
    document.body.appendChild(indicator);
  }

  /**
   * Get current hash without # symbol
   * @returns {string}
   */
  getHash() {
    return window.location.hash.slice(1) || '/';
  }

  /**
   * Parse route path and extract parameters
   * @param {string} route - The requested route
   * @returns {Object} - { path, params }
   */
  parseRoute(route) {
    // Remove trailing slash
    route = route.replace(/\/$/, '') || '/';

    for (const [registeredPath, handler] of this.routes) {
      const params = this.matchPath(registeredPath, route);
      if (params !== null) {
        return { path: registeredPath, params, handler };
      }
    }

    return { path: null, params: {}, handler: null };
  }

  /**
   * Match a registered path pattern against actual route
   * Handles dynamic segments like /candidates/:id
   * @param {string} pattern - Pattern (e.g., '/candidates/:id')
   * @param {string} route - Actual route (e.g., '/candidates/123')
   * @returns {Object|null} - Extracted params or null if no match
   */
  matchPath(pattern, route) {
    const patternParts = pattern.split('/').filter(Boolean);
    const routeParts = route.split('/').filter(Boolean);

    if (patternParts.length !== routeParts.length) {
      return null;
    }

    const params = {};
    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].startsWith(':')) {
        // Dynamic segment
        const paramName = patternParts[i].slice(1);
        params[paramName] = decodeURIComponent(routeParts[i]);
      } else if (patternParts[i] !== routeParts[i]) {
        // Static segment mismatch
        return null;
      }
    }

    return params;
  }

  /**
   * Handle route change
   * @private
   */
  async handleRoute() {
    if (!this.initialized) return;

    const hash = this.getHash();
    console.log('Router: handling hash:', hash);
    console.log('Router: available routes:', Array.from(this.routes.keys()));
    const { path, params, handler } = this.parseRoute(hash);

    if (!handler) {
      console.warn(`No route found for: ${hash}`);
      console.warn('Parsed route:', { path, params, handler });
      this.renderNotFound();
      return;
    }

    console.log('Router: found matching route:', path);

    this.currentRoute = path;
    this.currentParams = params;

    try {
      // Show loading state
      this.showLoading();

      // Call handler with params
      const html = await handler(params);

      // Render HTML (trusted application-generated content)
      this.pageContainer.innerHTML = html;

      // Dispatch custom event for event binding
      window.dispatchEvent(new CustomEvent('pageLoaded', {
        detail: { path, params }
      }));

      // Scroll to top
      window.scrollTo(0, 0);
    } catch (error) {
      console.error(`Error loading route ${hash}:`, error);
      this.renderError(error);
    }
  }

  /**
   * Navigate to a route programmatically
   * @param {string} path - Route path
   * @param {Object} params - Dynamic parameters
   */
  navigate(path, params = {}) {
    let hash = path;

    // Replace :param placeholders with actual values
    Object.entries(params).forEach(([key, value]) => {
      hash = hash.replace(`:${key}`, encodeURIComponent(value));
    });

    window.location.hash = hash;
  }

  /**
   * Navigate back in browser history
   */
  back() {
    window.history.back();
  }

  /**
   * Render loading state
   * @private
   */
  showLoading() {
    // Using trusted HTML template
    this.pageContainer.innerHTML = `
      <div class="loading-container">
        <div class="spinner"></div>
        <p>Loading...</p>
      </div>
    `;
  }

  /**
   * Render error state
   * @param {Error} error
   * @private
   */
  renderError(error) {
    // Escape error message to prevent XSS
    const message = document.createElement('p');
    message.textContent = error.message || 'An unexpected error occurred';

    const container = document.createElement('div');
    container.className = 'error-container';
    container.innerHTML = '<h1>Error Loading Page</h1>';
    container.appendChild(message);

    const button = document.createElement('button');
    button.textContent = 'Return Home';
    button.onclick = () => { window.location.hash = '/'; };
    container.appendChild(button);

    this.pageContainer.innerHTML = '';
    this.pageContainer.appendChild(container);
  }

  /**
   * Render 404 not found
   * @private
   */
  renderNotFound() {
    const hash = this.getHash();
    const availableRoutes = Array.from(this.routes.keys());
    const routeCount = availableRoutes.length;

    // Update page title with debug info
    document.title = `404 | Hash: ${hash} | Routes: ${routeCount}`;

    // Using trusted HTML template
    this.pageContainer.innerHTML = `
      <main style="padding: 20px;">
        <div style="background: #ff6b6b; color: white; padding: 20px; margin-bottom: 20px; border-radius: 5px;">
          <h1 style="margin: 0; font-size: 20px;">DEBUG INFO</h1>
          <p style="margin: 5px 0;"><strong>Hash being requested:</strong> "${hash}"</p>
          <p style="margin: 5px 0;"><strong>Total routes registered:</strong> ${routeCount}</p>
          <p style="margin: 10px 0 0 0;"><strong>Available routes:</strong></p>
          <code style="display: block; background: rgba(0,0,0,0.2); padding: 10px; margin-top: 5px; white-space: pre-wrap; word-wrap: break-word;">${availableRoutes.map(r => '  ' + r).join('\n')}</code>
        </div>

        <h1>Page Not Found</h1>
        <p>The page you're looking for doesn't exist.</p>
        <button onclick="window.location.hash='/'">Return Home</button>
      </main>
    `;
  }

  /**
   * Get current route information
   * @returns {Object}
   */
  getCurrentRoute() {
    return {
      path: this.currentRoute,
      params: this.currentParams
    };
  }
}

// Export as singleton
const router = new Router();
