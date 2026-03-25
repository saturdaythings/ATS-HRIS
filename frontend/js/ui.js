/**
 * UI - User interface helper functions for common interactions
 * Handles tables, modals, panels, forms, editing, and event binding
 * All functions work with DOM elements without external dependencies
 */

class UI {
  /**
   * Initialize event listeners for page
   * Call this after page content is loaded
   */
  static initEvents() {
    // Table event delegation
    document.addEventListener('click', (e) => this.handleTableClick(e));
    document.addEventListener('change', (e) => this.handleFormChange(e));
    document.addEventListener('submit', (e) => this.handleFormSubmit(e));
  }

  /**
   * Handle table interactions (expand, sort, filter)
   * @private
   */
  static handleTableClick(e) {
    // Expand row
    if (e.target.closest('[data-toggle-row]')) {
      const button = e.target.closest('[data-toggle-row]');
      const rowId = button.dataset.toggleRow;
      this.toggleRow(rowId);
    }

    // Sort column
    if (e.target.closest('[data-sort-by]')) {
      const button = e.target.closest('[data-sort-by]');
      const column = button.dataset.sortBy;
      this.sortTable(button.closest('table'), column);
    }

    // Delete row
    if (e.target.closest('[data-delete-row]')) {
      const button = e.target.closest('[data-delete-row]');
      const rowId = button.dataset.deleteRow;
      if (confirm('Are you sure you want to delete this item?')) {
        button.closest('tr').remove();
        // Emit delete event for API handling
        window.dispatchEvent(new CustomEvent('rowDelete', {
          detail: { id: rowId }
        }));
      }
    }

    // Edit field
    if (e.target.closest('[data-edit-field]')) {
      const field = e.target.closest('[data-edit-field]');
      const rowId = field.dataset.rowId;
      const fieldName = field.dataset.editField;
      this.editField(field, rowId, fieldName);
    }
  }

  /**
   * Handle form changes
   * @private
   */
  static handleFormChange(e) {
    if (e.target.matches('[data-filter]')) {
      const table = e.target.closest('table');
      if (table) {
        const filterValue = e.target.value.toLowerCase();
        const filterColumn = e.target.dataset.filter;
        this.filterTable(table, filterColumn, filterValue);
      }
    }
  }

  /**
   * Handle form submission
   * @private
   */
  static handleFormSubmit(e) {
    if (e.target.matches('[data-form]')) {
      e.preventDefault();
      const form = e.target;
      const data = new FormData(form);
      const obj = Object.fromEntries(data);

      // Emit form event
      window.dispatchEvent(new CustomEvent('formSubmit', {
        detail: { formId: form.dataset.form, data: obj, form }
      }));
    }
  }

  /**
   * Toggle row expansion
   * @param {string} rowId - Row identifier
   */
  static toggleRow(rowId) {
    const button = document.querySelector(`[data-toggle-row="${rowId}"]`);
    const row = button.closest('tr');
    const detailRow = row.nextElementSibling;

    if (detailRow && detailRow.classList.contains('detail-row')) {
      detailRow.classList.toggle('visible');
      button.classList.toggle('expanded');

      // Update state
      const isExpanded = button.classList.contains('expanded');
      state.set(`ui.expandedRows.${rowId}`, isExpanded);
    }
  }

  /**
   * Expand specific row
   * @param {string} rowId
   */
  static expandRow(rowId) {
    const button = document.querySelector(`[data-toggle-row="${rowId}"]`);
    if (button && !button.classList.contains('expanded')) {
      this.toggleRow(rowId);
    }
  }

  /**
   * Collapse specific row
   * @param {string} rowId
   */
  static collapseRow(rowId) {
    const button = document.querySelector(`[data-toggle-row="${rowId}"]`);
    if (button && button.classList.contains('expanded')) {
      this.toggleRow(rowId);
    }
  }

