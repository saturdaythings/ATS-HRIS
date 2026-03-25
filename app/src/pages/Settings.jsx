import { useState, useEffect } from 'react';
import { useAdmin } from '../hooks/useAdmin';

export default function Settings() {
  const { getSettings, loading } = useAdmin();
  const [settings, setSettings] = useState({
    companyName: '',
    theme: 'light',
    timezone: 'America/New_York',
    language: 'en',
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await getSettings();
        if (data.data) {
          setSettings(prev => ({
            ...prev,
            companyName: data.data.companyName || '',
            theme: data.data.theme || 'light',
            timezone: data.data.timezone || 'America/New_York',
            language: data.data.language || 'en',
          }));
        }
      } catch (err) {
        console.error('Error loading settings:', err);
      }
    };

    loadSettings();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
      <p className="text-gray-600">User preferences and workspace configuration</p>

      {loading && (
        <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-center text-gray-500">Loading settings...</div>
        </div>
      )}

      {!loading && (
        <div className="mt-6 max-w-2xl space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Current Configuration</h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Company</span>
                <span className="text-gray-900 font-medium">{settings.companyName || 'V.Two Operations'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Theme</span>
                <span className="text-gray-900 font-medium capitalize">{settings.theme}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Timezone</span>
                <span className="text-gray-900 font-medium">{settings.timezone}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Language</span>
                <span className="text-gray-900 font-medium uppercase">{settings.language}</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
            <p className="text-sm text-blue-800">
              To change workspace settings, visit <span className="font-medium">Admin → Settings</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
