export default function Inventory() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Device Inventory</h1>
      <p className="text-gray-600">All devices and their status</p>

      <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Serial</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Make / Model</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Condition</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td colSpan="5" className="py-8 px-4 text-center text-gray-500">
                No devices loaded - API implementation coming in Phase 3
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
