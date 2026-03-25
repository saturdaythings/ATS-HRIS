/**
 * App - Main application entry point
 * Initializes router, state, API, and page handlers
 * Routes to all 16+ pages with their HTML templates and event bindings
 */

// ── CONSTANTS & HELPERS ──────────────────────────────────────────────────────
const CAND_STATUS = ['Active','On Hold','Nurturing','Closed'];
const EMP_TYPES = ['FTE','Contract','Open to Both'];
const SOURCES = ['LinkedIn','Referral','Indeed','Outbound','Website','Other'];
const SENIORITIES = ['Junior','Mid','Senior','Staff','Principal'];
const STAGES = ['sourced','screening','interview','offer','hired'];
const SCORE_LABELS = {1:'No hire',2:'Lean no',3:'Maybe',4:'Lean yes',5:'Strong hire'};
const SCORE_COLORS = {1:'#c0392b',2:'#e67e22',3:'#f1c40f',4:'#27ae60',5:'#1a9c6e'};
const AVCOLORS = ['#f4d4e8','#d4e8f4','#d4f4e0','#f4ead4','#e0d4f4','#f4d4d4','#d4f4f0'];

const initials = n => n.split(' ').map(x => x[0]).join('').slice(0, 2).toUpperCase();
const daysAgo = d => Math.floor((Date.now() - new Date(d)) / 86400000);
const relTime = d => {
  const n = daysAgo(d);
  if (n === 0) return 'Today';
  if (n === 1) return 'Yesterday';
  if (n < 7) return n + 'd ago';
  if (n < 30) return Math.floor(n / 7) + 'w ago';
  return Math.floor(n / 30) + 'mo ago';
};
const av = n => `background:${AVCOLORS[n.charCodeAt(0) % AVCOLORS.length]};color:#333`;
const now = () => new Date().toISOString();

function stagePill(s) {
  const m = {sourced:'gray',screening:'blue',interview:'amber',offer:'purple',hired:'green'};
  return `<span class="pill pill-${m[s]||'gray'}">${s}</span>`;
}

function candStatusPill(s) {
  const m = {'Active':'green','On Hold':'amber','Nurturing':'blue','Closed':'red'};
  return `<span class="pill pill-${m[s]||'gray'}">${s}</span>`;
}

function statusPill(s) {
  if(['active','good','new','available'].includes(s)) return `<span class="pill pill-green">${s}</span>`;
  if(s==='onboarding') return `<span class="pill pill-blue">onboarding</span>`;
  if(s==='assigned') return `<span class="pill pill-purple">assigned</span>`;
  if(s==='pending') return `<span class="pill pill-amber">pending</span>`;
  return `<span class="pill pill-gray">${s}</span>`;
}

function personCell(name, sub='') {
  return `<div class="person-cell"><div class="person-av" style="${av(name)}">${initials(name)}</div><div><div class="person-name">${name}</div>${sub?`<div class="person-sub">${sub}</div>`:''}</div></div>`;
}

function scoreDisplay(score) {
  if(!score) return '<span style="color:var(--text3);font-size:12px">—</span>';
  return `<span style="display:inline-flex;align-items:center;gap:4px;font-size:12px"><span class="score-dot" style="background:${SCORE_COLORS[score]}"></span>${SCORE_LABELS[score]}</span>`;
}

function compDisplay(c) {
  if(!c.compAmount) return '—';
  if(c.compType==='hourly') return `$${c.compAmount.toLocaleString()}/hr`;
  return `$${c.compAmount.toLocaleString()}/yr`;
}

function renderEmpty(title, sub) {
  return `<div class="empty-state"><div class="empty-title">${title}</div><div class="empty-sub">${sub}</div></div>`;
}

function touch(c) { c.updatedAt = now(); }
function showToast(msg) {
  const t = document.getElementById('toast') || document.createElement('div');
  t.id = 'toast';
  t.textContent = msg;
  t.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#333;color:#fff;padding:12px 16px;border-radius:6px;font-size:13px;z-index:1000;';
  if (!t.parentElement) document.body.appendChild(t);
  t.style.display = 'block';
  setTimeout(() => t.style.display = 'none', 2200);
}
function closeModal() { document.getElementById('modal-root').innerHTML = ''; }
function showModal(html) { document.getElementById('modal-root').innerHTML = `<div class="modal-overlay" onclick="if(event.target===this)closeModal()">${html}</div>`; }
const today = () => new Date().toISOString().split('T')[0];

