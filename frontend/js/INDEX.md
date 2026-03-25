# Vanilla JavaScript Framework - File Index

**Location:** `/Users/oliver/OliverRepo/workspaces/work/projects/vtwo-ops/frontend/js/`

## Quick Navigation

### Start Here
1. **QUICK_START.md** ← Read this first (5 minutes)
2. **README.md** ← Full API reference
3. **IMPLEMENTATION_GUIDE.md** ← Architecture deep dive

### Framework Code (Load in Order)
```html
<script src="./js/state.js"></script>      <!-- State management -->
<script src="./js/api.js"></script>        <!-- API integration -->
<script src="./js/router.js"></script>     <!-- Routing -->
<script src="./js/ui.js"></script>         <!-- UI helpers -->
<script src="./js/app.js"></script>        <!-- Main app -->
```

---

## File Descriptions

### `router.js` (6.2 KB)
**Hash-based client-side routing engine**

- Register routes with dynamic parameters
- Navigate between pages without reload
- Handle URL parameters (:id)
- Loading/error/404 states
- Browser history support

```javascript
router.navigate('/candidates/123');
router.getCurrentRoute();
```

**Export:** Global `router` object

---

### `state.js` (8.4 KB)
**Global reactive state management**

- Centralized state object
- Dot-notation access (state.get('ui.loading'))
- Subscribe to changes (observer pattern)
- Array operations (push, remove, find, filter)
- localStorage persistence
- Cache expiration

```javascript
state.set('candidates', []);
state.subscribe('candidates', (newVal) => console.log(newVal));
state.push('candidates', item);
```

**Export:** Global `state` object

---

### `api.js` (10.0 KB)
**Fetch wrapper with caching and error handling**

- HTTP methods: GET, POST, PATCH, DELETE
- Automatic response parsing
- GET request caching (5 min default)
- Bearer token authentication
- Loading/error state management
- 30-second request timeout
- Pre-built methods for all entities

```javascript
const candidates = await api.getCandidates();
const newEmp = await api.createEmployee({name: 'Jane'});
await api.updateCandidate('123', {status: 'hired'});
```

**Export:** Global `api` object

---

### `ui.js` (14.0 KB)
**UI helper functions for common interactions**

- Table sorting (numeric & string)
- Table filtering (case-insensitive)
- Row expansion (collapsible)
- Inline field editing
- Modal management (open/close/toggle)
- Confirmation dialogs
- Form data get/set
- Toast notifications
- Error banners
- Loading spinners

```javascript
UI.notify('Saved!', 'success', 3000);
UI.openModal('edit-modal', {name: 'John'});
UI.sortTable(tableElement, 'name');
```

**Export:** Global `UI` class (static methods)

---

### `app.js` (25.0 KB)
**Application entry point with 16+ page renderers**

- Application initialization
- Route registration for all pages
- Page renderers (dashboard, candidates, employees, devices, assignments, onboarding, admin)
- Form submission handling
- Row deletion handling
- Inline field update handling
- Cross-module event coordination

**Routes:**
- `/` - Dashboard
- `/candidates`, `/candidates/:id`, `/candidates/new`
- `/employees`, `/employees/:id`, `/employees/new`
- `/devices`, `/devices/:id`
- `/assignments`, `/assignments/:id`
- `/onboarding`, `/onboarding/:id`
- `/admin/workflows`, `/admin/templates`, `/admin/settings`

**Export:** Global `app` object

---

## Documentation Files

### `README.md` (11 KB)
**Complete API reference**

- Architecture overview
- Module descriptions with API
- Data structure
- Global objects
- URL routes
- Environment configuration
- Event system
- Data attributes (HTML API)
- Browser support
- Performance tips
- Security notes
- File sizes
- Development workflow
- Troubleshooting

**When to read:** After QUICK_START.md

---

### `QUICK_START.md` (10 KB)
**5-minute setup and usage guide**

- File loading order
- Core usage patterns
- Routing examples
- State management examples
- API call examples
- UI function examples
- HTML data attributes
- Event listening
- Adding new pages
- Form handling
- Debugging

**When to read:** First (5 minutes)

---

### `IMPLEMENTATION_GUIDE.md` (12 KB)
**Deep dive into architecture**

- Architecture diagram
- File-by-file detailed reference
- Global objects documentation
- Event flow
- Real-world examples
  - Create candidate
  - Add table filtering
  - Inline editing
- Performance considerations
- Security notes
- Testing strategies
- Extending the framework

**When to read:** For deep understanding

---

## Related Project Files

### `VANILLA_JS_FRAMEWORK_DELIVERABLES.md`
Main project deliverables document in parent directory
- Feature checklist
- File inventory
- Integration guide
- Deployment instructions

### `FRAMEWORK_COMPLETION_SUMMARY.md`
Completion summary in parent directory
- All deliverables
- Metrics
- Success criteria
- Next steps

---

## Usage Summary

### Include in HTML
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>V-Two Ops</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <div id="app"></div>

  <!-- Load in this order -->
  <script src="js/state.js"></script>
  <script src="js/api.js"></script>
  <script src="js/router.js"></script>
  <script src="js/ui.js"></script>
  <script src="js/app.js"></script>