  /**
   * Sort table by column
   * @param {HTMLTableElement} table
   * @param {string} column - Column name
   */
  static sortTable(table, column) {
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr:not(.detail-row)'));

    // Determine sort direction
    const header = table.querySelector(`[data-sort-by="${column}"]`);
    const currentDir = header.dataset.sortDir || 'asc';
    const newDir = currentDir === 'asc' ? 'desc' : 'asc';

    // Sort rows
    rows.sort((a, b) => {
      const aVal = a.querySelector(`[data-column="${column}"]`)?.textContent || '';
      const bVal = b.querySelector(`[data-column="${column}"]`)?.textContent || '';

      // Try numeric comparison
      const aNum = parseFloat(aVal);
      const bNum = parseFloat(bVal);

      if (!isNaN(aNum) && !isNaN(bNum)) {
        return newDir === 'asc' ? aNum - bNum : bNum - aNum;
      }

      // String comparison
      return newDir === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    });

    // Update DOM
    rows.forEach(row => tbody.appendChild(row));

    // Update header styling
    table.querySelectorAll('[data-sort-by]').forEach(h => {
      h.dataset.sortDir = h === header ? newDir : '';
      h.classList.remove('sort-asc', 'sort-desc');
      if (h === header) {
        h.classList.add(`sort-${newDir}`);
      }
    });
  }

  /**
   * Filter table rows
   * @param {HTMLTableElement} table
   * @param {string} column - Column name to filter
   * @param {string} query - Filter query (case-insensitive)
   */
  static filterTable(table, column, query) {
    const tbody = table.querySelector('tbody');
    const rows = tbody.querySelectorAll('tr:not(.detail-row)');

    rows.forEach(row => {
      const cell = row.querySelector(`[data-column="${column}"]`);
      if (!cell) return;

      const text = cell.textContent.toLowerCase();
      const matches = text.includes(query);

      row.style.display = matches ? '' : 'none';

      // Also hide corresponding detail row if filtered out
      const detailRow = row.nextElementSibling;
      if (detailRow && detailRow.classList.contains('detail-row')) {
        detailRow.style.display = matches ? '' : 'none';
      }
    });
  }

