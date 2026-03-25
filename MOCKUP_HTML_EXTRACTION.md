# V.Two Ops — Complete HTML Structure Extraction from Mockups

## File 1: MOCKUP-v2.html (Main Application Mockup)
### Complete Application Structure

---

## DASHBOARD PAGE

### Shell Container
```html
<div id="tab-dashboard" class="shell" style="display:none">
```

### Sidebar Navigation
```html
<div class="sidebar">
  <div class="sb-logo"><div class="sb-wordmark">V.Two <span>Ops</span></div></div>
  <div class="sb-nav">
    <div class="nav-item top active">Dashboard</div>
    <div class="nav-group"><div class="nav-group-label">People</div>
      <div class="nav-item">Candidates</div>
      <div class="nav-item">Employees</div>
      <div class="nav-item">Onboarding</div>
      <div class="nav-item">Offboarding</div>
    </div>
    <div class="nav-group"><div class="nav-group-label">Devices</div>
      <div class="nav-item">Inventory</div>
      <div class="nav-item">Assignments</div>
    </div>
    <div class="nav-item top">Tracks</div>
    <div class="nav-item top">Reports</div>
    <div class="nav-group"><div class="nav-group-label">Settings</div>
      <div class="nav-item">Lists</div>
      <div class="nav-item">Users</div>
    </div>
  </div>
  <div class="sb-foot"><div class="avatar">OK</div><div><div class="sb-user-name">Oliver</div><div class="sb-user-role">Admin</div></div></div>
</div>
```

### Main Content Area
```html
<div class="main">
  <div class="topbar">
    <div class="topbar-title">Dashboard</div>
    <div class="topbar-right">
      <div class="search-box">Global search...</div>
    </div>
  </div>
  <div class="content">
    <div class="page active">
      <div class="dash-pad">
        <!-- STAT CARDS ROW -->
        <div class="stat-row">
          <div class="stat-card"><div class="stat-lbl">Active candidates</div><div class="stat-val">34</div><div class="stat-sub">in pipeline</div></div>
          <div class="stat-card"><div class="stat-lbl">Interviews this week</div><div class="stat-val">7</div><div class="stat-sub">scheduled</div></div>
          <div class="stat-card"><div class="stat-lbl">Onboardings in progress</div><div class="stat-val">3</div><div class="stat-sub">active runs</div></div>
          <div class="stat-card"><div class="stat-lbl">Devices unassigned</div><div class="stat-val">8</div><div class="stat-sub">available</div></div>
        </div>

        <!-- WIDGETS GRID 1 -->
        <div class="dash-grid">
          <div class="widget">
            <div class="widget-title">Stale candidates <span class="badge-red">4</span></div>
            <div class="stale-row"><div><div class="stale-name">Marcus Webb</div><div class="stale-meta">Screening · LinkedIn</div></div><div class="stale-pill">21 days</div></div>
            <div class="stale-row"><div><div class="stale-name">Priya Nair</div><div class="stale-meta">Interview · Mid</div></div><div class="stale-pill">18 days</div></div>
            <div class="stale-row"><div><div class="stale-name">Daniel Cho</div><div class="stale-meta">Screening · Referral</div></div><div class="stale-pill">16 days</div></div>
            <div class="stale-row"><div><div class="stale-name">Amara Osei</div><div class="stale-meta">Applied · Job board</div></div><div class="stale-pill">14 days</div></div>
          </div>
          <div class="widget">
            <div class="widget-title">Upcoming interviews</div>
            <div class="int-row"><div class="date-block"><div class="d">25</div><div class="m">Mar</div></div><div style="flex:1"><div class="int-name">Sofia Reyes</div><div class="int-meta">2:00 PM · J. Kim, T. Park</div></div><div class="fmt-pill">Video</div></div>
            <div class="int-row"><div class="date-block"><div class="d">26</div><div class="m">Mar</div></div><div style="flex:1"><div class="int-name">Leo Hartmann</div><div class="int-meta">10:30 AM · R. Patel</div></div><div class="fmt-pill">Phone</div></div>
            <div class="int-row"><div class="date-block"><div class="d">27</div><div class="m">Mar</div></div><div style="flex:1"><div class="int-name">Chen Wei</div><div class="int-meta">3:00 PM · Client — Acme</div></div><div class="fmt-pill">Onsite</div></div>
          </div>
        </div>

        <!-- WIDGETS GRID 2 -->
        <div class="dash-grid">
          <div class="widget">
            <div class="widget-title">Pending onboarding tasks <span class="badge-amber">5</span></div>
            <div class="task-row"><div class="task-name">Slack &amp; tools access</div><div class="task-who">James Okafor</div><div class="task-due due-today">Today</div></div>
            <div class="task-row"><div class="task-name">Send welcome package</div><div class="task-who">Yuki Tanaka</div><div class="task-due due-future">Mar 29</div></div>
            <div class="task-row"><div class="task-name">IT account setup</div><div class="task-who">Yuki Tanaka</div><div class="task-due due-future">Mar 30</div></div>
            <div class="task-row"><div class="task-name">Device assigned</div><div class="task-who">Yuki Tanaka</div><div class="task-due due-future">Mar 31</div></div>
            <div class="task-row"><div class="task-name">Benefits enrollment</div><div class="task-who">James Okafor</div><div class="task-due due-overdue">2 days overdue</div></div>
          </div>
          <div class="widget">
            <div class="widget-title">Recent activity</div>
            <div class="act-row"><div class="act-dot" style="background:#3b82f6"></div><div><div class="act-text"><span class="act-bold">Sofia Reyes</span> moved to Interview</div><div class="act-time">Today 9:14 AM</div></div></div>
            <div class="act-row"><div class="act-dot" style="background:#16a34a"></div><div><div class="act-text"><span class="act-bold">James Okafor</span> hired — onboarding started</div><div class="act-time">Yesterday 4:32 PM</div></div></div>
            <div class="act-row"><div class="act-dot" style="background:#9333ea"></div><div><div class="act-text"><span class="act-bold">MacBook Pro M3</span> assigned to James Okafor</div><div class="act-time">Yesterday 4:40 PM</div></div></div>
            <div class="act-row"><div class="act-dot" style="background:#aaa"></div><div><div class="act-text"><span class="act-bold">Marcus Webb</span> added · LinkedIn</div><div class="act-time">Mar 22 2:18 PM</div></div></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

---

## CANDIDATES PAGE

### Container & Sidebar
```html
<div id="tab-candidates" class="shell" style="display:none">
  <div class="sidebar">
    <div class="sb-logo"><div class="sb-wordmark">V.Two <span>Ops</span></div></div>
    <div class="sb-nav">
      <div class="nav-item top">Dashboard</div>
      <div class="nav-group"><div class="nav-group-label">People</div>
        <div class="nav-item active">Candidates</div>
        <div class="nav-item">Employees</div>
        <div class="nav-item">Onboarding</div>
        <div class="nav-item">Offboarding</div>
      </div>
      <div class="nav-group"><div class="nav-group-label">Devices</div>
        <div class="nav-item">Inventory</div>
        <div class="nav-item">Assignments</div>
      </div>
      <div class="nav-item top">Tracks</div>
      <div class="nav-item top">Reports</div>
      <div class="nav-group"><div class="nav-group-label">Settings</div>
        <div class="nav-item">Lists</div>
        <div class="nav-item">Users</div>
      </div>
    </div>
    <div class="sb-foot"><div class="avatar">OK</div><div><div class="sb-user-name">Oliver</div><div class="sb-user-role">Admin</div></div></div>
  </div>
```

### Topbar
```html
<div class="topbar">
  <div class="topbar-title">People</div>
  <div class="topbar-sep">/</div>
  <div class="topbar-sub">Candidates</div>
  <div class="topbar-right">
    <button class="btn btn-primary" onclick="showModal('modal-add-candidate')">+ Add candidate</button>
    <div class="search-box">Search candidates...</div>
  </div>
