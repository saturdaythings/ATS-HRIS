export default function Settings() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
      <p className="text-gray-600">User preferences and workspace configuration</p>

      <div className="mt-6 max-w-2xl space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Appearance</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
              <select disabled className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-500 bg-gray-50">
                <option>Light (default)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Data</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Page Size</label>
              <select disabled className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-500 bg-gray-50">
                <option>25 items (default)</option>
              </select>
            </div>
            <button disabled className="px-4 py-2 bg-purple-600 text-white rounded-lg disabled:opacity-50">
              Export as CSV
            </button>
          </div>
        </div>

        <p className="text-sm text-gray-500">Full settings implementation coming in Phase 5</p>
      </div>
    </div>
  );
}
