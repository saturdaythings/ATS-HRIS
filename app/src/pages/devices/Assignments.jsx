export default function Assignments() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Device Assignments</h1>
      <p className="text-gray-600">Active device assignments to employees</p>

      <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Employee</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Device</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Assigned Date</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td colSpan="4" className="py-8 px-4 text-center text-gray-500">
                No assignments loaded - API implementation coming in Phase 3
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
