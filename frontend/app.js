// V.Two Ops — app.js
// Wires live API data into the mockup HTML
// Drop this file into the frontend directory alongside index.html

const API = 'http://localhost:3001/api';
const COOKIES = { credentials: 'include' };

// ── Auth ──────────────────────────────────────────────────────────────────────

async function ensureLoggedIn() {
  try {
    const res = await fetch(`${API}/auth/me`, COOKIES);
    if (res.ok) return true;
  } catch (e) {}
  // Auto-login with seeded user
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'oliver@v.two', password: 'password123' }),
    credentials: 'include',
  });
  return res.ok;
}

// ── Fetch helpers ─────────────────────────────────────────────────────────────

async function api(path) {
  const res = await fetch(`${API}${path}`, COOKIES);
  if (!res.ok) return null;
  return res.json();
}

async function post(path, body) {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    credentials: 'include',
  });
  return res.json();
}

async function patch(path, body) {
  const res = await fetch(`${API}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    credentials: 'include',
  });
  return res.json();
}

// ── Utility ───────────────────────────────────────────────────────────────────

function stagePill(stage) {
  const map = {
    applied: 's-applied', screening: 's-screening', interview: 's-interview',
    offer: 's-offer', hired: 's-hired', rejected: 's-rejected', withdrawn: 's-withdrawn',
  };
  const cls = map[stage] || 's-applied';
  return `<span class="stage-pill ${cls}">${cap(stage)}</span>`;
}

function statusPill(status, type = 'candidate') {
  if (type === 'device') {
    const map = { available: 's-available', assigned: 's-assigned', retired: 's-retired' };
    return `<span class="stage-pill ${map[status] || 's-available'}">${cap(status)}</span>`;
  }
  if (type === 'run') {
    const map = { pending: 's-pending', in_progress: 's-inprogress', complete: 's-complete' };
    return `<span class="stage-pill ${map[status] || 's-pending'}">${cap(status).replace('_',' ')}</span>`;
  }
  return `<span class="stage-pill ${status === 'active' ? 's-active' : 's-inactive'}">${cap(status)}</span>`;
}

function cap(s) {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function fmtShort(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function staleDot(candidate) {
  if (candidate.staleDays && candidate.staleDays >= 14) {
    return `<span class="stale-dot"></span>`;
  }
  return '';
}

function emptyState(msg, cta, action) {
  return `<div style="padding:48px;text-align:center;color:#aaa">
    <div style="font-size:14px;font-weight:500;color:#555;margin-bottom:6px">${msg}</div>
    ${cta ? `<button class="btn btn-primary" style="margin-top:12px" onclick="${action}">${cta}</button>` : ''}
  </div>`;
}

// ── State ─────────────────────────────────────────────────────────────────────

let state = {
  currentPage: 'dashboard',
  selectedCandidate: null,
  selectedEmployee: null,
  selectedDevice: null,
  candidates: [],
  employees: [],
  devices: [],
  tracks: [],
  onboardingRuns: [],
  offboardingRuns: [],
  assignments: [],
  configLists: [],
  candidateFilters: { status: 'active', stage: '', stale: false },
  candidateSort: { col: 'createdAt', dir: 'desc' },
  detailTab: 'overview',
};

// ── Navigation ────────────────────────────────────────────────────────────────

function navigate(page) {
  state.currentPage = page;
  state.selectedCandidate = null;
  state.selectedEmployee = null;
  state.selectedDevice = null;
  state.detailTab = 'overview';

  // Update sidebar active state
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  const navMap = {
    dashboard: 'Dashboard', candidates: 'Candidates', employees: 'Employees',
    onboarding: 'Onboarding', offboarding: 'Offboarding', inventory: 'Inventory',
    assignments: 'Assignments', tracks: 'Tracks', reports: 'Reports',
    lists: 'Lists', users: 'Users',
  };
  document.querySelectorAll('.nav-item').forEach(el => {
    if (el.textContent.trim() === navMap[page]) el.classList.add('active');
  });

  // Update topbar title
  const titleEl = document.getElementById('topbar-title');
  if (titleEl) {
    const parts = {
      dashboard: 'Dashboard', candidates: 'People / Candidates', employees: 'People / Employees',
      onboarding: 'People / Onboarding', offboarding: 'People / Offboarding',
      inventory: 'Devices / Inventory', assignments: 'Devices / Assignments',
      tracks: 'Tracks', reports: 'Reports', lists: 'Settings / Lists', users: 'Settings / Users',
    };
    titleEl.textContent = parts[page] || cap(page);
  }

  renderPage(page);
}

async function renderPage(page) {
  const activeShell = document.querySelector('.shell[style*="flex"], .shell:not([style*="none"])'); const content = activeShell ? activeShell.querySelector('.content') : document.querySelector('.content'); if (!content) return;
  if (!content) return;

  // Show loading state
  content.innerHTML = `<div style="padding:40px;color:#aaa;font-size:13px">Loading...</div>`;

  switch (page) {
    case 'dashboard': await renderDashboard(); break;
    case 'candidates': await renderCandidates(); break;
    case 'employees': await renderEmployees(); break;
    case 'onboarding': await renderOnboarding(); break;
    case 'offboarding': await renderOffboarding(); break;
    case 'inventory': await renderInventory(); break;
    case 'assignments': await renderAssignments(); break;
    case 'tracks': await renderTracks(); break;
    case 'reports': await renderReports(); break;
    case 'lists': await renderLists(); break;
    case 'users': await renderUsers(); break;
    default: content.innerHTML = `<div style="padding:40px">Page not found</div>`;
  }
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────

async function renderDashboard() {
  const data = await api('/dashboard');
  const d = data?.data || {};
  const content = document.querySelector('.content');

  const staleRows = (d.staleCandidates || []).map(c => `
    <div class="stale-row" style="cursor:pointer" onclick="openCandidate('${c.id}')">
      <div><div class="stale-name">${c.name}</div><div class="stale-meta">${cap(c.stage || '')} · ${c.staleDays || 14}+ days</div></div>
      <div class="stale-pill">${c.staleDays || 14} days</div>
    </div>`).join('') || '<div style="padding:8px 0;font-size:12.5px;color:#aaa">No stale candidates</div>';

  const intRows = (d.upcomingInterviewsNext7Days || []).map(i => {
    const dt = new Date(i.scheduledAt);
    return `
    <div class="int-row">
      <div class="date-block"><div class="d">${dt.getDate()}</div><div class="m">${dt.toLocaleString('en',{month:'short'})}</div></div>
      <div style="flex:1"><div class="int-name">${i.candidate?.name || '—'}</div><div class="int-meta">${dt.toLocaleTimeString('en',{hour:'2-digit',minute:'2-digit'})}</div></div>
    </div>`;
  }).join('') || '<div style="padding:8px 0;font-size:12.5px;color:#aaa">No upcoming interviews</div>';

  const taskRows = (d.pendingOnboardingTasksNext7Days || []).map(t => {
    const due = t.dueDate ? fmtShort(t.dueDate) : 'No deadline';
    const isToday = t.dueDate && new Date(t.dueDate).toDateString() === new Date().toDateString();
    const isOverdue = t.dueDate && new Date(t.dueDate) < new Date();
    const dueClass = isOverdue ? 'due-overdue' : isToday ? 'due-today' : 'due-future';
    return `
    <div class="task-row">
      <div class="task-name">${t.taskTemplate?.name || t.name || '—'}</div>
      <div class="task-who">${t.run?.employee?.name || ''}</div>
      <div class="task-due ${dueClass}">${isOverdue ? 'Overdue' : isToday ? 'Today' : due}</div>
    </div>`;
  }).join('') || '<div style="padding:8px 0;font-size:12.5px;color:#aaa">No pending tasks</div>';

  const actRows = (d.lastActivityRecords || []).slice(0, 8).map(a => {
    const colors = { candidate_added: '#aaa', stage_changed: '#3b82f6', hired: '#16a34a', device_assigned: '#9333ea', task_completed: '#16a34a' };
    const color = colors[a.type] || '#aaa';
    return `
    <div class="act-row">
      <div class="act-dot" style="background:${color}"></div>
      <div><div class="act-text">${a.description || ''}</div><div class="act-time">${fmtShort(a.createdAt)}</div></div>
    </div>`;
  }).join('') || '<div style="padding:8px 0;font-size:12.5px;color:#aaa">No recent activity</div>';

  content.innerHTML = `
  <div class="page active">
    <div class="dash-pad">
      <div class="stat-row">
        <div class="stat-card"><div class="stat-lbl">Active candidates</div><div class="stat-val">${d.activeCandidateCount || 0}</div><div class="stat-sub">in pipeline</div></div>
        <div class="stat-card"><div class="stat-lbl">Interviews this week</div><div class="stat-val">${d.interviewsScheduledThisWeek || 0}</div><div class="stat-sub">scheduled</div></div>
        <div class="stat-card"><div class="stat-lbl">Onboardings active</div><div class="stat-val">${d.onboardingsInProgress || 0}</div><div class="stat-sub">in progress</div></div>
        <div class="stat-card"><div class="stat-lbl">Devices unassigned</div><div class="stat-val">${d.unassignedDeviceCount || 0}</div><div class="stat-sub">available</div></div>
      </div>
      <div class="dash-grid">
        <div class="widget">
          <div class="widget-title">Stale candidates <span class="badge-red">${(d.staleCandidates||[]).length}</span></div>
          ${staleRows}
        </div>
        <div class="widget">
          <div class="widget-title">Upcoming interviews</div>
          ${intRows}
        </div>
      </div>
      <div class="dash-grid">
        <div class="widget">
          <div class="widget-title">Pending onboarding tasks <span class="badge-amber">${(d.pendingOnboardingTasksNext7Days||[]).length}</span></div>
          ${taskRows}
        </div>
        <div class="widget">
          <div class="widget-title">Recent activity</div>
          ${actRows}
        </div>
      </div>
    </div>
  </div>`;
}

// ── CANDIDATES ────────────────────────────────────────────────────────────────

async function renderCandidates() {
  const data = await api('/candidates?limit=100');
  state.candidates = data?.candidates || [];
  renderCandidateTable();
}

function renderCandidateTable() {
  const content = document.querySelector('.content');
  let rows = [...state.candidates];

  // Apply filters
  if (state.candidateFilters.status) {
    rows = rows.filter(c => (c.status || 'active') === state.candidateFilters.status);
  }
  if (state.candidateFilters.stage) {
    rows = rows.filter(c => c.stage === state.candidateFilters.stage);
  }
  if (state.candidateFilters.stale) {
    rows = rows.filter(c => c.staleDays >= 14);
  }

  // Apply sort
  rows.sort((a, b) => {
    const col = state.candidateSort.col;
    const dir = state.candidateSort.dir === 'asc' ? 1 : -1;
    const av = a[col] || ''; const bv = b[col] || '';
    return av > bv ? dir : av < bv ? -dir : 0;
  });

  const tbody = rows.length ? rows.map(c => `
    <tr data-id="${c.id}" class="${state.selectedCandidate?.id === c.id ? 'selected' : ''}" onclick="selectCandidate('${c.id}')">
      <td>${staleDot(c)}${c.name}</td>
      <td>${c.roleApplied || '—'}</td>
      <td>${stagePill(c.stage)}</td>
      <td>${statusPill(c.status || 'active')}</td>
      <td>${c.seniority || '—'}</td>
      <td>${c.source || '—'}</td>
      <td>${fmtShort(c.sourcedAt || c.createdAt)}</td>
      <td>${fmtShort(c.updatedAt)}</td>
    </tr>`).join('') : `<tr><td colspan="8">${emptyState('No candidates yet', '+ Add candidate', "openModal('modal-add-candidate')")}</td></tr>`;

  const staleOn = state.candidateFilters.stale;
  const activeOn = state.candidateFilters.status === 'active';
  const inactiveOn = state.candidateFilters.status === 'inactive';

  content.innerHTML = `
  <div class="page-split active">
    <div class="page-flex active" style="position:relative;flex:1">
      <div class="table-toolbar">
        <div class="filter-chip ${activeOn ? 'on' : ''}" onclick="setCandidateFilter('status','${activeOn ? '' : 'active'}')">Active${activeOn ? ' ✕' : ''}</div>
        <div class="filter-chip ${inactiveOn ? 'on' : ''}" onclick="setCandidateFilter('status','${inactiveOn ? '' : 'inactive'}')">Inactive${inactiveOn ? ' ✕' : ''}</div>
        <div class="filter-chip ${staleOn ? 'on' : ''}" onclick="toggleStaleFilter()">Stale${staleOn ? ' ✕' : ''}</div>
        <div class="filter-chip" onclick="setCandidateStageFilter('screening')">Screening</div>
        <div class="filter-chip" onclick="setCandidateStageFilter('interview')">Interview</div>
        <div class="filter-chip" onclick="setCandidateStageFilter('offer')">Offer</div>
      </div>
      <div class="tbl-wrap">
        <table>
          <thead><tr>
            <th onclick="sortCandidates('name')">Name ↕</th>
            <th>Role</th>
            <th onclick="sortCandidates('stage')">Stage ↕</th>
            <th>Status</th>
            <th>Seniority</th>
            <th>Source</th>
            <th onclick="sortCandidates('createdAt')">Added ↕</th>
            <th onclick="sortCandidates('updatedAt')">Last activity ↕</th>
          </tr></thead>
          <tbody>${tbody}</tbody>
        </table>
      </div>
    </div>
    <div id="detail-panel-placeholder"></div>
  </div>`;

  if (state.selectedCandidate) renderCandidatePanel(state.selectedCandidate);
}

function setCandidateFilter(key, val) {
  state.candidateFilters[key] = val;
  renderCandidateTable();
}

function toggleStaleFilter() {
  state.candidateFilters.stale = !state.candidateFilters.stale;
  renderCandidateTable();
}

function setCandidateStageFilter(stage) {
  state.candidateFilters.stage = state.candidateFilters.stage === stage ? '' : stage;
  renderCandidateTable();
}

function sortCandidates(col) {
  if (state.candidateSort.col === col) {
    state.candidateSort.dir = state.candidateSort.dir === 'asc' ? 'desc' : 'asc';
  } else {
    state.candidateSort = { col, dir: 'asc' };
  }
  renderCandidateTable();
}

async function selectCandidate(id) {
  const c = state.candidates.find(x => x.id === id);
  if (!c) return;
  state.selectedCandidate = c;
  state.detailTab = 'overview';
  document.querySelectorAll('#detail-panel-placeholder ~ tr, tbody tr').forEach(r => r.classList.remove('selected'));
  document.querySelector(`tr[data-id="${id}"]`)?.classList.add('selected');
  renderCandidatePanel(c);
}

async function openCandidate(id) {
  await renderCandidates();
  selectCandidate(id);
}

function renderCandidatePanel(c) {
  const placeholder = document.getElementById('detail-panel-placeholder');
  if (!placeholder) return;

  const tabs = ['overview', 'interviews', 'offer', 'resumes', 'activity'];
  const tabHtml = tabs.map(t => `<div class="dp-tab ${state.detailTab === t ? 'active' : ''}" onclick="setCandidateTab('${t}')">${cap(t)}</div>`).join('');

  let body = '';
  if (state.detailTab === 'overview') {
    body = `
      <div class="field"><div class="field-lbl">Phone</div><div class="field-val" onclick="editField(this,'phone','${c.id}','candidate')">${c.phone || '—'}</div></div>
      <div class="field"><div class="field-lbl">Location</div><div class="field-val" onclick="editField(this,'location','${c.id}','candidate')">${c.location || '—'}</div></div>
      <div class="field"><div class="field-lbl">Role applied</div><div class="field-val" onclick="editField(this,'roleApplied','${c.id}','candidate')">${c.roleApplied || '—'}</div></div>
      <div class="field"><div class="field-lbl">Seniority</div><div class="field-val" onclick="editField(this,'seniority','${c.id}','candidate')">${c.seniority || '—'}</div></div>
      <div class="field"><div class="field-lbl">Source</div><div class="field-val" onclick="editField(this,'source','${c.id}','candidate')">${c.source || '—'}</div></div>
      <div class="field"><div class="field-lbl">Status</div>
        <select class="field-select" onchange="patchRecord('/candidates/${c.id}',{status:this.value})">
          <option ${c.status==='active'?'selected':''}>active</option>
          <option ${c.status==='inactive'?'selected':''}>inactive</option>
          <option ${c.status==='hired'?'selected':''}>hired</option>
          <option ${c.status==='rejected'?'selected':''}>rejected</option>
          <option ${c.status==='withdrawn'?'selected':''}>withdrawn</option>
        </select>
      </div>
      <div class="field"><div class="field-lbl">Sourced date</div><div class="field-val" onclick="editField(this,'sourcedAt','${c.id}','candidate',true)">${fmtDate(c.sourcedAt || c.createdAt)}</div></div>
      <div class="field"><div class="field-lbl">Notes</div><div class="field-val muted" onclick="editField(this,'notes','${c.id}','candidate')">${c.notes || '—'}</div></div>`;
  } else if (state.detailTab === 'interviews') {
    body = `<div class="sec-head">Interview history</div><div id="interviews-list">Loading...</div>`;
    setTimeout(() => loadCandidateInterviews(c.id), 0);
  } else if (state.detailTab === 'offer') {
    body = `<div class="sec-head">Offer</div><div id="offer-content">Loading...</div>`;
    setTimeout(() => loadCandidateOffer(c.id), 0);
  } else if (state.detailTab === 'resumes') {
    body = `<div class="sec-head">Resumes</div><div id="resumes-list">Loading...</div>`;
    setTimeout(() => loadCandidateResumes(c.id), 0);
  } else if (state.detailTab === 'activity') {
    body = `<div class="sec-head">Activity</div><div id="activity-list">Loading...</div>`;
    setTimeout(() => loadCandidateActivity(c.id), 0);
  }

  // Pipeline row
  const stages = ['applied','screening','interview','offer','hired'];
  const stageIdx = stages.indexOf(c.stage);
  const pipelineHtml = stages.map((s, i) => {
    const cls = i < stageIdx ? 'done' : i === stageIdx ? 'active' : '';
    return `<span class="pip-step ${cls}">${cap(s)}</span>${i < stages.length-1 ? '<span class="pip-arrow">›</span>' : ''}`;
  }).join('');

  placeholder.outerHTML = `
  <div class="detail-panel" id="candidate-detail">
    <div class="dp-header">
      <span class="dp-close" onclick="closeDetail()">✕</span>
      <div class="dp-name">${c.name}</div>
      <div class="dp-sub">${c.email}${c.phone ? ' · ' + c.phone : ''}</div>
      <div class="dp-meta">${stagePill(c.stage)} ${statusPill(c.status || 'active')} ${c.seniority ? `<span class="tag">${c.seniority}</span>` : ''}</div>
      <div class="pipeline-row">${pipelineHtml}</div>
    </div>
    <div class="dp-tabs">${tabHtml}</div>
    <div class="dp-body">${body}</div>
    <div class="dp-actions">
      <button class="btn btn-secondary" onclick="openLogInterviewModal('${c.id}','${c.name}')">Log interview</button>
      ${c.stage !== 'hired' ? `<button class="btn btn-primary" onclick="advanceStage('${c.id}')">Advance stage →</button>` : ''}
    </div>
  </div>`;
}

function setCandidateTab(tab) {
  state.detailTab = tab;
  if (state.selectedCandidate) renderCandidatePanel(state.selectedCandidate);
}

async function loadCandidateInterviews(candidateId) {
  const data = await api(`/interviews?candidateId=${candidateId}`);
  const list = document.getElementById('interviews-list');
  if (!list) return;
  const interviews = data?.data || data || [];
  if (!interviews.length) { list.innerHTML = '<div style="font-size:12.5px;color:#aaa;font-style:italic">No interviews logged yet.</div>'; return; }
  list.innerHTML = interviews.map(i => `
    <div class="int-card">
      <div class="int-card-top"><div class="int-card-date">${fmtDate(i.scheduledAt)}</div><span class="int-fmt">${cap(i.format || 'Video')}</span></div>
      ${(i.interviewers || []).map(iv => `
        <div class="int-card-interviewer">
          <div><span class="int-name">${iv.name}</span><span class="int-role"> · ${iv.role || ''}</span></div>
          <span class="rec-${iv.recommendation === 'hire' ? 'hire' : iv.recommendation === 'maybe' ? 'maybe' : 'no'}">${cap(iv.recommendation || '')}</span>
        </div>
        ${iv.feedback ? `<div class="int-feedback">${iv.feedback}</div>` : ''}`).join('')}
      ${i.notes ? `<div class="int-card-body">${i.notes}</div>` : ''}
    </div>`).join('');
}

async function loadCandidateOffer(candidateId) {
  const data = await api(`/offers?candidateId=${candidateId}`);
  const el = document.getElementById('offer-content');
  if (!el) return;
  const offers = data?.data || [];
  if (!offers.length) { el.innerHTML = '<div style="font-size:13px;color:#aaa;font-style:italic">No offer created yet.</div>'; return; }
  const o = offers[0];
  el.innerHTML = `
    <div class="offer-card">
      <div class="offer-status-row"><div style="font-size:14px;font-weight:500">${o.role}</div>${stagePill(o.status)}</div>
      <div class="field"><div class="field-lbl">Compensation</div><div class="field-val">${o.compensation || '—'}</div></div>
      <div class="field"><div class="field-lbl">Start date</div><div class="field-val">${fmtDate(o.startDate)}</div></div>
      <div class="field"><div class="field-lbl">Sent</div><div class="field-val">${fmtDate(o.sentAt)}</div></div>
      <div class="field"><div class="field-lbl">Expires</div><div class="field-val">${fmtDate(o.expiresAt)}</div></div>
      ${o.notes ? `<div class="field"><div class="field-lbl">Notes</div><div class="field-val muted">${o.notes}</div></div>` : ''}
    </div>`;
}

async function loadCandidateResumes(candidateId) {
  const data = await api(`/candidates/${candidateId}/resumes`);
  const el = document.getElementById('resumes-list');
  if (!el) return;
  const resumes = data?.data || data || [];
  if (!resumes.length) { el.innerHTML = '<div style="font-size:12.5px;color:#aaa;font-style:italic">No resumes linked yet.</div>'; return; }
  el.innerHTML = resumes.map(r => `
    <div class="resume-row">
      <div><div class="resume-name">${r.fileName}</div><div class="resume-meta">Version ${r.version} · ${fmtShort(r.uploadedAt)} ${r.isActive ? '· Active' : ''}</div></div>
      <a class="link-blue" href="${r.fileUrl}" target="_blank">Open ↗</a>
    </div>`).join('');
}

async function loadCandidateActivity(candidateId) {
  const data = await api(`/activities?candidateId=${candidateId}&limit=20`);
  const el = document.getElementById('activity-list');
  if (!el) return;
  const acts = data?.data || [];
  if (!acts.length) { el.innerHTML = '<div style="font-size:12.5px;color:#aaa">No activity recorded.</div>'; return; }
  el.innerHTML = acts.map(a => `
    <div class="act-item">
      <div class="act-dot" style="background:#aaa"></div>
      <div><div class="act-text">${a.description}</div><div class="act-time">${fmtShort(a.createdAt)}</div></div>
    </div>`).join('');
}

async function advanceStage(candidateId) {
  const stages = ['applied', 'screening', 'interview', 'offer'];
  const c = state.candidates.find(x => x.id === candidateId);
  if (!c) return;
  const idx = stages.indexOf(c.stage);
  if (idx === -1 || idx >= stages.length - 1) return;
  const nextStage = stages[idx + 1];
  await patch(`/candidates/${candidateId}`, { stage: nextStage });
  await renderCandidates();
}

function closeDetail() {
  state.selectedCandidate = null;
  state.selectedEmployee = null;
  state.selectedDevice = null;
  const panel = document.getElementById('candidate-detail') || document.getElementById('employee-detail') || document.getElementById('device-detail');
  if (panel) panel.id === 'candidate-detail' ? panel.outerHTML = '<div id="detail-panel-placeholder"></div>' : panel.remove();
  renderCandidateTable();
}

// ── INLINE EDITING ────────────────────────────────────────────────────────────

function editField(el, field, recordId, type, isDate = false) {
  const current = el.textContent.trim() === '—' ? '' : el.textContent.trim();
  const inputType = isDate ? 'date' : 'text';
  const dateVal = isDate && current ? new Date(current).toISOString().split('T')[0] : current;

  el.outerHTML = `
    <div class="field-editing" data-field="${field}" data-id="${recordId}" data-type="${type}">
      <input class="field-input" type="${inputType}" value="${isDate ? dateVal : current}" id="edit-${field}-${recordId}" />
      <div class="inline-save-row">
        <button class="save-btn" onclick="saveField('${field}','${recordId}','${type}',${isDate})">Save</button>
        <button class="cancel-btn" onclick="cancelEdit('${field}','${recordId}','${type}','${current}')">Cancel</button>
      </div>
      ${isDate ? '<div class="edit-hint">Can be back-dated</div>' : ''}
    </div>`;
  document.getElementById(`edit-${field}-${recordId}`)?.focus();
}

async function saveField(field, recordId, type, isDate) {
  const input = document.getElementById(`edit-${field}-${recordId}`);
  if (!input) return;
  const value = input.value;
  const endpoint = type === 'candidate' ? `/candidates/${recordId}` : type === 'employee' ? `/employees/${recordId}` : `/devices/${recordId}`;
  await patch(endpoint, { [field]: value });

  // Refresh the record in state
  if (type === 'candidate') {
    const data = await api(`/candidates/${recordId}`);
    if (data) {
      const idx = state.candidates.findIndex(c => c.id === recordId);
      if (idx >= 0) state.candidates[idx] = data.data || data;
      state.selectedCandidate = data.data || data;
      renderCandidatePanel(state.selectedCandidate);
    }
  }
}

async function patchRecord(path, body) {
  await patch(path, body);
  if (state.currentPage === 'candidates') await renderCandidates();
  if (state.currentPage === 'employees') await renderEmployees();
}

function cancelEdit(field, recordId, type, original) {
  const editing = document.querySelector(`.field-editing[data-field="${field}"][data-id="${recordId}"]`);
  if (editing) editing.outerHTML = `<div class="field-val" onclick="editField(this,'${field}','${recordId}','${type}')">${original || '—'}</div>`;
}

// ── EMPLOYEES ─────────────────────────────────────────────────────────────────

async function renderEmployees() {
  const data = await api('/employees?limit=100');
  state.employees = data?.data || [];
  const content = document.querySelector('.content');

  const tbody = state.employees.length ? state.employees.map(e => `
    <tr data-id="${e.id}" onclick="selectEmployee('${e.id}')">
      <td>${e.name}</td>
      <td>${e.title || '—'}</td>
      <td>${e.department || '—'}</td>
      <td>${fmtShort(e.startDate)}</td>
      <td>${statusPill(e.status || 'active')}</td>
    </tr>`).join('') : `<tr><td colspan="5">${emptyState('No employees yet','','')}</td></tr>`;

  content.innerHTML = `
  <div class="page-split active">
    <div class="page-flex active" style="position:relative;flex:1">
      <div class="table-toolbar">
        <div class="filter-chip">Status ▾</div>
        <div class="filter-chip">Department ▾</div>
      </div>
      <div class="tbl-wrap">
        <table>
          <thead><tr><th>Name ↕</th><th>Title</th><th>Department</th><th>Start date ↕</th><th>Status</th></tr></thead>
          <tbody>${tbody}</tbody>
        </table>
      </div>
    </div>
    <div id="employee-panel-placeholder"></div>
  </div>`;
}

async function selectEmployee(id) {
  const data = await api(`/employees/${id}`);
  const e = data?.data || data;
  if (!e) return;
  state.selectedEmployee = e;
  state.detailTab = 'details';
  document.querySelector(`tr[data-id="${id}"]`)?.classList.add('selected');

  const placeholder = document.getElementById('employee-panel-placeholder');
  if (!placeholder) return;

  placeholder.outerHTML = `
  <div class="detail-panel" id="employee-detail">
    <div class="dp-header">
      <span class="dp-close" onclick="document.getElementById('employee-detail').remove()">✕</span>
      <div class="dp-name">${e.name}</div>
      <div class="dp-sub">${e.email} · ${e.title || ''}</div>
      <div class="dp-meta">${statusPill(e.status || 'active')} ${e.department ? `<span class="tag">${e.department}</span>` : ''}</div>
    </div>
    <div class="dp-tabs">
      <div class="dp-tab active">Details</div>
      <div class="dp-tab">Devices</div>
      <div class="dp-tab">Onboarding</div>
      <div class="dp-tab">Activity</div>
    </div>
    <div class="dp-body">
      <div class="field"><div class="field-lbl">Email</div><div class="field-val">${e.email}</div></div>
      <div class="field"><div class="field-lbl">Title</div><div class="field-val" onclick="editField(this,'title','${e.id}','employee')">${e.title || '—'}</div></div>
      <div class="field"><div class="field-lbl">Department</div><div class="field-val" onclick="editField(this,'department','${e.id}','employee')">${e.department || '—'}</div></div>
      <div class="field"><div class="field-lbl">Start date</div><div class="field-val" onclick="editField(this,'startDate','${e.id}','employee',true)">${fmtDate(e.startDate)}</div></div>
      <div class="field"><div class="field-lbl">Status</div>
        <select class="field-select" onchange="patchRecord('/employees/${e.id}',{status:this.value})">
          <option ${e.status==='active'?'selected':''}>active</option>
          <option ${e.status==='offboarded'?'selected':''}>offboarded</option>
        </select>
      </div>
    </div>
    <div class="dp-actions">
      <button class="btn btn-secondary" onclick="openAssignDeviceModal('${e.id}','${e.name}')">Assign device</button>
      <button class="btn btn-danger" onclick="triggerOffboard('${e.id}','${e.name}')">Offboard</button>
    </div>
  </div>`;
}

// ── ONBOARDING ────────────────────────────────────────────────────────────────

async function renderOnboarding() {
  const data = await api('/onboarding');
  state.onboardingRuns = (data?.data || []).filter(r => r.type === 'onboarding');
  renderRunList('onboarding');
}

async function renderOffboarding() {
  const data = await api('/onboarding');
  state.offboardingRuns = (data?.data || []).filter(r => r.type === 'offboarding');
  renderRunList('offboarding');
}

function renderRunList(type) {
  const runs = type === 'onboarding' ? state.onboardingRuns : state.offboardingRuns;
  const content = document.querySelector('.content');

  if (!runs.length) {
    content.innerHTML = `<div class="page active"><div class="dash-pad">${emptyState(`No ${type} runs yet`, '', '')}</div></div>`;
    return;
  }

  const cards = runs.map(run => {
    const tasks = run.tasks || [];
    const done = tasks.filter(t => t.status === 'complete').length;
    const total = tasks.length;
    const pct = total ? Math.round((done / total) * 100) : 0;

    const taskRows = tasks.slice(0, 6).map(t => {
      const isDone = t.status === 'complete';
      const isOverdue = t.dueDate && new Date(t.dueDate) < new Date() && !isDone;
      const isToday = t.dueDate && new Date(t.dueDate).toDateString() === new Date().toDateString();
      const dueClass = isOverdue ? 'due-overdue' : isToday ? 'due-today' : 'due-future';
      const due = t.dueDate ? fmtShort(t.dueDate) : '';
      return `
      <div class="run-task">
        <span class="${isDone ? 'task-check-done' : 'task-check-pending'}">${isDone ? '✓' : '○'}</span>
        <span class="${isDone ? 'task-text-done' : 'task-text'}" onclick="toggleTask('${t.id}','${isDone ? 'pending' : 'complete'}')">${t.taskTemplate?.name || t.name || '—'}</span>
        <span class="task-owner">· ${t.taskTemplate?.ownerRole || ''}</span>
        ${due ? `<div style="margin-left:auto" class="task-due ${dueClass}">${isOverdue ? 'Overdue' : isToday ? 'Today' : due}</div>` : ''}
      </div>`;
    }).join('');

    return `
    <div class="run-card">
      <div class="run-header">
        <div><div class="run-name">${run.employee?.name || '—'}</div><div class="run-sub">${run.employee?.title || ''} · ${run.startDate ? 'Started ' + fmtShort(run.startDate) : 'Pending'}</div></div>
        <div style="display:flex;gap:6px;align-items:center">${statusPill(run.status, 'run')}</div>
      </div>
      <div class="progress-bg"><div class="progress-fill" style="width:${pct}%"></div></div>
      <div style="font-size:11px;color:#aaa;margin-bottom:10px">${done} of ${total} tasks complete</div>
      ${taskRows}
    </div>`;
  }).join('');

  content.innerHTML = `<div class="page active"><div class="dash-pad">${cards}</div></div>`;
}

async function toggleTask(taskId, newStatus) {
  await patch(`/onboarding/tasks/${taskId}`, { status: newStatus });
  if (state.currentPage === 'onboarding') await renderOnboarding();
  if (state.currentPage === 'offboarding') await renderOffboarding();
}

// ── DEVICES / INVENTORY ───────────────────────────────────────────────────────

async function renderInventory() {
  const data = await api('/devices?limit=100');
  state.devices = data?.data || [];
  const content = document.querySelector('.content');

  const tbody = state.devices.length ? state.devices.map(d => `
    <tr data-id="${d.id}" onclick="selectDevice('${d.id}')">
      <td>${d.serial}</td>
      <td>${cap(d.type)}</td>
      <td>${d.make} / ${d.model}</td>
      <td>${cap(d.condition)}</td>
      <td>${statusPill(d.status, 'device')}</td>
      <td>${d.currentAssignee?.name || '—'}</td>
      <td>${fmtShort(d.warrantyExp)}</td>
    </tr>`).join('') : `<tr><td colspan="7">${emptyState('No devices yet', '+ Add device', "openModal('modal-add-device')")}</td></tr>`;

  content.innerHTML = `
  <div class="page-split active">
    <div class="page-flex active" style="position:relative;flex:1">
      <div class="table-toolbar">
        <div class="filter-chip">Type ▾</div>
        <div class="filter-chip">Status ▾</div>
        <div class="filter-chip">Condition ▾</div>
      </div>
      <div class="tbl-wrap">
        <table>
          <thead><tr><th>Serial ↕</th><th>Type</th><th>Make / Model</th><th>Condition</th><th>Status ↕</th><th>Assigned to</th><th>Warranty exp.</th></tr></thead>
          <tbody>${tbody}</tbody>
        </table>
      </div>
    </div>
    <div id="device-panel-placeholder"></div>
  </div>`;
}

async function selectDevice(id) {
  const data = await api(`/devices/${id}`);
  const d = data?.data || data;
  if (!d) return;
  state.selectedDevice = d;

  const placeholder = document.getElementById('device-panel-placeholder');
  if (!placeholder) return;

  const histData = await api(`/assignments?deviceId=${id}`);
  const history = histData?.data || [];
  const histHtml = history.length ? history.map(a => `
    <div class="assign-row ${!a.returnedDate ? 'assign-current' : ''}">
      <div class="assign-top">
        <div class="assign-name">${a.employee?.name || '—'}</div>
        ${!a.returnedDate ? '<span class="stage-pill s-assigned" style="font-size:10px">Current</span>' : `<span class="assign-condition">Returned: ${cap(a.condition || '')}</span>`}
      </div>
      <div class="assign-dates">${fmtShort(a.assignedDate)} → ${a.returnedDate ? fmtShort(a.returnedDate) : 'Present'}</div>
    </div>`).join('') : '<div style="font-size:12.5px;color:#aaa">No assignment history.</div>';

  placeholder.outerHTML = `
  <div class="detail-panel" id="device-detail">
    <div class="dp-header">
      <span class="dp-close" onclick="document.getElementById('device-detail').remove()">✕</span>
      <div class="dp-name">${d.make} ${d.model}</div>
      <div class="dp-sub">${d.make} · Serial: ${d.serial}</div>
      <div class="dp-meta">${statusPill(d.status,'device')} <span class="tag">${cap(d.type)}</span></div>
    </div>
    <div class="dp-tabs">
      <div class="dp-tab active">Details</div>
      <div class="dp-tab">Assignment history</div>
    </div>
    <div class="dp-body">
      <div class="field"><div class="field-lbl">Type</div><div class="field-val">${cap(d.type)}</div></div>
      <div class="field"><div class="field-lbl">Make / Model</div><div class="field-val">${d.make} / ${d.model}</div></div>
      <div class="field"><div class="field-lbl">Condition</div><div class="field-val">${cap(d.condition)}</div></div>
      <div class="field"><div class="field-lbl">Warranty expiry</div><div class="field-val">${fmtDate(d.warrantyExp)}</div></div>
      <div class="field"><div class="field-lbl">Notes</div><div class="field-val muted" onclick="editField(this,'notes','${d.id}','device')">${d.notes || '—'}</div></div>
      <div class="sec-head">Assignment history</div>
      ${histHtml}
    </div>
    <div class="dp-actions">
      <button class="btn btn-secondary" onclick="recordReturn('${d.id}')">Record return</button>
      <button class="btn btn-ghost">Edit</button>
    </div>
  </div>`;
}

async function renderAssignments() {
  const data = await api('/assignments?limit=100');
  state.assignments = data?.data || [];
  const content = document.querySelector('.content');

  const tbody = state.assignments.length ? state.assignments.map(a => `
    <tr>
      <td>${a.device?.make || ''} ${a.device?.model || ''}</td>
      <td>${a.device?.serial || '—'}</td>
      <td>${a.employee?.name || '—'}</td>
      <td>${fmtShort(a.assignedDate)}</td>
      <td>${a.returnedDate ? fmtShort(a.returnedDate) : '—'}</td>
      <td>${cap(a.condition || '')}</td>
    </tr>`).join('') : `<tr><td colspan="6">${emptyState('No assignments yet','','')}</td></tr>`;

  content.innerHTML = `
  <div class="page active">
    <div class="tbl-wrap">
      <table>
        <thead><tr><th>Device</th><th>Serial</th><th>Employee</th><th>Assigned ↕</th><th>Returned</th><th>Condition</th></tr></thead>
        <tbody>${tbody}</tbody>
      </table>
    </div>
  </div>`;
}

// ── TRACKS ────────────────────────────────────────────────────────────────────

async function renderTracks() {
  const data = await api('/tracks');
  state.tracks = data || [];
  const content = document.querySelector('.content');

  const groups = { company: [], role: [], client: [] };
  state.tracks.forEach(t => { if (groups[t.type]) groups[t.type].push(t); else groups.company.push(t); });

  const listHtml = Object.entries(groups).map(([type, tracks]) => {
    if (!tracks.length) return '';
    return `
      <div style="font-size:10.5px;font-weight:500;color:#aaa;text-transform:uppercase;letter-spacing:.07em;margin:14px 0 8px;padding:0 4px">${cap(type)} tracks</div>
      ${tracks.map(t => `
        <div class="track-item" onclick="showTrackDetail('${t.id}')">
          <div class="track-item-name">${t.name} ${t.autoApply ? '<span class="tag" style="font-size:10px;margin-left:4px">auto</span>' : ''}</div>
          <div class="track-item-meta">${cap(t.type)} · ${(t.tasks || []).length} tasks</div>
        </div>`).join('')}`;
  }).join('');

  content.innerHTML = `
  <div class="page active" style="display:flex;flex-direction:column">
    <div class="tracks-layout" style="flex:1">
      <div class="tracks-list">${listHtml || emptyState('No tracks yet','+ New track','')}</div>
      <div class="track-detail" id="track-detail-area">
        <div style="color:#aaa;font-size:13px;padding:20px">Select a track to view its tasks</div>
      </div>
    </div>
  </div>`;
}

function showTrackDetail(trackId) {
  const t = state.tracks.find(x => x.id === trackId);
  if (!t) return;
  const area = document.getElementById('track-detail-area');
  if (!area) return;

  const taskRows = (t.tasks || []).sort((a, b) => a.order - b.order).map(task => {
    const offset = task.dueDaysOffset;
    const offsetLabel = offset === null || offset === undefined ? 'No deadline' : offset < 0 ? `Day ${offset}` : offset === 0 ? 'Day 0' : `Day +${offset}`;
    const offsetClass = offset === null ? '' : offset < 0 ? 'offset-neg' : offset === 0 ? 'offset-zero' : '';
    return `
    <div class="track-task-row">
      <div style="color:#bbb;font-size:12px">⠿</div>
      <div style="flex:1"><div class="track-task-name">${task.name}</div><div class="track-task-owner">Owner: ${task.ownerRole || '—'}</div></div>
      <span class="offset-pill ${offsetClass}">${offsetLabel}</span>
      <button class="btn btn-ghost" style="font-size:11px;padding:3px 8px">Edit</button>
    </div>`;
  }).join('') || '<div style="color:#aaa;font-size:12.5px;padding:8px 0">No tasks yet</div>';

  area.innerHTML = `
    <div class="track-detail-header">
      <div>
        <div style="font-size:16px;font-weight:500;color:#111">${t.name}</div>
        <div style="font-size:12.5px;color:#888;margin-top:3px">${cap(t.type)} track · ${t.autoApply ? 'Auto-applies · ' : ''}${(t.tasks||[]).length} tasks</div>
      </div>
      <div style="display:flex;gap:7px">
        <button class="btn btn-ghost">Edit track</button>
        <button class="btn btn-primary">+ Add task</button>
      </div>
    </div>
    <div style="font-size:11px;background:#fef9c3;border:.5px solid #fde68a;border-radius:6px;padding:8px 12px;color:#92400e;margin-bottom:14px">
      Offset key: negative = before start date · 0 = day of start · blank = no deadline
    </div>
    ${taskRows}`;
}

// ── REPORTS ───────────────────────────────────────────────────────────────────

async function renderReports() {
  const [candData, empData, devData] = await Promise.all([
    api('/candidates?limit=1'),
    api('/employees?limit=1'),
    api('/devices?limit=1'),
  ]);

  const candTotal = candData?.total || 0;
  const empTotal = empData?.total || 0;
  const devTotal = devData?.total || 0;

  const content = document.querySelector('.content');
  content.innerHTML = `
  <div class="page active"><div style="padding:24px">
    <div class="report-section">
      <div class="report-h">Summary</div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px">
        <div class="stat-card"><div class="stat-lbl">Total candidates</div><div class="stat-val" style="font-size:22px">${candTotal}</div></div>
        <div class="stat-card"><div class="stat-lbl">Total employees</div><div class="stat-val" style="font-size:22px">${empTotal}</div></div>
        <div class="stat-card"><div class="stat-lbl">Total devices</div><div class="stat-val" style="font-size:22px">${devTotal}</div></div>
      </div>
    </div>
    <div class="report-section">
      <div class="report-h">Exports</div>
      <div class="export-row">
        <div class="export-card"><div class="export-title">Candidates</div><div class="export-desc">All candidate records with stage, source, seniority, skills, and notes</div><button class="btn btn-secondary" style="font-size:12px;padding:5px 10px" onclick="exportCSV('candidates')">Export CSV</button></div>
        <div class="export-card"><div class="export-title">Employees</div><div class="export-desc">Active and offboarded employees with start dates and departments</div><button class="btn btn-secondary" style="font-size:12px;padding:5px 10px" onclick="exportCSV('employees')">Export CSV</button></div>
        <div class="export-card"><div class="export-title">Devices</div><div class="export-desc">Full inventory with assignment history and condition log</div><button class="btn btn-secondary" style="font-size:12px;padding:5px 10px" onclick="exportCSV('devices')">Export CSV</button></div>
      </div>
    </div>
  </div></div>`;
}

async function exportCSV(type) {
  window.open(`${API}/exports/${type}?format=csv`, '_blank');
}

// ── SETTINGS / LISTS ──────────────────────────────────────────────────────────

async function renderLists() {
  const data = await api('/config-lists');
  state.configLists = data || [];
  const content = document.querySelector('.content');

  const listNav = state.configLists.map((l, i) => `
    <div class="list-sidebar-item ${i === 0 ? 'active' : ''}" onclick="showListItems('${l.id}',this)">
      <span>${l.name.replace(/_/g,' ')}</span>
      <span class="list-item-count">${(l.items||[]).length}</span>
    </div>`).join('') || '<div style="padding:12px;font-size:13px;color:#aaa">No lists yet</div>';

  const firstList = state.configLists[0];
  const itemsHtml = firstList ? renderListItems(firstList) : '';

  content.innerHTML = `
  <div class="page active">
    <div class="settings-layout" style="height:100%">
      <div class="settings-nav">
        <div style="font-size:11px;font-weight:500;color:#aaa;text-transform:uppercase;letter-spacing:.07em;margin-bottom:8px;padding:0 4px">Settings</div>
        <div class="settings-nav-item active" onclick="navigate('lists')">Lists</div>
        <div class="settings-nav-item" onclick="navigate('users')">Users</div>
      </div>
      <div class="settings-content">
        <div class="settings-h">Configurable lists</div>
        <div class="settings-sub">Manage the dropdown options used across the platform.</div>
        <div class="lists-layout">
          <div class="list-sidebar">${listNav}</div>
          <div class="list-items-panel" id="list-items-panel">${itemsHtml}</div>
        </div>
      </div>
    </div>
  </div>`;
}

function renderListItems(list) {
  const items = (list.items || []).sort((a, b) => a.order - b.order);
  const rows = items.map(item => `
    <div class="list-item-row">
      <span class="drag-handle">⠿</span>
      <span class="list-item-label">${item.label}</span>
      <div class="list-item-actions">
        <span class="icon-btn" onclick="editListItem('${item.id}','${item.label}')">Edit</span>
        <span class="icon-btn" style="color:#e74c3c" onclick="deleteListItem('${item.id}','${list.id}')">Delete</span>
      </div>
    </div>`).join('') || '<div style="color:#aaa;font-size:12.5px;padding:8px 0">No items yet</div>';

  return `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
      <div style="font-size:14px;font-weight:500;color:#111">${list.name.replace(/_/g,' ')}</div>
      <button class="btn btn-secondary" style="font-size:12px;padding:5px 10px" onclick="addListItem('${list.id}')">+ Add item</button>
    </div>
    ${rows}`;
}

function showListItems(listId, el) {
  document.querySelectorAll('.list-sidebar-item').forEach(x => x.classList.remove('active'));
  el.classList.add('active');
  const list = state.configLists.find(l => l.id === listId);
  if (!list) return;
  const panel = document.getElementById('list-items-panel');
  if (panel) panel.innerHTML = renderListItems(list);
}

async function addListItem(listId) {
  const label = prompt('Item name:');
  if (!label) return;
  await post(`/config-lists/${listId}/items`, { label });
  await renderLists();
}

async function deleteListItem(itemId, listId) {
  if (!confirm('Delete this item?')) return;
  await fetch(`${API}/config-lists/${listId}/items/${itemId}`, { method: 'DELETE', credentials: 'include' });
  await renderLists();
}

// ── SETTINGS / USERS ─────────────────────────────────────────────────────────

async function renderUsers() {
  const data = await api('/settings/users');
  const users = data?.data || data || [];
  const content = document.querySelector('.content');

  const rows = users.map(u => `
    <tr>
      <td>${u.name}</td>
      <td>${u.email}</td>
      <td><span class="role-badge ${u.role === 'admin' ? 'role-admin' : 'role-viewer'}">${cap(u.role)}</span></td>
      <td><span class="${u.active !== false ? 'status-active' : 'status-inactive'}">${u.active !== false ? 'Active' : 'Deactivated'}</span></td>
      <td><span class="link-blue" style="font-size:12px">Edit</span></td>
    </tr>`).join('');

  content.innerHTML = `
  <div class="page active">
    <div class="settings-layout" style="height:100%">
      <div class="settings-nav">
        <div style="font-size:11px;font-weight:500;color:#aaa;text-transform:uppercase;letter-spacing:.07em;margin-bottom:8px;padding:0 4px">Settings</div>
        <div class="settings-nav-item" onclick="navigate('lists')">Lists</div>
        <div class="settings-nav-item active" onclick="navigate('users')">Users</div>
      </div>
      <div class="settings-content">
        <div class="settings-h">Users</div>
        <div class="settings-sub">Manage who has access to V.Two Ops.</div>
        <div style="margin-bottom:12px"><button class="btn btn-primary" style="font-size:12.5px">+ Invite user</button></div>
        <table class="users-table">
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th></th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>
  </div>`;
}

// ── MODALS ────────────────────────────────────────────────────────────────────

function openModal(id) {
  const m = document.getElementById(id);
  if (m) m.style.display = 'flex';
}

function hideModal(id) {
  const m = document.getElementById(id);
  if (m) m.style.display = 'none';
}

function openLogInterviewModal(candidateId, candidateName) {
  const m = document.getElementById('modal-log-interview');
  if (!m) return;
  const title = m.querySelector('.modal-title');
  if (title) title.textContent = `Log interview — ${candidateName}`;
  m.dataset.candidateId = candidateId;
  m.style.display = 'flex';
}

function openAssignDeviceModal(employeeId, employeeName) {
  const m = document.getElementById('modal-assign-device');
  if (!m) return;
  const title = m.querySelector('.modal-title');
  if (title) title.textContent = `Assign device — ${employeeName}`;
  m.dataset.employeeId = employeeId;
  m.style.display = 'flex';
}

async function submitAddCandidate() {
  const form = document.getElementById('modal-add-candidate');
  if (!form) return;
  const inputs = form.querySelectorAll('input, select, textarea');
  const data = {};
  inputs.forEach(i => { if (i.name) data[i.name] = i.value; });
  const res = await post('/candidates', {
    name: form.querySelector('[name=name]')?.value,
    email: form.querySelector('[name=email]')?.value,
    phone: form.querySelector('[name=phone]')?.value,
    location: form.querySelector('[name=location]')?.value,
    roleApplied: form.querySelector('[name=role]')?.value,
    notes: form.querySelector('[name=notes]')?.value,
  });
  if (res.error) { alert(res.error); return; }
  hideModal('modal-add-candidate');
  await renderCandidates();
}

async function submitLogInterview() {
  const m = document.getElementById('modal-log-interview');
  if (!m) return;
  const candidateId = m.dataset.candidateId;
  const scheduledAt = m.querySelector('[name=scheduledAt]')?.value;
  const format = m.querySelector('[name=format]')?.value;
  const notes = m.querySelector('[name=notes]')?.value;
  if (!scheduledAt) { alert('Please select a date and time'); return; }
  await post('/interviews', { candidateId, scheduledAt, format, notes, status: 'completed' });
  hideModal('modal-log-interview');
  if (state.selectedCandidate?.id === candidateId) {
    state.detailTab = 'interviews';
    renderCandidatePanel(state.selectedCandidate);
  }
}

async function triggerOffboard(employeeId, employeeName) {
  if (!confirm(`Start offboarding for ${employeeName}?`)) return;
  await post('/onboarding', { employeeId, type: 'offboarding' });
  navigate('offboarding');
}

async function recordReturn(deviceId) {
  const condition = prompt('Condition at return (new/good/fair/poor):', 'good');
  if (!condition) return;
  await patch(`/devices/${deviceId}/return`, { condition, returnedDate: new Date().toISOString() });
  await renderInventory();
}

// ── SEARCH ────────────────────────────────────────────────────────────────────

async function globalSearch(query) {
  if (!query || query.length < 2) return;
  const data = await api(`/search?q=${encodeURIComponent(query)}`);
  const results = data?.results || data || [];
  if (!results.length) return;
  // Navigate to first result
  const first = results[0];
  if (first.type === 'candidate') { navigate('candidates'); setTimeout(() => selectCandidate(first.id), 500); }
  if (first.type === 'employee') { navigate('employees'); setTimeout(() => selectEmployee(first.id), 500); }
}

// ── SIDEBAR SETUP ─────────────────────────────────────────────────────────────

function setupSidebar() {
  // Show dashboard tab by default using existing showTab function
  if (typeof showTab === 'function') showTab('dashboard');

  // Wire sidebar nav items in ALL tab shells
  document.querySelectorAll('.nav-item').forEach(el => {
    el.addEventListener('click', () => {
      const text = el.textContent.trim().toLowerCase();
      const map = {
        'dashboard': 'dashboard', 'candidates': 'candidates', 'employees': 'employees',
        'onboarding': 'onboarding', 'offboarding': 'offboarding',
        'inventory': 'devices', 'assignments': 'assignments',
        'tracks': 'tracks', 'reports': 'reports',
        'lists': 'settings', 'users': 'settings',
      };
      const page = map[text];
      if (page) {
        if (typeof showTab === 'function') showTab(page);
        navigate(page);
      }
    });
  });

  // Remove yellow info bar
  document.querySelectorAll('body > div').forEach(el => {
    if (el.textContent && el.textContent.includes('Click the tabs below')) el.remove();
  });

  // Hide demo tabs bar
  const demotabs = document.getElementById('demotabs');
  if (demotabs) demotabs.style.display = 'none';
}

// ── INIT ──────────────────────────────────────────────────────────────────────

async function init() {
  await ensureLoggedIn();
  setupSidebar();
  navigate('dashboard');
}

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
