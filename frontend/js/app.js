/**
 * App - Main application entry point
 * Initializes router, state, API, and page handlers
 * Routes to all 16+ pages with their HTML templates and event bindings
 */

class Application {
  constructor() {
    this.initialized = false;
    // Map UI page names to router paths
    this.pageRouteMap = {
      'dashboard': '/dashboard',
      'hiring': '/candidates',
      'directory': '/employees',
      'inventory': '/devices',
      'assignments': '/assignments',
      'onboarding': '/onboarding',
      'offboarding': '/offboarding',
      'tracks': '/tracks',
      'reports': '/reports',
      'settings': '/admin/settings',
      'lists': '/admin/lists',
      'users': '/admin/users',
    };
  }

  /**
   * Initialize and boot the application
   */
  async init() {
    if (this.initialized) return;

    console.log('Initializing V-Two Ops Application...');

    try {
      // Initialize core systems
      console.log('Step 1: Initializing router');
      router.init('app');

      console.log('Step 2: Registering routes');
      this.registerRoutes();

      console.log('Step 2b: Starting router with initial route');
      router.start();

      console.log('Step 3: Setting up event listeners');
      this.setupEventListeners();

      this.initialized = true;
      console.log('Application ready');

      // Show init success indicator
      const indicator = document.createElement('div');
      indicator.style.cssText = 'position: fixed; bottom: 10px; right: 10px; background: #0a0; color: white; padding: 8px 12px; font-size: 11px; border-radius: 3px; z-index: 9999;';
      indicator.textContent = '✓ App Ready';
      document.body.appendChild(indicator);
    } catch (error) {
      console.error('Application initialization failed:', error);
      const indicator = document.createElement('div');
      indicator.style.cssText = 'position: fixed; bottom: 10px; right: 10px; background: #a00; color: white; padding: 8px 12px; font-size: 11px; border-radius: 3px; z-index: 9999; max-width: 300px;';
      indicator.textContent = '✗ Init Failed: ' + error.message;
      document.body.appendChild(indicator);
    }
  }

  /**
   * Load a page HTML file
   */
  async loadPageFile(filename) {
    try {
      const response = await fetch(`pages/${filename}`);
      if (!response.ok) throw new Error(`Failed to load ${filename}`);
      return await response.text();
    } catch (error) {
      console.error(`Error loading page ${filename}:`, error);
      return `<main><p>Error loading page: ${error.message}</p></main>`;
    }
  }

  /**
   * Register all routes and page handlers
   */
  registerRoutes() {
    router.registerBatch({
      '/': () => this.renderDashboard(),
      '/dashboard': () => this.renderDashboard(),
      '/candidates': () => this.renderCandidates(),
      '/candidates/:id': (params) => this.renderCandidateDetail(params.id),
      '/candidates/new': () => this.renderCandidateForm(),
      '/employees': () => this.renderEmployees(),
      '/employees/:id': (params) => this.renderEmployeeDetail(params.id),
      '/employees/new': () => this.renderEmployeeForm(),
      '/devices': () => this.renderDevices(),
      '/devices/:id': (params) => this.renderDeviceDetail(params.id),
      '/assignments': () => this.renderAssignments(),
      '/assignments/:id': (params) => this.renderAssignmentDetail(params.id),
      '/onboarding': () => this.renderOnboarding(),
      '/onboarding/:id': (params) => this.renderOnboardingDetail(params.id),
      '/offboarding': () => this.renderOffboarding(),
      '/tracks': () => this.renderTracks(),
      '/reports': () => this.renderReports(),
      '/admin/workflows': () => this.renderWorkflows(),
      '/admin/templates': () => this.renderTemplates(),
      '/admin/settings': () => this.renderSettings(),
      '/admin/lists': () => this.renderLists(),
      '/admin/users': () => this.renderUsers(),
    });
  }

