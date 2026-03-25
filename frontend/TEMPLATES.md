# V.Two Ops Frontend Templates

Complete reusable HTML template layer extracted from the V.Two Ops UI mockup. This is a pure HTML/CSS/JavaScript system with zero framework dependencies.

## Directory Structure

```
frontend/
├── index.html                 # Main SPA shell (sidebar, topbar, content areas)
├── css/
│   └── style.css             # Complete design system (3600+ lines)
├── js/
│   └── app.js                # Application controller (page routing, lifecycle)
└── pages/
    ├── dashboard.html        # Dashboard with stats, widgets
    ├── hiring.html           # Candidates table + detail panel
    ├── directory.html        # Employees table + detail panel
    ├── onboarding.html       # Active onboarding runs
    ├── offboarding.html      # Active offboarding runs
    ├── inventory.html        # Device inventory table + detail
    ├── assignments.html      # Device assignment history
    ├── tracks.html           # Career tracks/career paths
    ├── reports.html          # Export/reporting cards
    ├── settings.html         # Settings with nav and sections
    ├── search.html           # Global search results
    └── admin/
        ├── custom-fields.html    # Admin custom fields
        ├── templates.html        # Admin email templates
        ├── settings.html         # Admin system settings
        ├── feature-requests.html # Admin feature requests
        └── health.html           # Admin system health
```

## Design System (style.css)

### Color Palette (Gray/Black Minimal)
- **Primary**: #111 (black) for text, buttons
- **Background**: #fff (white) for main, #fafafa (off-white) for sidebar
- **Borders**: #e8e8e8 (light gray)
- **Accents**: #aaa (medium gray) for labels