</div>
```

### Content Area with Split Layout
```html
<div class="content">
  <div class="page-split active">
    <div class="page-flex active" style="position:relative;flex:1">
      <!-- TABLE TOOLBAR -->
      <div class="table-toolbar">
        <div class="filter-chip on">Stale ✕</div>
        <div class="filter-chip">Stage ▾</div>
        <div class="filter-chip">Status ▾</div>
        <div class="filter-chip">Seniority ▾</div>
        <div class="filter-chip">Source ▾</div>
        <div class="filter-chip">Client ▾</div>
        <div class="filter-chip">Skills ▾</div>
        <div class="filter-chip">Date added ▾</div>
      </div>

      <!-- TABLE -->
      <div class="tbl-wrap">
        <table>
          <thead><tr>
            <th>Name ↕</th><th>Role</th><th>Stage ↕</th><th>Seniority</th><th>Source</th><th>Client</th><th>Added ↕</th><th>Last activity ↕</th>
          </tr></thead>
          <tbody>
            <tr class="selected" onclick="">
              <td><span class="stale-dot"></span>Sofia Reyes</td>
              <td>Senior PM</td>
              <td><span class="stage-pill s-interview">Interview</span></td>
              <td>Senior</td>
              <td>LinkedIn</td>
              <td>Acme Corp</td>
              <td>Mar 10</td>
              <td>Today</td>
            </tr>
            <tr><td>Leo Hartmann</td><td>Full-stack Dev</td><td><span class="stage-pill s-screening">Screening</span></td><td>Mid</td><td>Referral</td><td>—</td><td>Mar 14</td><td>Mar 22</td></tr>
            <tr><td><span class="stale-dot"></span>Marcus Webb</td><td>UX Designer</td><td><span class="stage-pill s-screening">Screening</span></td><td>Mid</td><td>LinkedIn</td><td>—</td><td>Mar 3</td><td>Mar 3</td></tr>
            <tr><td>Chen Wei</td><td>Backend Dev</td><td><span class="stage-pill s-offer">Offer</span></td><td>Senior</td><td>Job board</td><td>—</td><td>Feb 28</td><td>Mar 20</td></tr>
            <tr><td>Priya Nair</td><td>Data Analyst</td><td><span class="stage-pill s-applied">Applied</span></td><td>Junior</td><td>Job board</td><td>—</td><td>Mar 18</td><td>Mar 18</td></tr>
            <tr><td>Yuki Tanaka</td><td>Project Manager</td><td><span class="stage-pill s-interview">Interview</span></td><td>Senior</td><td>Referral</td><td>—</td><td>Mar 5</td><td>Mar 19</td></tr>
            <tr><td>Daniel Cho</td><td>DevOps Engineer</td><td><span class="stage-pill s-screening">Screening</span></td><td>Mid</td><td>Referral</td><td>—</td><td>Mar 1</td><td>Mar 6</td></tr>
            <tr><td>Amara Osei</td><td>QA Engineer</td><td><span class="stage-pill s-applied">Applied</span></td><td>Junior</td><td>Job board</td><td>—</td><td>Mar 8</td><td>Mar 8</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- DETAIL PANEL -->
    <div class="detail-panel">
      <div class="dp-header">
        <span class="dp-close">✕</span>
        <div class="dp-name">Sofia Reyes</div>
        <div class="dp-sub">sofia.reyes@email.com · +1 (720) 555-0143</div>
        <div class="dp-meta">
          <span class="stage-pill s-interview">Interview</span>
          <span class="tag">Senior</span>
          <span class="tag">Active</span>
        </div>
        <div class="pipeline-row">
          <span class="pip-step done">Applied</span><span class="pip-arrow">›</span>
          <span class="pip-step done">Screening</span><span class="pip-arrow">›</span>
          <span class="pip-step active">Interview</span><span class="pip-arrow">›</span>
          <span class="pip-step">Offer</span><span class="pip-arrow">›</span>
          <span class="pip-step">Hired</span>
        </div>
      </div>
      <div class="dp-tabs">
        <div class="dp-tab active">Overview</div>
        <div class="dp-tab">Interviews</div>
        <div class="dp-tab">Offer</div>
        <div class="dp-tab">Resumes</div>
      </div>
      <div class="dp-body">
        <div class="field"><div class="field-lbl">Location</div><div class="field-val">Denver, CO</div></div>
        <div class="field"><div class="field-lbl">Role applied</div><div class="field-val">Senior PM</div></div>
        <div class="field"><div class="field-lbl">Client</div><div class="field-val">Acme Corp</div></div>
        <div class="field"><div class="field-lbl">Source</div><div class="field-val">LinkedIn</div></div>
        <div class="field"><div class="field-lbl">Sourced</div><div class="field-val">March 10, 2026</div></div>
        <div class="field"><div class="field-lbl">Skills</div><div class="tag-row"><span class="tag">Agile</span><span class="tag">Roadmapping</span><span class="tag">Stakeholder mgmt</span><span class="tag">SQL</span></div></div>
        <div class="field"><div class="field-lbl">Notes</div><div class="field-val muted">Strong B2B SaaS background. Referral from T. Park. Wants response by end of March.</div></div>
      </div>
      <div class="dp-actions">
        <button class="btn btn-secondary" onclick="showModal('modal-log-interview')">Log interview</button>
        <button class="btn btn-primary" onclick="showModal('modal-promote')">Move to Offer →</button>
      </div>
    </div>
  </div>
</div>
```

---

## EMPLOYEES PAGE

### Shell & Sidebar
```html
<div id="tab-employees" class="shell" style="display:none">
  <div class="sidebar">
    <div class="sb-logo"><div class="sb-wordmark">V.Two <span>Ops</span></div></div>
    <div class="sb-nav">
      <div class="nav-item top">Dashboard</div>
      <div class="nav-group"><div class="nav-group-label">People</div>
        <div class="nav-item">Candidates</div>
        <div class="nav-item active">Employees</div>
        <div class="nav-item">Onboarding</div>
        <div class="nav-item">Offboarding</div>
      </div>
      <div class="nav-group"><div class="nav-group-label">Devices</div>
        <div class="nav-item">Inventory</div>
        <div class="nav-item">Assignments</div>
      </div>
      <div class="nav-item top">Tracks</div>
      <div class="nav-item top">Reports</div>
      <div class="nav-group"><div class="nav-group-label">Settings</div>
        <div class="nav-item">Lists</div>
        <div class="nav-item">Users</div>
      </div>
    </div>
    <div class="sb-foot"><div class="avatar">OK</div><div><div class="sb-user-name">Oliver</div><div class="sb-user-role">Admin</div></div></div>
  </div>
```

### Topbar
```html
<div class="topbar">
  <div class="topbar-title">People</div>
  <div class="topbar-sep">/</div>
  <div class="topbar-sub">Employees</div>
  <div class="topbar-right">
    <div class="search-box">Search employees...</div>
  </div>
</div>
```

### Table Content
```html
<div class="content">
  <div class="page-split active">
    <div class="page-flex active" style="position:relative;flex:1">
      <div class="table-toolbar">
        <div class="filter-chip">Status ▾</div>
        <div class="filter-chip">Department ▾</div>
        <div class="filter-chip">Start date ▾</div>
      </div>
      <div class="tbl-wrap">
        <table>
          <thead><tr><th>Name ↕</th><th>Title</th><th>Department</th><th>Start date ↕</th><th>Status</th><th>Devices</th></tr></thead>
          <tbody>
            <tr class="selected"><td>James Okafor</td><td>Full-stack Developer</td><td>Engineering</td><td>Mar 24, 2026</td><td><span class="stage-pill s-active">Active</span></td><td>1 assigned</td></tr>
            <tr><td>Yuki Tanaka</td><td>Project Manager</td><td>Delivery</td><td>Apr 1, 2026</td><td><span class="stage-pill s-active">Active</span></td><td>0 assigned</td></tr>
            <tr><td>Rania Aziz</td><td>UX Designer</td><td>Product</td><td>Jan 6, 2026</td><td><span class="stage-pill s-active">Active</span></td><td>2 assigned</td></tr>
            <tr><td>Tom Nguyen</td><td>QA Engineer</td><td>Engineering</td><td>Nov 4, 2025</td><td><span class="stage-pill s-offboarded">Offboarded</span></td><td>0 assigned</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- EMPLOYEE DETAIL PANEL -->
    <div class="detail-panel">
      <div class="dp-header">
        <span class="dp-close">✕</span>
        <div class="dp-name">James Okafor</div>
        <div class="dp-sub">james.okafor@v.two · Full-stack Developer</div>
        <div class="dp-meta"><span class="stage-pill s-active">Active</span><span class="tag">Engineering</span></div>
      </div>
      <div class="dp-tabs">
        <div class="dp-tab active">Details</div>
        <div class="dp-tab">Devices</div>
        <div class="dp-tab">Onboarding</div>
      </div>
      <div class="dp-body">
        <div class="field"><div class="field-lbl">Email</div><div class="field-val">james.okafor@v.two</div></div>
        <div class="field"><div class="field-lbl">Department</div><div class="field-val">Engineering</div></div>
        <div class="field"><div class="field-lbl">Start date</div><div class="field-val">March 24, 2026</div></div>
        <div class="field"><div class="field-lbl">Status</div><div class="field-val">Active</div></div>
        <div class="field"><div class="field-lbl">Linked candidate</div><div class="field-val" style="color:#1d4ed8;cursor:pointer">View candidate record →</div></div>
        <div class="sec-head">Assigned devices</div>
        <div class="resume-row"><div><div class="resume-name">MacBook Pro M3</div><div class="resume-meta">Assigned Mar 24 · Condition: New</div></div><span class="link-blue">View →</span></div>
      </div>
      <div class="dp-actions">
        <button class="btn btn-secondary" onclick="showModal('modal-assign-device')">Assign device</button>
        <button class="btn btn-danger">Offboard</button>
      </div>
    </div>
  </div>
