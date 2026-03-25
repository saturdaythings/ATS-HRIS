/**
 * EmployeeDetailPanel Component
 * Rippling-style slide-in panel for employee viewing and management
 */
import { useState, useEffect } from 'react';
import Badge from '../common/Badge';
import ProgressBar from '../common/ProgressBar';
import Timeline from '../common/Timeline';
import DatePicker from '../common/DatePicker';
import OffboardModal from '../modals/OffboardModal';

export default function EmployeeDetailPanel({ employee, isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [showOffboardModal, setShowOffboardModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    title: '',
    department: '',
    startDate: '',
    status: 'active',
    manager: '',
  });

  const [activities] = useState([
    {
      id: 1,
      action: 'Employee created',
      timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    },
    {
      id: 2,
      action: 'Onboarding checklist started',
      timestamp: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
    },
    {
      id: 3,
      action: 'IT setup completed',
      timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    },
    {
      id: 4,
      action: 'Department orientation completed',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
  ]);

  const [onboardingItems] = useState([
    {
      id: 1,
      task: 'Send welcome email',
      assignedTo: 'HR',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      completed: true,
      notes: 'Sent on first day',
    },
    {
      id: 2,
      task: 'Create email account',
      assignedTo: 'IT',
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      completed: true,
      notes: 'account@company.com',
    },
    {
      id: 3,
      task: 'Manager intro call',
      assignedTo: 'Manager',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      completed: false,
      notes: 'Schedule for next week',
    },
    {
      id: 4,
      task: 'Send handbook',
      assignedTo: 'HR',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      completed: false,
      notes: '',
    },
  ]);

  const [devices] = useState([
    {
      id: 1,
      type: 'MacBook Pro M3',
      serial: 'C123456789',
      assignedDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      status: 'active',
      returnedDate: null,
      deviceCondition: 'new',
    },
    {
      id: 2,
      type: 'iPhone 15',
      serial: 'A987654321',
      assignedDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      status: 'returned',
      returnedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      returnedCondition: 'fair',
    },
  ]);

  const departments = ['Engineering', 'Design', 'Sales', 'Marketing', 'Operations', 'HR', 'Finance'];

  // Initialize form data when employee changes
  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name || '',
        email: employee.email || '',
        title: employee.title || '',
        department: employee.department || '',
        startDate: employee.startDate || '',
        status: employee.status || 'active',
        manager: employee.manager || '',
      });
      setIsEditing(false);
      setActiveTab('overview');
    }
  }, [employee, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // TODO: Call API to save employee
    setIsEditing(false);
  };

  const handleMarkTaskComplete = (taskId) => {
    // TODO: Call API to mark task complete
    console.log('Mark task complete:', taskId);
  };

  const handleOffboard = async (data) => {
    try {
      const response = await fetch(`/api/offboarding/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: employee.id,
          lastDay: data.lastDay,
          trackIds: data.trackIds,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start offboarding');
      }

      setShowOffboardModal(false);
      // Optionally refresh or navigate to offboarding page
      console.log('Offboarding started successfully');
    } catch (error) {
      console.error('Offboarding error:', error);
      // TODO: Show error toast/notification
    }
  };

  if (!isOpen || !employee) return null;

  const completedTasks = onboardingItems.filter(item => item.completed).length;
  const totalTasks = onboardingItems.length;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 w-full md:w-[40%] lg:w-[35%] bg-white shadow-xl z-50 flex flex-col overflow-hidden transform transition-transform duration-300">
        {/* Header */}
        <div className="flex-shrink-0 px-6 py-4 border-b border-slate-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-slate-900">{formData.name}</h2>
              <p className="text-sm text-slate-600 mt-1">{formData.email}</p>
              <div className="flex gap-2 mt-3">
                <Badge variant={formData.status === 'active' ? 'active' : 'inactive'}>
                  {formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}
                </Badge>
                <Badge variant="info">{formData.title}</Badge>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex-shrink-0 px-6 border-b border-slate-200 flex gap-6 overflow-x-auto">
          {['overview', 'onboarding', 'devices', 'history'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                ${activeTab === tab
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
                }
              `}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {!isEditing ? (
                <>
                  {/* Display Mode */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Name</label>
                      <p className="text-slate-900">{formData.name}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Email</label>
                      <p className="text-slate-900">{formData.email}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Title</label>
                      <p className="text-slate-900">{formData.title}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Department</label>
                      <p className="text-slate-900">{formData.department}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Start Date</label>
                      <p className="text-slate-900">
                        {formData.startDate ? new Date(formData.startDate).toLocaleDateString() : '-'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Manager</label>
                      <p className="text-slate-900">{formData.manager || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Status</label>
                      <p className="text-slate-900 capitalize">{formData.status}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 space-y-2">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="w-full px-4 py-2 bg-slate-100 text-slate-900 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                    >
                      Edit Details
                    </button>
                    <button
                      className="w-full px-4 py-2 bg-slate-100 text-slate-900 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                    >
                      Reassign Manager
                    </button>
                    <button
                      onClick={() => setShowOffboardModal(true)}
                      className="w-full px-4 py-2 bg-red-50 text-red-700 rounded-lg font-medium hover:bg-red-100 transition-colors"
                    >
                      Offboard
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Edit Mode */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-1">Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-1">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-1">Title</label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-1">Department</label>
                      <select
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                      >
                        <option value="">Select department</option>
                        {departments.map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <DatePicker
                        label="Start Date"
                        value={formData.startDate}
                        onChange={(date) => setFormData(prev => ({
                          ...prev,
                          startDate: date ? date.toISOString().split('T')[0] : '',
                        }))}
                        helperText="Date employee started or will start"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-1">Manager</label>
                      <input
                        type="text"
                        name="manager"
                        value={formData.manager}
                        onChange={handleChange}
                        placeholder="Manager name or email"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  {/* Save/Cancel Buttons */}
                  <div className="pt-4 flex gap-3">
                    <button
                      onClick={handleSave}
                      className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex-1 px-4 py-2 bg-slate-100 text-slate-900 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Onboarding Tab */}
          {activeTab === 'onboarding' && (
            <div className="space-y-6">
              {/* Progress */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-4">Onboarding Progress</h3>
                <ProgressBar completed={completedTasks} total={totalTasks} />
              </div>

              {/* Checklist Items */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Tasks</h3>
                <div className="space-y-2">
                  {onboardingItems.map(item => (
                    <div
                      key={item.id}
                      className={`
                        p-3 rounded-lg border transition-colors
                        ${item.completed
                          ? 'bg-green-50 border-green-200'
                          : 'bg-slate-50 border-slate-200'
                        }
                      `}
                    >
                      <div className="flex gap-3">
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={() => handleMarkTaskComplete(item.id)}
                          className="mt-0.5 w-5 h-5 rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                        />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${item.completed ? 'line-through text-slate-600' : 'text-slate-900'}`}>
                            {item.task}
                          </p>
                          <div className="flex gap-2 mt-2 flex-wrap text-xs">
                            <Badge size="sm" variant="info">
                              {item.assignedTo}
                            </Badge>
                            <Badge size="sm" variant={item.completed ? 'active' : 'pending'}>
                              {item.completed ? 'Done' : 'Pending'}
                            </Badge>
                          </div>
                          {item.notes && (
                            <p className="text-xs text-slate-600 mt-2">{item.notes}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Devices Tab */}
          {activeTab === 'devices' && (
            <div className="space-y-6">
              {/* Helper function to format dates */}
              {devices.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-sm">
                  No devices assigned
                </div>
              ) : (
                <>
                  {/* Active/Current Devices */}
                  {devices.filter(d => d.status === 'active').length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 mb-3">Current Devices</h3>
                      <div className="space-y-3">
                        {devices.filter(d => d.status === 'active').map(device => {
                          const assignedDate = new Date(device.assignedDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          });
                          const conditionLabel = device.deviceCondition
                            ? device.deviceCondition.charAt(0).toUpperCase() + device.deviceCondition.slice(1)
                            : 'Good';

                          return (
                            <div key={device.id} className="p-4 border border-slate-200 rounded-lg">
                              <div className="flex items-start justify-between mb-2">
                                <p className="text-sm font-medium text-slate-900">{device.type}</p>
                                <Badge variant="active" size="sm">Active</Badge>
                              </div>
                              <p className="text-xs text-slate-600 mb-1">Serial: {device.serial}</p>
                              <div className="text-xs text-slate-600 space-y-1">
                                <div>
                                  <span className="font-medium">{assignedDate}</span>
                                  <span className="mx-1">–</span>
                                  <span className="font-medium">present</span>
                                </div>
                                <div>
                                  <span className="text-slate-600">Condition:</span>
                                  <span className="ml-1 font-medium">{conditionLabel}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Returned Devices */}
                  {devices.filter(d => d.status !== 'active').length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 mb-3">Returned Devices</h3>
                      <div className="space-y-3">
                        {devices.filter(d => d.status !== 'active').map(device => {
                          const assignedDate = new Date(device.assignedDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          });
                          const returnedDate = device.returnedDate
                            ? new Date(device.returnedDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                            : 'Unknown';
                          const returnedCondition = device.returnedCondition
                            ? device.returnedCondition.charAt(0).toUpperCase() + device.returnedCondition.slice(1)
                            : 'Unknown';

                          return (
                            <div key={device.id} className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                              <div className="flex items-start justify-between mb-2">
                                <p className="text-sm font-medium text-slate-900">{device.type}</p>
                                <Badge variant="inactive" size="sm">Returned</Badge>
                              </div>
                              <p className="text-xs text-slate-600 mb-1">Serial: {device.serial}</p>
                              <div className="text-xs text-slate-600 space-y-1">
                                <div>
                                  <span className="font-medium">{assignedDate}</span>
                                  <span className="mx-1">–</span>
                                  <span className="font-medium">{returnedDate}</span>
                                </div>
                                <div>
                                  <span className="text-slate-600">Returned:</span>
                                  <span className="ml-1 font-medium">{returnedCondition}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Activity Timeline</h3>
              <Timeline activities={activities} />
            </div>
          )}
        </div>
      </div>

      {/* Offboard Modal */}
      {showOffboardModal && (
        <OffboardModal
          employee={employee}
          onConfirm={handleOffboard}
          onCancel={() => setShowOffboardModal(false)}
        />
      )}
    </>
  );
}
