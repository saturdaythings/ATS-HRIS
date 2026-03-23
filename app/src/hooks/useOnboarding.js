/**
 * useOnboarding Hook
 * Provides API methods for onboarding templates, checklists, and items
 */

export function useOnboarding() {
  /**
   * Fetch all templates, optionally filtered by role
   * @param {string} role - Optional role filter
   * @returns {Promise<Array>} Array of templates
   */
  const fetchTemplates = async (role) => {
    const url = role
      ? `/api/onboarding/templates?role=${encodeURIComponent(role)}`
      : '/api/onboarding/templates';

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch templates: ${response.statusText}`);
    }

    const { data } = await response.json();
    return data;
  };

  /**
   * Get checklists for an employee
   * @param {string} employeeId - Employee ID
   * @returns {Promise<Array>} Array of checklists
   */
  const getChecklistForEmployee = async (employeeId) => {
    const response = await fetch(`/api/onboarding/checklists/${employeeId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch checklist: ${response.statusText}`);
    }

    const { data } = await response.json();
    return data;
  };

  /**
   * Assign a template to an employee (create checklist)
   * @param {string} employeeId - Employee ID
   * @param {string} templateId - Template ID
   * @returns {Promise<Object>} Created checklist
   */
  const assignTemplate = async (employeeId, templateId) => {
    const response = await fetch('/api/onboarding/checklists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employeeId,
        templateId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to assign template: ${response.statusText}`);
    }

    const { data } = await response.json();
    return data;
  };

  /**
   * Mark a checklist item as complete
   * @param {string} checklistId - Checklist ID
   * @param {string} itemId - Item ID
   * @param {string} completedBy - User/email completing the item
   * @returns {Promise<Object>} Updated item
   */
  const markItemComplete = async (checklistId, itemId, completedBy) => {
    const response = await fetch(
      `/api/onboarding/checklists/${checklistId}/items/${itemId}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completedBy }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to mark item complete: ${response.statusText}`);
    }

    const { data } = await response.json();
    return data;
  };

  /**
   * Get progress for a checklist
   * @param {string} checklistId - Checklist ID
   * @returns {Promise<Object>} Progress { total, completed, percentage }
   */
  const getProgress = async (checklistId) => {
    const response = await fetch(
      `/api/onboarding/checklists/${checklistId}/progress`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch progress: ${response.statusText}`);
    }

    const { data } = await response.json();
    return data;
  };

  /**
   * Get detailed checklist with employee and template info
   * @param {string} checklistId - Checklist ID
   * @returns {Promise<Object>} Detailed checklist
   */
  const getChecklistDetail = async (checklistId) => {
    const response = await fetch(
      `/api/onboarding/checklists/detail/${checklistId}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch checklist detail: ${response.statusText}`);
    }

    const { data } = await response.json();
    return data;
  };

  return {
    fetchTemplates,
    getChecklistForEmployee,
    assignTemplate,
    markItemComplete,
    getProgress,
    getChecklistDetail,
  };
}

export default useOnboarding;