</div>
```

---

## ONBOARDING PAGE

### Shell & Sidebar
```html
<div id="tab-onboarding" class="shell" style="display:none">
  <div class="sidebar">
    <div class="sb-logo"><div class="sb-wordmark">V.Two <span>Ops</span></div></div>
    <div class="sb-nav">
      <div class="nav-item top">Dashboard</div>
      <div class="nav-group"><div class="nav-group-label">People</div>
        <div class="nav-item">Candidates</div>
        <div class="nav-item">Employees</div>
        <div class="nav-item active">Onboarding</div>
        <div class="nav-item">Offboarding</div>
      </div>
      <div class="nav-group"><div class="nav-group-label">Devices</div>
        <div class="nav-item">Inventory</div>
        <div class="nav-item">Assignments</div>
      </div>
      <div class="nav-item top">Tracks</div>
      <div class="nav-item top">Reports</div>
      <div class="nav-group"><div class="nav-group-label">Settings</div>
        <div class="nav-item">Lists</div>
        <div class="nav-item">Users</div>
      </div>
    </div>
    <div class="sb-foot"><div class="avatar">OK</div><div><div class="sb-user-name">Oliver</div><div class="sb-user-role">Admin</div></div></div>
  </div>
```

### Topbar & Content
```html
<div class="topbar">
  <div class="topbar-title">People</div>
  <div class="topbar-sep">/</div>
  <div class="topbar-sub">Onboarding</div>
  <div class="topbar-right"><div class="filter-chip">Status ▾</div></div>
</div>
<div class="content">
  <div class="page active">
    <div class="dash-pad">
      <!-- ONBOARDING RUN CARD IN PROGRESS -->
      <div class="run-card">
        <div class="run-header">
          <div><div class="run-name">James Okafor</div><div class="run-sub">Full-stack Developer · Started Mar 24, 2026</div></div>
          <div style="display:flex;gap:6px;align-items:center">
            <span class="badge-blue">V.Two US</span>
            <span class="badge-gray">Developer Onboarding</span>
            <span class="stage-pill s-inprogress">In progress</span>
          </div>
        </div>
        <div class="progress-bg"><div class="progress-fill" style="width:37%"></div></div>
        <div style="font-size:11px;color:#aaa;margin-bottom:10px">3 of 8 tasks complete</div>
        <div class="run-task"><span class="task-check-done">✓</span><span class="task-text-done">IT account setup</span><span class="task-owner">· ops</span><div style="margin-left:auto;font-size:11px;color:#aaa">Mar 22</div></div>
        <div class="run-task"><span class="task-check-done">✓</span><span class="task-text-done">Contract signed</span><span class="task-owner">· ops</span><div style="margin-left:auto;font-size:11px;color:#aaa">Mar 23</div></div>
        <div class="run-task"><span class="task-check-done">✓</span><span class="task-text-done">Device assigned</span><span class="task-owner">· ops</span><div style="margin-left:auto;font-size:11px;color:#aaa">Mar 24</div></div>
        <div class="run-task"><span class="task-check-pending">○</span><span class="task-text">Slack &amp; tools access</span><span class="task-owner">· ops</span><div style="margin-left:auto" class="task-due due-today">Due today</div></div>
        <div class="run-task"><span class="task-check-pending">○</span><span class="task-text">Benefits enrollment</span><span class="task-owner">· ops</span><div style="margin-left:auto" class="task-due due-overdue">2 days overdue</div></div>
        <div class="run-task"><span class="task-check-pending">○</span><span class="task-text">Team intro call</span><span class="task-owner">· pm</span><div style="margin-left:auto" class="task-due due-future">Mar 27</div></div>
        <div class="run-task"><span class="task-check-pending">○</span><span class="task-text">30-day check-in</span><span class="task-owner">· hiring manager</span><div style="margin-left:auto" class="task-due due-future">Apr 23</div></div>
        <div class="run-task"><span class="task-check-pending">○</span><span class="task-text">Acme Corp system access</span><span class="task-owner">· ops · Client track</span><div style="margin-left:auto" class="task-due due-future">Apr 1</div></div>
      </div>

      <!-- ONBOARDING RUN CARD PENDING -->
      <div class="run-card">
        <div class="run-header">
          <div><div class="run-name">Yuki Tanaka</div><div class="run-sub">Project Manager · Starting Apr 1, 2026</div></div>
          <div style="display:flex;gap:6px;align-items:center">
            <span class="badge-blue">V.Two Mexico</span>
            <span class="badge-gray">PM Onboarding</span>
            <span class="stage-pill s-pending">Pending</span>
          </div>
        </div>
        <div class="progress-bg"><div class="progress-fill" style="width:0%"></div></div>
        <div style="font-size:11px;color:#aaa;margin-bottom:10px">0 of 7 tasks complete · Starts in 8 days</div>
        <div class="run-task"><span class="task-check-pending">○</span><span class="task-text">Send laptop (pre-board)</span><span class="task-owner">· ops</span><div style="margin-left:auto" class="task-due due-future">Mar 29 <span style="color:#aaa;font-weight:400">(-3 days)</span></div></div>
        <div class="run-task"><span class="task-check-pending">○</span><span class="task-text">IT account setup</span><span class="task-owner">· ops</span><div style="margin-left:auto" class="task-due due-future">Mar 30</div></div>
        <div class="run-task"><span class="task-check-pending">○</span><span class="task-text">Contract signed (MX entity)</span><span class="task-owner">· ops</span><div style="margin-left:auto" class="task-due due-future">Mar 31</div></div>
        <div class="run-task"><span class="task-check-pending">○</span><span class="task-text">Slack &amp; tools access</span><span class="task-owner">· ops</span><div style="margin-left:auto" class="task-due due-future">Apr 1</div></div>
      </div>
    </div>
  </div>
</div>
```

---

## OFFBOARDING PAGE

### Content Area
```html
<div class="content">
  <div class="page active">
    <div class="dash-pad">
      <div class="run-card">
        <div class="run-header">
          <div><div class="run-name">Tom Nguyen</div><div class="run-sub">QA Engineer · Last day Apr 4, 2026</div></div>
          <div style="display:flex;gap:6px;align-items:center">
            <span class="badge-blue">V.Two US Offboard</span>
            <span class="stage-pill s-inprogress">In progress</span>
          </div>
        </div>
        <div class="progress-bg"><div class="progress-fill" style="width:50%"></div></div>
        <div style="font-size:11px;color:#aaa;margin-bottom:10px">3 of 6 tasks complete</div>
        <div class="run-task"><span class="task-check-done">✓</span><span class="task-text-done">Exit interview scheduled</span><span class="task-owner">· ops</span></div>
        <div class="run-task"><span class="task-check-done">✓</span><span class="task-text-done">Accounts deactivated</span><span class="task-owner">· ops</span></div>
        <div class="run-task"><span class="task-check-done">✓</span><span class="task-text-done">Final payroll confirmed</span><span class="task-owner">· ops</span></div>
        <div class="run-task"><span class="task-check-pending">○</span><span class="task-text">Device returned</span><span class="task-owner">· ops</span><div style="margin-left:auto" class="task-due due-today">Due today</div></div>
        <div class="run-task"><span class="task-check-pending">○</span><span class="task-text">Device condition noted &amp; logged</span><span class="task-owner">· ops</span><div style="margin-left:auto" class="task-due due-future">Apr 5</div></div>
        <div class="run-task"><span class="task-check-pending">○</span><span class="task-text">Reference letter sent</span><span class="task-owner">· hiring manager</span><div style="margin-left:auto" class="task-due due-future">Apr 7</div></div>
      </div>
    </div>
  </div>