  /**
   * Make field editable inline
   * @param {HTMLElement} field
   * @param {string} rowId
   * @param {string} fieldName
   */
  static editField(field, rowId, fieldName) {
    const originalText = field.textContent;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = originalText;
    input.className = 'field-edit-input';

    const save = () => {
      const newValue = input.value;
      if (newValue !== originalText) {
        field.textContent = newValue;
        window.dispatchEvent(new CustomEvent('fieldUpdate', {
          detail: { rowId, fieldName, newValue }
        }));
      } else {
        field.textContent = originalText;
      }
    };

    const cancel = () => {
      field.textContent = originalText;
    };

    field.textContent = '';
    field.appendChild(input);
    input.focus();
    input.select();

    input.addEventListener('blur', save);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') save();
      if (e.key === 'Escape') cancel();
    });
  }

  /**
   * Open modal
   * @param {string} modalId - Modal element ID
   * @param {Object} data - Optional data to populate modal
   */
  static openModal(modalId, data = {}) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    // Populate form fields if data provided
    Object.entries(data).forEach(([key, value]) => {
      const input = modal.querySelector(`[name="${key}"]`);
      if (input) {
        input.value = value;
      }
    });

    modal.classList.add('active');
    modal.style.display = 'flex';

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    // Update state
    state.set(`ui.modals.${modalId}`, true);
  }

  /**
   * Close modal
   * @param {string} modalId - Modal element ID
   */
  static closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.classList.remove('active');
    modal.style.display = 'none';

    // Restore body scroll
    document.body.style.overflow = '';

    // Update state
    state.set(`ui.modals.${modalId}`, false);
  }

  /**
   * Toggle modal
   * @param {string} modalId
   */
  static toggleModal(modalId) {
    const isOpen = state.get(`ui.modals.${modalId}`);
    if (isOpen) {
      this.closeModal(modalId);
    } else {
      this.openModal(modalId);
    }
  }

  /**
   * Show confirmation dialog
   * @param {string} message - Confirmation message
   * @returns {Promise<boolean>}
   */
  static async confirm(message) {
    return new Promise((resolve) => {
      const id = `confirm-${Date.now()}`;
      const html = `
        <div id="${id}" class="modal" role="alertdialog">
          <div class="modal-content">
            <p>${message}</p>
            <div class="modal-buttons">
              <button class="btn btn-secondary" data-action="cancel">Cancel</button>
              <button class="btn btn-primary" data-action="confirm">Confirm</button>
            </div>
          </div>
        </div>
      `;

      document.body.insertAdjacentHTML('beforeend', html);
      const modal = document.getElementById(id);
      this.openModal(id);

      const handleAction = (action) => {
        this.closeModal(id);
        modal.remove();
        resolve(action === 'confirm');
      };

      modal.querySelector('[data-action="confirm"]').onclick = () => handleAction('confirm');
      modal.querySelector('[data-action="cancel"]').onclick = () => handleAction('cancel');
    });
  }

  /**
   * Show notification/toast
   * @param {string} message - Message text
   * @param {string} type - 'success', 'error', 'info', 'warning'
   * @param {number} duration - Auto-dismiss time in ms (0 = no auto-dismiss)
   */
  static notify(message, type = 'info', duration = 3000) {
    const id = `toast-${Date.now()}`;
    const html = `
      <div id="${id}" class="toast toast-${type}" role="status">
        <p>${message}</p>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', html);
    const toast = document.getElementById(id);

    if (duration > 0) {
      setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
      }, duration);
    }
  }

  /**
   * Show loading spinner
   * @param {boolean} show - Show or hide
   * @param {string} message - Optional message
   */
  static setLoading(show, message = 'Loading...') {
    let spinner = document.getElementById('app-spinner');

    if (show) {
      if (!spinner) {
        const html = `
          <div id="app-spinner" class="spinner-overlay">
            <div class="spinner"></div>
            <p>${message}</p>
          </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
        spinner = document.getElementById('app-spinner');
      } else {
        spinner.style.display = 'flex';
        spinner.querySelector('p').textContent = message;
      }
    } else if (spinner) {
      spinner.style.display = 'none';
    }
  }

  /**
   * Show error message
   * @param {string} message
   */
  static showError(message) {
    const id = `error-${Date.now()}`;
    const html = `
      <div id="${id}" class="error-banner" role="alert">
        <p>${message}</p>
        <button aria-label="Dismiss" onclick="this.parentElement.remove()">×</button>
      </div>
    `;

    const container = document.querySelector('main') || document.body;
    container.insertAdjacentHTML('afterbegin', html);
  }

  /**
   * Highlight table column
   * @param {HTMLTableElement} table
   * @param {string} column - Column name
   * @param {boolean} highlight - Highlight or unhighlight
   */
  static highlightColumn(table, column, highlight = true) {
    const cells = table.querySelectorAll(`[data-column="${column}"]`);
    cells.forEach(cell => {
      if (highlight) {
        cell.classList.add('highlighted');
      } else {
        cell.classList.remove('highlighted');
      }
    });
  }

  /**
   * Get form data from form element
   * @param {HTMLFormElement} form
   * @returns {Object}
   */
  static getFormData(form) {
    const data = new FormData(form);
    return Object.fromEntries(data);
  }

  /**
   * Populate form with data
   * @param {HTMLFormElement} form
   * @param {Object} data
   */
  static fillForm(form, data) {
    Object.entries(data).forEach(([key, value]) => {
      const input = form.querySelector(`[name="${key}"]`);
      if (input) {
        if (input.type === 'checkbox' || input.type === 'radio') {
          input.checked = value;
        } else {
          input.value = value;
        }
      }
    });
  }

  /**
   * Disable/enable form inputs
   * @param {HTMLFormElement} form
   * @param {boolean} disabled
   */
  static setFormDisabled(form, disabled) {
    form.querySelectorAll('input, select, textarea, button').forEach(el => {
      el.disabled = disabled;
    });
  }

  /**
   * Focus element
   * @param {string|HTMLElement} element - Selector or element
   */
  static focus(element) {
    const el = typeof element === 'string'
      ? document.querySelector(element)
      : element;

    if (el) {
      el.focus();
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  /**
   * Scroll to element
   * @param {string|HTMLElement} element - Selector or element
   */
  static scrollTo(element) {
    const el = typeof element === 'string'
      ? document.querySelector(element)
      : element;

    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }
}

// Initialize event listeners when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => UI.initEvents());
} else {
  UI.initEvents();
}
