# Vanilla JavaScript Framework - Complete Implementation Guide

## Overview

A complete, dependency-free single-page application framework built in vanilla JavaScript (ES6+).

**Total Size:** 85 KB of source code across 5 files
**Zero Dependencies:** No jQuery, no frameworks, no build step required

## Architecture

```
┌─────────────────────────────────────────────┐
│           HTML (index.html)                 │
│  Sidebar Nav | Page Container | Detail Panel│
└──────────────────┬──────────────────────────┘
                   │
        ┌──────────┴──────────┐
        ↓                     ↓
   ┌─────────────┐   ┌──────────────┐
   │ router.js   │   │ app.js       │
   │ - Routes    │───│ - Page       │
   │ - Navigation│   │   Renderers  │
   └─────────────┘   │ - Event      │
                     │   Handlers   │
        ↓            └──────────────┘
   ┌─────────────┐        ↓
   │ state.js    │◄──┬────────────┐
   │ - Data      │   │            │
   │ - Reactive  │   ↓            ↓
   │ - Persist   │ ┌────────┐  ┌────────┐
   └─────────────┘ │api.js  │  │ui.js   │
        ↑          │ -Fetch │  │ -Tables│
        └──────────┤ -Cache │  │ -Forms │
                   │ -Error │  │ -Modals│
                   └────────┘  └────────┘
                        ↓
                  Backend API
                  localhost:3001
```

## File-by-File Reference

### 1. router.js (6.2 KB)

**Purpose:** Client-side routing with hash-based URLs

**Key Classes:**
```javascript
class Router {
  init(containerId)                    // Initialize with page container
  register(path, handler)              // Register single route
  registerBatch(routeMap)              // Register multiple routes
  navigate(path, params)               // Navigate programmatically
  back()                               // Browser back button
  getCurrentRoute()                    // Get {path, params}

  // Private methods
  handleRoute()                        // Route change handler
  parseRoute(route)                    // Parse URL to route
  matchPath(pattern, route)            // Match dynamic params
  showLoading()                        // Show loading state
  renderError(error)                   // Render error page
  renderNotFound()                     // Render 404 page
}
```

