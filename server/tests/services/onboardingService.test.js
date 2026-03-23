import {
  createTemplate,
  getTemplate,
  listTemplates,
  updateTemplate,
  deleteTemplate,
  createChecklistFromTemplate,
  getChecklist,
  getChecklistProgress,
  markItemComplete,
  listChecklistsByEmployee,
} from '../../services/onboardingService.js';
import { db } from '../../db.js';

describe('OnboardingService', () => {
  beforeEach(async () => {
    // Clean up test data
    await db.onboardingChecklistItem.deleteMany({});
    await db.onboardingChecklist.deleteMany({});
    await db.onboardingTemplate.deleteMany({});
    await db.employee.deleteMany({});
  });

  afterAll(async () => {
    await db.$disconnect();
  });

  // ============ Template Tests ============

  describe('createTemplate', () => {
    test('should create a template with items', async () => {
      const template = await createTemplate({
        name: 'Engineering Onboarding',
        role: 'Junior Engineer',
        items: [
          { task: 'Set up laptop', assignedTo: 'IT', daysUntilDue: 1 },
          { task: 'Complete security training', assignedTo: 'HR', daysUntilDue: 3 },
          { task: 'Meet with manager', assignedTo: 'Manager', daysUntilDue: 1 },
        ],
      });

      expect(template.id).toBeDefined();
      expect(template.name).toBe('Engineering Onboarding');
      expect(template.role).toBe('Junior Engineer');
      expect(template.items).toHaveLength(3);
      expect(template.items[0].task).toBe('Set up laptop');
      expect(template.items[0].assignedTo).toBe('IT');
    });

    test('should require name', async () => {
      await expect(
        createTemplate({
          role: 'Engineer',
          items: [],
        })
      ).rejects.toThrow('Template name is required');
    });

    test('should require role', async () => {
      await expect(
        createTemplate({
          name: 'Test',
          items: [],
        })
      ).rejects.toThrow('Role is required');
    });

    test('should allow empty items array', async () => {
      const template = await createTemplate({
        name: 'Empty Template',
        role: 'Test Role',
        items: [],
      });

      expect(template.items).toHaveLength(0);
    });

    test('should require task for each item', async () => {
      await expect(
        createTemplate({
          name: 'Test',
          role: 'Engineer',
          items: [{ assignedTo: 'HR', daysUntilDue: 3 }],
        })
      ).rejects.toThrow('Task is required for all items');
    });

    test('should require assignedTo for each item', async () => {
      await expect(
        createTemplate({
          name: 'Test',
          role: 'Engineer',
          items: [{ task: 'Setup', daysUntilDue: 3 }],
        })
      ).rejects.toThrow('Assigned to is required for all items');
    });

    test('should require daysUntilDue for each item', async () => {
      await expect(
        createTemplate({
          name: 'Test',
          role: 'Engineer',
          items: [{ task: 'Setup', assignedTo: 'IT' }],
        })
      ).rejects.toThrow('Days until due is required for all items');
    });

    test('should validate daysUntilDue is positive', async () => {
      await expect(
        createTemplate({
          name: 'Test',
          role: 'Engineer',
          items: [{ task: 'Setup', assignedTo: 'IT', daysUntilDue: -1 }],
        })
      ).rejects.toThrow('Days until due must be positive');
    });
  });

  describe('getTemplate', () => {
    test('should return template by id', async () => {
      const created = await createTemplate({
        name: 'Test Template',
        role: 'Engineer',
        items: [{ task: 'Setup', assignedTo: 'IT', daysUntilDue: 1 }],
      });

      const found = await getTemplate(created.id);

      expect(found.id).toBe(created.id);
      expect(found.name).toBe('Test Template');
      expect(found.items).toHaveLength(1);
    });

    test('should throw if template not found', async () => {
      await expect(getTemplate('nonexistent')).rejects.toThrow('not found');
    });
  });

  describe('listTemplates', () => {
    beforeEach(async () => {
      await createTemplate({
        name: 'Eng Template',
        role: 'Engineer',
        items: [],
      });

      await createTemplate({
        name: 'Design Template',
        role: 'Designer',
        items: [],
      });

      await createTemplate({
        name: 'Senior Eng',
        role: 'Engineer',
        items: [],
      });
    });

    test('should list all templates', async () => {
      const templates = await listTemplates();
      expect(templates).toHaveLength(3);
    });

    test('should filter by role', async () => {
      const templates = await listTemplates({ role: 'Engineer' });
      expect(templates).toHaveLength(2);
      expect(templates.every(t => t.role === 'Engineer')).toBe(true);
    });

    test('should return empty array if no templates match role', async () => {
      const templates = await listTemplates({ role: 'NonExistent' });
      expect(templates).toEqual([]);
    });

    test('should include items in response', async () => {
      const template = await createTemplate({
        name: 'Full Template',
        role: 'Developer',
        items: [
          { task: 'Task 1', assignedTo: 'HR', daysUntilDue: 1 },
          { task: 'Task 2', assignedTo: 'IT', daysUntilDue: 2 },
        ],
      });

      const templates = await listTemplates({ role: 'Developer' });
      expect(templates[0].items).toHaveLength(2);
    });
  });

  describe('updateTemplate', () => {
    test('should update template name', async () => {
      const template = await createTemplate({
        name: 'Original',
        role: 'Engineer',
        items: [],
      });

      const updated = await updateTemplate(template.id, {
        name: 'Updated Name',
      });

      expect(updated.name).toBe('Updated Name');
    });

    test('should update template role', async () => {
      const template = await createTemplate({
        name: 'Test',
        role: 'Engineer',
        items: [],
      });

      const updated = await updateTemplate(template.id, {
        role: 'Senior Engineer',
      });

      expect(updated.role).toBe('Senior Engineer');
    });

    test('should update items', async () => {
      const template = await createTemplate({
        name: 'Test',
        role: 'Engineer',
        items: [{ task: 'Old Task', assignedTo: 'HR', daysUntilDue: 1 }],
      });

      const updated = await updateTemplate(template.id, {
        items: [
          { task: 'New Task 1', assignedTo: 'IT', daysUntilDue: 2 },
          { task: 'New Task 2', assignedTo: 'Manager', daysUntilDue: 3 },
        ],
      });

      expect(updated.items).toHaveLength(2);
      expect(updated.items[0].task).toBe('New Task 1');
    });

    test('should throw if template not found', async () => {
      await expect(
        updateTemplate('nonexistent', { name: 'Test' })
      ).rejects.toThrow('not found');
    });

    test('should validate items if provided', async () => {
      const template = await createTemplate({
        name: 'Test',
        role: 'Engineer',
        items: [],
      });

      await expect(
        updateTemplate(template.id, {
          items: [{ task: 'Task', assignedTo: 'HR' }],
        })
      ).rejects.toThrow('Days until due is required');
    });
  });

  describe('deleteTemplate', () => {
    test('should soft-delete template', async () => {
      const template = await createTemplate({
        name: 'To Delete',
        role: 'Engineer',
        items: [],
      });

      // Update template to have an 'active' field (add if needed in schema)
      // For now, we'll just verify deletion doesn't throw
      await deleteTemplate(template.id);

      // Attempt to get should throw
      await expect(getTemplate(template.id)).rejects.toThrow('not found');
    });

    test('should throw if template not found', async () => {
      await expect(deleteTemplate('nonexistent')).rejects.toThrow('not found');
    });
  });

  // ============ Checklist Tests ============

  describe('createChecklistFromTemplate', () => {
    let employee;
    let template;

    beforeEach(async () => {
      // Create an employee
      employee = await db.employee.create({
        data: {
          name: 'John Doe',
          email: 'john@example.com',
          title: 'Engineer',
          department: 'Engineering',
          startDate: new Date(),
        },
      });

      // Create a template
      template = await createTemplate({
        name: 'Eng Onboarding',
        role: 'Engineer',
        items: [
          { task: 'Setup laptop', assignedTo: 'IT', daysUntilDue: 1 },
          { task: 'Security training', assignedTo: 'HR', daysUntilDue: 3 },
          { task: 'Meet manager', assignedTo: 'Manager', daysUntilDue: 1 },
        ],
      });
    });

    test('should create checklist with items from template', async () => {
      const checklist = await createChecklistFromTemplate(employee.id, template.id);

      expect(checklist.id).toBeDefined();
      expect(checklist.employeeId).toBe(employee.id);
      expect(checklist.templateId).toBe(template.id);
      expect(checklist.status).toBe('active');
      expect(checklist.items).toHaveLength(3);
      expect(checklist.items[0].task).toBe('Setup laptop');
      expect(checklist.items[0].completed).toBe(false);
    });

    test('should calculate dueDate correctly', async () => {
      const beforeChecklistCreate = new Date();
      const checklist = await createChecklistFromTemplate(employee.id, template.id);

      // Items should have dueDate set
      const item1 = checklist.items[0];
      const item2 = checklist.items[1];

      // Verify items have valid due dates (should be in the future)
      expect(item1.dueDate).toBeDefined();
      expect(item2.dueDate).toBeDefined();
      expect(item1.dueDate.getTime()).toBeGreaterThanOrEqual(beforeChecklistCreate.getTime());
      expect(item2.dueDate.getTime()).toBeGreaterThanOrEqual(beforeChecklistCreate.getTime());
    });

    test('should throw if employee not found', async () => {
      await expect(
        createChecklistFromTemplate('nonexistent', template.id)
      ).rejects.toThrow('Employee not found');
    });

    test('should throw if template not found', async () => {
      await expect(
        createChecklistFromTemplate(employee.id, 'nonexistent')
      ).rejects.toThrow('Template not found');
    });

    test('should create checklist even if template has no items', async () => {
      const emptyTemplate = await createTemplate({
        name: 'Empty',
        role: 'Test',
        items: [],
      });

      const checklist = await createChecklistFromTemplate(
        employee.id,
        emptyTemplate.id
      );

      expect(checklist.items).toHaveLength(0);
    });
  });

  describe('getChecklist', () => {
    let employee;
    let checklist;

    beforeEach(async () => {
      employee = await db.employee.create({
        data: {
          name: 'Jane Doe',
          email: 'jane@example.com',
          title: 'Designer',
          department: 'Design',
          startDate: new Date(),
        },
      });

      const template = await createTemplate({
        name: 'Design Onboarding',
        role: 'Designer',
        items: [{ task: 'Setup tools', assignedTo: 'IT', daysUntilDue: 1 }],
      });

      checklist = await createChecklistFromTemplate(employee.id, template.id);
    });

    test('should return checklist by id', async () => {
      const found = await getChecklist(checklist.id);

      expect(found.id).toBe(checklist.id);
      expect(found.employeeId).toBe(employee.id);
      expect(found.items).toHaveLength(1);
    });

    test('should throw if checklist not found', async () => {
      await expect(getChecklist('nonexistent')).rejects.toThrow('not found');
    });
  });

  describe('listChecklistsByEmployee', () => {
    let employee;

    beforeEach(async () => {
      employee = await db.employee.create({
        data: {
          name: 'Bob Smith',
          email: 'bob@example.com',
          title: 'Engineer',
          department: 'Engineering',
          startDate: new Date(),
        },
      });

      const template1 = await createTemplate({
        name: 'Eng Onboarding',
        role: 'Engineer',
        items: [{ task: 'Setup', assignedTo: 'IT', daysUntilDue: 1 }],
      });

      const template2 = await createTemplate({
        name: 'Security Training',
        role: 'All',
        items: [{ task: 'Training', assignedTo: 'HR', daysUntilDue: 5 }],
      });

      await createChecklistFromTemplate(employee.id, template1.id);
      await createChecklistFromTemplate(employee.id, template2.id);
    });

    test('should list all checklists for an employee', async () => {
      const checklists = await listChecklistsByEmployee(employee.id);

      expect(checklists).toHaveLength(2);
      expect(checklists.every(c => c.employeeId === employee.id)).toBe(true);
    });

    test('should throw if employee not found', async () => {
      await expect(
        listChecklistsByEmployee('nonexistent')
      ).rejects.toThrow('Employee not found');
    });
  });

  describe('getChecklistProgress', () => {
    let employee;
    let template;
    let checklist;

    beforeEach(async () => {
      employee = await db.employee.create({
        data: {
          name: 'Alice Johnson',
          email: 'alice@example.com',
          title: 'Manager',
          department: 'Management',
          startDate: new Date(),
        },
      });

      template = await createTemplate({
        name: 'Manager Onboarding',
        role: 'Manager',
        items: [
          { task: 'Task 1', assignedTo: 'HR', daysUntilDue: 1 },
          { task: 'Task 2', assignedTo: 'HR', daysUntilDue: 2 },
          { task: 'Task 3', assignedTo: 'HR', daysUntilDue: 3 },
          { task: 'Task 4', assignedTo: 'HR', daysUntilDue: 4 },
        ],
      });

      checklist = await createChecklistFromTemplate(employee.id, template.id);
    });

    test('should return progress with 0 completed items', async () => {
      const progress = await getChecklistProgress(checklist.id);

      expect(progress.total).toBe(4);
      expect(progress.completed).toBe(0);
      expect(progress.percentage).toBe(0);
    });

    test('should return progress with some completed items', async () => {
      const items = checklist.items.slice(0, 2);
      await markItemComplete(items[0].id, 'alice@example.com');
      await markItemComplete(items[1].id, 'alice@example.com');

      const progress = await getChecklistProgress(checklist.id);

      expect(progress.total).toBe(4);
      expect(progress.completed).toBe(2);
      expect(progress.percentage).toBe(50);
    });

    test('should return 100% when all items completed', async () => {
      for (const item of checklist.items) {
        await markItemComplete(item.id, 'alice@example.com');
      }

      const progress = await getChecklistProgress(checklist.id);

      expect(progress.total).toBe(4);
      expect(progress.completed).toBe(4);
      expect(progress.percentage).toBe(100);
    });

    test('should return 0% for empty checklist', async () => {
      const emptyTemplate = await createTemplate({
        name: 'Empty',
        role: 'Empty',
        items: [],
      });

      const emptyChecklist = await createChecklistFromTemplate(
        employee.id,
        emptyTemplate.id
      );

      const progress = await getChecklistProgress(emptyChecklist.id);

      expect(progress.total).toBe(0);
      expect(progress.completed).toBe(0);
      expect(progress.percentage).toBe(0);
    });

    test('should throw if checklist not found', async () => {
      await expect(
        getChecklistProgress('nonexistent')
      ).rejects.toThrow('not found');
    });
  });

  describe('markItemComplete', () => {
    let employee;
    let checklist;
    let item;

    beforeEach(async () => {
      employee = await db.employee.create({
        data: {
          name: 'Charlie Brown',
          email: 'charlie@example.com',
          title: 'Developer',
          department: 'Engineering',
          startDate: new Date(),
        },
      });

      const template = await createTemplate({
        name: 'Dev Onboarding',
        role: 'Developer',
        items: [
          { task: 'Setup dev env', assignedTo: 'IT', daysUntilDue: 1 },
          { task: 'Review code', assignedTo: 'Manager', daysUntilDue: 3 },
        ],
      });

      checklist = await createChecklistFromTemplate(employee.id, template.id);
      item = checklist.items[0];
    });

    test('should mark item complete', async () => {
      const updated = await markItemComplete(item.id, 'charlie@example.com');

      expect(updated.completed).toBe(true);
      expect(updated.completedAt).toBeDefined();
      expect(updated.completedBy).toBe('charlie@example.com');
    });

    test('should set completedAt timestamp', async () => {
      const before = new Date();
      const updated = await markItemComplete(item.id, 'charlie@example.com');
      const after = new Date();

      expect(updated.completedAt >= before).toBe(true);
      expect(updated.completedAt <= after).toBe(true);
    });

    test('should allow marking already completed item again', async () => {
      await markItemComplete(item.id, 'charlie@example.com');
      const updated = await markItemComplete(item.id, 'different@example.com');

      expect(updated.completed).toBe(true);
      expect(updated.completedBy).toBe('different@example.com');
    });

    test('should throw if item not found', async () => {
      await expect(
        markItemComplete('nonexistent', 'charlie@example.com')
      ).rejects.toThrow('not found');
    });

    test('should throw if completedBy not provided', async () => {
      await expect(
        markItemComplete(item.id, null)
      ).rejects.toThrow('completedBy is required');
    });
  });
});
