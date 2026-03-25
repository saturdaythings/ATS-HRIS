import { useState, useEffect } from 'react';

export default function Tracks() {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/tracks');

        if (!response.ok) {
          throw new Error('Failed to load tracks');
        }

        const { data } = await response.json();
        setTracks(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTracks();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tracks</h1>
        <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6 text-center text-gray-500">
          Loading tracks...
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Tracks</h1>
      <p className="text-gray-600">Manage career development and progression tracks</p>

      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-800 rounded-lg">
          {error}
        </div>
      )}

      <div className="mt-6 bg-white rounded-lg border border-gray-200 overflow-hidden">
        {tracks.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No tracks defined yet. Create one from Admin → Templates.
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Track Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Role</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Items</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tracks.map(track => (
                <tr key={track.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">{track.name}</td>
                  <td className="py-3 px-4 text-gray-600 capitalize">{track.role}</td>
                  <td className="py-3 px-4 text-gray-600">{track.items?.length || 0} items</td>
                  <td className="py-3 px-4 text-right">
                    <button className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
