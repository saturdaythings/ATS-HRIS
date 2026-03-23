import { useState, useEffect } from 'react';
import { useAdmin } from '../../hooks/useAdmin';

export default function Templates() {
  const {
    getOnboardingTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    loading,
  } = useAdmin();

  const [templates, setTemplates] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    items: [],
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const data = await getOnboardingTemplates();
      setTemplates(data.templates || []);
    } catch (err) {
      setMessage(`Error loading templates: ${err.message}`);
    }
  };

  const handleAddTemplate = () => {
    setEditingTemplate(null);
    setFormData({ name: '', role: '', items: [] });
    setShowModal(true);
  };

  const handleEditTemplate = (template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      role: template.role,
      items: template.items || [],
    });
    setShowModal(true);
  };

  const handleSaveTemplate = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.role.trim()) {
      setMessage('Template name and role are required');
      return;
    }

    try {
      const payload = {
        name: formData.name,
        role: formData.role,
        items: formData.items,
      };

      if (editingTemplate) {
        await updateTemplate(editingTemplate.id, payload);
        setMessage('Template updated successfully');
      } else {
        await createTemplate(payload);
        setMessage('Template created successfully');
      }

      setShowModal(false);
      loadTemplates();
    } catch (err) {
      setMessage(`Error saving template: ${err.message}`);
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    if (!confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      await deleteTemplate(templateId);
      setMessage('Template deleted successfully');
      loadTemplates();
    } catch (err) {
      setMessage(`Error deleting template: ${err.message}`);
    }
  };

  const handleAddItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          task: '',
          assignedTo: 'HR',
          dueDate: '',
        },
      ],
    }));
  };

  const handleUpdateItem = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index][field] = value;
    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
    }));
  };

  const handleRemoveItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Onboarding Templates</h1>
        <p className="text-gray-600">Create and manage onboarding checklists for different roles</p>
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

      {/* Add Button */}
      <button
        onClick={handleAddTemplate}
        disabled={loading}
        className="mb-6 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium"
      >
        + Create Template
      </button>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.length === 0 ? (
          <div className="col-span-full text-center p-8 text-gray-500">
            No onboarding templates yet
          </div>
        ) : (
          templates.map((template) => (
            <div key={template.id} className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-1">{template.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{template.role}</p>

              <div className="mb-4 space-y-2">
                <p className="text-xs font-semibold text-gray-700 uppercase">Items</p>
                <p className="text-2xl font-bold text-purple-600">{(template.items || []).length}</p>
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleEditTemplate(template)}
                  className="flex-1 px-3 py-2 text-purple-600 hover:bg-purple-50 rounded-lg text-sm font-medium border border-purple-200"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteTemplate(template.id)}
                  className="flex-1 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium border border-red-200"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-900">
                {editingTemplate ? 'Edit Template' : 'Create Template'}
              </h2>
            </div>

            <form onSubmit={handleSaveTemplate} className="p-6 space-y-6">
              {/* Template Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Engineering Onboarding"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
                  placeholder="e.g., Junior Engineer"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              {/* Items */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-700">Checklist Items</label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    + Add Item
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.items.map((item, index) => (
                    <div
                      key={index}
                      className="p-4 border border-gray-200 rounded-lg space-y-3 bg-gray-50"
                    >
                      <input
                        type="text"
                        placeholder="Task description"
                        value={item.task}
                        onChange={(e) => handleUpdateItem(index, 'task', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />

                      <div className="grid grid-cols-2 gap-3">
                        <select
                          value={item.assignedTo}
                          onChange={(e) => handleUpdateItem(index, 'assignedTo', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        >
                          <option value="HR">HR</option>
                          <option value="IT">IT</option>
                          <option value="Manager">Manager</option>
                          <option value="Employee">Employee</option>
                        </select>

                        <input
                          type="date"
                          value={item.dueDate}
                          onChange={(e) => handleUpdateItem(index, 'dueDate', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="text-xs text-red-600 hover:text-red-700 font-medium"
                      >
                        Remove Item
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium"
                >
                  {loading ? 'Saving...' : editingTemplate ? 'Update Template' : 'Create Template'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={loading}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
