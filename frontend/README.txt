V.TWO OPS FRONTEND TEMPLATES

Pure HTML/CSS/JavaScript template layer extracted from MOCKUP-v2.html.
Zero framework dependencies. 16 pages, complete design system.

FILES CREATED

Core
  index.html              - Main SPA shell with sidebar, topbar, content
  css/style.css           - Complete design system (3700+ lines)
  js/app.js               - Page routing and lifecycle management

Pages (16 total)
  pages/dashboard.html    - Home dashboard with stats and widgets
  pages/hiring.html       - Candidates table + detail panel
  pages/directory.html    - Employees table + detail panel
  pages/onboarding.html   - Active onboarding runs
  pages/offboarding.html  - Active offboarding runs
  pages/inventory.html    - Device inventory table + detail
  pages/assignments.html  - Device assignment history
  pages/tracks.html       - Career tracks
  pages/reports.html      - Export and reporting
  pages/settings.html     - Settings with navigation
  pages/admin/custom-fields.html    - Admin custom fields
  pages/admin/templates.html        - Admin email templates
  pages/admin/settings.html         - Admin system settings
  pages/admin/feature-requests.html - Feature requests
  pages/admin/health.html           - System health monitoring

DESIGN SYSTEM

Color Palette (Gray/Black)
  Primary Text: #111 (black)
  Background: #fff (white), #fafafa (off-white sidebar)
  Borders: #e8e8e8 (light gray)
  Labels: #aaa (medium gray)

Status Colors
  Green (#166534): Active, Available, Complete, Hired
  Blue (#1d4ed8): Interview, In Progress
  Amber (#92400e): Screening, Assigned, Pending
  Red (#c0392b): Rejected, Stale, Offboarded
  Purple (#7e22ce): Company role, Admin

Layout Dimensions
  Sidebar: 216px fixed width
  Topbar: 48px fixed height
  Detail Panel: 360px fixed width
  Content: Full remaining space

Components
  Tables with sticky headers, hover states, row selection
  Detail panels with tabs and actions
  Modals with forms and buttons
  Dashboard widgets with stats and lists
  Forms with inputs, selects, textareas
  Status badges and pills

Typography
  System font: -apple-system, BlinkMacSystemFont, SF Pro Text
  Heading: 24px, weight 500
  Body: 13px, weight 400
  Label: 10.5px, uppercase, weight 500
  Code: 12.5px

PAGES STRUCTURE

Dashboard (dashboard.html)
  4-column stats row
  2-column widget grid (stale candidates, upcoming interviews)
  2-column widget grid (pending tasks, recent activity)

Table Pages (hiring, directory, inventory)
  Split layout: table + detail panel
  Toolbar with filter chips
  Sortable columns
  Detail panels with tabs

Settings (settings.html)
  Split layout: nav + content
  Accordion sections

Admin Pages
  Follow settings layout pattern
  System configuration interfaces

JAVASCRIPT INTEGRATION

Global Functions
  loadPage(name)      - Load page dynamically
  closeDetailPanel()  - Hide detail panel
  closeModal()        - Hide modal
  showModal(id)       - Show modal

Page Routing
  Click nav item -> loadPage() -> fetch page HTML -> insert -> initialize

Detail Panels
  Click table row -> add .selected class -> show panel
  Click close -> hide panel

Tables
  setupTableClickHandlers(tableId) -> enables row selection

Settings
  setupSettingsNavigation() -> show/hide sections by data-section

CUSTOMIZATION

Adding a New Page
  1. Create pages/newpage.html with class=page container
  2. Add to PAGES object in app.js
  3. Add nav item to index.html sidebar
  4. Add PAGE_META entry for title/breadcrumb

Changing Colors
  Edit css/style.css
  Primary: #111
  Accents: .s-{status} classes
  Backgrounds: .sidebar, .widget

Adding Modals
  Use .modal-overlay and .modal classes
  Initialize with showModal(id)

DATA POPULATION

API Integration Pattern
  1. Page loads (fetch pages/*.html)
  2. Page initializes (event listeners)
  3. JavaScript calls API endpoint
  4. JSON response populates into DOM by ID
  5. User interaction triggers POST/PUT/DELETE

Tables: fetch() -> populate tbody -> setupTableClickHandlers()
Forms: collect input values -> fetch() -> updateUI()
Detail Panels: Populate fields from row data on selection

NO DEPENDENCIES

Zero npm packages
No CSS framework
No JavaScript framework
Vanilla HTML, CSS, JavaScript only
Works in any modern browser

RESPONSIVE DESIGN

Current layout is fixed desktop (1280px max)

To add mobile support:
  Change .shell height and widths to %
  Hide sidebar on mobile
  Make detail panels full-width
  Stack 2-column grids to 1 column

BROWSER SUPPORT

Chrome, Safari, Firefox, Edge (modern versions)
Requires: CSS Grid, Flexbox, Fetch API

PERFORMANCE

Static HTML pages (no build step)
Single CSS file (3700 lines)
Minimal JavaScript (app.js)
Fast page transitions (DOM swap)
Instant navigation

DOCUMENTATION

TEMPLATES.md     - Complete reference with CSS classes and HTML patterns
QUICK_START.md   - Getting started guide with examples
README.txt       - This file
README.md        - Markdown format (may have security warnings)

NEXT PHASE

1. Connect app.js to backend API endpoints
2. Populate tables with real data from API
3. Implement form validation and submission
4. Add search and filtering logic
5. Create responsive mobile layout
6. Add keyboard shortcuts
7. Implement PWA features (offline)

TESTING

Open index.html in browser. All pages load, sidebar nav works, detail
panels show/hide. No API integration required - templates are pure HTML.

LOCATION

/Users/oliver/OliverRepo/workspaces/work/projects/vtwo-ops/frontend/

All 16 pages + core files ready for backend integration.