// Global state for hiring page
let selectedCandId = null;
let kanbanFilter = '';
let candidates = []; // Will be populated from API

// Global state for directory page
let selectedEmpId = null;
let employees = [];
let devices = [];
let assignments = [];

// Hiring page helper functions
function filterKanbanStatus(v) {
  kanbanFilter = v;
  renderKanban(v ? candidates.filter(c => c.candStatus === v) : candidates);
}

function renderKanban(list) {
  const k = document.getElementById('kanban');
  if (!k) return;
  k.innerHTML = STAGES.map(stage => {
    const cols = (list || candidates).filter(c => c.stage === stage);
    return `<div class="kanban-col">
      <div class="kanban-col-header"><span class="kanban-col-name">${stage}</span><span class="kanban-count">${cols.length}</span></div>
      ${cols.map(c => `
        <div class="kanban-card${selectedCandId === c.id ? ' selected' : ''}" onclick="selectCandidate('${c.id}')">
          <div class="kanban-name">${c.name}</div>
          <div class="kanban-role">${c.role}</div>
          <div class="kanban-meta">
            ${candStatusPill(c.candStatus)}
            ${c.interviews && c.interviews.length ? `<span style="font-size:11px;color:var(--text3)">${c.interviews.length} interview${c.interviews.length > 1 ? 's' : ''}</span>` : ''}
          </div>
          <div style="font-size:11px;color:var(--text3);margin-top:6px">${relTime(c.updatedAt)}</div>
        </div>`).join('')}
    </div>`;
  }).join('');
}

function selectCandidate(id) {
  selectedCandId = id;
  renderKanban(kanbanFilter ? candidates.filter(c => c.candStatus === kanbanFilter) : candidates);
  renderCandidateDetail(id);
}

function renderCandidateDetail(id) {
  const c = candidates.find(x => x.id === id);
  if (!c) return;
  const d = document.getElementById('candidate-detail');
  if (!d) return;
  d.classList.add('open');
  d.innerHTML = `
    <div class="detail-header">
      <div style="flex:1">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
          <div class="person-av" style="${av(c.name)};width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600">${initials(c.name)}</div>
          <div>
            <div style="font-weight:600;font-size:15px">${c.name}</div>
            <div style="font-size:12px;color:var(--text2)">${c.role}${c.seniority ? ' · ' + c.seniority : ''}</div>
          </div>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">${stagePill(c.stage)}${candStatusPill(c.candStatus)}</div>
      </div>
      <div style="display:flex;gap:4px;align-items:flex-start">
        <button class="btn btn-sm btn-secondary" onclick="showEditCandidateModal('${c.id}')">Edit</button>
        <button class="detail-close" onclick="closeCandDetail()">×</button>
      </div>
    </div>
    <div class="detail-body">
      <div class="detail-section">
        <div class="detail-section-title">Details</div>
        <div class="detail-row"><span class="detail-key">Employment Type</span><span class="detail-val">${c.empType || '—'}</span></div>
        <div class="detail-row"><span class="detail-key">Compensation</span><span class="detail-val">${compDisplay(c)}</span></div>
        <div class="detail-row"><span class="detail-key">Source</span><span class="detail-val">${c.source}</span></div>
        ${c.client ? `<div class="detail-row"><span class="detail-key">Client</span><span class="detail-val">${c.client}</span></div>` : ''}
        <div class="detail-row"><span class="detail-key">Added</span><span class="detail-val">${relTime(c.addedAt)}</span></div>
        <div class="detail-row"><span class="detail-key">Last Updated</span><span class="detail-val">${relTime(c.updatedAt)}</span></div>
      </div>
      <div class="detail-section">
        <div class="detail-section-title">Resume</div>
        ${c.resumeLink
          ? `<a href="${c.resumeLink}" target="_blank" style="font-size:13px;color:var(--accent);display:flex;align-items:center;gap:6px">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1V9"/><path d="M10 2l4 4"/><path d="M14 2v4h-4"/></svg>
              View on SharePoint
            </a>`
          : `<div style="display:flex;align-items:center;gap:8px"><span style="font-size:12px;color:var(--text3)">No resume linked</span><button class="btn-link btn-sm" onclick="showEditCandidateModal('${c.id}')">Add link</button></div>`}
      </div>
      <div class="detail-section">
        <div class="detail-section-title">
          Notes
          <button class="btn-link" style="font-size:11px" onclick="showEditCandidateModal('${c.id}')">Edit</button>
        </div>
        <p style="font-size:13px;color:var(--text2);line-height:1.6">${c.notes || 'No notes yet.'}</p>
      </div>
      <div class="detail-section">
        <div class="detail-section-title">Move Stage</div>
        <div style="display:flex;flex-wrap:wrap;gap:6px">
          ${STAGES.map(s => `<button class="btn btn-sm ${s === c.stage ? 'btn-primary' : 'btn-secondary'}" onclick="moveStage('${c.id}','${s}')">${s}</button>`).join('')}
        </div>
      </div>
      <div class="detail-section">
        <div class="detail-section-title">
          Interviews (${c.interviews ? c.interviews.length : 0})
          <button class="btn btn-sm btn-primary" onclick="showAddInterviewModal('${c.id}')">+ Add</button>
        </div>
        <div id="interviews-list-${c.id}">
          ${renderInterviewsList(c)}
        </div>
      </div>
      <div style="margin-top:8px;display:flex;gap:8px">
        ${['offer', 'hired'].includes(c.stage) ? `<button class="btn btn-primary" style="flex:1" onclick="promoteCandidate('${c.id}')">Promote to Employee</button>` : ''}
      </div>
    </div>
  `;
}

