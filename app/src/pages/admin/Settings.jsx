import { useState, useEffect } from 'react';
import { useAdmin } from '../../hooks/useAdmin';

export default function AdminSettings() {
  const { getSettings, updateSettings, loading } = useAdmin();

  const [formData, setFormData] = useState({
    companyName: '',
    logo: '',
    timezone: 'UTC',
    smtpHost: '',
    smtpPort: '587',
    smtpFrom: '',
    phases: {
      preBoard: 'Pre-boarding',
      day1: 'Day 1',
      week1: 'Week 1',
      day30: '30-day',
      day90: '90-day',
    },
    features: {
      chatEnabled: true,
      autoAssignEnabled: true,
      notificationsEnabled: true,
    },
  });

  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await getSettings();
      if (data.settings) {
        setFormData((prev) => ({
          ...prev,
          ...data.settings,
        }));
      }
    } catch (err) {
      setMessage(`Error loading settings: ${err.message}`);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith('phase_')) {
      const phaseKey = name.replace('phase_', '');
      setFormData((prev) => ({
        ...prev,
        phases: {
          ...prev.phases,
          [phaseKey]: value,
        },
      }));
    } else if (name.startsWith('feature_')) {
      const featureKey = name.replace('feature_', '');
      setFormData((prev) => ({
        ...prev,
        features: {
          ...prev.features,
          [featureKey]: type === 'checkbox' ? checked : value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.companyName.trim()) {
      setMessage('Company name is required');
      return;
    }

    try {
      await updateSettings(formData);
      setMessage('Settings saved successfully');
    } catch (err) {
      setMessage(`Error saving settings: ${err.message}`);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">System Settings</h1>
        <p className="text-gray-600">Configure company information, email settings, and features</p>
      </div>

      {/* Messages */}
      {message && (
        <div
          className={`mb-4 p-4 rounded-lg ${
            message.includes('Error') ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
        {/* Company Information Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Company Information</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="V.Two"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Logo URL</label>
              <input
                type="url"
                name="logo"
                value={formData.logo}
                onChange={handleChange}
                placeholder="https://example.com/logo.png"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
              <select
                name="timezone"
                value={formData.timezone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="UTC">UTC</option>
                <option value="EST">EST</option>
                <option value="CST">CST</option>
                <option value="MST">MST</option>
                <option value="PST">PST</option>
              </select>
            </div>
          </div>
        </div>

        {/* Email Settings Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Email Settings</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Host</label>
              <input
                type="text"
                name="smtpHost"
                value={formData.smtpHost}
                onChange={handleChange}
                placeholder="smtp.gmail.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Port</label>
                <input
                  type="number"
                  name="smtpPort"
                  value={formData.smtpPort}
                  onChange={handleChange}
                  placeholder="587"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">From Email</label>
                <input
                  type="email"
                  name="smtpFrom"
                  value={formData.smtpFrom}
                  onChange={handleChange}
                  placeholder="noreply@vtwo.co"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Onboarding Phases Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Onboarding Phases</h2>
          <p className="text-sm text-gray-600 mb-4">
            Customize the names of onboarding phases used in your company
          </p>

          <div className="space-y-4">
            {Object.entries(formData.phases).map(([key, value]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()} Phase
                </label>
                <input
                  type="text"
                  name={`phase_${key}`}
                  value={value}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Feature Flags Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Feature Flags</h2>

          <div className="space-y-4">
            {Object.entries(formData.features).map(([key, value]) => (
              <label key={key} className="flex items-center">
                <input
                  type="checkbox"
                  name={`feature_${key}`}
                  checked={value}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="ml-3 text-sm text-gray-700 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()} Enabled
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium"
          >
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