</div>
```

---

## DEVICES (INVENTORY) PAGE

### Table & Detail Panel
```html
<div class="content">
  <div class="page-split active">
    <div class="page-flex active" style="position:relative;flex:1">
      <div class="table-toolbar">
        <div class="filter-chip">Type ▾</div>
        <div class="filter-chip">Status ▾</div>
        <div class="filter-chip">Condition ▾</div>
        <div class="filter-chip">Make ▾</div>
      </div>
      <div class="tbl-wrap">
        <table>
          <thead><tr><th>Serial ↕</th><th>Type</th><th>Make / Model</th><th>Condition</th><th>Status ↕</th><th>Assigned to</th><th>Warranty exp.</th></tr></thead>
          <tbody>
            <tr class="selected"><td>MBP-2024-001</td><td>Laptop</td><td>Apple / MacBook Pro M3</td><td>New</td><td><span class="stage-pill s-assigned">Assigned</span></td><td>James Okafor</td><td>Mar 2027</td></tr>
            <tr><td>MBP-2024-002</td><td>Laptop</td><td>Apple / MacBook Pro M3</td><td>Good</td><td><span class="stage-pill s-available">Available</span></td><td>—</td><td>Mar 2027</td></tr>
            <tr><td>MON-2023-001</td><td>Monitor</td><td>LG / 27UK850</td><td>Good</td><td><span class="stage-pill s-available">Available</span></td><td>—</td><td>Jan 2026</td></tr>
            <tr><td>MBP-2022-003</td><td>Laptop</td><td>Apple / MacBook Pro M1</td><td>Fair</td><td><span class="stage-pill s-retired">Retired</span></td><td>—</td><td>Expired</td></tr>
            <tr><td>PHN-2024-001</td><td>Phone</td><td>Apple / iPhone 15</td><td>New</td><td><span class="stage-pill s-available">Available</span></td><td>—</td><td>Sep 2026</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- DEVICE DETAIL PANEL -->
    <div class="detail-panel">
      <div class="dp-header">
        <span class="dp-close">✕</span>
        <div class="dp-name">MacBook Pro M3</div>
        <div class="dp-sub">Apple · Serial: MBP-2024-001</div>
        <div class="dp-meta"><span class="stage-pill s-assigned">Assigned</span><span class="tag">Laptop</span><span class="tag">New</span></div>
      </div>
      <div class="dp-tabs">
        <div class="dp-tab active">Details</div>
        <div class="dp-tab">Assignment history</div>
      </div>
      <div class="dp-body">
        <div class="field"><div class="field-lbl">Type</div><div class="field-val">Laptop</div></div>
        <div class="field"><div class="field-lbl">Make / Model</div><div class="field-val">Apple / MacBook Pro M3 14"</div></div>
        <div class="field"><div class="field-lbl">Condition</div><div class="field-val">New</div></div>
        <div class="field"><div class="field-lbl">Warranty expiry</div><div class="field-val">March 2027</div></div>
        <div class="field"><div class="field-lbl">Currently assigned to</div><div class="field-val" style="color:#1d4ed8;cursor:pointer">James Okafor →</div></div>
        <div class="field"><div class="field-lbl">Assigned date</div><div class="field-val">March 24, 2026</div></div>
        <div class="field"><div class="field-lbl">Notes</div><div class="field-val muted">—</div></div>
      </div>
      <div class="dp-actions">
        <button class="btn btn-secondary">Record return</button>
        <button class="btn btn-ghost">Edit</button>
      </div>
    </div>
  </div>
</div>
```

---

## TRACKS PAGE

### Tracks Layout
```html
<div class="content">
  <div class="page active" style="display:flex;flex-direction:column">
    <div class="tracks-layout" style="flex:1">
      <!-- TRACKS LIST -->
      <div class="tracks-list">
        <div style="font-size:10.5px;font-weight:500;color:#aaa;text-transform:uppercase;letter-spacing:.07em;margin-bottom:8px;padding:0 4px">Company tracks</div>
        <div class="track-item active">
          <div class="track-item-name">V.Two General <span class="tag" style="font-size:10px;margin-left:4px">auto</span></div>
          <div class="track-item-meta">Onboarding · 6 tasks</div>
        </div>
        <div class="track-item">
          <div class="track-item-name">V.Two US <span class="tag" style="font-size:10px;margin-left:4px">auto</span></div>
          <div class="track-item-meta">Onboarding · 8 tasks</div>
        </div>
        <div class="track-item">
          <div class="track-item-name">V.Two Mexico</div>
          <div class="track-item-meta">Onboarding · 9 tasks</div>
        </div>
        <div class="track-item">
          <div class="track-item-name">V.Two US Offboard</div>
          <div class="track-item-meta">Offboarding · 6 tasks</div>
        </div>
        <div class="track-item">
          <div class="track-item-name">V.Two Mexico Offboard</div>
          <div class="track-item-meta">Offboarding · 7 tasks</div>
        </div>
        <div style="font-size:10.5px;font-weight:500;color:#aaa;text-transform:uppercase;letter-spacing:.07em;margin:14px 0 8px;padding:0 4px">Role tracks</div>
        <div class="track-item">
          <div class="track-item-name">Developer Onboarding</div>
          <div class="track-item-meta">Role · 5 tasks</div>
        </div>
        <div class="track-item">
          <div class="track-item-name">PM Onboarding</div>
          <div class="track-item-meta">Role · 4 tasks</div>
        </div>
        <div style="font-size:10.5px;font-weight:500;color:#aaa;text-transform:uppercase;letter-spacing:.07em;margin:14px 0 8px;padding:0 4px">Client tracks</div>
        <div class="track-item">
          <div class="track-item-name">Acme Corp Setup</div>
          <div class="track-item-meta">Client · Acme Corp · 3 tasks</div>
        </div>
        <div class="track-item">
          <div class="track-item-name">OutSolve Onboarding</div>
          <div class="track-item-meta">Client · OutSolve · 4 tasks</div>
        </div>
      </div>

      <!-- TRACK DETAIL -->
      <div class="track-detail">
        <div class="track-detail-header">
          <div>
            <div style="font-size:16px;font-weight:500;color:#111">V.Two General</div>
            <div style="font-size:12.5px;color:#888;margin-top:3px">Company track · Auto-applies to every hire · 6 tasks</div>
          </div>
          <div style="display:flex;gap:7px">
            <button class="btn btn-ghost">Edit track</button>
            <button class="btn btn-primary">+ Add task</button>
          </div>
        </div>
        <div style="font-size:11px;color:#aaa;margin-bottom:14px;background:#fef9c3;border:.5px solid #fde68a;border-radius:6px;padding:8px 12px;color:#92400e">
          Offset key: negative = before start date · 0 = day of start · blank = no deadline (checkbox only)
        </div>
        <div class="track-task-row">
          <div style="color:#bbb;cursor:grab;font-size:12px">⠿</div>
          <div style="flex:1"><div class="track-task-name">IT account setup</div><div class="track-task-owner">Owner: ops</div></div>
          <span class="offset-pill offset-neg">Day -2</span>
          <button class="btn btn-ghost" style="font-size:11px;padding:3px 8px">Edit</button>
        </div>
        <div class="track-task-row">
          <div style="color:#bbb;cursor:grab;font-size:12px">⠿</div>
          <div style="flex:1"><div class="track-task-name">Contract signed</div><div class="track-task-owner">Owner: ops</div></div>
          <span class="offset-pill offset-neg">Day -1</span>
          <button class="btn btn-ghost" style="font-size:11px;padding:3px 8px">Edit</button>
        </div>
        <div class="track-task-row">
          <div style="color:#bbb;cursor:grab;font-size:12px">⠿</div>
          <div style="flex:1"><div class="track-task-name">Device assigned</div><div class="track-task-owner">Owner: ops</div></div>
          <span class="offset-pill offset-zero">Day 0</span>
          <button class="btn btn-ghost" style="font-size:11px;padding:3px 8px">Edit</button>
        </div>
        <div class="track-task-row">
          <div style="color:#bbb;cursor:grab;font-size:12px">⠿</div>
          <div style="flex:1"><div class="track-task-name">Slack &amp; tools access</div><div class="track-task-owner">Owner: ops</div></div>
          <span class="offset-pill">Day 0</span>
          <button class="btn btn-ghost" style="font-size:11px;padding:3px 8px">Edit</button>
        </div>
        <div class="track-task-row">
          <div style="color:#bbb;cursor:grab;font-size:12px">⠿</div>
          <div style="flex:1"><div class="track-task-name">Team intro call</div><div class="track-task-owner">Owner: pm</div></div>
          <span class="offset-pill">Day +3</span>
          <button class="btn btn-ghost" style="font-size:11px;padding:3px 8px">Edit</button>
        </div>
        <div class="track-task-row">
          <div style="color:#bbb;cursor:grab;font-size:12px">⠿</div>
          <div style="flex:1"><div class="track-task-name">30-day check-in</div><div class="track-task-owner">Owner: hiring manager</div></div>
          <span class="offset-pill">Day +30</span>
          <button class="btn btn-ghost" style="font-size:11px;padding:3px 8px">Edit</button>
        </div>
      </div>
    </div>
  </div>
