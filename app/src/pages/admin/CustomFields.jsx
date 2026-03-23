import { useState, useEffect } from 'react';
import { useAdmin } from '../../hooks/useAdmin';
import FieldBuilder from '../../components/admin/FieldBuilder';

export default function CustomFields() {
  const {
    getCustomFields,
    createCustomField,
    updateCustomField,
    deleteCustomField,
    loading,
    error,
  } = useAdmin();

  const [fields, setFields] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterEntity, setFilterEntity] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadFields();
  }, []);

  const loadFields = async () => {
    try {
      const data = await getCustomFields();
      setFields(data.fields || []);
    } catch (err) {
      setMessage(`Error loading fields: ${err.message}`);
    }
  };

  const handleAddField = () => {
    setEditingField(null);
    setShowModal(true);
  };

  const handleEditField = (field) => {
    setEditingField(field);
    setShowModal(true);
  };

  const handleSaveField = async (formData) => {
    try {
      if (editingField) {
        // Update: can only update label, required, order, options
        await updateCustomField(editingField.id, {
          label: formData.label,
          options: formData.options,
          required: formData.required,
          order: formData.order,
        });
        setMessage('Field updated successfully');
      } else {
        // Create
        await createCustomField(formData);
        setMessage('Field created successfully');
      }
      setShowModal(false);
      loadFields();
    } catch (err) {
      setMessage(`Error saving field: ${err.message}`);
    }
  };

  const handleDeleteField = async (fieldId) => {
    if (!confirm('Are you sure you want to delete this field? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteCustomField(fieldId);
      setMessage('Field deleted successfully');
      loadFields();
    } catch (err) {
      setMessage(`Error deleting field: ${err.message}`);
    }
  };

  // Filter fields
  const filteredFields = fields.filter((field) => {
    const matchesSearch =
      field.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      field.label.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !filterType || field.type === filterType;
    const matchesEntity = !filterEntity || field.entityType === filterEntity;
    return matchesSearch && matchesType && matchesEntity;
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Custom Fields</h1>
        <p className="text-gray-600">Manage custom fields for candidates, employees, and devices</p>
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

      {/* Controls */}
      <div className="mb-6 space-y-4">
        <button
          onClick={handleAddField}
          disabled={loading}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium"
        >
          + Add Custom Field
        </button>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search by name or label..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">All Types</option>
            <option value="text">Text</option>
            <option value="select">Select</option>
            <option value="date">Date</option>
            <option value="checkbox">Checkbox</option>
            <option value="number">Number</option>
          </select>

          <select
            value={filterEntity}
            onChange={(e) => setFilterEntity(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">All Entities</option>
            <option value="candidate">Candidate</option>
            <option value="employee">Employee</option>
            <option value="device">Device</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {filteredFields.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {fields.length === 0 ? 'No custom fields yet' : 'No fields match your filters'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Label
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Entity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Required
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredFields
                  .sort((a, b) => a.order - b.order)
                  .map((field) => (
                    <tr key={field.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{field.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{field.label}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                          {field.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                          {field.entityType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {field.required ? (
                          <span className="text-green-600 font-medium">Yes</span>
                        ) : (
                          <span className="text-gray-500">No</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{field.order}</td>
                      <td className="px-6 py-4 text-sm space-x-2">
                        <button
                          onClick={() => handleEditField(field)}
                          className="text-purple-600 hover:text-purple-700 font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteField(field.id)}
                          className="text-red-600 hover:text-red-700 font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {editingField ? 'Edit Custom Field' : 'Create Custom Field'}
              </h2>
            </div>
            <div className="p-6">
              <FieldBuilder
                field={editingField}
                onSave={handleSaveField}
                onCancel={() => setShowModal(false)}
                loading={loading}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
