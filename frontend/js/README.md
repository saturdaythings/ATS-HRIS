# V-Two Ops - Vanilla JavaScript Framework

A lightweight, single-page application framework built with vanilla JavaScript (ES6+). No external dependencies, no frameworks—just pure JavaScript for routing, state management, and API integration.

## Architecture Overview

The framework consists of 5 core modules:

### 1. Router (`router.js`)
Client-side routing engine using hash-based URLs (#). Supports dynamic routes with URL parameters.

**Key Features:**
- Hash-based routing for compatibility
- Dynamic route parameters (e.g., `/candidates/:id`)
- Page loading and unloading
- Error handling
- Browser history support

**Usage:**
```javascript
// Register a single route
router.register('/candidates', async (params) => {
  const html = await renderCandidatesPage();
  return html;
});

// Register multiple routes at once
router.registerBatch({
  '/': () => renderDashboard(),
  '/candidates/:id': (params) => renderCandidateDetail(params.id),
});

// Navigate programmatically
router.navigate('/candidates/123');
router.navigate('/candidates/:id', { id: 123 }); // With params

// Navigate back
router.back();
```

### 2. State (`state.js`)
Global application state management with reactive updates using a publish-subscribe pattern.

**Key Features:**
- Centralized state object
- Dot-notation path access (`'candidates'`, `'ui.loading'`)
- Reactive subscriptions with callbacks
- Array operations (push, remove, find, filter)
- LocalStorage persistence

**Usage:**
```javascript
// Get state
const candidates = state.get('candidates');
const isLoading = state.get('ui.loading');

// Set state
state.set('candidates', [/* ... */]);
state.set('ui.loading', false);

// Update (merge) state
state.update('ui', { loading: false, error: null });

// Array operations
state.push('candidates', newCandidate);
state.remove('candidates', c => c.id === '123');
const candidate = state.find('candidates', c => c.id === '123');
const active = state.filter('candidates', c => c.status === 'active');

// Subscribe to changes
const unsubscribe = state.subscribe('candidates', (newValue, oldValue) => {
  console.log('Candidates changed!', newValue);
});

// Unsubscribe
unsubscribe();

// Clear and reset
state.clear();
state.reset();
```

### 3. API (`api.js`)
Centralized fetch wrapper for all backend API calls with error handling, loading states, and caching.

**Key Features:**
- Fetch wrapper with timeout
- HTTP methods: GET, POST, PATCH, DELETE
- Auto-caching for GET requests
- Error handling and status checking
- Auth token support
- Loading state management

**Usage:**
```javascript
// GET requests (with optional caching)
const candidates = await api.getCandidates();
const candidate = await api.getCandidate(id);

// POST - create
const newCandidate = await api.createCandidate({
  name: 'John Doe',
  email: 'john@example.com'
});

// PATCH - update
const updated = await api.updateCandidate(id, {
  status: 'hired'
});

// DELETE
await api.deleteCandidate(id);

// Same API for employees, devices, assignments, etc.
await api.getEmployees();
await api.createDevice({...});
await api.updateAssignment(id, {...});

// Admin endpoints
const workflows = await api.getWorkflows();
const templates = await api.getTemplates();
const settings = await api.getSettings();
await api.updateSettings({smtpHost: 'mail.example.com'});

// Manual API calls
const data = await api.get('/custom-endpoint', { cache: true });
const result = await api.post('/action', { param: 'value' });
await api.patch('/resource/123', { field: 'newValue' });
await api.delete('/resource/123');

// Cache management
api.clearCache();
const cacheInfo = api.getCacheInfo();
```

### 4. UI (`ui.js`)
Helper functions for common user interface interactions. Event delegation for tables, modals, forms.

**Key Features:**
- Table sorting and filtering
- Row expansion (collapsible details)
- Inline field editing
- Modal management
- Form handling
- Notifications and toasts
- Loading spinners

**Usage:**
```javascript
// Initialize events (called automatically)
UI.initEvents();

// Table operations
UI.expandRow('candidate-123');
UI.collapseRow('candidate-123');
UI.sortTable(tableElement, 'name');
UI.filterTable(tableElement, 'email', 'gmail.com');
UI.highlightColumn(tableElement, 'status', true);

// Modals
UI.openModal('edit-modal', { name: 'John', email: 'john@example.com' });
UI.closeModal('edit-modal');
UI.toggleModal('edit-modal');

// Forms
const data = UI.getFormData(formElement);
UI.fillForm(formElement, { name: 'Jane', email: 'jane@example.com' });
UI.setFormDisabled(formElement, true);

// Notifications
UI.notify('Success!', 'success', 3000);
UI.notify('Error occurred', 'error');
UI.notify('Loading...', 'info');

// Dialogs
const confirmed = await UI.confirm('Are you sure?');

// Loading
UI.setLoading(true, 'Saving...');
UI.setLoading(false);

// Errors
UI.showError('Something went wrong');

// Focus/Scroll
UI.focus('#email-input');
UI.focus(formElement);
UI.scrollTo('#section-id');
UI.scrollTo(element);
```

### 5. App (`app.js`)
Main application entry point. Initializes all systems and coordinates routing, events, and handlers.

**Key Features:**
- Application initialization
- Route registration (16+ pages)
- Page rendering
- Form submission handling
- Cross-module event coordination

**Usage:**
```javascript
// Application boots automatically on page load
// Access via global `app` object

// Current route info
const route = router.getCurrentRoute();
console.log(route.path);      // '/candidates'
console.log(route.params);    // { id: '123' }

// Navigate
router.navigate('/candidates');
router.navigate('/employees/456');
```

## Data Flow

```
User Action
    ↓
UI.js (Event Handler)
    ↓
router.navigate() or api.call()
    ↓
Router changes hash → Page renders
API calls backend → State updates
    ↓
state.set() triggers subscribers
    ↓
UI re-renders with new data
```

## State Structure

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

  // Cache metadata
  meta: {
    lastFetch: {},
    cacheExpiry: 5 * 60 * 1000
  }
}
```

## URL Routes (16+ Pages)

- `/` - Dashboard
- `/dashboard` - Dashboard (alias)
- `/candidates` - Candidates list
- `/candidates/:id` - Candidate detail
- `/candidates/new` - New candidate form
- `/employees` - Employees list
- `/employees/:id` - Employee detail
- `/employees/new` - New employee form
- `/devices` - Devices list
- `/devices/:id` - Device detail
- `/assignments` - Assignments list
- `/assignments/:id` - Assignment detail
- `/onboarding` - Onboarding progress
- `/onboarding/:id` - Onboarding detail
- `/admin/workflows` - Workflow management
- `/admin/templates` - Email template management
- `/admin/settings` - System settings

## HTML Template

Create an `index.html` file to bootstrap the application:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>V-Two Ops</title>
  <link rel="stylesheet" href="./styles.css">
</head>
<body>
  <div id="app"></div>

  <!-- Load in order -->
  <script src="./js/state.js"></script>
  <script src="./js/api.js"></script>
  <script src="./js/router.js"></script>
  <script src="./js/ui.js"></script>
  <script src="./js/app.js"></script>
</body>
</html>
```