  /**
   * Setup global event listeners
   */
  setupEventListeners() {
    // Page loaded event
    window.addEventListener('pageLoaded', (e) => {
      console.log('Page loaded:', e.detail.path);
      UI.initEvents();
    });

    // Form submission
    window.addEventListener('formSubmit', async (e) => {
      await this.handleFormSubmit(e.detail);
    });

    // Row deletion
    window.addEventListener('rowDelete', async (e) => {
      await this.handleRowDelete(e.detail);
    });

    // Field update
    window.addEventListener('fieldUpdate', async (e) => {
      await this.handleFieldUpdate(e.detail);
    });

    // Modal close buttons
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-close-modal]')) {
        const modalId = e.target.dataset.closeModal;
        UI.closeModal(modalId);
      }
    });

    // Navigation links
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[data-navigate]');
      if (link) {
        e.preventDefault();
        const path = link.dataset.navigate;
        const params = link.dataset.params ? JSON.parse(link.dataset.params) : {};
        router.navigate(path, params);
      }
    });

    // Sidebar nav items
    document.addEventListener('click', (e) => {
      const navItem = e.target.closest('.nav-item');
      if (navItem && navItem.dataset.page) {
        e.preventDefault();
        const pageId = navItem.dataset.page;
        const routePath = this.pageRouteMap[pageId] || `/${pageId}`;
        router.navigate(routePath);

        // Update active state for sidebar
        document.querySelectorAll('.nav-item').forEach(item => {
          item.classList.remove('active');
        });
        navItem.classList.add('active');

        // Update page title
        const titleEl = document.getElementById('page-title');
        if (titleEl) {
          titleEl.textContent = navItem.textContent.trim();
        }
      }
    });
  }

  /**
   * Handle form submission
   */
  async handleFormSubmit(detail) {
    const { formId, data, form } = detail;
    console.log('Form submitted:', formId, data);

    try {
      UI.setFormDisabled(form, true);

      let result;

      // Route based on form ID
      switch (formId) {
        case 'candidate-form':
          result = data.id
            ? await api.updateCandidate(data.id, data)
            : await api.createCandidate(data);
          UI.notify('Candidate saved', 'success');
          router.navigate('/candidates');
          break;

        case 'employee-form':
          result = data.id
            ? await api.updateEmployee(data.id, data)
            : await api.createEmployee(data);
          UI.notify('Employee saved', 'success');
          router.navigate('/employees');
          break;

        case 'device-form':
          result = data.id
            ? await api.updateDevice(data.id, data)
            : await api.createDevice(data);
          UI.notify('Device saved', 'success');
          router.navigate('/devices');
          break;

        case 'assignment-form':
          result = data.id
            ? await api.updateAssignment(data.id, data)
            : await api.createAssignment(data);
          UI.notify('Assignment saved', 'success');
          router.navigate('/assignments');
          break;

        case 'settings-form':
          await api.updateSettings(data);
          UI.notify('Settings updated', 'success');
          break;
      }
    } catch (error) {
      console.error('Form submission error:', error);
      UI.notify(error.message || 'Error saving', 'error');
    } finally {
      UI.setFormDisabled(form, false);
    }
  }

  /**
   * Handle row deletion
   */
  async handleRowDelete(detail) {
    const { id } = detail;
    const route = router.getCurrentRoute().path;

    try {
      if (route === '/candidates') {
        await api.deleteCandidate(id);
        UI.notify('Candidate deleted', 'success');
      } else if (route === '/employees') {
        await api.deleteEmployee(id);
        UI.notify('Employee deleted', 'success');
      } else if (route === '/devices') {
        await api.deleteDevice(id);
        UI.notify('Device deleted', 'success');
      } else if (route === '/assignments') {
        await api.deleteAssignment(id);
        UI.notify('Assignment deleted', 'success');
      }
    } catch (error) {
      console.error('Delete error:', error);
      UI.notify(error.message || 'Error deleting', 'error');
    }
  }

  /**
   * Handle inline field update
   */
  async handleFieldUpdate(detail) {
    const { rowId, fieldName, newValue } = detail;
    const route = router.getCurrentRoute().path;

    try {
      if (route === '/candidates') {
        await api.updateCandidate(rowId, { [fieldName]: newValue });
      } else if (route === '/employees') {
        await api.updateEmployee(rowId, { [fieldName]: newValue });
      } else if (route === '/devices') {
        await api.updateDevice(rowId, { [fieldName]: newValue });
      }
      UI.notify('Updated', 'success');
    } catch (error) {
      console.error('Update error:', error);
      UI.notify(error.message || 'Error updating', 'error');
    }
  }

  /**
   * PAGE RENDERERS - Each returns HTML string
   */

  async renderDashboard() {
    try {
      const data = await api.call('GET', '/dashboard');
      const dashboard = data.data;

      return `
        <main style="padding:20px;">
          <h1 style="font-size:24px;font-weight:500;margin-bottom:20px;">Dashboard</h1>

          <div class="stat-row">
            <div class="stat-card">
              <div class="stat-lbl">Active Candidates</div>
              <div class="stat-val">${dashboard.activeCandidateCount || 0}</div>
              <div class="stat-sub">in pipeline</div>
            </div>
            <div class="stat-card">
              <div class="stat-lbl">Interviews This Week</div>
              <div class="stat-val">${dashboard.interviewsScheduledThisWeek || 0}</div>
              <div class="stat-sub">scheduled</div>
            </div>
            <div class="stat-card">
              <div class="stat-lbl">Onboardings in Progress</div>
              <div class="stat-val">${dashboard.onboardingsInProgress || 0}</div>
              <div class="stat-sub">active runs</div>
            </div>
            <div class="stat-card">
              <div class="stat-lbl">Devices Unassigned</div>
              <div class="stat-val">${dashboard.unassignedDeviceCount || 0}</div>
              <div class="stat-sub">available</div>
            </div>
          </div>

          <div class="dash-grid">
            <div class="widget">
              <div class="widget-title">Stale Candidates</div>
              ${(dashboard.staleCandidates || []).length > 0
                ? (dashboard.staleCandidates || []).map(c => `
                    <div class="stale-row">
                      <div><div class="stale-name">${c.name}</div></div>
                      <div class="stale-pill">${Math.floor((Date.now() - new Date(c.latestStageChangeAt)) / (1000*60*60*24))} days</div>
                    </div>
                  `).join('')
                : '<p style="color:#aaa;">No stale candidates</p>'
              }
            </div>
            <div class="widget">
              <div class="widget-title">Upcoming Interviews</div>
              ${(dashboard.upcomingInterviewsNext7Days || []).length > 0
                ? (dashboard.upcomingInterviewsNext7Days || []).map(i => `
                    <div class="int-row">
                      <div><div class="int-name">${i.candidate?.name || 'Unknown'}</div></div>
                    </div>
                  `).join('')
                : '<p style="color:#aaa;">No upcoming interviews</p>'
              }
            </div>
          </div>

          <div class="widget">
            <div class="widget-title">Recent Activity</div>
            ${(dashboard.lastActivityRecords || []).slice(0, 5).length > 0
              ? (dashboard.lastActivityRecords || []).slice(0, 5).map(a => `
                  <div class="act-row">
                    <div><div class="act-text">${a.description || 'Activity'}</div></div>
                  </div>
                `).join('')
              : '<p style="color:#aaa;">No recent activity</p>'
            }
          </div>
        </main>
      `;
    } catch (error) {
      return `<main style="padding:20px;"><p>Error loading dashboard: ${error.message}</p></main>`;
    }
  }

  async renderCandidates() {
    try {
      const candidates = await api.getCandidates();

      let html = `
        <main>
          <header>
            <h1>Candidates</h1>
            <button class="btn btn-primary" onclick="router.navigate('/candidates/new')">
              + New Candidate
            </button>
          </header>

          <section class="table-section">
            <input type="search" placeholder="Filter by name..." data-filter="name" class="search-input">
            <table>
              <thead>
                <tr>
                  <th data-sort-by="name">Name</th>
                  <th data-sort-by="email">Email</th>
                  <th data-sort-by="status">Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
      `;

      candidates.forEach(candidate => {
        html += `
          <tr>
            <td data-column="name">
              <a data-navigate="/candidates/${candidate.id}" href="#/candidates/${candidate.id}">
                ${candidate.name || 'N/A'}
              </a>
            </td>
            <td data-column="email">${candidate.email || 'N/A'}</td>
            <td data-column="status">${candidate.status || 'N/A'}</td>
            <td>
              <button class="btn btn-sm" data-toggle-row="${candidate.id}">Details</button>
              <button class="btn btn-danger btn-sm" data-delete-row="${candidate.id}">Delete</button>
            </td>
          </tr>
          <tr class="detail-row">
            <td colspan="4">
              <div class="detail-content">
                <p><strong>Phone:</strong> ${candidate.phone || 'N/A'}</p>
                <p><strong>Location:</strong> ${candidate.location || 'N/A'}</p>
              </div>
            </td>
          </tr>
        `;
      });

      html += `
              </tbody>
            </table>
          </section>
        </main>
      `;

      return html;
    } catch (error) {
      return `<main><p>Error loading candidates: ${error.message}</p></main>`;
    }
  }

  async renderCandidateDetail(id) {
    try {
      const candidate = await api.getCandidate(id);

      return `
        <main>
          <button class="btn btn-secondary" onclick="router.back()">← Back</button>
          <h1>${candidate.name || 'Candidate'}</h1>

          <section class="detail-section">
            <h2>Information</h2>
            <dl>
              <dt>Email</dt>
              <dd>${candidate.email || 'N/A'}</dd>
              <dt>Phone</dt>
              <dd>${candidate.phone || 'N/A'}</dd>
              <dt>Location</dt>
              <dd>${candidate.location || 'N/A'}</dd>
              <dt>Status</dt>
              <dd>${candidate.status || 'N/A'}</dd>
            </dl>
          </section>

          <div class="button-group">
            <button class="btn btn-primary" onclick="router.navigate('/candidates/${id}/edit')">Edit</button>
            <button class="btn btn-danger" onclick="if(confirm('Delete?')) router.navigate('/candidates')">Delete</button>
          </div>
        </main>
      `;
    } catch (error) {
      return `<main><p>Error: ${error.message}</p></main>`;
    }
  }

  async renderCandidateForm() {
    return `
      <main>
        <button class="btn btn-secondary" onclick="router.back()">← Back</button>
        <h1>New Candidate</h1>

        <form data-form="candidate-form">
          <div class="form-group">
            <label for="name">Name *</label>
            <input type="text" id="name" name="name" required>
          </div>

          <div class="form-group">
            <label for="email">Email *</label>
            <input type="email" id="email" name="email" required>
          </div>

          <div class="form-group">
            <label for="phone">Phone</label>
            <input type="tel" id="phone" name="phone">
          </div>

          <div class="form-group">
            <label for="location">Location</label>
            <input type="text" id="location" name="location">
          </div>

          <div class="form-group">
            <label for="status">Status</label>
            <select id="status" name="status">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <button type="submit" class="btn btn-primary">Save Candidate</button>
        </form>
      </main>
    `;
  }

  async renderEmployees() {
    try {
      const employees = await api.getEmployees();

      let html = `
        <main>
          <header>
            <h1>Employees</h1>
            <button class="btn btn-primary" onclick="router.navigate('/employees/new')">
              + New Employee
            </button>
          </header>

          <section class="table-section">
            <input type="search" placeholder="Filter by name..." data-filter="name" class="search-input">
            <table>
              <thead>
                <tr>
                  <th data-sort-by="name">Name</th>
                  <th data-sort-by="email">Email</th>
                  <th data-sort-by="department">Department</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
      `;

      employees.forEach(emp => {
        html += `
          <tr>
            <td data-column="name">
              <a data-navigate="/employees/${emp.id}" href="#/employees/${emp.id}">
                ${emp.name || 'N/A'}
              </a>
            </td>
            <td data-column="email">${emp.email || 'N/A'}</td>
            <td data-column="department">${emp.department || 'N/A'}</td>
            <td>
              <button class="btn btn-sm" data-toggle-row="${emp.id}">Details</button>
              <button class="btn btn-danger btn-sm" data-delete-row="${emp.id}">Delete</button>
            </td>
          </tr>
          <tr class="detail-row">
            <td colspan="4">
              <div class="detail-content">
                <p><strong>Title:</strong> ${emp.title || 'N/A'}</p>
                <p><strong>Phone:</strong> ${emp.phone || 'N/A'}</p>
              </div>
            </td>
          </tr>
        `;
      });

      html += `
              </tbody>
            </table>
          </section>
        </main>
      `;

      return html;
    } catch (error) {
      return `<main><p>Error loading employees: ${error.message}</p></main>`;
    }
  }

  async renderEmployeeDetail(id) {
    try {
      const employee = await api.getEmployee(id);

      return `
        <main>
          <button class="btn btn-secondary" onclick="router.back()">← Back</button>
          <h1>${employee.name || 'Employee'}</h1>

          <section class="detail-section">
            <h2>Information</h2>
            <dl>
              <dt>Email</dt>
              <dd>${employee.email || 'N/A'}</dd>
              <dt>Title</dt>
              <dd>${employee.title || 'N/A'}</dd>
              <dt>Department</dt>
              <dd>${employee.department || 'N/A'}</dd>
              <dt>Phone</dt>
              <dd>${employee.phone || 'N/A'}</dd>
            </dl>
          </section>

          <div class="button-group">
            <button class="btn btn-primary" onclick="router.navigate('/employees/${id}/edit')">Edit</button>
            <button class="btn btn-danger" onclick="if(confirm('Delete?')) router.navigate('/employees')">Delete</button>
          </div>
        </main>
      `;
    } catch (error) {
      return `<main><p>Error: ${error.message}</p></main>`;
    }
  }

  async renderEmployeeForm() {
    return `
      <main>
        <button class="btn btn-secondary" onclick="router.back()">← Back</button>
        <h1>New Employee</h1>

        <form data-form="employee-form">
          <div class="form-group">
            <label for="name">Name *</label>
            <input type="text" id="name" name="name" required>
          </div>

          <div class="form-group">
            <label for="email">Email *</label>
            <input type="email" id="email" name="email" required>
          </div>

          <div class="form-group">
            <label for="title">Title</label>
            <input type="text" id="title" name="title">
          </div>

          <div class="form-group">
            <label for="department">Department</label>
            <input type="text" id="department" name="department">
          </div>

          <div class="form-group">
            <label for="phone">Phone</label>
            <input type="tel" id="phone" name="phone">
          </div>

          <button type="submit" class="btn btn-primary">Save Employee</button>
        </form>
      </main>
    `;
  }

  async renderDevices() {
    try {
      const devices = await api.getDevices();

      let html = `
        <main>
          <header>
            <h1>Devices</h1>
            <button class="btn btn-primary" onclick="router.navigate('/devices/new')">
              + New Device
            </button>
          </header>

          <section class="table-section">
            <input type="search" placeholder="Filter by model..." data-filter="model" class="search-input">
            <table>
              <thead>
                <tr>
                  <th data-sort-by="type">Type</th>
                  <th data-sort-by="model">Model</th>
                  <th data-sort-by="status">Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
      `;

      devices.forEach(device => {
        html += `
          <tr>
            <td data-column="type">${device.type || 'N/A'}</td>
            <td data-column="model">${device.model || 'N/A'}</td>
            <td data-column="status">${device.status || 'N/A'}</td>
            <td>
              <button class="btn btn-sm" data-toggle-row="${device.id}">Details</button>
              <button class="btn btn-danger btn-sm" data-delete-row="${device.id}">Delete</button>
            </td>
          </tr>
          <tr class="detail-row">
            <td colspan="4">
              <div class="detail-content">
                <p><strong>Serial:</strong> ${device.serial || 'N/A'}</p>
                <p><strong>Assigned To:</strong> ${device.assignedTo || 'Unassigned'}</p>
              </div>
            </td>
          </tr>
        `;
      });

      html += `
              </tbody>
            </table>
          </section>
        </main>
      `;

      return html;
    } catch (error) {
      return `<main><p>Error loading devices: ${error.message}</p></main>`;
    }
  }

  async renderDeviceDetail(id) {
    try {
      const device = await api.getDevice(id);

      return `
        <main>
          <button class="btn btn-secondary" onclick="router.back()">← Back</button>
          <h1>${device.type || 'Device'} - ${device.model || 'N/A'}</h1>

          <section class="detail-section">
            <h2>Information</h2>
            <dl>
              <dt>Serial Number</dt>
              <dd>${device.serial || 'N/A'}</dd>
              <dt>Type</dt>
              <dd>${device.type || 'N/A'}</dd>
              <dt>Model</dt>
              <dd>${device.model || 'N/A'}</dd>
              <dt>Status</dt>
              <dd>${device.status || 'N/A'}</dd>
            </dl>
          </section>

          <div class="button-group">
            <button class="btn btn-primary" onclick="router.navigate('/devices/${id}/edit')">Edit</button>
            <button class="btn btn-danger" onclick="if(confirm('Delete?')) router.navigate('/devices')">Delete</button>
          </div>
        </main>
      `;
    } catch (error) {
      return `<main><p>Error: ${error.message}</p></main>`;
    }
  }

  async renderAssignments() {
    try {
      const assignments = await api.getAssignments();

      let html = `
        <main>
          <header>
            <h1>Assignments</h1>
            <button class="btn btn-primary" onclick="router.navigate('/assignments/new')">
              + New Assignment
            </button>
          </header>

          <section class="table-section">
            <table>
              <thead>
                <tr>
                  <th data-sort-by="employee">Employee</th>
                  <th data-sort-by="device">Device</th>
                  <th data-sort-by="assignedAt">Assigned</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
      `;

      assignments.forEach(assign => {
        html += `
          <tr onclick="router.navigate('/assignments/${assign.id}')" style="cursor: pointer;">
            <td data-column="employee">
              <a href="#/assignments/${assign.id}">${assign.employee?.name || 'N/A'}</a>
            </td>
            <td data-column="device">${assign.device?.name || assign.device?.model || 'N/A'}</td>
            <td data-column="assignedAt">${assign.assignedAt ? new Date(assign.assignedAt).toLocaleDateString() : 'N/A'}</td>
            <td>
              <button class="btn btn-danger btn-sm" data-delete-row="${assign.id}">Remove</button>
            </td>
          </tr>
        `;
      });

      html += `
              </tbody>
            </table>
          </section>
        </main>
      `;

      return html;
    } catch (error) {
      return `<main><p>Error loading assignments: ${error.message}</p></main>`;
    }
  }

  async renderAssignmentDetail(id) {
    try {
      const assignment = await api.getAssignment(id);

      return `
        <main style="padding:20px;">
          <button class="btn btn-secondary" onclick="router.back()">← Back</button>
          <h1>${assignment.employee?.name || 'Assignment'}</h1>

          <section class="detail-section">
            <h2>Assignment Details</h2>
            <dl>
              <dt>Employee</dt>
              <dd>${assignment.employee?.name || 'N/A'}</dd>
              <dt>Device</dt>
              <dd>${assignment.device?.name || assignment.device?.model || 'N/A'}</dd>
              <dt>Assigned At</dt>
              <dd>${assignment.assignedAt ? new Date(assignment.assignedAt).toLocaleDateString() : 'N/A'}</dd>
              <dt>Status</dt>
              <dd>${assignment.status || 'Active'}</dd>
            </dl>
          </section>
        </main>
      `;
    } catch (error) {
      return `<main style="padding:20px;"><p>Error: ${error.message}</p></main>`;
    }
  }

  async renderOnboarding() {
    try {
      const onboarding = await api.getOnboarding();
      const runs = onboarding || [];

      return `
        <main style="padding:20px;">
          <header style="margin-bottom:24px;">
            <h1 style="font-size:24px;font-weight:500;color:#111;margin-bottom:8px;">Onboarding</h1>
            <p style="font-size:13px;color:#888;">Manage new employee onboarding and orientation</p>
          </header>
          <section id="onboarding-runs">
            ${runs.length > 0
              ? runs.map(run => `
                  <div class="run-card" onclick="router.navigate('/onboarding/${run.id}')" style="cursor: pointer;">
                    <div class="run-header">
                      <div class="run-name">${run.employee?.name || 'Employee'}</div>
                      <div class="run-sub" style="color:#888;">Status: ${run.status || 'active'}</div>
                    </div>
                    <div class="progress-bg">
                      <div class="progress-fill" style="width: ${(run.tasks?.filter(t => t.status === 'completed').length || 0) / (run.tasks?.length || 1) * 100}%"></div>
                    </div>
                    ${(run.tasks || []).slice(0, 3).map(t => `
                      <div class="run-task">
                        <span>${t.status === 'completed' ? '✓' : '○'}</span>
                        <span style="margin-left:8px;">${t.taskTemplate?.name || 'Task'}</span>
                      </div>
                    `).join('')}
                  </div>
                `).join('')
              : '<p style="color:#aaa;padding:20px;">No onboarding runs in progress</p>'
            }
          </section>
        </main>
      `;
    } catch (error) {
      return `<main style="padding:20px;"><p>Error loading onboarding: ${error.message}</p></main>`;
    }
  }

  async renderOnboardingDetail(id) {
    try {
      const run = await api.call('GET', `/onboarding/${id}`);
      const data = run.data;

      return `
        <main style="padding:20px;">
          <button class="btn btn-secondary" onclick="router.back()">← Back</button>
          <h1>${data.employee?.name || 'Onboarding Run'}</h1>

          <div class="run-card">
            <div class="run-header">
              <div>
                <div class="run-name">Status: ${data.status || 'N/A'}</div>
              </div>
            </div>

            <div style="margin-top:16px;">
              <h3 style="font-size:14px;font-weight:500;margin-bottom:12px;">Tasks</h3>
              ${(data.tasks || []).length > 0
                ? (data.tasks || []).map(t => `
                    <div class="run-task">
                      <span class="task-check-${t.status === 'completed' ? 'done' : 'pending'}">
                        ${t.status === 'completed' ? '✓' : '○'}
                      </span>
                      <span class="task-text-${t.status === 'completed' ? 'done' : ''}">
                        ${t.taskTemplate?.name || 'Task'}
                      </span>
                      <span class="task-owner">· ${t.taskTemplate?.ownerRole || 'unassigned'}</span>
                    </div>
                  `).join('')
                : '<p style="color:#aaa;">No tasks</p>'
              }
            </div>
          </div>
        </main>
      `;
    } catch (error) {
      return `<main style="padding:20px;"><p>Error: ${error.message}</p></main>`;
    }
  }

  async renderWorkflows() {
    try {
      const tracksData = await api.call('GET', '/tracks');
      const workflows = tracksData.data || tracksData || [];

      let html = `
        <main style="padding:20px;">
          <header style="margin-bottom:24px;">
            <h1 style="font-size:24px;font-weight:500;color:#111;margin-bottom:8px;">Onboarding Workflows</h1>
            <p style="font-size:13px;color:#888;">Manage onboarding templates and workflows</p>
            <button class="btn btn-primary" style="margin-top:16px;">+ New Workflow</button>
          </header>

          <section class="table-section">
            <table>
              <thead>
                <tr>
                  <th data-sort-by="name">Name</th>
                  <th data-sort-by="type">Type</th>
                  <th data-sort-by="tasks">Tasks</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
      `;

      workflows.forEach(workflow => {
        html += `
          <tr>
            <td data-column="name">${workflow.name || 'N/A'}</td>
            <td data-column="type">${workflow.type || 'standard'}</td>
            <td data-column="tasks">${workflow.tasks?.length || 0}</td>
            <td>
              <button class="btn btn-sm">Edit</button>
            </td>
          </tr>
        `;
      });

      html += `
              </tbody>
            </table>
          </section>
        </main>
      `;

      return html;
    } catch (error) {
      return `<main style="padding:20px;"><p>Error loading workflows: ${error.message}</p></main>`;
    }
  }

  async renderTemplates() {
    try {
      const tracksData = await api.call('GET', '/tracks');
      const templates = tracksData.data || tracksData || [];

      let html = `
        <main style="padding:20px;">
          <header style="margin-bottom:24px;">
            <h1 style="font-size:24px;font-weight:500;color:#111;margin-bottom:8px;">Onboarding Templates</h1>
            <p style="font-size:13px;color:#888;">Manage task templates and track types</p>
            <button class="btn btn-primary" style="margin-top:16px;">+ New Template</button>
          </header>

          <section class="table-section">
            <table>
              <thead>
                <tr>
                  <th data-sort-by="name">Name</th>
                  <th data-sort-by="type">Type</th>
                  <th data-sort-by="description">Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
      `;

      templates.forEach(template => {
        html += `
          <tr>
            <td data-column="name">${template.name || 'N/A'}</td>
            <td data-column="type">${template.type || 'standard'}</td>
            <td data-column="description">${template.description ? template.description.substring(0, 50) + '...' : 'N/A'}</td>
            <td>
              <button class="btn btn-sm">Edit</button>
            </td>
          </tr>
        `;
      });

      html += `
              </tbody>
            </table>
          </section>
        </main>
      `;

      return html;
    } catch (error) {
      return `<main style="padding:20px;"><p>Error loading templates: ${error.message}</p></main>`;
    }
  }

  async renderSettings() {
    try {
      const settings = await api.getSettings();

      return `
        <main>
          <header>
            <h1>System Settings</h1>
          </header>

          <form data-form="settings-form">
            <section class="form-section">
              <h2>Email Configuration</h2>
              <div class="form-group">
                <label for="smtp-host">SMTP Host</label>
                <input type="text" id="smtp-host" name="smtpHost" value="${settings.smtpHost || ''}">
              </div>
              <div class="form-group">
                <label for="smtp-port">SMTP Port</label>
                <input type="number" id="smtp-port" name="smtpPort" value="${settings.smtpPort || ''}">
              </div>
            </section>

            <section class="form-section">
              <h2>Onboarding</h2>
              <div class="form-group">
                <label for="default-workflow">Default Workflow</label>
                <select id="default-workflow" name="defaultWorkflow">
                  <option>Standard</option>
                  <option>Executive</option>
                  <option>Contractor</option>
                </select>
              </div>
            </section>

            <button type="submit" class="btn btn-primary">Save Settings</button>
          </form>
        </main>
      `;
    } catch (error) {
      return `<main><p>Error loading settings: ${error.message}</p></main>`;
    }
  }

  async renderLists() {
    try {
      return `
        <main style="padding:20px;">
          <header style="margin-bottom:24px;">
            <h1>Configuration Lists</h1>
            <p style="color:#888;margin-top:4px;">Manage skill tags, seniority levels, and other configuration lists</p>
          </header>
          <p>Lists configuration page coming soon...</p>
        </main>
      `;
    } catch (error) {
      return `<main><p>Error loading lists: ${error.message}</p></main>`;
    }
  }

  async renderUsers() {
    try {
      return `
        <main style="padding:20px;">
          <header style="margin-bottom:24px;">
            <h1>Users</h1>
            <p style="color:#888;margin-top:4px;">Manage user accounts and permissions</p>
          </header>
          <p>Users management page coming soon...</p>
        </main>
      `;
    } catch (error) {
      return `<main><p>Error loading users: ${error.message}</p></main>`;
    }
  }

  async renderOffboarding() {
    try {
      const offboarding = await api.call('GET', '/onboarding?type=offboarding');
      const runs = offboarding.data || [];

      return `
        <main style="padding:20px;">
          <header style="margin-bottom:24px;">
            <h1 style="font-size:24px;font-weight:500;color:#111;margin-bottom:8px;">Offboarding</h1>
            <p style="font-size:13px;color:#888;">Manage employee separations and final tasks</p>
          </header>
          <section id="offboarding-runs">
            ${runs.length > 0
              ? runs.map(run => `
                  <div class="run-card">
                    <div class="run-header">
                      <div class="run-name">${run.employee?.name || 'Employee'}</div>
                      <div class="run-sub" style="color:#888;">Status: ${run.status}</div>
                    </div>
                    <div class="progress-bg">
                      <div class="progress-fill" style="width: ${(run.tasks?.filter(t => t.status === 'completed').length || 0) / (run.tasks?.length || 1) * 100}%"></div>
                    </div>
                    ${(run.tasks || []).slice(0, 5).map(t => `
                      <div class="run-task">
                        <span>${t.status === 'completed' ? '✓' : '○'}</span>
                        <span style="margin-left:8px;">${t.taskTemplate?.name || 'Task'}</span>
                      </div>
                    `).join('')}
                  </div>
                `).join('')
              : '<p style="color:#aaa;padding:20px;">No offboarding runs</p>'
            }
          </section>
        </main>
      `;
    } catch (error) {
      return `<main style="padding:20px;"><p>Error loading offboarding: ${error.message}</p></main>`;
    }
  }

  async renderTracks() {
    try {
      const tracksData = await api.call('GET', '/tracks');
      const tracks = tracksData.data || tracksData || [];

      return `
        <main style="padding:20px;">
          <header style="margin-bottom:24px;">
            <h1 style="font-size:24px;font-weight:500;color:#111;margin-bottom:8px;">Tracks</h1>
            <p style="font-size:13px;color:#888;">Career development and progression tracking</p>
          </header>
          <section id="tracks-content">
            ${tracks.length > 0
              ? tracks.map(track => `
                  <div class="run-card">
                    <div class="run-header">
                      <div class="run-name">${track.name || 'Track'}</div>
                      <div class="run-sub" style="color:#888;">Type: ${track.type || 'standard'}</div>
                    </div>
                    ${track.description ? `<p style="font-size:13px;color:#666;margin:12px 0;">${track.description}</p>` : ''}
                    <div style="margin-top:12px;">
                      <h4 style="font-size:12px;font-weight:500;margin-bottom:8px;color:#888;">Tasks</h4>
                      ${(track.tasks || []).length > 0
                        ? (track.tasks || []).map(t => `
                            <div class="run-task">
                              <span style="color:#666;">•</span>
                              <span style="margin-left:8px;">${t.name || 'Task'}</span>
                            </div>
                          `).join('')
                        : '<p style="font-size:12px;color:#aaa;">No tasks</p>'
                      }
                    </div>
                  </div>
                `).join('')
              : '<p style="color:#aaa;padding:20px;">No tracks found</p>'
            }
          </section>
        </main>
      `;
    } catch (error) {
      return `<main style="padding:20px;"><p>Error loading tracks: ${error.message}</p></main>`;
    }
  }

  async renderReports() {
    try {
      const data = await api.call('GET', '/dashboard');
      const dashboard = data.data || {};

      return `
        <main style="padding:20px;">
          <header style="margin-bottom:24px;">
            <h1 style="font-size:24px;font-weight:500;color:#111;margin-bottom:8px;">Reports</h1>
            <p style="font-size:13px;color:#888;">Analytics and HR insights</p>
          </header>
          <section id="reports-content">
            <div class="stat-row">
              <div class="stat-card">
                <div class="stat-lbl">Active Candidates</div>
                <div class="stat-val">${dashboard.activeCandidateCount || 0}</div>
                <div class="stat-sub">in pipeline</div>
              </div>
              <div class="stat-card">
                <div class="stat-lbl">Interviews This Week</div>
                <div class="stat-val">${dashboard.interviewsScheduledThisWeek || 0}</div>
                <div class="stat-sub">scheduled</div>
              </div>
              <div class="stat-card">
                <div class="stat-lbl">Onboardings in Progress</div>
                <div class="stat-val">${dashboard.onboardingsInProgress || 0}</div>
                <div class="stat-sub">active runs</div>
              </div>
              <div class="stat-card">
                <div class="stat-lbl">Devices Unassigned</div>
                <div class="stat-val">${dashboard.unassignedDeviceCount || 0}</div>
                <div class="stat-sub">available</div>
              </div>
            </div>

            <div class="widget" style="margin-top:24px;">
              <div class="widget-title">Stale Candidates (${(dashboard.staleCandidates || []).length})</div>
              ${(dashboard.staleCandidates || []).length > 0
                ? (dashboard.staleCandidates || []).map(c => `
                    <div class="stale-row">
                      <div><div class="stale-name">${c.name}</div></div>
                      <div class="stale-pill">${Math.floor((Date.now() - new Date(c.latestStageChangeAt)) / (1000*60*60*24))} days</div>
                    </div>
                  `).join('')
                : '<p style="color:#aaa;padding:12px 0;">No stale candidates</p>'
              }
            </div>

            <div class="widget" style="margin-top:24px;">
              <div class="widget-title">Pending Onboarding Tasks (${(dashboard.pendingOnboardingTasksNext7Days || []).length})</div>
              ${(dashboard.pendingOnboardingTasksNext7Days || []).length > 0
                ? (dashboard.pendingOnboardingTasksNext7Days || []).map(t => `
                    <div class="run-task">
                      <span>○</span>
                      <span style="margin-left:8px;">${t.taskTemplate?.name || 'Task'}</span>
                      <span style="font-size:11px;color:#999;margin-left:auto;">${t.employee?.name || 'Unknown'}</span>
                    </div>
                  `).join('')
                : '<p style="color:#aaa;padding:12px 0;">No pending tasks</p>'
              }
            </div>
          </section>
        </main>
      `;
    } catch (error) {
      return `<main style="padding:20px;"><p>Error loading reports: ${error.message}</p></main>`;
    }
  }
}

// Boot application
const app = new Application();
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => app.init());
} else {
  app.init();
}