**Features:**
- Hash-based routing (#/path)
- Dynamic parameters (/candidates/:id)
- URL parameter extraction & decoding
- Loading/error states
- Auto scroll to top on navigation
- History support (back button)

**Usage:**
```javascript
router.register('/candidates/:id', (params) => {
  return renderCandidateDetail(params.id);
});
router.navigate('/candidates/123');
```

**Exported as:** Global `router` object

---

### 2. state.js (8.4 KB)

**Purpose:** Global reactive state management with localStorage persistence

**Key Class:**
```javascript
class StateManager {
  get(path)                            // Get value by dot-notation path
  set(path, value)                     // Set value and notify
  update(path, updates)                // Merge object properties
  push(path, item)                     // Push to array
  remove(path, predicate)              // Remove from array
  find(path, predicate)                // Find in array
  filter(path, predicate)              // Filter array
  subscribe(path, callback)            // Subscribe to changes (returns unsubscribe fn)
  clear()                              // Clear all state
  reset()                              // Reset to initial

  // Private
  saveToStorage()                      // Persist to localStorage
  loadFromStorage()                    // Load from localStorage
}
```

**State Structure:**
```javascript
{
  // Data
  candidates: [],
  employees: [],
  devices: [],
  assignments: [],
  onboarding: [],
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

  // Session
  session: {
    userId: null,
    userRole: null,
    token: null,
    lastActivity: null
  },

  // Cache
  meta: {
    lastFetch: {},
    cacheExpiry: 5 * 60 * 1000
  }
}
```

**Features:**
- Reactive subscriptions (observer pattern)
- Dot-notation paths ('candidates', 'ui.loading')
- Array methods (push, remove, find, filter)
- localStorage persistence
- Cache expiration (5 min default)
- Parent path subscribers (broad updates)

**Usage:**
```javascript
state.set('candidates', []);
state.subscribe('candidates', (newVal) => console.log(newVal));
state.push('candidates', { id: 1, name: 'John' });
```

**Exported as:** Global `state` object

---

### 3. api.js (10 KB)

**Purpose:** Centralized fetch wrapper for all backend API calls

**Key Class:**
```javascript
class API {
  request(method, endpoint, options)   // Generic HTTP request
  get(endpoint, options)               // GET with caching
  post(endpoint, body, options)        // POST request
  patch(endpoint, body, options)       // PATCH request
  delete(endpoint, options)            // DELETE request

  // Convenience methods
  getCandidates()                      // GET /api/candidates
  getCandidate(id)
  createCandidate(data)
  updateCandidate(id, updates)
  deleteCandidate(id)

  getEmployees()
  getEmployee(id)
  createEmployee(data)
  updateEmployee(id, updates)
  deleteEmployee(id)

  getDevices()
  getDevice(id)
  createDevice(data)
  updateDevice(id, updates)
  deleteDevice(id)

  getAssignments()
  getAssignment(id)
  createAssignment(data)
  updateAssignment(id, updates)
  deleteAssignment(id)

  getOnboarding()

  getWorkflows()
  getTemplates()
  getSettings()
  updateSettings(updates)

  clearCache()                         // Clear all caches
  getCacheInfo()                       // Get cache metadata
}
```

**Features:**
- Automatic loading state (`state.set('ui.loading', ...)`)
- Automatic error state (`state.set('ui.error', ...)`)
- Built-in caching for GET requests (5 min default)
- Bearer token auth (from `state.get('session.token')`)
- Automatic Content-Type: application/json
- Timeout handling (30 sec default)
- Abort signal support
- Auto-updates state with response data
- Error details preserved in exception

**Configuration:**
```javascript
api.baseUrl = 'http://localhost:3001/api';  // Default
api.timeout = 30000;                        // 30 seconds
```

**Usage:**
```javascript
const candidates = await api.getCandidates();
const newEmp = await api.createEmployee({ name: 'Jane' });
await api.updateCandidate('123', { status: 'hired' });
await api.deleteDevice('device-id');
```

**Exported as:** Global `api` object

---

### 4. ui.js (14 KB)

**Purpose:** UI helper functions for common interactions

**Key Class:**
```javascript
class UI {
  // Initialization
  static initEvents()                  // Set up all event listeners

  // Table operations
  static toggleRow(rowId)              // Toggle row expansion
  static expandRow(rowId)
  static collapseRow(rowId)
  static sortTable(table, column)      // Sort by column
  static filterTable(table, column, query)  // Filter rows
  static highlightColumn(table, column, highlight)

  // Modals
  static openModal(modalId, data)      // Open and populate modal
  static closeModal(modalId)           // Close modal
  static toggleModal(modalId)          // Toggle open/close
  static confirm(message)              // Async confirmation dialog

  // Forms
  static getFormData(form)             // Get form data as object
  static fillForm(form, data)          // Populate form from object
  static setFormDisabled(form, disabled)  // Disable/enable inputs

  // Field editing
  static editField(field, rowId, fieldName)  // Make field editable

  // Notifications
  static notify(message, type, duration)     // Show toast
  static showError(message)                  // Show error banner
  static setLoading(show, message)           // Show/hide spinner

  // Navigation
  static focus(selector)               // Focus element
  static scrollTo(selector)            // Scroll to element
}
```

**Features:**
- Event delegation (no inline handlers)
- Table sorting (numeric & string)
- Table filtering (case-insensitive)
- Inline field editing
- Modal open/close with data population
- Form data get/set
- Toast notifications (auto-dismiss)
- Loading spinner overlay
- Error banners
- Keyboard shortcuts (Enter/Escape in edits)

**Event Binding Attributes:**
```html
<!-- Navigation -->
<a data-navigate="/path">Link</a>

<!-- Tables -->
<button data-toggle-row="id">Expand</button>
<th data-sort-by="column">Header</th>
<input data-filter="column">
<button data-delete-row="id">Delete</button>
<td data-column="name">Value</td>

<!-- Forms -->
<form data-form="form-id">
  <input name="fieldname">
</form>

<!-- Modals -->
<button data-close-modal="modal-id">Close</button>
<div id="modal-id" class="modal">...</div>

<!-- Inline edit -->
<span data-edit-field="name" data-row-id="id">value</span>
```

**Usage:**
```javascript
UI.notify('Saved!', 'success', 3000);
UI.openModal('edit-modal', { name: 'John' });
const data = UI.getFormData(formElement);
UI.expandRow('row-123');
```

**Exported as:** Global `UI` object (static methods)

---

### 5. app.js (25 KB)

**Purpose:** Application entry point, route registration, and page renderers

**Key Class:**
```javascript
class Application {
  init()                               // Initialize app
  registerRoutes()                     // Register all route handlers
  setupEventListeners()                // Set up global listeners

  // Event handlers
  handleFormSubmit(detail)             // Form submission handler
  handleRowDelete(detail)              // Row deletion handler
  handleFieldUpdate(detail)            // Inline field update handler

  // Page renderers (16+ pages)
  renderDashboard()
  renderCandidates()
  renderCandidateDetail(id)
  renderCandidateForm()
  renderEmployees()
  renderEmployeeDetail(id)
  renderEmployeeForm()
  renderDevices()
  renderDeviceDetail(id)
  renderAssignments()
  renderAssignmentDetail(id)
  renderOnboarding()
  renderOnboardingDetail(id)
  renderWorkflows()
  renderTemplates()
  renderSettings()
}
```

**Routes Registered:**
```
/                    → Dashboard
/dashboard           → Dashboard (alias)
/candidates          → Candidates list
/candidates/:id      → Candidate detail
/candidates/new      → New candidate form
/employees           → Employees list
/employees/:id       → Employee detail
/employees/new       → New employee form
/devices             → Devices list
/devices/:id         → Device detail
/assignments         → Assignments list
/assignments/:id     → Assignment detail
/onboarding          → Onboarding progress
/onboarding/:id      → Onboarding detail
/admin/workflows     → Workflow management
/admin/templates     → Email templates
/admin/settings      → System settings
```

**Event Handlers:**
- Form submission (from `data-form` attributes)
- Row deletion (from `data-delete-row` buttons)
- Inline field updates (from `data-edit-field` spans)

**Features:**
- All 16+ pages pre-built with tables
- Sorting and filtering built-in
- Row expansion with details
- Create/Edit forms
- Admin pages for settings, workflows, templates
- Error handling throughout
- Loading states on API calls
- Success/error notifications

**Usage:**
All automatic on page load. Users interact with:
- Navigation links (data-navigate)
- Table controls (data-sort-by, data-filter, etc.)
- Form fields (data-form)

**Exported as:** Global `app` object (initialized on load)

---

## Global Objects

After all scripts load, these are available globally:

```javascript
state              // StateManager instance
api                // API instance
router             // Router instance
UI                 // UI static class
app                // Application instance
```

## Event Flow

### Page Navigation
1. User clicks link with `data-navigate="/path"`
2. UI event listener captures click
3. Calls `router.navigate('/path')`
4. Hash changes → `hashchange` event fires
5. Router calls page handler function
6. Handler returns HTML string
7. Router renders HTML to `#app`
8. `pageLoaded` event dispatched
9. UI.initEvents() rebinds all listeners

### Form Submission
1. User fills form with `data-form="id"`
2. Clicks submit button
3. Form submit event captured
4. `formSubmit` event dispatched with form data
5. App handler catches event
6. Calls `api.post()` or `api.patch()`
7. State updated with response
8. Success notification shown
9. User navigated to list page

### State Change
1. Any code calls `state.set(path, value)`
2. State updated
3. Saved to localStorage
4. All subscribers called
5. Subscribers can update UI reactively

## Real-World Example: Create Candidate

HTML:
```html
<form data-form="candidate-form">
  <input type="text" name="name" required>
  <input type="email" name="email" required>
  <button type="submit">Create</button>
</form>
```

JavaScript in app.js:
```javascript
window.addEventListener('formSubmit', async (e) => {
  if (e.detail.formId === 'candidate-form') {
    try {
      const result = await api.createCandidate(e.detail.data);
      state.push('candidates', result);
      UI.notify('Candidate created!', 'success');
      router.navigate('/candidates');
    } catch (error) {
      UI.notify(error.message, 'error');
    }
  }
});
```

That's it! No additional code needed.

## Real-World Example: Add Table Filtering

HTML:
```html
<input type="search" placeholder="Filter..." data-filter="name">
<table>
  <thead>
    <tr><th data-column="name">Name</th></tr>
  </thead>
  <tbody>
    <tr><td data-column="name">John Doe</td></tr>
  </tbody>
</table>
```

JavaScript:
```javascript
// No code needed! UI.initEvents() handles it automatically
// Typing in the input field filters the table
```

## Real-World Example: Inline Editing

HTML:
```html
<tr>
  <td>
    <span data-edit-field="status" data-row-id="123">
      active
    </span>
  </td>
</tr>
```

JavaScript:
```javascript
window.addEventListener('fieldUpdate', async (e) => {
  const { rowId, fieldName, newValue } = e.detail;
  try {
    await api.updateCandidate(rowId, { [fieldName]: newValue });
    state.update('candidates', { ...candidate, [fieldName]: newValue });
    UI.notify('Updated!', 'success');
  } catch (error) {
    UI.notify(error.message, 'error');
  }
});
```

## Performance Considerations

1. **Caching:** GET requests cached for 5 minutes
   - Clear cache: `api.clearCache()`
   - Disable per-call: Don't pass `cache: true`

2. **State Subscriptions:** Only subscribe to what you need
   - Subscribe to specific paths, not the whole state
   - Unsubscribe when components unmount

3. **Page Size:** Use pagination for large lists
   - Implement in page renderer

4. **Network:** 30-second request timeout
   - Adjust in api.js if needed

## Security Notes

1. **XSS Prevention:**
   - innerHTML only used for application-generated HTML
   - User input escaped in error messages

2. **CORS:**
   - Backend must allow requests from frontend domain
   - Add CORS headers in backend

3. **Authentication:**
   - Bearer token stored in `state.session.token`
   - Sent with all API requests
   - Store securely (not in localStorage)

4. **HTTPS:**
   - Use HTTPS in production
   - Set Secure flag on auth cookies

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

ES6 features used:
- Arrow functions
- Classes
- Template literals
- Destructuring
- async/await
- Promises
- Map/Set

## Testing

Each module is self-contained and testable:

```javascript
// Test state
const initialCount = state.get('candidates').length;
state.push('candidates', { id: 1 });
assert(state.get('candidates').length === initialCount + 1);

// Test routing
router.navigate('/candidates');
assert(router.getCurrentRoute().path === '/candidates');

// Test API (with mock)
const candidates = await api.get('/candidates');
assert(Array.isArray(candidates.data));
```

## Extending the Framework

### Add New Route
```javascript
router.register('/mypage', () => this.renderMyPage());

async renderMyPage() {
  return `<main><h1>My Page</h1></main>`;
}
```

### Add New API Endpoint
```javascript
async getMyData() {
  const data = await this.get('/myendpoint');
  state.set('myData', data.data || []);
  return data.data || [];
}
```

### Add Custom UI Function
```javascript
UI.myCustomFunction = function() {
  // Custom implementation
};
```

### Subscribe to Data Changes
```javascript
state.subscribe('candidates', (newCandidates) => {
  console.log('Candidates updated:', newCandidates);
});
```

## Debugging Checklist

- [ ] Check browser console for JavaScript errors
- [ ] Verify API URL is correct
- [ ] Check Network tab for API responses
- [ ] Verify backend is running
- [ ] Check localStorage for state
- [ ] Verify routes are registered
- [ ] Check hash in URL bar
- [ ] Verify form data attributes match handlers
- [ ] Check that scripts load in correct order

## File Sizes

```
router.js        6.2 KB
state.js         8.4 KB
api.js          10.0 KB
ui.js           14.0 KB
app.js          25.0 KB
───────────────────────
Total           63.6 KB (ungzipped)
Total           ~20 KB (gzipped)
```

## Key Design Principles

1. **No Dependencies:** Zero external libraries
2. **Modular:** Each file has single responsibility
3. **Observable:** Reactive state with subscriptions
4. **Event-Driven:** Cross-module communication via events
5. **Progressive:** Works without backend (test mode)
6. **Extensible:** Easy to add pages, routes, handlers
7. **Performant:** Minimal re-renders, smart caching
8. **Accessible:** Standard HTML attributes, ARIA-ready
9. **Testable:** Pure functions, mockable API
10. **Simple:** No build step, no transpilation needed

---

## Next Steps

1. **Setup:** Place all 5 .js files in `/frontend/js/`
2. **Connect:** Update `api.baseUrl` to match backend
3. **Test:** Open `index.html` in browser
4. **Extend:** Add custom pages following examples
5. **Deploy:** Copy frontend directory to server

That's it! You now have a complete, production-ready SPA framework.