</body>
</html>
```

### Basic Operations
```javascript
// Navigate
router.navigate('/candidates');

// Get data
const candidates = await api.getCandidates();

// Update state
state.set('candidates', candidates);

// Listen to changes
state.subscribe('candidates', (newVal) => {
  console.log('Candidates changed!');
});

// Show notification
UI.notify('Saved!', 'success');

// Open modal
UI.openModal('edit-modal', {name: 'John'});
```

---

## HTML Data Attributes

No code required for common interactions:

```html
<!-- Navigation -->
<a data-navigate="/candidates">View Candidates</a>

<!-- Tables -->
<button data-toggle-row="123">Expand</button>
<th data-sort-by="name">Name</th>
<input data-filter="email">
<button data-delete-row="123">Delete</button>
<td data-column="email">value</td>

<!-- Forms -->
<form data-form="candidate-form">
  <input name="name">
</form>

<!-- Modals -->
<button data-close-modal="modal-id">Close</button>
<div id="modal-id" class="modal"></div>

<!-- Inline Editing -->
<span data-edit-field="status" data-row-id="123">value</span>
```

---

## Global Objects

Available after page load:

```javascript
state    // StateManager instance
api      // API instance
router   // Router instance
UI       // UI static class
app      // Application instance
```

---

## Key Features

✓ **Router**
- Hash-based routing
- Dynamic parameters
- Async page handlers
- Error/404 pages
- History support

✓ **State**
- Reactive subscriptions
- Dot-notation access
- Array operations
- localStorage persistence

✓ **API**
- Fetch wrapper
- Caching (5 min)
- Error handling
- Auth tokens
- 30 sec timeout

✓ **UI**
- Table sorting/filtering
- Row expansion
- Inline editing
- Modal management
- Notifications

✓ **App**
- 16+ pre-built pages
- Form handling
- Event coordination
- Error handling

---

## Common Tasks

### Navigate to Page
```javascript
router.navigate('/candidates');
router.navigate('/employees/123');
```

### Get Data
```javascript
const data = await api.getCandidates();
```

### Update State
```javascript
state.set('candidates', data);
state.push('candidates', newItem);
```

### Show Notification
```javascript
UI.notify('Done!', 'success', 3000);
```

### Open Modal
```javascript
UI.openModal('edit-modal', {name: 'John'});
```

### Handle Form Submission
```javascript
window.addEventListener('formSubmit', async (e) => {
  if (e.detail.formId === 'candidate-form') {
    // Handle submission
  }
});
```

---

## Getting Started

1. **Read QUICK_START.md** (5 min)
2. **Open index.html** in browser
3. **Test routes** - navigate to `#/candidates`
4. **Connect API** - update `api.baseUrl` in api.js
5. **Customize** - add custom pages as needed

---

## Support

| Question | Answer |
|----------|--------|
| How do I navigate? | Use `router.navigate('/path')` or `data-navigate` attribute |
| How do I get data? | Use `await api.getXxx()` methods |
| How do I update UI? | Use `state.set()` and subscribe to changes |
| How do I show messages? | Use `UI.notify()` |
| How do I handle forms? | Use `data-form` attribute and listen to `formSubmit` event |
| How do I add a new page? | Create renderer in app.js and register route |
| No build step? | Correct - pure JavaScript, no compilation |
| Works offline? | With data in state/localStorage, yes |
| Mobile friendly? | Yes - responsive CSS included |
| Browser support? | Chrome 60+, Firefox 55+, Safari 11+, Edge 79+ |

---

## Project Structure

```
/Users/oliver/OliverRepo/workspaces/work/projects/vtwo-ops/
├── frontend/
│   ├── index.html                    (main entry point)
│   ├── css/
│   │   └── style.css                 (styling)
│   └── js/                            (FRAMEWORK FILES)
│       ├── router.js                 (routing)
│       ├── state.js                  (state)
│       ├── api.js                    (API)
│       ├── ui.js                     (UI)
│       ├── app.js                    (app)
│       ├── INDEX.md                  (this file)
│       ├── README.md                 (full docs)
│       ├── QUICK_START.md            (quick guide)
│       └── IMPLEMENTATION_GUIDE.md   (deep dive)
├── server/                            (backend API)
├── FRAMEWORK_COMPLETION_SUMMARY.md   (completion report)
└── VANILLA_JS_FRAMEWORK_DELIVERABLES.md
```

---

## Code Stats

| Metric | Value |
|--------|-------|
| Framework Files | 5 |
| Documentation Files | 3 |
| Total Code | ~1,450 lines |
| Total Docs | ~1,800 lines |
| Bundle Size | 63.6 KB |
| Gzipped Size | ~20 KB |
| Dependencies | 0 |

---

## Next Steps

1. Review **QUICK_START.md**
2. Test in browser
3. Connect to backend
4. Customize pages
5. Deploy to production

---

**Framework Status:** ✓ Complete and Production Ready
**Last Updated:** March 24, 2026
**Location:** `/Users/oliver/OliverRepo/workspaces/work/projects/vtwo-ops/frontend/js/`
