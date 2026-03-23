export default function Directory() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Employee Directory</h1>
      <p className="text-gray-600">All active employees - Phase 2</p>

      <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Title</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Department</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Start Date</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td colSpan="4" className="py-8 px-4 text-center text-gray-500">
                No employees loaded - API implementation coming in Phase 2
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
