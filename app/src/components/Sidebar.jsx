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
    {
      label: 'Admin',
      items: [
        { label: 'Custom Fields', path: '/admin/custom-fields', icon: '🔧' },
        { label: 'Templates', path: '/admin/templates', icon: '📝' },
        { label: 'Admin Settings', path: '/admin/settings', icon: '⚙️' },
        { label: 'Feature Requests', path: '/admin/feature-requests', icon: '💡' },
        { label: 'System Health', path: '/admin/health', icon: '❤️' },
      ],
    },
  ];

  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-neutral-50 border-r border-neutral-200 transition-transform duration-fast ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:static md:translate-x-0 flex flex-col`}
    >
      {/* Header */}
      <div className="h-16 flex items-center px-6 border-b border-neutral-200 flex-shrink-0">
        <h1 className="text-xl font-bold text-neutral-900">V.Two Ops</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6" aria-label="Main navigation">
        {navGroups.map((group) => (
          <div key={group.label} className="px-4 mb-8">
            <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3 px-3">
              {group.label}
            </h2>
            <ul className="space-y-1">
              {group.items.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-fast focus-visible:outline-2 focus-visible:outline-primary-600 focus-visible:outline-offset-0 ${
                      isActive(item.path)
                        ? 'bg-primary-100 text-primary-900'
                        : 'text-neutral-700 hover:bg-neutral-100'
                    }`}
                    aria-current={isActive(item.path) ? 'page' : undefined}
                  >
                    <span className="text-lg" aria-hidden="true">
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-neutral-200 flex-shrink-0">
        <div className="text-xs text-neutral-500 text-center">
          <p className="font-medium">Phase 2 Implementation</p>
          <p className="text-neutral-400">v2.0.0</p>
        </div>
      </div>
    </div>
  );
}
