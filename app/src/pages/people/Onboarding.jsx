import { useState, useEffect } from 'react';
import { useOnboarding } from '../../hooks/useOnboarding';
import ProgressBar from '../../components/common/ProgressBar';
import TimelineStep from '../../components/TimelineStep';
import Badge from '../../components/common/Badge';

export default function Onboarding() {
  const { fetchTemplates, getChecklistDetail, markItemComplete } = useOnboarding();

  // State for employees and checklists
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedChecklist, setSelectedChecklist] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(null);

  // Load employees and templates
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [employeeRes, templatesData] = await Promise.all([
          fetch('/api/employees'),
          fetchTemplates(),
        ]);

        if (!employeeRes.ok) throw new Error('Failed to load employees');
        const { data: employeesData } = await employeeRes.json();
        setEmployees(employeesData || []);
        setTemplates(templatesData || []);
        setError(null);
      } catch (err) {
        setError(err.message);
        setEmployees([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Load checklist when employee is selected
  useEffect(() => {
    if (!selectedEmployee) {
      setSelectedChecklist(null);
      setProgress(null);
      return;
    }

    const loadChecklist = async () => {
      try {
        // Get checklists for employee
        const res = await fetch(`/api/onboarding/checklists/${selectedEmployee.id}`);
        if (!res.ok) throw new Error('Failed to load checklist');
        const { data: checklists } = await res.json();

        if (checklists && checklists.length > 0) {
          const checklist = checklists[0];
          const detail = await getChecklistDetail(checklist.id);
          setSelectedChecklist(detail);

          // Get progress
          const progressRes = await fetch(
            `/api/onboarding/checklists/${checklist.id}/progress`
          );
          const { data: progressData } = await progressRes.json();
          setProgress(progressData);
        } else {
          setSelectedChecklist(null);
          setProgress(null);
        }
      } catch (err) {
        setSelectedChecklist(null);
        setProgress(null);
      }
    };

    loadChecklist();
  }, [selectedEmployee]);

  // Handle marking item complete
  const handleMarkComplete = async (itemId) => {
    if (!selectedChecklist) return;

    try {
      await markItemComplete(selectedChecklist.id, itemId, 'current-user');
      // Reload checklist to update UI
      const detail = await getChecklistDetail(selectedChecklist.id);
      setSelectedChecklist(detail);

      const progressRes = await fetch(
        `/api/onboarding/checklists/${selectedChecklist.id}/progress`
      );
      const { data: progressData } = await progressRes.json();
      setProgress(progressData);
    } catch (err) {
      console.error('Failed to mark item complete:', err);
    }
  };

  // Filter and search employees
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'active') return matchesSearch && !selectedChecklist?.status === 'completed';
    if (filterStatus === 'completed')
      return matchesSearch && progress?.percentage === 100;
    return matchesSearch;
  });

  // Group items by phase/due date
  const groupItemsByPhase = (items) => {
    if (!items) return {};

    const phases = {
      'Pre-Board': [],
      'Day 1': [],
      'Week 1': [],
      '30-day': [],
      '90-day': [],
    };

    const now = new Date();

    items.forEach((item) => {
      const dueDate = new Date(item.dueDate);
      const daysFromNow = Math.ceil(
        (dueDate - now) / (1000 * 60 * 60 * 24)
      );

      if (daysFromNow <= 0) phases['Pre-Board'].push(item);
      else if (daysFromNow <= 1) phases['Day 1'].push(item);
      else if (daysFromNow <= 7) phases['Week 1'].push(item);
      else if (daysFromNow <= 30) phases['30-day'].push(item);
      else phases['90-day'].push(item);
    });

    return phases;
  };

  const phases = selectedChecklist ? groupItemsByPhase(selectedChecklist.items) : {};

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Onboarding Checklists
        </h1>
        <p className="text-slate-600">
          Track new hire onboarding tasks and device assignments
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">Error: {error}</p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <p className="text-slate-600">Loading...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* LEFT PANEL: Employees */}
          <div className="bg-white rounded-lg border border-slate-200 flex flex-col">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Employees
              </h2>

              {/* Search */}
              <div className="relative mb-4">
                <svg className="absolute left-3 top-3 text-slate-400 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search employees"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Employee list */}
            <div className="flex-1 overflow-y-auto">
              {filteredEmployees.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-slate-500">No employees found</p>
                </div>
              ) : (
                <div className="space-y-2 p-4">
                  {filteredEmployees.map((emp) => (
                    <button
                      key={emp.id}
                      onClick={() => setSelectedEmployee(emp)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                        selectedEmployee?.id === emp.id
                          ? 'bg-purple-100 border-2 border-purple-500'
                          : 'hover:bg-slate-50 border-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-900">
                            {emp.name}
                          </p>
                          <p className="text-xs text-slate-600">{emp.role}</p>
                        </div>
                        {progress && (
                          <Badge
                            variant={
                              progress.percentage === 100
                                ? 'active'
                                : 'pending'
                            }
                            size="sm"
                          >
                            {progress.percentage}%
                          </Badge>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* MIDDLE PANEL: Checklist */}
          <div className="bg-white rounded-lg border border-slate-200 flex flex-col">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Checklist
              </h2>

              {selectedEmployee && selectedChecklist && (
                <div>
                  <p className="text-sm text-slate-600 mb-4">
                    {selectedChecklist.template?.name}
                  </p>
                  {progress && <ProgressBar completed={progress.completed} total={progress.total} />}
                </div>
              )}
            </div>

            {/* Checklist content */}
            <div className="flex-1 overflow-y-auto">
              {!selectedEmployee ? (
                <div className="p-6 text-center">
                  <p className="text-slate-500">
                    Select an employee to view their checklist
                  </p>
                </div>
              ) : !selectedChecklist ? (
                <div className="p-6">
                  <p className="text-slate-600 mb-4">
                    No checklist assigned yet.
                  </p>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Assign Template
                    </label>
                    <select
                      value={selectedTemplateId}
                      onChange={(e) => setSelectedTemplateId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mb-3"
                    >
                      <option value="">Select a template...</option>
                      {templates.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={async () => {
                        if (selectedTemplateId) {
                          try {
                            await fetch('/api/onboarding/checklists', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                employeeId: selectedEmployee.id,
                                templateId: selectedTemplateId,
                              }),
                            });
                            setSelectedTemplateId('');
                            setSelectedEmployee(null);
                            setSelectedEmployee(selectedEmployee);
                          } catch (err) {
                            console.error('Failed to assign template:', err);
                          }
                        }
                      }}
                      className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Assign Template
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6 space-y-3">
                  {selectedChecklist.items?.length === 0 ? (
                    <p className="text-slate-500">No items in this checklist</p>
                  ) : (
                    selectedChecklist.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={() => handleMarkComplete(item.id)}
                          className="mt-1 w-4 h-4 cursor-pointer accent-purple-600"
                          aria-label={`Mark ${item.task} complete`}
                        />
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-medium ${
                              item.completed
                                ? 'line-through text-slate-500'
                                : 'text-slate-900'
                            }`}
                          >
                            {item.task}
                          </p>
                          <p className="text-xs text-slate-600 mt-1">
                            Assigned to: {item.assignedTo}
                          </p>
                          <p
                            className={`text-xs mt-1 ${
                              new Date(item.dueDate) < new Date() && !item.completed
                                ? 'text-red-600'
                                : item.completed
                                ? 'text-green-600'
                                : 'text-slate-500'
                            }`}
                          >
                            Due: {new Date(item.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT PANEL: Timeline */}
          <div className="bg-white rounded-lg border border-slate-200 flex flex-col">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Timeline</h2>
            </div>

            {/* Timeline content */}
            <div className="flex-1 overflow-y-auto">
              {!selectedChecklist ? (
                <div className="p-6 text-center">
                  <p className="text-slate-500">
                    Select an employee to view their timeline
                  </p>
                </div>
              ) : (
                <div className="p-6 space-y-6">
                  {Object.entries(phases).map(([phase, items]) => (
                    <TimelineStep
                      key={phase}
                      label={phase}
                      completed={items.every((i) => i.completed)}
                      items={items}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
