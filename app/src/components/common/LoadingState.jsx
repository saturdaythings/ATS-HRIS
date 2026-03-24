/**
 * LoadingState Component
 * Displays loading skeleton or spinner
 */
export default function LoadingState({ message = 'Loading...' }) {
  return (
    <div className="bg-white rounded-lg border border-neutral-200 p-12 text-center">
      <div className="flex justify-center mb-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-neutral-200"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-600 animate-spin"></div>
        </div>
      </div>
      <p className="text-neutral-600">{message}</p>
    </div>
  );
}
