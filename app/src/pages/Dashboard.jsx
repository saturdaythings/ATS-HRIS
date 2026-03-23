export default function Dashboard() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
      <p className="text-gray-600 mb-8">Welcome to V.Two Ops - Phase 1 Scaffold</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Employees', value: 'TBD', icon: '👥' },
          { label: 'Candidates', value: 'TBD', icon: '📋' },
          { label: 'Devices', value: 'TBD', icon: '🖥️' },
          { label: 'Unassigned', value: 'TBD', icon: '📦' },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-700 font-medium">{card.label}</h3>
              <span className="text-2xl">{card.icon}</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{card.value}</p>
            <p className="text-xs text-gray-500 mt-2">Coming in Phase 2</p>
          </div>
        ))}
      </div>

      <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h2 className="font-semibold text-blue-900 mb-2">Phase 1 Status</h2>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>✓ Prisma schema with all models</li>
          <li>✓ Express API scaffold with placeholder routes</li>
          <li>✓ React shell with sidebar navigation</li>
          <li>→ Phase 2: Implement CRUD endpoints</li>
        </ul>
      </div>
    </div>
  );
}