function renderInterviewsList(c) {
  if (!c.interviews || !c.interviews.length) return `<div style="font-size:12px;color:var(--text3);padding:8px 0">No interviews logged yet</div>`;
  return c.interviews.map((iv, i) => `
    <div class="interview-card">
      <div class="interview-header">
        <div>
          <div style="font-weight:500;font-size:13px">${iv.date}</div>
          <div style="font-size:12px;color:var(--text2);margin-top:1px">${iv.interviewers || 'No interviewers listed'}</div>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          ${scoreDisplay(iv.score)}
          <button class="btn-ghost btn-sm" style="color:var(--red);padding:4px 6px" onclick="deleteInterview('${c.id}',${i})">✕</button>
        </div>
      </div>
      ${iv.notes ? `<p style="font-size:12px;color:var(--text2);margin-top:6px;line-height:1.5">${iv.notes}</p>` : ''}
    </div>`).join('');
}

function deleteInterview(candId, idx) {
  const c = candidates.find(x => x.id === candId);
  if (c && c.interviews) {
    c.interviews.splice(idx, 1);
    touch(c);
    renderCandidateDetail(candId);
    showToast('Interview removed');
  }
}

function moveStage(id, stage) {
  const c = candidates.find(x => x.id === id);
  if (c) {
    c.stage = stage;
    touch(c);
    showToast(`${c.name} → ${stage}`);
    renderCandidateDetail(id);
    renderKanban(kanbanFilter ? candidates.filter(x => x.candStatus === kanbanFilter) : candidates);
  }
}

function closeCandDetail() {
  selectedCandId = null;
  const d = document.getElementById('candidate-detail');
  if (d) d.classList.remove('open');
  renderKanban(kanbanFilter ? candidates.filter(c => c.candStatus === kanbanFilter) : candidates);
}