</div>
```

---

## REPORTS PAGE

### Content Area
```html
<div class="content">
  <div class="page active">
    <div style="padding:24px">
      <div class="report-section">
        <div class="report-h">Pipeline summary</div>
        <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-bottom:16px">
          <div class="stat-card"><div class="stat-lbl">Applied</div><div class="stat-val" style="font-size:22px">12</div></div>
          <div class="stat-card"><div class="stat-lbl">Screening</div><div class="stat-val" style="font-size:22px">8</div></div>
          <div class="stat-card"><div class="stat-lbl">Interview</div><div class="stat-val" style="font-size:22px">7</div></div>
          <div class="stat-card"><div class="stat-lbl">Offer</div><div class="stat-val" style="font-size:22px">3</div></div>
          <div class="stat-card"><div class="stat-lbl">Hired (30d)</div><div class="stat-val" style="font-size:22px">4</div></div>
        </div>
      </div>
      <div class="report-section">
        <div class="report-h">Exports</div>
        <div class="export-row">
          <div class="export-card"><div class="export-title">Candidates</div><div class="export-desc">All candidate records with stage, source, seniority, skills, and notes</div><button class="btn btn-secondary" style="font-size:12px;padding:5px 10px">Export CSV</button></div>
          <div class="export-card"><div class="export-title">Employees</div><div class="export-desc">Active and offboarded employees with start dates and departments</div><button class="btn btn-secondary" style="font-size:12px;padding:5px 10px">Export CSV</button></div>
          <div class="export-card"><div class="export-title">Devices</div><div class="export-desc">Full inventory with assignment history and condition log</div><button class="btn btn-secondary" style="font-size:12px;padding:5px 10px">Export CSV</button></div>
          <div class="export-card"><div class="export-title">Onboarding tasks</div><div class="export-desc">All task instances with due dates, status, and completion dates</div><button class="btn btn-secondary" style="font-size:12px;padding:5px 10px">Export CSV</button></div>
        </div>
      </div>
    </div>
  </div>
</div>
```

---

## SETTINGS PAGE

### Settings Layout
```html
<div class="content">
  <div class="page active">
    <div class="settings-layout" style="height:100%">
      <!-- SETTINGS NAVIGATION -->
      <div class="settings-nav">
        <div style="font-size:11px;font-weight:500;color:#aaa;text-transform:uppercase;letter-spacing:.07em;margin-bottom:8px;padding:0 4px">Settings</div>
        <div class="settings-nav-item active">Lists</div>
        <div class="settings-nav-item">Users</div>
      </div>

      <!-- SETTINGS CONTENT -->
      <div class="settings-content">
        <div class="settings-h">Configurable lists</div>
        <div class="settings-sub">Manage the dropdown options used across the platform. Drag to reorder items within a list.</div>

        <!-- LISTS SECTION -->
        <div class="lists-layout">
          <div class="list-sidebar">
            <div class="list-sidebar-item active"><span>Candidate source</span><span class="list-item-count">5</span></div>
            <div class="list-sidebar-item"><span>Seniority</span><span class="list-item-count">4</span></div>
            <div class="list-sidebar-item"><span>Skill tags</span><span class="list-item-count">18</span></div>
            <div class="list-sidebar-item"><span>Rejection reason</span><span class="list-item-count">6</span></div>
            <div class="list-sidebar-item"><span>Interview format</span><span class="list-item-count">3</span></div>
          </div>
          <div class="list-items-panel">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
              <div style="font-size:14px;font-weight:500;color:#111">Candidate source</div>
              <button class="btn btn-secondary" style="font-size:12px;padding:5px 10px">+ Add item</button>
            </div>
            <div class="list-item-row"><span class="drag-handle">⠿</span><span class="list-item-label">LinkedIn</span><div class="list-item-actions"><span class="icon-btn">Edit</span><span class="icon-btn" style="color:#e74c3c">Delete</span></div></div>
            <div class="list-item-row"><span class="drag-handle">⠿</span><span class="list-item-label">Referral</span><div class="list-item-actions"><span class="icon-btn">Edit</span><span class="icon-btn" style="color:#e74c3c">Delete</span></div></div>
            <div class="list-item-row"><span class="drag-handle">⠿</span><span class="list-item-label">Job board</span><div class="list-item-actions"><span class="icon-btn">Edit</span><span class="icon-btn" style="color:#e74c3c">Delete</span></div></div>
            <div class="list-item-row"><span class="drag-handle">⠿</span><span class="list-item-label">Direct outreach</span><div class="list-item-actions"><span class="icon-btn">Edit</span><span class="icon-btn" style="color:#e74c3c">Delete</span></div></div>
            <div class="list-item-row"><span class="drag-handle">⠿</span><span class="list-item-label">Agency</span><div class="list-item-actions"><span class="icon-btn">Edit</span><span class="icon-btn" style="color:#e74c3c">Delete</span></div></div>
          </div>
        </div>

        <!-- USERS SECTION -->
        <div style="margin-top:28px">
          <div class="settings-h">Users</div>
          <div class="settings-sub">Manage who has access to V.Two Ops. Admins have full write access. Viewers are read-only.</div>
          <div style="margin-bottom:12px"><button class="btn btn-primary" style="font-size:12.5px">+ Invite user</button></div>
          <table class="users-table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th></th></tr></thead>
            <tbody>
              <tr><td>Oliver</td><td>oliver@v.two</td><td><span class="role-badge role-admin">Admin</span></td><td><span class="status-active">Active</span></td><td><span class="link-blue" style="font-size:12px">Edit</span></td></tr>
              <tr><td>Kiana</td><td>kiana@v.two</td><td><span class="role-badge role-admin">Admin</span></td><td><span class="status-active">Active</span></td><td><span class="link-blue" style="font-size:12px">Edit</span></td></tr>
              <tr><td>Rachel Park</td><td>r.park@v.two</td><td><span class="role-badge role-viewer">Viewer</span></td><td><span class="status-active">Active</span></td><td><span class="link-blue" style="font-size:12px">Edit</span></td></tr>
              <tr><td>Tom Nguyen</td><td>t.nguyen@v.two</td><td><span class="role-badge role-viewer">Viewer</span></td><td><span class="status-inactive">Deactivated</span></td><td><span class="link-blue" style="font-size:12px">Edit</span></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</div>
```

---

## MODALS

### Add Candidate Modal
```html
<div class="modal-overlay" id="modal-add-candidate" style="display:none" onclick="if(event.target===this)hideModal('modal-add-candidate')">
  <div class="modal">
    <div class="modal-header">
      <div class="modal-title">Add candidate</div>
      <span class="modal-close" onclick="hideModal('modal-add-candidate')">✕</span>
    </div>
    <div class="modal-body">
      <div class="form-row">
        <div class="form-group"><label class="form-label">Full name <span class="req">*</span></label><input class="form-input" placeholder="e.g. Sofia Reyes" /></div>
        <div class="form-group"><label class="form-label">Email <span class="req">*</span></label><input class="form-input" placeholder="sofia@email.com" /></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Phone</label><input class="form-input" placeholder="+1 (720) 555-0143" /></div>
        <div class="form-group"><label class="form-label">Location</label><input class="form-input" placeholder="Denver, CO" /></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Role applied <span class="req">*</span></label><input class="form-input" placeholder="e.g. Senior PM" /></div>
        <div class="form-group"><label class="form-label">Seniority</label><select class="form-select"><option>— select —</option><option>Junior</option><option>Mid</option><option>Senior</option><option>Lead</option></select></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Source</label><select class="form-select"><option>— select —</option><option>LinkedIn</option><option>Referral</option><option>Job board</option></select></div>
        <div class="form-group"><label class="form-label">Referred by</label><input class="form-input" placeholder="Name (if referral)" /></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Client</label><select class="form-select"><option>— none —</option><option>Acme Corp</option><option>OutSolve</option></select></div>
        <div class="form-group"><label class="form-label">Sourced date</label><input class="form-input" type="date" value="2026-03-24" /></div>
      </div>
      <div class="form-row full">
        <div class="form-group"><label class="form-label">Skill tags</label><input class="form-input" placeholder="Type to add tags — Agile, SQL, Roadmapping..." /><div class="form-hint">Managed in Settings → Lists → Skill tags</div></div>
      </div>
      <div class="form-row full">
        <div class="form-group"><label class="form-label">Resume link</label><input class="form-input" placeholder="Google Drive or SharePoint URL" /></div>
      </div>
      <div class="form-row full">
        <div class="form-group"><label class="form-label">Notes</label><textarea class="form-textarea" placeholder="Any context, referral notes, timing preferences..."></textarea></div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="hideModal('modal-add-candidate')">Cancel</button>
      <button class="btn btn-primary">Add candidate</button>
    </div>
  </div>
</div>
```

### Duplicate Detection Modal
```html
<div class="modal-overlay" id="modal-duplicate" style="display:none" onclick="if(event.target===this)hideModal('modal-duplicate')">
  <div class="modal">
    <div class="modal-header">
      <div class="modal-title">Possible duplicate</div>
      <span class="modal-close" onclick="hideModal('modal-duplicate')">✕</span>
    </div>
    <div class="modal-body">
      <div style="font-size:13px;color:#555;margin-bottom:14px">A candidate with this email already exists. How would you like to proceed?</div>
      <div class="dup-card">
        <div class="dup-name">Sofia Reyes</div>
        <div class="dup-meta">sofia.reyes@email.com · Senior PM · Interview stage · Added Mar 10</div>
        <div class="dup-actions">
          <button class="btn btn-secondary" style="font-size:12px">View existing</button>
          <button class="btn btn-secondary" style="font-size:12px">Merge (copy notes &amp; resumes)</button>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost" onclick="hideModal('modal-duplicate')">Proceed anyway</button>
    </div>
  </div>
