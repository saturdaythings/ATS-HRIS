import { useState, useEffect } from 'react';

export default function Search() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}`);

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const { data } = await response.json();
      setResults(data || []);
    } catch (err) {
      setError(err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Global Search</h1>
      <p className="text-gray-600">Search across people, devices, and activities</p>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="mt-6 max-w-2xl">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, device serial..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-800 rounded-lg">
          {error}
        </div>
      )}

      {/* Results */}
      {searchTerm && (
        <div className="mt-8 max-w-4xl">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {loading ? 'Searching...' : `${results.length} result${results.length !== 1 ? 's' : ''}`}
          </h2>

          {results.length === 0 && !loading && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 text-center text-gray-500">
              No results found
            </div>
          )}

          {results.map((result) => (
            <div key={result.id} className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
              <h3 className="font-medium text-gray-900">{result.name || result.title}</h3>
              <p className="text-sm text-gray-600">{result.type || result.category}</p>
              {result.description && (
                <p className="text-sm text-gray-500 mt-2">{result.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
