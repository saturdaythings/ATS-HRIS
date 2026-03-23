import { Link, useLocation } from 'react-router-dom';

export default function Sidebar({ isOpen }) {
  const location = useLocation();

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const navGroups = [
    {
      label: 'Core',
      items: [
        { label: 'Dashboard', path: '/', icon: '📊' },
      ],
    },
    {
      label: 'People',
      items: [
        { label: 'Directory', path: '/people/directory', icon: '👥' },
        { label: 'Hiring', path: '/people/hiring', icon: '📋' },
        { label: 'Onboarding', path: '/people/onboarding', icon: '📍' },
        { label: 'Offboarding', path: '/people/offboarding', icon: '🚪' },
      ],
    },
    {
      label: 'Assets',
      items: [
        { label: 'Inventory', path: '/devices/inventory', icon: '🖥️' },
        { label: 'Assignments', path: '/devices/assignments', icon: '📦' },
      ],
    },
    {
      label: 'Workspace',
      items: [
        { label: 'Reports', path: '/reports', icon: '📈' },
        { label: 'Settings', path: '/settings', icon: '⚙️' },
      ],
    },
  ];

  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:static md:translate-x-0`}
    >
      {/* Header */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">V.Two Ops</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6">
        {navGroups.map((group) => (
          <div key={group.label} className="px-4 mb-8">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              {group.label}
            </h2>
            <ul className="space-y-1">
              {group.items.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive(item.path)
                        ? 'bg-purple-100 text-purple-900 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          <p>Phase 1 Scaffold</p>
          <p className="text-gray-400">v1.0.0</p>
        </div>
      </div>
    </div>
  );
}