function showAddInterviewModal(candId) {
  const c = candidates.find(x => x.id === candId);
  if (!c) return;
  showModal(`
    <div class="modal">
      <div class="modal-header"><div class="modal-title">Log Interview — ${c.name}</div><button class="detail-close" onclick="closeModal()">×</button></div>
      <div class="modal-body">
        <div class="form-row">
          <div class="form-group"><label class="form-label">Date</label><input type="date" class="form-input" id="iv-date" value="${today()}"/></div>
          <div class="form-group"><label class="form-label">Score</label>
            <select class="form-input form-select" id="iv-score">
              <option value="">— No score —</option>
              ${[1, 2, 3, 4, 5].map(n => `<option value="${n}">${n} — ${SCORE_LABELS[n]}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="form-group"><label class="form-label">Interviewer(s)</label><input class="form-input" id="iv-interviewers" placeholder="e.g. Jordan Lee, Nina Patel"/></div>
        <div class="form-group"><label class="form-label">Notes / Comments</label><textarea class="form-input" id="iv-notes" rows="4" placeholder="How did it go? Key observations, strengths, concerns..."></textarea></div>
      </div>
      <div class="modal-footer"><button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="addInterview('${candId}')">Save Interview</button></div>
    </div>
  `);
}

function addInterview(candId) {
  const date = document.getElementById('iv-date').value;
  if (!date) { showToast('Date required'); return; }
  const c = candidates.find(x => x.id === candId);
  if (!c) return;
  const score = parseInt(document.getElementById('iv-score').value) || null;
  if (!c.interviews) c.interviews = [];
  c.interviews.push({ id: 'i' + Date.now(), date, interviewers: document.getElementById('iv-interviewers').value, score, notes: document.getElementById('iv-notes').value });
  touch(c);
  closeModal();
  showToast('Interview saved');
  renderCandidateDetail(candId);
  renderKanban(kanbanFilter ? candidates.filter(x => x.candStatus === kanbanFilter) : candidates);
}

function showAddCandidateModal() {
  showModal(`
    <div class="modal modal-lg">
      <div class="modal-header"><div class="modal-title">Add Candidate</div><button class="detail-close" onclick="closeModal()">×</button></div>
      <div class="modal-body">
        <div class="form-row">
          <div class="form-group"><label class="form-label">First Name</label><input class="form-input" id="cfn" placeholder="Jane"/></div>
          <div class="form-group"><label class="form-label">Last Name</label><input class="form-input" id="cln" placeholder="Smith"/></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Role</label><input class="form-input" id="crole" placeholder="Software Engineer"/></div>
          <div class="form-group"><label class="form-label">Seniority</label><select class="form-input form-select" id="csen">${SENIORITIES.map(s => `<option>${s}</option>`).join('')}</select></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Source</label><select class="form-input form-select" id="csrc">${SOURCES.map(s => `<option>${s}</option>`).join('')}</select></div>
          <div class="form-group"><label class="form-label">Status</label><select class="form-input form-select" id="cstat">${CAND_STATUS.map(s => `<option>${s}</option>`).join('')}</select></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Employment Type</label><select class="form-input form-select" id="cetype">${EMP_TYPES.map(s => `<option>${s}</option>`).join('')}</select></div>
          <div class="form-group"><label class="form-label">Compensation Type</label><select class="form-input form-select" id="cctype"><option value="salary">Salary (annual)</option><option value="hourly">Hourly</option></select></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Amount (\$)</label><input type="number" class="form-input" id="ccomp" placeholder="120000"/></div>
          <div class="form-group"><label class="form-label">Client (optional)</label><input class="form-input" id="cclient" placeholder="Acme Corp"/></div>
        </div>
        <div class="form-group"><label class="form-label">Resume Link (SharePoint)</label><input class="form-input" id="cresume" placeholder="https://sharepoint.com/..."/></div>
        <div class="form-group"><label class="form-label">Notes</label><textarea class="form-input" id="cnotes" rows="3" placeholder="Initial notes..."></textarea></div>
      </div>
      <div class="modal-footer"><button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="addCandidate()">Add Candidate</button></div>
    </div>
  `);
}

function addCandidate() {
  const fn = document.getElementById('cfn').value;
  const ln = document.getElementById('cln').value;
  if (!fn || !ln) { showToast('Name required'); return; }
  const nc = {
    id: 'c' + Date.now(),
    name: fn + ' ' + ln,
    role: document.getElementById('crole').value || 'TBD',
    seniority: document.getElementById('csen').value,
    source: document.getElementById('csrc').value,
    candStatus: document.getElementById('cstat').value,
    empType: document.getElementById('cetype').value,
    compType: document.getElementById('cctype').value,
    compAmount: parseInt(document.getElementById('ccomp').value) || null,
    client: document.getElementById('cclient').value || null,
    resumeLink: document.getElementById('cresume').value || '',
    notes: document.getElementById('cnotes').value || '',
    stage: 'sourced',
    addedAt: today(),
    updatedAt: today(),
    interviews: []
  };
  candidates.push(nc);
  closeModal();
  showToast('Candidate added');
  renderKanban(kanbanFilter ? candidates.filter(c => c.candStatus === kanbanFilter) : candidates);
}

function showEditCandidateModal(candId) {
  // TODO: Implement edit modal
  showToast('Edit modal not yet implemented');
}

function promoteCandidate(candId) {
  // TODO: Implement promotion to employee
  showToast('Promotion not yet implemented');
}

// Directory page helper functions
function empRows(list) {
  return list.map(e => `
    <tr class="clickable${selectedEmpId === e.id ? ' selected' : ''}" onclick="selectEmp('${e.id}')">
      <td>${personCell(e.name, e.email)}</td>
      <td>${e.role}</td>
      <td>${e.dept}</td>
      <td>${statusPill(e.status)}</td>
      <td>${e.location}</td>
      <td>${e.startDate}</td>
    </tr>`).join('');
}

function filterEmps(q) {
  const list = q ? employees.filter(e =>
    e.name.toLowerCase().includes(q.toLowerCase()) ||
    e.role.toLowerCase().includes(q.toLowerCase())
  ) : employees;
  const tb = document.getElementById('emp-tbody');
  if (tb) tb.innerHTML = empRows(list);
}

function selectEmp(id) {
  selectedEmpId = id;
  document.querySelectorAll('#emp-tbody tr').forEach(r =>
    r.classList.toggle('selected', r.getAttribute('onclick') === `selectEmp('${id}')`)
  );
  const e = employees.find(x => x.id === id);
  if (!e) return;
  const d = document.getElementById('emp-detail');
  if (!d) return;
  d.classList.add('open');
  const empDevs = assignments
    .filter(a => a.employeeId === id)
    .map(a => devices.find(dv => dv.id === a.deviceId))
    .filter(Boolean);

  d.innerHTML = `
    <div class="detail-header">
      <div style="display:flex;align-items:center;gap:10px">
        <div class="person-av" style="${av(e.name)};width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:600">${initials(e.name)}</div>
        <div><div style="font-weight:600;font-size:15px">${e.name}</div><div style="font-size:12px;color:var(--text2)">${e.role} · ${e.dept}</div></div>
      </div>
      <button class="detail-close" onclick="closeEmpDetail()">×</button>
    </div>
    <div class="detail-body">
      <div class="detail-section">
        <div class="detail-section-title">Info</div>
        <div class="detail-row"><span class="detail-key">Status</span>${statusPill(e.status)}</div>
        <div class="detail-row"><span class="detail-key">Manager</span><span class="detail-val">${e.manager}</span></div>
        <div class="detail-row"><span class="detail-key">Location</span><span class="detail-val">${e.location}</span></div>
        <div class="detail-row"><span class="detail-key">Email</span><span class="detail-val" style="font-size:12px">${e.email}</span></div>
        <div class="detail-row"><span class="detail-key">Start Date</span><span class="detail-val">${e.startDate}</span></div>
      </div>
      <div class="detail-section">
        <div class="detail-section-title">Devices (${empDevs.length})</div>
        ${empDevs.length ? empDevs.map(dv =>
          `<div style="display:flex;align-items:center;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--border)">
            <span>${dv.name}</span>
            <span class="pill pill-gray" style="font-size:10px;font-family:var(--mono)">${dv.serial}</span>
          </div>`
        ).join('') : '<div style="font-size:12px;color:var(--text3);padding:8px 0">No devices</div>'}
      </div>
    </div>
  `;
}

function closeEmpDetail() {
  selectedEmpId = null;
  const d = document.getElementById('emp-detail');
  if (d) d.classList.remove('open');
}

function showAddEmployeeModal() {
  showModal(`
    <div class="modal">
      <div class="modal-header"><div class="modal-title">Add Employee</div><button class="detail-close" onclick="closeModal()">×</button></div>
      <div class="modal-body">
        <div class="form-row">
          <div class="form-group"><label class="form-label">First Name</label><input class="form-input" id="efn" placeholder="Jane"/></div>
          <div class="form-group"><label class="form-label">Last Name</label><input class="form-input" id="eln" placeholder="Smith"/></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Role</label><input class="form-input" id="erole" placeholder="Engineer"/></div>
          <div class="form-group"><label class="form-label">Department</label><select class="form-input form-select" id="edept"><option>Engineering</option><option>Design</option><option>Product</option><option>Operations</option></select></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Start Date</label><input type="date" class="form-input" id="estart"/></div>
          <div class="form-group"><label class="form-label">Location</label><select class="form-input form-select" id="eloc"><option>Remote</option><option>NYC</option><option>SF</option></select></div>
        </div>
      </div>
      <div class="modal-footer"><button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="addEmployee()">Add</button></div>
    </div>
  `);
}

function addEmployee() {
  const fn = document.getElementById('efn').value.trim();
  const ln = document.getElementById('eln').value.trim();
  if (!fn || !ln) { showToast('Name required'); return; }
  const ne = {
    id: 'e' + Date.now(),
    name: `${fn} ${ln}`,
    role: document.getElementById('erole').value || 'TBD',
    dept: document.getElementById('edept').value,
    status: 'active',
    location: document.getElementById('eloc').value,
    manager: 'Jordan Lee',
    startDate: document.getElementById('estart').value || today(),
    email: fn.toLowerCase() + '@vtwo.co',
    phone: '—'
  };
  employees.push(ne);
  closeModal();
  showToast(`${ne.name} added`);
  // Refresh directory display
  const tb = document.getElementById('emp-tbody');
  if (tb) tb.innerHTML = empRows(employees);
}

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
      router.init('page');

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
      '/candidates/new': () => this.renderCandidateForm(),
      '/candidates/:id': (params) => this.renderCandidateDetail(params.id),
      '/employees': () => this.renderEmployees(),
      '/employees/new': () => this.renderEmployeeForm(),
      '/employees/:id': (params) => this.renderEmployeeDetail(params.id),
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

      // Initialize hiring page kanban
      if (e.detail.path === '/candidates') {
        renderKanban(kanbanFilter ? candidates.filter(c => c.candStatus === kanbanFilter) : candidates);
      }

      // Initialize directory page table
      if (e.detail.path === '/employees') {
        const tb = document.getElementById('emp-tbody');
        if (tb) tb.innerHTML = empRows(employees);
      }
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
      // Fetch data from API
      const candidates = await api.getCandidates().catch(() => []);
      const devices = await api.getDevices().catch(() => []);
      const onboardingRuns = []; // Mock data - no API endpoint yet
      const activities = []; // Mock data - no API endpoint yet

      // Calculate stats
      const activeC = candidates.filter(c => c.candStatus === 'Active').length;
      const inInterviewStage = candidates.filter(c => c.stage === 'interview').length;
      const onboardingCount = onboardingRuns.filter(r => r.status === 'active').length;
      const availDev = devices.filter(d => d.status === 'available').length;

      // Upcoming interviews: candidates in interview stage with latest interview in last 14d or future
      const withInterviews = candidates
        .filter(c => c.interviews && c.interviews.length > 0 && ['sourced','screening','interview','offer'].includes(c.stage))
        .sort((a,b) => {
          const la = a.interviews[a.interviews.length-1]?.date || '';
          const lb = b.interviews[b.interviews.length-1]?.date || '';
          return lb.localeCompare(la);
        })
        .slice(0, 5);

      // Status breakdown
      const statusGroups = {};
      CAND_STATUS.forEach(s => {
        statusGroups[s] = candidates.filter(c => c.candStatus === s).length;
      });

      return `
        <div class="page-header"><div><div class="page-title">Good morning, Kiana</div><div class="page-subtitle">Here's what's happening across V.Two</div></div></div>
        <div class="stat-grid">
          <div class="stat-card"><div class="stat-label">Active Candidates</div><div class="stat-value">${activeC}</div><div class="stat-sub">in pipeline</div></div>
          <div class="stat-card"><div class="stat-label">In Interview</div><div class="stat-value">${inInterviewStage}</div><div class="stat-sub">this stage</div></div>
          <div class="stat-card"><div class="stat-label">Onboardings</div><div class="stat-value">${onboardingCount}</div><div class="stat-sub">in progress</div></div>
          <div class="stat-card"><div class="stat-label">Devices Available</div><div class="stat-value">${availDev}</div><div class="stat-sub">unassigned</div></div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
          <div class="card">
            <div style="font-weight:600;font-size:13px;margin-bottom:14px">Candidate Pipeline Status</div>
            ${CAND_STATUS.map(s => `
              <div style="display:flex;align-items:center;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--border);cursor:pointer">
                <span>${candStatusPill(s)}</span>
                <span style="font-weight:600;font-size:14px">${statusGroups[s]}</span>
              </div>`).join('')}
          </div>
          <div class="card">
            <div style="font-weight:600;font-size:13px;margin-bottom:14px">Recent Interviews</div>
            ${withInterviews.length ? withInterviews.map(c => {
              const last = c.interviews[c.interviews.length-1];
              return `<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)">
                ${personCell(c.name, c.role)}
                <div style="text-align:right">${scoreDisplay(last.score)}<div style="font-size:11px;color:var(--text3);margin-top:2px">${relTime(last.date)}</div></div>
              </div>`;
            }).join('') : renderEmpty('No interviews logged', 'Interviews will appear here')}
          </div>
        </div>
        <div class="card">
          <div style="font-weight:600;font-size:13px;margin-bottom:14px">Recent Activity</div>
          <div class="timeline">
            ${activities.slice(0, 5).map((a, i) => `
              <div class="tl-item">
                <div class="tl-dot-wrap"><div class="tl-dot"></div>${i < 4 ? '<div class="tl-line"></div>' : ''}</div>
                <div style="flex:1;padding-bottom:4px"><div class="tl-desc">${a.desc}</div><div class="tl-time">${relTime(a.at)}</div></div>
              </div>`).join('')}
          </div>
        </div>
      `;
    } catch (error) {
      console.error('Dashboard error:', error);
      return `<div style="padding:20px"><p>Error loading dashboard: ${error.message}</p></div>`;
    }
  }

  async renderCandidates() {
    try {
      // Fetch candidates from API and store in global variable for hiring functions
      const fetchedCandidates = await api.getCandidates().catch(() => []);
      candidates = fetchedCandidates;
      selectedCandId = null;
      kanbanFilter = '';

      return `
        <div class="split-layout" style="height:100%">
          <div class="split-list" style="padding:24px;overflow-y:auto">
            <div class="page-header">
              <div>
                <div class="page-title">Hiring Pipeline</div>
                <div class="page-subtitle">${candidates.length} candidates</div>
              </div>
              <div style="display:flex;gap:8px">
                <select class="form-input form-select" style="width:auto" onchange="filterKanbanStatus(this.value)">
                  <option value="">All statuses</option>
                  ${CAND_STATUS.map(s => `<option>${s}</option>`).join('')}
                </select>
                <button class="btn btn-primary" onclick="showAddCandidateModal()">+ Add Candidate</button>
              </div>
            </div>
            <div class="kanban" id="kanban"></div>
          </div>
          <div class="split-detail" id="candidate-detail"></div>
        </div>
      `;
    } catch (error) {
      console.error('Hiring page error:', error);
      return `<div style="padding:20px"><p>Error loading hiring: ${error.message}</p></div>`;
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
      // Fetch employees and devices from API, store in global variables
      const fetchedEmps = await api.getEmployees().catch(() => []);
      const fetchedDevs = await api.getDevices().catch(() => []);
      const fetchedAssignments = await api.getAssignments ? await api.getAssignments().catch(() => []) : [];

      employees = fetchedEmps;
      devices = fetchedDevs;
      assignments = fetchedAssignments;
      selectedEmpId = null;

      return `
        <div class="split-layout" style="height:100%">
          <div class="split-list" style="flex:1;padding:24px;overflow-y:auto">
            <div class="page-header">
              <div><div class="page-title">Directory</div><div class="page-subtitle">${employees.length} employees</div></div>
              <button class="btn btn-primary" onclick="showAddEmployeeModal()">+ Add Employee</button>
            </div>
            <div class="table-wrap">
              <div class="table-toolbar">
                <div class="table-search">
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="7" cy="7" r="5"/><path d="M11 11l3 3"/></svg>
                  <input placeholder="Search..." oninput="filterEmps(this.value)"/>
                </div>
              </div>
              <table><thead><tr><th>Employee</th><th>Role</th><th>Dept</th><th>Status</th><th>Location</th><th>Start Date</th></tr></thead>
              <tbody id="emp-tbody">${empRows(employees)}</tbody></table>
            </div>
          </div>
          <div class="split-detail" id="emp-detail"></div>
        </div>
      `;
    } catch (error) {
      console.error('Directory page error:', error);
      return `<div style="padding:20px"><p>Error loading directory: ${error.message}</p></div>`;
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
      const workflows = Array.isArray(tracksData) ? tracksData : (tracksData.data || []);

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
      const templates = Array.isArray(tracksData) ? tracksData : (tracksData.data || []);

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
      const tracks = Array.isArray(tracksData) ? tracksData : (tracksData.data || []);

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
