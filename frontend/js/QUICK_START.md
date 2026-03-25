# V-Two Ops Vanilla JS Framework - Quick Start

## 5-Minute Setup

### Files Created
Located in `/Users/oliver/OliverRepo/workspaces/work/projects/vtwo-ops/frontend/js/`:

1. **router.js** - Client-side routing (hash-based)
2. **state.js** - Global state management with subscriptions
3. **api.js** - API fetch wrapper with caching
4. **ui.js** - UI helper functions
5. **app.js** - Application entry point and page handlers

Plus:
- **README.md** - Full documentation (400+ lines)
- **QUICK_START.md** - This file

### File Loading Order (In HTML)

```html
<!-- Must load in this order -->
<script src="./js/state.js"></script>
<script src="./js/api.js"></script>
<script src="./js/router.js"></script>
<script src="./js/ui.js"></script>
<script src="./js/app.js"></script>
```

## Core Usage Patterns

### 1. Routing (Hash-based)

```javascript
// Navigate to pages
router.navigate('/candidates');
router.navigate('/employees/123');  // With ID parameter
router.navigate('/candidates/:id', { id: '456' });

// Current route
const { path, params } = router.getCurrentRoute();
```

URL patterns:
```
http://localhost:8000/#/
http://localhost:8000/#/candidates
http://localhost:8000/#/candidates/123
http://localhost:8000/#/employees/456
```

### 2. State Management

```javascript
// Get values
const candidates = state.get('candidates');
const isLoading = state.get('ui.loading');

// Set values
state.set('candidates', [{ id: 1, name: 'John' }]);
state.set('ui.loading', true);

// Subscribe to changes
state.subscribe('candidates', (newValue, oldValue) => {
  console.log('Candidates updated!', newValue);
});

// Array methods
state.push('candidates', newCandidate);
state.remove('candidates', c => c.id === '123');
state.filter('candidates', c => c.status === 'active');
```

### 3. API Calls

```javascript
// Get data (with caching)
const candidates = await api.getCandidates();
const candidate = await api.getCandidate('123');

// Create (POST)
const newEmployee = await api.createEmployee({
  name: 'Jane Doe',
  email: 'jane@example.com',
  department: 'Engineering'
});

// Update (PATCH)
const updated = await api.updateCandidate('123', {
  status: 'hired'
});

// Delete
await api.deleteDevice('device-id');

// Error handling
try {
  await api.getCandidates();
} catch (error) {
  console.error(error.message);
  // Loading state automatically cleared
}
```

### 4. UI Functions

```javascript
// Tables
UI.expandRow('row-123');
UI.collapseRow('row-123');
UI.sortTable(tableElement, 'name');
UI.filterTable(tableElement, 'email', 'gmail');

// Modals
UI.openModal('edit-modal', { name: 'John', email: 'john@example.com' });
UI.closeModal('edit-modal');

// Forms
const formData = UI.getFormData(formElement);
UI.fillForm(formElement, { name: 'Jane' });
UI.setFormDisabled(formElement, true);

// Notifications
UI.notify('Saved!', 'success', 3000);
UI.notify('Error', 'error');
UI.showError('Something went wrong');

// Loading
UI.setLoading(true, 'Saving...');
UI.setLoading(false);
```

## 16+ Pre-Built Pages

All pages are automatically registered in `app.js`:

**Dashboard**
- `/` - Main dashboard

**Candidates** (4 pages)
- `/candidates` - List
- `/candidates/:id` - Detail view
- `/candidates/new` - Create form

**Employees** (4 pages)
- `/employees` - List
- `/employees/:id` - Detail view
- `/employees/new` - Create form

**Devices** (3 pages)
- `/devices` - List
- `/devices/:id` - Detail view

**Assignments** (2 pages)
- `/assignments` - List
- `/assignments/:id` - Detail view

**Onboarding** (2 pages)
- `/onboarding` - Progress list
- `/onboarding/:id` - Detail view

**Admin** (3 pages)
- `/admin/workflows` - Workflow management
- `/admin/templates` - Email templates
- `/admin/settings` - System settings

## HTML Data Attributes (No Code Required!)

Use these attributes in templates to connect to the framework:

### Navigation Links
```html
<a data-navigate="/candidates">View Candidates</a>
<a data-navigate="/employees/123" href="#/employees/123">Employee 123</a>
```

### Table Controls
```html
<!-- Sorting -->
<th data-sort-by="name">Name</th>

<!-- Filtering -->
<input data-filter="email" placeholder="Filter by email">

<!-- Row expansion -->
<button data-toggle-row="123">Details</button>

<!-- Row deletion -->
<button data-delete-row="123">Delete</button>

<!-- Column reference -->
<td data-column="email">user@example.com</td>
```

### Forms
```html
<form data-form="candidate-form">
  <input name="name">
  <input name="email">
</form>
```

### Modals
```html
<button data-close-modal="modal-id">Close</button>
<div id="modal-id" class="modal">...</div>
```

### Inline Editing
```html
<span data-edit-field="name" data-row-id="123">Click to edit</span>
```

## Event Listening

Listen for cross-module events:

