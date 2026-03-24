import { useState, useEffect } from 'react';
import SearchBar from '../components/SearchBar';

export default function Search() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  const handleSearch = async (searchQuery) => {
    if (!searchQuery || searchQuery.trim().length === 0) {
      setResults([]);
      setQuery('');
      return;
    }

    try {
      setLoading(true);
      setQuery(searchQuery);
      setError(null);

      const params = new URLSearchParams({
        q: searchQuery,
      });

      if (selectedType !== 'all') {
        params.append('types', selectedType);
      }

      const response = await fetch(`/api/search?${params}`);

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setResults(data.results || []);
    } catch (err) {
      setError(err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.type]) {
      acc[result.type] = [];
    }
    acc[result.type].push(result);
    return acc;
  }, {});

  const typeLabels = {
    candidate: 'Candidates',
    employee: 'Employees',
    device: 'Devices',
    activity: 'Activity',
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Global Search</h1>
        <p className="text-gray-600">Search across candidates, employees, devices, and activity log</p>
      </div>

      <SearchBar onSearch={handleSearch} />

      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {query && (
        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Search Results
              {!loading && results.length > 0 && (
                <span className="text-gray-600 ml-2">({results.length})</span>
              )}
            </h2>
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                if (query) {
                  handleSearch(query);
                }
              }}
              className="px-3 py-2 border border-gray-300 rounded text-sm text-gray-700"
            >
              <option value="all">All Types</option>
              <option value="candidates">Candidates Only</option>
              <option value="employees">Employees Only</option>
              <option value="devices">Devices Only</option>
              <option value="activity">Activity Only</option>
            </select>
          </div>

          {loading && (
            <div className="text-center py-8">
              <div className="text-gray-500">Searching...</div>
            </div>
          )}

          {!loading && results.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-500">No results found for "{query}"</div>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="space-y-4">
              {Object.entries(groupedResults).map(([type, typeResults]) => (
                <div key={type}>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase">
                    {typeLabels[type] || type}
                  </h3>
                  <div className="space-y-2">
                    {typeResults.map((result) => (
                      <div
                        key={result.id}
                        className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900">
                              {result.name || result.action || 'Untitled'}
                            </div>
                            <div className="text-sm text-gray-600">
                              {result.subtitle}
                            </div>
                            {result.description && (
                              <div className="text-sm text-gray-500 mt-1">
                                {result.description}
                              </div>
                            )}
                            {result.timestamp && (
                              <div className="text-xs text-gray-400 mt-1">
                                {new Date(result.timestamp).toLocaleString()}
                              </div>
                            )}
                          </div>
                          <div className="flex-shrink-0">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {type}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!query && (
        <div className="mt-12 text-center">
          <div className="text-gray-500 mb-6">
            Start typing to search across all data
          </div>
          <div className="inline-flex gap-4">
            <div className="text-left">
              <div className="text-sm font-semibold text-gray-700 mb-2">Try searching for:</div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Candidate names or emails</li>
                <li>• Employee departments</li>
                <li>• Device serial numbers</li>
                <li>• Recent actions</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