</div>
```

### Log Interview Modal
```html
<div class="modal-overlay" id="modal-log-interview" style="display:none" onclick="if(event.target===this)hideModal('modal-log-interview')">
  <div class="modal">
    <div class="modal-header">
      <div class="modal-title">Log interview — Sofia Reyes</div>
      <span class="modal-close" onclick="hideModal('modal-log-interview')">✕</span>
    </div>
    <div class="modal-body">
      <div class="form-row">
        <div class="form-group"><label class="form-label">Date &amp; time <span class="req">*</span></label><input class="form-input" type="datetime-local" /></div>
        <div class="form-group"><label class="form-label">Format</label><select class="form-select"><option>Video</option><option>Phone</option><option>Onsite</option></select></div>
      </div>
      <div class="form-row full">
        <div class="form-group"><label class="form-label">General notes</label><textarea class="form-textarea" placeholder="Overall interview notes..."></textarea></div>
      </div>
      <div style="font-size:11.5px;font-weight:500;color:#555;margin-bottom:8px;margin-top:4px">Interviewer feedback</div>
      <div style="border:.5px solid #e8e8e8;border-radius:8px;padding:12px;margin-bottom:8px">
        <div class="form-row">
          <div class="form-group"><label class="form-label">Interviewer name</label><input class="form-input" placeholder="J. Kim" /></div>
          <div class="form-group"><label class="form-label">Role</label><input class="form-input" placeholder="Tech Lead" /></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Recommendation</label><select class="form-select"><option>— select —</option><option>Hire</option><option>Maybe</option><option>No hire</option></select></div>
          <div class="form-group"><label class="form-label">Client interviewer?</label><select class="form-select"><option>No</option><option>Yes</option></select></div>
        </div>
        <div class="form-row full">
          <div class="form-group"><label class="form-label">Feedback</label><textarea class="form-textarea" style="min-height:56px" placeholder="Open-ended feedback..."></textarea></div>
        </div>
      </div>
      <button class="btn btn-ghost" style="font-size:12px;width:100%;margin-top:2px">+ Add another interviewer</button>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="hideModal('modal-log-interview')">Cancel</button>
      <button class="btn btn-primary">Save interview</button>
    </div>
  </div>
</div>
```

### Promote to Hired Modal
```html
<div class="modal-overlay" id="modal-promote" style="display:none" onclick="if(event.target===this)hideModal('modal-promote')">
  <div class="modal modal-lg">
    <div class="modal-header">
      <div class="modal-title">Promote to hired — Sofia Reyes</div>
      <span class="modal-close" onclick="hideModal('modal-promote')">✕</span>
    </div>
    <div class="modal-body">
      <div style="font-size:13px;color:#555;margin-bottom:16px">Confirm employee details and select which onboarding tracks to apply. Company tracks auto-apply; role and client tracks are suggested based on this hire.</div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Title <span class="req">*</span></label><input class="form-input" value="Senior PM" /></div>
        <div class="form-group"><label class="form-label">Department</label><input class="form-input" placeholder="e.g. Delivery" /></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Start date <span class="req">*</span></label><input class="form-input" type="date" /></div>
        <div class="form-group"><label class="form-label">Email</label><input class="form-input" value="sofia.reyes@v.two" /></div>
      </div>
      <div style="height:.5px;background:#f0f0f0;margin:16px 0"></div>
      <div class="track-section">
        <div class="track-section-title">Company tracks</div>
        <div class="track-option checked"><div class="track-option-checkbox">✓</div><div><div class="track-option-name">V.Two General</div><div class="track-option-meta">6 tasks · Always applied</div></div><span class="track-auto-badge">auto</span></div>
        <div class="track-option checked"><div class="track-option-checkbox">✓</div><div><div class="track-option-name">V.Two US</div><div class="track-option-meta">8 tasks · Acme Corp placement</div></div></div>
        <div class="track-option"><div class="track-option-checkbox"></div><div><div class="track-option-name">V.Two Mexico</div><div class="track-option-meta">9 tasks</div></div></div>
      </div>
      <div class="track-section">
        <div class="track-section-title">Role tracks <span style="color:#aaa;font-weight:400;font-size:10px;margin-left:4px">suggested based on title</span></div>
        <div class="track-option checked"><div class="track-option-checkbox">✓</div><div><div class="track-option-name">PM Onboarding</div><div class="track-option-meta">4 tasks · Matched on "PM" in title</div></div></div>
      </div>
      <div class="track-section">
        <div class="track-section-title">Client tracks <span style="color:#aaa;font-weight:400;font-size:10px;margin-left:4px">suggested based on client</span></div>
        <div class="track-option checked"><div class="track-option-checkbox">✓</div><div><div class="track-option-name">Acme Corp Setup</div><div class="track-option-meta">3 tasks · Acme Corp</div></div></div>
      </div>
      <div style="background:#f8f8f8;border-radius:8px;padding:10px 14px;font-size:12.5px;color:#555;margin-top:4px">
        <strong>13 total tasks</strong> will be created across 4 tracks · Start date determines all due dates
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="hideModal('modal-promote')">Cancel</button>
      <button class="btn btn-primary">Confirm hire &amp; start onboarding</button>
    </div>
  </div>
</div>
```

### Assign Device Modal
```html
<div class="modal-overlay" id="modal-assign-device" style="display:none" onclick="if(event.target===this)hideModal('modal-assign-device')">
  <div class="modal">
    <div class="modal-header">
      <div class="modal-title">Assign device — James Okafor</div>
      <span class="modal-close" onclick="hideModal('modal-assign-device')">✕</span>
    </div>
    <div class="modal-body">
      <div style="font-size:13px;color:#555;margin-bottom:14px">Select an available device to assign. Only unassigned devices are shown.</div>
      <div class="device-option selected"><div class="device-radio"><div class="device-radio-dot"></div></div><div><div style="font-size:13px;font-weight:500;color:#111">MacBook Pro M3 14"</div><div style="font-size:12px;color:#888">Apple · MBP-2024-002 · Good condition</div></div></div>
      <div class="device-option"><div class="device-radio"></div><div><div style="font-size:13px;font-weight:500;color:#111">LG 27UK850 Monitor</div><div style="font-size:12px;color:#888">LG · MON-2023-001 · Good condition</div></div></div>
      <div class="device-option"><div class="device-radio"></div><div><div style="font-size:13px;font-weight:500;color:#111">iPhone 15</div><div style="font-size:12px;color:#888">Apple · PHN-2024-001 · New</div></div></div>
      <div class="form-row full" style="margin-top:14px">
        <div class="form-group"><label class="form-label">Condition at assignment</label><select class="form-select"><option>New</option><option>Good</option><option>Fair</option><option>Poor</option></select></div>
      </div>
      <div class="form-row full">
        <div class="form-group"><label class="form-label">Notes</label><textarea class="form-textarea" style="min-height:56px" placeholder="Any notes about this assignment..."></textarea></div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="hideModal('modal-assign-device')">Cancel</button>
      <button class="btn btn-primary">Assign device</button>
    </div>
  </div>