## Environment Configuration

Set API URL in environment:

```bash
# Development (default)
API_URL=http://localhost:3001/api

# Production
API_URL=https://api.vtwo-ops.com/api
```

Or modify `api.js`:
```javascript
this.baseUrl = process.env.API_URL || 'http://localhost:3001/api';
```

## Event System

The framework emits custom events for cross-module communication:

```javascript
// Listen for page loads
window.addEventListener('pageLoaded', (e) => {
  console.log(e.detail.path);
  console.log(e.detail.params);
});

// Listen for form submissions
window.addEventListener('formSubmit', (e) => {
  console.log(e.detail.formId);
  console.log(e.detail.data);
  console.log(e.detail.form);
});

// Listen for row deletions
window.addEventListener('rowDelete', (e) => {
  console.log(e.detail.id);
});

// Listen for field updates
window.addEventListener('fieldUpdate', (e) => {
  console.log(e.detail.rowId);
  console.log(e.detail.fieldName);
  console.log(e.detail.newValue);
});
```

## Data Attributes (HTML API)

Use data attributes in your HTML templates to hook into the framework:

### Navigation
```html
<a data-navigate="/candidates">View Candidates</a>
<a data-navigate="/employees/123" href="#/employees/123">Employee 123</a>
```

### Tables
```html
<button data-toggle-row="123">Details</button>
<button data-sort-by="name">Name</button>
<input data-filter="email">
<button data-delete-row="123">Delete</button>
<td data-column="email">value</td>
```

### Forms
```html
<form data-form="candidate-form">
  <input name="name">
  <textarea name="notes"></textarea>
</form>
```

### Modals
```html
<button data-close-modal="modal-id">Close</button>
<div id="modal-id" class="modal">...</div>
```

### Editing
```html
<span data-edit-field="name" data-row-id="123">Click to edit</span>
```

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## Performance Tips

1. **Caching:** API GET requests are cached for 5 minutes by default
   ```javascript
   api.getCandidates(); // Cached for 5 minutes
   api.clearCache();    // Clear cache
   ```

2. **Lazy Loading:** Pages render on demand as user navigates
3. **State Subscriptions:** Only subscribe to data you need
4. **Local Storage:** Persistent state across sessions

## Security Considerations

- Auth tokens stored in state (not localStorage) for sensitive apps
- All innerHTML uses are for application-generated HTML only
- User input is safely escaped when displayed
- CORS/CSP policies enforced by server

## File Sizes

- `router.js` - ~6 KB
- `state.js` - ~8 KB
- `api.js` - ~10 KB
- `ui.js` - ~12 KB
- `app.js` - ~15 KB
- **Total: ~51 KB (ungzipped)**

## Development Workflow

1. Add new page to `app.js`:
   ```javascript
   router.register('/new-page', () => this.renderNewPage());

   async renderNewPage() {
     return `<main>...</main>`;
   }
   ```

2. Update state as needed:
   ```javascript
   state.set('myData', value);
   ```

3. Add form/event handlers:
   ```javascript
   window.addEventListener('formSubmit', async (e) => {
     if (e.detail.formId === 'my-form') {
       // Handle form
     }
   });
   ```

4. Test in browser - no build step required!

## Troubleshooting

**Page not loading?**
- Check browser console for errors
- Verify API URL is correct
- Check network tab for API response

**State not updating?**
- Use `state.set()` not direct assignment
- Check subscribers are registered before state changes

**Routes not matching?**
- Verify route pattern uses correct syntax (e.g., `/path/:id`)
- Check hash in URL (should start with #)

**Forms not submitting?**
- Verify `data-form` attribute matches form ID in handler
- Check form inputs have `name` attributes

## License

MIT - Built for V-Two Ops
