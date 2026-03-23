export default function Hiring() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Hiring Pipeline</h1>
      <p className="text-gray-600">Candidate stages: Sourced → Screening → Interview → Offer → Hired</p>

      <div className="mt-6 grid grid-cols-5 gap-4">
        {['Sourced', 'Screening', 'Interview', 'Offer', 'Hired'].map((stage) => (
          <div key={stage} className="bg-gray-50 rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-700 mb-4">{stage}</h3>
            <div className="space-y-2">
              <div className="text-center text-gray-400">
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-gray-500">Phase 2</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