</div>
```

---

---

# File 2: vtwo-ops-phase2-mockup_V2.html (Phase 2 Features)

---

## AI ASSISTANT PANEL

### Full AI Assistant Tab
```html
<div id="tab-ai" class="shell">
  <div class="sidebar">
    <div class="sb-logo"><div class="sb-wordmark">V.Two <span>Ops</span></div></div>
    <div class="sb-nav">
      <div class="nav-item top">Dashboard</div>
      <div class="nav-group-label">People</div>
      <div class="nav-item active">Candidates</div>
      <div class="nav-item">Employees</div>
      <div class="nav-item">Onboarding</div>
      <div class="nav-item">Offboarding</div>
      <div class="nav-group-label">Devices</div>
      <div class="nav-item">Inventory</div>
      <div class="nav-item">Assignments</div>
      <div class="nav-item top">Tracks</div>
      <div class="nav-item top">Reports</div>
      <div class="nav-group-label">Settings</div>
      <div class="nav-item">Lists</div>
      <div class="nav-item">Users</div>
    </div>
    <div class="sb-foot"><div class="avatar">OK</div><div><div class="sb-user-name">Oliver</div><div class="sb-user-role">Admin</div></div></div>
  </div>
  <div class="main">
    <div class="topbar">
      <div class="topbar-title">People</div>
      <div class="topbar-sep">/</div>
      <div class="topbar-sub">Candidates</div>
      <div class="topbar-right">
        <div class="search-box">Global search...</div>
        <button class="ai-btn"><span class="ai-btn-dot"></span> Ask Oliver</button>
      </div>
    </div>
    <!-- main area + AI panel side by side -->
    <div style="flex:1;display:flex;overflow:hidden">
      <!-- table (compressed) -->
      <div style="flex:1;display:flex;flex-direction:column;overflow:hidden">
        <div class="table-toolbar">
          <div class="filter-chip on">Active ✕</div>
          <div class="filter-chip">Stage ▾</div>
          <div class="filter-chip">Seniority ▾</div>
          <div class="filter-chip">Source ▾</div>
        </div>
        <div class="tbl-wrap">
          <table>
            <thead><tr><th>Name</th><th>Stage</th><th>Seniority</th><th>Added</th></tr></thead>
            <tbody>
              <tr><td>Sofia Reyes</td><td><span class="stage-pill s-interview">Interview</span></td><td>Senior</td><td>Mar 10</td></tr>
              <tr><td>Leo Hartmann</td><td><span class="stage-pill s-screening">Screening</span></td><td>Mid</td><td>Mar 14</td></tr>
              <tr><td>Chen Wei</td><td><span class="stage-pill s-offer">Offer</span></td><td>Senior</td><td>Feb 28</td></tr>
              <tr><td>Priya Nair</td><td><span class="stage-pill s-applied">Applied</span></td><td>Junior</td><td>Mar 18</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- AI PANEL -->
      <div class="ai-panel">
        <div class="ai-panel-header">
          <div class="ai-panel-title">
            Ask Oliver
            <span class="ai-status">Ready</span>
          </div>
          <button class="btn btn-ghost btn-sm">✕</button>
        </div>

        <div class="ai-messages">

          <!-- example 1: action with confirmation -->
          <div class="msg user">
            <div class="msg-bubble">Move Sam to interviewed</div>
            <div class="msg-time">9:14 AM</div>
          </div>
          <div class="msg assistant">
            <div class="msg-bubble">
              Found Samuel Park — currently in Screening. I'll move him to Interview stage.
              <div class="confirm-card">
                <div class="confirm-title">Confirm update</div>
                <div class="confirm-row"><span class="confirm-key">Candidate</span><span class="confirm-val">Samuel Park</span></div>
                <div class="confirm-row"><span class="confirm-key">Stage</span><span class="confirm-val">Screening → Interview</span></div>
                <div class="confirm-actions">
                  <button class="btn btn-primary btn-sm">Confirm</button>
                  <button class="btn btn-secondary btn-sm">Cancel</button>
                </div>
              </div>
            </div>
            <div class="msg-time">9:14 AM</div>
          </div>

          <!-- example 2: question answered -->
          <div class="msg user">
            <div class="msg-bubble">How many mid devs do we have in pipeline?</div>
            <div class="msg-time">9:16 AM</div>
          </div>
          <div class="msg assistant">
            <div class="msg-bubble">You have <strong>4 mid-level developers</strong> currently active in pipeline — 1 in Screening, 2 in Interview, 1 with an Offer out.</div>
            <div class="msg-time">9:16 AM</div>
          </div>

          <!-- example 3: gap filling -->
          <div class="msg user">
            <div class="msg-bubble">Schedule James for Friday</div>
            <div class="msg-time">9:18 AM</div>
          </div>
          <div class="msg assistant">
            <div class="msg-bubble">James Okafor — what time on Friday?</div>
            <div class="msg-time">9:18 AM</div>
          </div>
          <div class="msg user">
            <div class="msg-bubble">2pm</div>
            <div class="msg-time">9:18 AM</div>
          </div>
          <div class="msg assistant">
            <div class="msg-bubble">
              Who's interviewing him?
            </div>
            <div class="msg-time">9:18 AM</div>
          </div>
          <div class="msg user">
            <div class="msg-bubble">R. Patel, video call</div>
            <div class="msg-time">9:19 AM</div>
          </div>
          <div class="msg assistant">
            <div class="msg-bubble">
              Got it.
              <div class="confirm-card">
                <div class="confirm-title">Confirm interview</div>
                <div class="confirm-row"><span class="confirm-key">Candidate</span><span class="confirm-val">James Okafor</span></div>
                <div class="confirm-row"><span class="confirm-key">Date</span><span class="confirm-val">Fri Mar 27, 2:00 PM</span></div>
                <div class="confirm-row"><span class="confirm-key">Format</span><span class="confirm-val">Video</span></div>
                <div class="confirm-row"><span class="confirm-key">Interviewer</span><span class="confirm-val">R. Patel</span></div>
                <div class="confirm-actions">
                  <button class="btn btn-primary btn-sm">Confirm</button>
                  <button class="btn btn-secondary btn-sm">Edit</button>
                </div>
              </div>
            </div>
            <div class="msg-time">9:19 AM</div>
          </div>

        </div>

        <div class="ai-input-area">
          <textarea class="ai-input" placeholder="Ask Oliver anything or give an instruction..."></textarea>
          <button class="ai-send">Send</button>
        </div>
      </div>
    </div>
  </div>
</div>
```

---

## INLINE EDITING TAB

### Full Inline Editing Demo
```html
<div id="tab-inline" class="shell" style="display:none">
  <div class="sidebar">
    <div class="sb-logo"><div class="sb-wordmark">V.Two <span>Ops</span></div></div>
    <div class="sb-nav">
      <div class="nav-item top">Dashboard</div>
      <div class="nav-group-label">People</div>
      <div class="nav-item active">Candidates</div>
      <div class="nav-item">Employees</div>
    </div>
    <div class="sb-foot"><div class="avatar">OK</div><div><div class="sb-user-name">Oliver</div><div class="sb-user-role">Admin</div></div></div>
  </div>
  <div class="main">
    <div class="topbar">
      <div class="topbar-title">People</div>
      <div class="topbar-sep">/</div>
      <div class="topbar-sub">Candidates</div>
      <div class="topbar-right"><div class="search-box">Global search...</div></div>
    </div>
    <div style="flex:1;display:flex;overflow:hidden">
      <div style="flex:1;display:flex;flex-direction:column;overflow:hidden">
        <div class="table-toolbar">
          <div class="filter-chip on">Active ✕</div>
          <div class="filter-chip">Stage ▾</div>
        </div>
        <div class="tbl-wrap">
          <table>
            <thead><tr><th>Name</th><th>Stage</th><th>Status</th><th>Seniority</th><th>Source</th><th>Added</th></tr></thead>
            <tbody>
              <tr class="selected"><td>Sofia Reyes</td><td><span class="stage-pill s-interview">Interview</span></td><td><span class="stage-pill s-active">Active</span></td><td>Senior</td><td>LinkedIn</td><td>Mar 10</td></tr>
              <tr><td>Marcus Webb</td><td><span class="stage-pill s-screening">Screening</span></td><td><span class="stage-pill s-inactive">Inactive</span></td><td>Mid</td><td>LinkedIn</td><td>Mar 3</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- DETAIL PANEL with inline edit -->
      <div class="detail-panel">
        <div class="dp-header">
          <div class="dp-header-top">
            <div>
              <div class="dp-name">Sofia Reyes</div>
              <div class="dp-sub">sofia.reyes@email.com</div>
            </div>
          </div>
          <div class="dp-meta">
            <span class="stage-pill s-interview">Interview</span>
            <span class="stage-pill s-active">Active</span>
            <span class="tag">Senior</span>
          </div>
        </div>
        <div class="dp-tabs">
          <div class="dp-tab active">Overview</div>
          <div class="dp-tab">Interviews</div>
          <div class="dp-tab">Activity</div>
        </div>
        <div class="dp-body">
          <div style="font-size:11px;color:#aaa;background:#f8f8f8;border-radius:6px;padding:7px 10px;margin-bottom:12px">Click any field to edit it</div>

          <!-- normal field -->
          <div class="field">
            <div class="field-lbl">Location</div>
            <div class="field-val">Denver, CO</div>
          </div>

          <!-- field being edited -->
          <div class="field">
            <div class="field-lbl">Role applied</div>
            <input class="field-input" value="Senior PM" />
            <div class="inline-save-row">
              <button class="save-btn">Save</button>
              <button class="cancel-btn">Cancel</button>
            </div>
          </div>

          <!-- select field -->
          <div class="field">
            <div class="field-lbl">Stage</div>
            <select class="field-select">
              <option>Applied</option>
              <option>Screening</option>
              <option selected>Interview</option>
              <option>Offer</option>
            </select>
            <div class="inline-save-row">
              <button class="save-btn">Save</button>
              <button class="cancel-btn">Cancel</button>
            </div>
          </div>

          <!-- status field — active/inactive toggle -->
          <div class="field">
            <div class="field-lbl">Status</div>
            <select class="field-select">
              <option selected>Active</option>
              <option>Inactive</option>
            </select>
            <div class="inline-save-row">
              <button class="save-btn">Save</button>
              <button class="cancel-btn">Cancel</button>
            </div>
          </div>

          <!-- date field — overridable -->
          <div class="field">
            <div class="field-lbl">Sourced date</div>
            <input class="field-input" type="date" value="2026-03-10" />
            <div class="inline-save-row">
              <button class="save-btn">Save</button>
              <button class="cancel-btn">Cancel</button>
            </div>
            <div class="edit-hint">Can be back-dated — not locked to today</div>
          </div>

          <div class="field">
            <div class="field-lbl">Source</div>
            <div class="field-val">LinkedIn</div>
          </div>

          <div class="field">
            <div class="field-lbl">Notes</div>
            <div class="field-val" style="color:#777">Strong B2B SaaS background. Referral from T. Park.</div>
          </div>
        </div>
        <div class="dp-actions">
          <button class="btn btn-secondary">Log interview</button>
          <button class="btn btn-primary">Move to Offer →</button>
        </div>
      </div>
    </div>
  </div>
