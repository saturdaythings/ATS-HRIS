export default function Reports() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports</h1>
      <p className="text-gray-600">Analytics and business intelligence</p>

      <div className="mt-6 grid grid-cols-2 gap-6">
        {[
          { title: 'Headcount Trends', phase: 'Phase 5' },
          { title: 'Device Condition', phase: 'Phase 5' },
          { title: 'Onboarding Time', phase: 'Phase 5' },
          { title: 'Asset Utilization', phase: 'Phase 5' },
        ].map((report) => (
          <div key={report.title} className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900">{report.title}</h3>
            <p className="text-sm text-gray-500 mt-2">{report.phase}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