```javascript
// Page loaded
window.addEventListener('pageLoaded', (e) => {
  console.log(e.detail.path);    // '/candidates'
  console.log(e.detail.params);  // { id: '123' }
});

// Form submission
window.addEventListener('formSubmit', async (e) => {
  if (e.detail.formId === 'candidate-form') {
    const data = e.detail.data;  // { name: 'John', email: '...' }
    // Handle submission
  }
});

// Row deletion
window.addEventListener('rowDelete', (e) => {
  console.log(e.detail.id);  // ID to delete
});

// Field update (inline edit)
window.addEventListener('fieldUpdate', (e) => {
  console.log(e.detail.rowId, e.detail.fieldName, e.detail.newValue);
});
```

## Adding a New Page

1. Create render function in `app.js`:
```javascript
async renderMyPage() {
  return `
    <main>
      <h1>My Page</h1>
      <p>Content here</p>
    </main>
  `;
}
```

2. Register route:
```javascript
router.register('/mypage', () => this.renderMyPage());
```

3. Add navigation link (in HTML):
```html
<a data-navigate="/mypage" href="#/mypage">My Page</a>
```

Done! No build step required.

## Handling Form Submissions

In `app.js`, the framework already handles this for you:

```javascript
// When form with data-form="myform" is submitted:
window.addEventListener('formSubmit', async (e) => {
  if (e.detail.formId === 'myform') {
    try {
      // Get form data
      const { data } = e.detail;

      // Call API
      const result = await api.post('/endpoint', data);

      // Show success
      UI.notify('Success!', 'success');

      // Navigate
      router.navigate('/other-page');
    } catch (error) {
      UI.notify(error.message, 'error');
    }
  }
});
```

## State Subscriptions

Reactively update UI when state changes:

```javascript
// Subscribe to candidates list
state.subscribe('candidates', (newCandidates) => {
  console.log('Candidates count:', newCandidates.length);
  // Update UI
  renderCandidatesList(newCandidates);
});

// Subscribe to loading state
state.subscribe('ui.loading', (isLoading) => {
  if (isLoading) {
    UI.setLoading(true);
  } else {
    UI.setLoading(false);
  }
});
```

## Environment Configuration

Set API URL:

```javascript
// In api.js, line 10:
this.baseUrl = process.env.API_URL || 'http://localhost:3001/api';
```

Or in HTML (before loading scripts):
```html
<script>
  window.API_URL = 'https://api.production.com/api';
</script>
<script src="./js/state.js"></script>
<!-- ... -->
```

Then in `api.js`:
```javascript
this.baseUrl = window.API_URL || 'http://localhost:3001/api';
```

## Performance Notes

- **Caching:** GET requests cached for 5 minutes
- **No Build Step:** Works directly in browser (no webpack, no compilation)
- **Bundle Size:** ~51 KB ungzipped (all 5 files combined)
- **Lazy Loading:** Pages render on demand as user navigates
- **Local Storage:** State persists across sessions

## Debugging

### Check Current State
```javascript
console.log(state.get());  // All state
console.log(state.get('candidates'));  // Specific data
console.log(state.get('ui.loading'));  // Nested path
```

### Check Current Route
```javascript
const { path, params } = router.getCurrentRoute();
console.log(path, params);
```

### Monitor API Calls
```javascript
console.log(api.getCacheInfo());  // See what's cached
api.clearCache();  // Clear all caches
```

### Listen to All Page Loads
```javascript
window.addEventListener('pageLoaded', (e) => {
  console.log('Page loaded:', e.detail);
});
```

## Troubleshooting

**API calls not working?**
- Check API URL is correct: `api.baseUrl`
- Check network tab in DevTools
- Verify backend is running on correct port

**Routes not loading?**
- Check hash in URL (should be `#/path`)
- Verify route is registered in `app.js`
- Check browser console for errors

**State not updating UI?**
- Use `state.set()` not direct assignment
- Subscribe before state changes
- Check that subscriber is called with `console.log()`

**Forms not submitting?**
- Check `data-form` attribute matches handler ID
- Verify all inputs have `name` attributes
- Check form handler in `app.js`

## Next Steps

1. **Read full documentation:** `README.md` (400+ lines)
2. **Explore pages:** Look at page renderers in `app.js`
3. **Test locally:** Open `index.html` in browser
4. **Connect backend:** Update API URL in `api.js`
5. **Add custom pages:** Follow the "Adding a New Page" pattern above

## Key Files

- `/js/router.js` - 200 lines, routing logic
- `/js/state.js` - 220 lines, state & subscriptions
- `/js/api.js` - 240 lines, fetch wrapper
- `/js/ui.js` - 280 lines, UI helpers
- `/js/app.js` - 420 lines, app + 16 pages
- `/js/README.md` - Full documentation
- `/index.html` - Main HTML file (already exists)

## Live Demo

Once backend is running:

1. Start local server:
```bash
cd /Users/oliver/OliverRepo/workspaces/work/projects/vtwo-ops/frontend
python3 -m http.server 8000
# or: npx http-server
```

2. Open browser:
```
http://localhost:8000/
```

3. Navigate to:
```
http://localhost:8000/#/candidates
http://localhost:8000/#/employees
http://localhost:8000/#/devices
```

4. Tables, modals, forms all work immediately!

## No Build Step!

This is pure vanilla JavaScript. No webpack, no npm install required (except for optional http-server).

Just:
1. Update the files
2. Refresh browser
3. See changes immediately

No compilation, no transpiling, no bundling. Just JavaScript.

---

For detailed API reference, see `README.md`.