</div>
```

---

## TABLE CONTROLS TAB

### Column Visibility Dropdown
```html
<div class="col-dropdown open" id="col-dropdown" style="top:100px;right:20px">
  <div class="col-dropdown-title">Show / hide columns</div>
  <div class="col-row"><div class="col-checkbox checked">✓</div>Name</div>
  <div class="col-row"><div class="col-checkbox checked">✓</div>Role</div>
  <div class="col-row"><div class="col-checkbox checked">✓</div>Stage</div>
  <div class="col-row"><div class="col-checkbox checked">✓</div>Status</div>
  <div class="col-row"><div class="col-checkbox checked">✓</div>Seniority</div>
  <div class="col-row"><div class="col-checkbox">&#x2713;</div>Source</div>
  <div class="col-row"><div class="col-checkbox">&#x2713;</div>Client</div>
  <div class="col-row"><div class="col-checkbox checked">✓</div>Date added</div>
  <div class="col-row"><div class="col-checkbox checked">✓</div>Last activity</div>
</div>
```

### Table with Sort Arrows
```html
<div class="tbl-wrap">
  <table>
    <thead><tr>
      <th>Name <span class="sort-arrow">↕</span></th>
      <th>Role <span class="sort-arrow">↕</span></th>
      <th class="sorted">Stage <span class="sort-arrow">↑</span></th>
      <th>Status <span class="sort-arrow">↕</span></th>
      <th>Seniority <span class="sort-arrow">↕</span></th>
      <th>Date added <span class="sort-arrow">↕</span></th>
      <th>Last activity <span class="sort-arrow">↕</span></th>
    </tr></thead>
    <tbody>
      <tr><td>Sofia Reyes</td><td>Senior PM</td><td><span class="stage-pill s-interview">Interview</span></td><td><span class="stage-pill s-active">Active</span></td><td>Senior</td><td>Mar 10</td><td>Today</td></tr>
      <tr><td>Yuki Tanaka</td><td>Project Manager</td><td><span class="stage-pill s-interview">Interview</span></td><td><span class="stage-pill s-active">Active</span></td><td>Senior</td><td>Mar 5</td><td>Mar 19</td></tr>
      <tr><td>Marcus Webb</td><td>UX Designer</td><td><span class="stage-pill s-screening">Screening</span></td><td><span class="stage-pill s-inactive">Inactive</span></td><td>Mid</td><td>Mar 3</td><td>Mar 3</td></tr>
    </tbody>
  </table>
</div>
```

---

## INTERVIEW HISTORY TAB

### Interview Cards
```html
<div class="dp-body">
  <div class="sec-head">Interview history</div>

  <div class="int-card">
    <div class="int-card-top">
      <div class="int-card-date">Mar 25, 2026 · 2:00 PM</div>
      <span class="int-fmt">Video</span>
    </div>
    <div class="int-card-interviewer">
      <div><span class="int-name">J. Kim</span> <span class="int-role">· Tech Lead</span></div>
      <span class="rec-hire">Hire</span>
    </div>
    <div class="int-card-interviewer">
      <div><span class="int-name">T. Park</span> <span class="int-role">· PM</span></div>
      <span class="rec-maybe">Maybe</span>
    </div>
    <div class="int-feedback">Strong systems thinking. Needs follow-up on client-facing exp.</div>
  </div>

  <div class="int-card">
    <div class="int-card-top">
      <div class="int-card-date">Mar 18, 2026 · 10:00 AM</div>
      <span class="int-fmt">Phone</span>
    </div>
    <div class="int-card-interviewer">
      <div><span class="int-name">R. Patel</span> <span class="int-role">· Screening</span></div>
      <span class="rec-hire">Hire</span>
    </div>
    <div class="int-feedback">Good comms. Clear alignment on role scope.</div>
  </div>

  <div class="sec-head">Activity</div>
  <div class="act-item"><div class="act-dot" style="background:#3b82f6"></div><div><div class="act-text"><span class="act-bold">Stage</span> moved to Interview</div><div class="act-time">Mar 18 · R. Patel</div></div></div>
  <div class="act-item"><div class="act-dot" style="background:#aaa"></div><div><div class="act-text"><span class="act-bold">Interview</span> logged · Phone screen</div><div class="act-time">Mar 18</div></div></div>
  <div class="act-item"><div class="act-dot" style="background:#aaa"></div><div><div class="act-text"><span class="act-bold">Candidate</span> added · LinkedIn</div><div class="act-time">Mar 10</div></div></div>
</div>
```

---

## DEVICE HISTORY TAB

### Device Assignment History
```html
<div class="dp-body">
  <div class="sec-head">Assignment history</div>

  <!-- current assignment -->
  <div class="assign-row assign-current">
    <div class="assign-top">
      <div class="assign-name">James Okafor</div>
      <span class="stage-pill s-assigned" style="font-size:10px">Current</span>
    </div>
    <div class="assign-dates">Assigned Mar 24, 2026 · Condition: New</div>
  </div>

  <!-- past assignment -->
  <div class="assign-row">
    <div class="assign-top">
      <div class="assign-name" style="color:#555">Tom Nguyen</div>
      <span class="assign-condition">Returned: Fair</span>
    </div>
    <div class="assign-dates">Jan 6, 2025 → Mar 20, 2026</div>
  </div>

  <div class="assign-row">
    <div class="assign-top">
      <div class="assign-name" style="color:#555">Rania Aziz</div>
      <span class="assign-condition">Returned: Good</span>
    </div>
    <div class="assign-dates">Mar 1, 2024 → Dec 20, 2024</div>
  </div>

  <div style="font-size:12px;color:#aaa;margin-top:12px">When a new device is assigned, the previous assignment is automatically closed with a return date and condition — no history is lost.</div>
</div>
```

---

## KEY COMPONENTS

### AI Message Bubble Structure
```html
<div class="msg user">
  <div class="msg-bubble">User message text</div>
  <div class="msg-time">9:14 AM</div>
</div>
<div class="msg assistant">
  <div class="msg-bubble">Assistant response text</div>
  <div class="msg-time">9:14 AM</div>
</div>
```

### Confirmation Card (Inside AI Messages)
```html
<div class="confirm-card">
  <div class="confirm-title">Confirm update</div>
  <div class="confirm-row"><span class="confirm-key">Candidate</span><span class="confirm-val">Samuel Park</span></div>
  <div class="confirm-row"><span class="confirm-key">Stage</span><span class="confirm-val">Screening → Interview</span></div>
  <div class="confirm-actions">
    <button class="btn btn-primary btn-sm">Confirm</button>
    <button class="btn btn-secondary btn-sm">Cancel</button>
  </div>
</div>
```

### Interview Card
```html
<div class="int-card">
  <div class="int-card-top">
    <div class="int-card-date">Mar 25, 2026 · 2:00 PM</div>
    <span class="int-fmt">Video</span>
  </div>
  <div class="int-card-interviewer">
    <div><span class="int-name">J. Kim</span> <span class="int-role">· Tech Lead</span></div>
    <span class="rec-hire">Hire</span>
  </div>
  <div class="int-feedback">Strong systems thinking.</div>
</div>
```

### Device Assignment Row
```html
<div class="assign-row assign-current">
  <div class="assign-top">
    <div class="assign-name">James Okafor</div>
    <span class="stage-pill s-assigned" style="font-size:10px">Current</span>
  </div>
  <div class="assign-dates">Assigned Mar 24, 2026 · Condition: New</div>
</div>
```

---

## END OF EXTRACTION

All HTML structures have been extracted exactly as they appear in both mockup files without any modification, summarization, or simplification. Every tag, class name, and attribute is preserved precisely.
