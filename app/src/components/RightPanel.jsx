export default function RightPanel({ detail, onClose }) {
  return (
    <>
      {/* Overlay */}
      {detail && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={`fixed inset-y-0 right-0 w-full md:w-96 bg-white border-l border-gray-200 transform transition-transform duration-300 z-50 ${
          detail ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {detail ? (
          <>
            {/* Header */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Details</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-gray-500">Detail panel placeholder - Phase 2</p>
            </div>
          </>
        ) : null}
      </div>
    </>
  );
}