### Status Badge Colors
- Green (#166534): Active, Available, Complete, Hired
- Blue (#1d4ed8): Interview, In Progress, Active
- Amber (#92400e): Screening, Assigned, Pending
- Red (#c0392b): Rejected, Stale, Offboarded
- Purple (#7e22ce): Company, Role
- Gray (#374151): Applied, Pending, Viewer role

### Components
- **Sidebar** (216px wide): Logo, nav groups, user footer
- **Topbar** (48px tall): Title, breadcrumb, search, action buttons
- **Tables**: Sticky headers, hover states, selected rows
- **Detail Panel** (360px wide): Header, tabs, body, actions
- **Modals**: Centered overlay, forms, buttons
- **Widgets**: Cards with titles, content rows, badges
- **Status Pills**: Inline badges for stages and states

### Typography
- System font: `-apple-system, BlinkMacSystemFont, 'SF Pro Text'`
- Heading: 24px, weight 500
- Body: 13px, weight 400
- Label: 10.5px, uppercase, weight 500
- Code: 12.5px (for forms)

## Page Templates

### Dashboard (dashboard.html)
**Structure**: Full-width, scrollable content
**Components**:
- 4-column stat row (key metrics)
- 2-column dash grid (stale candidates, upcoming interviews)
- 2-column dash grid (pending tasks, recent activity)

**Data Attributes**:
- `id="stat-candidates"` - Active candidates count
- `id="stat-interviews"` - Interviews count
- `id="stat-onboardings"` - Onboarding count
- `id="stat-devices"` - Devices count

### Table Pages (hiring.html, directory.html, inventory.html)
**Structure**: Split layout (table + detail panel side-by-side)
**Components**:
- Table toolbar with filter chips
- Sticky table header with sortable columns
- Detail panel (hidden by default, shown on row select)

**Detail Panel Structure**:
- Header: Name, subtitle, metadata
- Tabs: Overview, detailed sections
- Body: Field rows
- Actions: Buttons (Edit, Delete, Advance, etc.)

**Selection Behavior**:
- Click row → Add `.selected` class
- Scroll row into view
- Show detail panel with `.display = 'flex'`

### Settings (settings.html)
**Structure**: Split layout (nav + content)
**Components**:
- Left: Navigation items (data-section)
- Right: Sections (data-section, hidden by default)
- Accordion behavior: Show/hide by data-section

**Sections**:
- Custom Fields
- Templates
- Organization
- Users
- Integrations

### Admin Pages
All admin pages follow the settings layout pattern:
- Left navigation sidebar (180px)
- Right content area (scrollable)
- Same styling as settings

## HTML Conventions

### Page Container
```html
<div class="page" id="page-{name}" data-page="{name}">
  <!-- Page content -->
</div>
```

### Detail Panel
```html
<div class="detail-panel" id="{type}-detail-panel" style="display:none;">
  <div class="dp-header">
    <span class="dp-close" onclick="closeDetailPanel()">✕</span>
    <div class="dp-name" id="{field}-name"></div>
    <!-- More fields -->
  </div>
  <div class="dp-tabs">
    <div class="dp-tab active" data-tab="overview">Overview</div>
  </div>
  <div class="dp-body">
    <div class="tab-content" data-tab="overview">
      <!-- Tab content -->
    </div>
  </div>
  <div class="dp-actions">
    <button class="btn btn-primary" id="action-btn">Action</button>
  </div>
</div>
```

### Table Structure
```html
<div class="page-split active">
  <div class="page-flex active">
    <div class="table-toolbar">
      <div class="filter-chip" data-filter="name">Filter ▾</div>
    </div>
    <div class="tbl-wrap">
      <table id="{entity}-table">
        <thead>
          <tr>
            <th data-sort="name">Name ↕</th>
          </tr>
        </thead>
        <tbody id="{entity}-tbody">
          <!-- Rows -->
        </tbody>
      </table>
    </div>
  </div>
  <div class="detail-panel" id="{entity}-detail-panel">
    <!-- Detail panel -->
  </div>
</div>
```

## JavaScript Integration (app.js)

### Page Loading
```javascript
loadPage('hiring')  // Loads pages/hiring.html, updates nav
```

### Detail Panels
```javascript
closeDetailPanel()  // Hides all *-detail-panel elements
showDetailPanel(id) // Shows specific panel, sets display:flex
```

### Modals
```javascript
showModal('modal-add-candidate')  // Shows modal overlay
closeModal()  // Hides modal overlay
```

### Table Selection
```javascript
setupTableClickHandlers('candidates-table')
// Adds click event: select row, add .selected class
```

### Settings Navigation
```javascript
setupSettingsNavigation()
// Shows/hides sections based on nav-item data-section
```

## CSS Classes Reference

### Layout
- `.shell` - Main container (flex)
- `.sidebar` - Left sidebar (216px)
- `.main` - Right content area (flex column)
- `.topbar` - Top navigation (48px)
- `.content` - Page container (flex, position relative)
- `.page` - Page wrapper (position absolute)
- `.page-split` - Two-column page (flex)
- `.page-flex` - Vertical flex page

### Components
- `.widget` - Card (border, padding, rounded)
- `.stat-card` - Stat widget (light gray bg)
- `.table-toolbar` - Filter bar above table
- `.tbl-wrap` - Table scroll wrapper
- `.detail-panel` - Side panel (360px)
- `.dp-header` - Panel header
- `.dp-tabs` - Tab bar
- `.dp-body` - Panel content
- `.dp-actions` - Button row
- `.modal-overlay` - Full-screen overlay
- `.modal` - Modal box

### Forms
- `.form-row` - Grid row (2 col default)
- `.form-row.full` - Single column
- `.form-group` - Label + input
- `.form-label` - Label text
- `.form-input` - Text input
- `.form-select` - Select dropdown
- `.form-textarea` - Textarea
- `.form-hint` - Helper text

### Typography
- `.stat-lbl` - Stat label (uppercase, small)
- `.stat-val` - Stat value (large, bold)
- `.stat-sub` - Stat subtitle (gray)
- `.widget-title` - Widget header (uppercase)
- `.field-lbl` - Field label
- `.field-val` - Field value

### Status & Badges
- `.badge-red` - Red background badge
- `.badge-amber` - Orange background badge
- `.badge-green` - Green background badge
- `.badge-blue` - Blue background badge
- `.badge-gray` - Gray background badge
- `.stage-pill` - Inline status pill
- `.s-{status}` - Status-specific color (e.g., `.s-interview`)
- `.role-badge` - Role badge (admin, viewer)
- `.role-admin` - Admin badge (purple)
- `.role-viewer` - Viewer badge (gray)
- `.status-active` - Active status (green)
- `.status-inactive` - Inactive status (gray)

### Navigation
- `.nav-item` - Sidebar nav item
- `.nav-item.active` - Active nav item
- `.nav-item.top` - Top-level nav item
- `.nav-group` - Nav group container
- `.nav-group-label` - Group label

### Interaction States
- `.active` - Active state (nav, tabs, detail panels)
- `.on` - Enabled state (filter chips)
- `.selected` - Row selected (tables)
- `.checked` - Checkbox selected (options)
- `:hover` - Hover state (all interactive elements)
- `:focus` - Focus state (form inputs)

## Data Attributes for JS

### Navigation
- `data-page="dashboard"` - Page to load on click

### Routing
- `data-section="custom-fields"` - Settings section to show

### Tables
- `data-sort="name"` - Column sort key
- `data-filter="stage"` - Filter type

### Modals
- `data-tab="overview"` - Tab content ID

### Settings
- `data-section="custom-fields"` - Section container

## Usage Example

### Loading a Page
```javascript
// In app.js already integrated
loadPage('hiring')  // Loads hiring.html, updates sidebar
```

### Showing Detail Panel
```javascript
// Table row is selected, panel shown automatically
const row = document.querySelector('tbody tr');
row.classList.add('selected');
document.getElementById('hiring-detail-panel').style.display = 'flex';
```

### Form Submission
```javascript
document.querySelector('form').addEventListener('submit', (e) => {
  e.preventDefault();
  // Collect form data
  // POST to API
  closeModal();
});
```

## Integration Points

The templates are designed to work with a backend API:

### API Endpoints Expected
- `GET /api/dashboard` - Dashboard stats
- `GET /api/candidates` - Candidates list
- `GET /api/employees` - Employees list
- `GET /api/devices` - Device inventory
- `GET /api/tracks` - Career tracks
- `POST /api/candidates` - Create candidate
- `PUT /api/candidates/:id` - Update candidate
- `DELETE /api/candidates/:id` - Delete candidate

### Data Population Flow
1. Page loads (fetch HTML from pages/*)
2. JS initializes page-specific behavior (setupTableClickHandlers, etc.)
3. Backend API calls populate data
4. Click handler shows detail panel
5. Form submission posts changes back to API

## Notes

- All CSS is embedded in style.css (no external dependencies)
- No CSS framework or utility classes (pure component CSS)
- Responsive layout uses CSS Grid and Flexbox
- Modal overlay uses fixed positioning with inset:0
- Tables use position:sticky for header
- Detail panels use position:absolute for smooth transitions
- All spacing uses consistent 8px/12px/16px/20px increments
- All borders are 0.5px for minimal appearance

## Next Steps for Implementation

1. Connect app.js to backend API endpoints
2. Implement table data population from API
3. Add form handlers for create/update/delete
4. Implement search and filtering logic
5. Add keyboard shortcuts and accessibility features
6. Implement responsive mobile layout
