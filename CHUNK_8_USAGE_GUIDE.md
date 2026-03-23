# Chunk-8 Usage Guide: Employee Directory & Onboarding Viewer

## Quick Start

### For End Users

1. **Access Directory**
   ```
   Navigate to: People menu → Directory
   URL: /people/directory
   ```

2. **View Employees**
   - All employees display in a table with: Name, Email, Title, Department, Status, Start Date
   - Status badges show color-coded indicators

3. **Search Employees**
   - Type in "Search by name or email..." box
   - Results update in real-time as you type
   - Case-insensitive matching on both fields

4. **Filter Employees**
   - **Department:** Select from dropdown showing count (e.g., "Engineering (5)")
   - **Status:** Choose All, Active, Inactive, or Onboarding
   - Filters combine with AND logic (both must match)

5. **View Employee Details**
   - Click any employee row to open side panel
   - Panel slides in from right side of screen
   - Shows employee name, email, status badges

6. **Check Onboarding Progress**
   - Click "Onboarding" tab in detail panel
   - See progress bar showing X/Y tasks completed
   - View all onboarding tasks with:
     - Task name
     - Assigned to (HR, IT, Manager, etc.)
     - Current status (Done/Pending)
     - Notes if applicable
   - Check checkbox to mark task complete (sends to API)

7. **View Other Employee Info**
   - **Overview:** See all employee details, edit mode available
   - **Devices:** See assigned MacBooks, iPhones, etc. with serial numbers
   - **Activity:** View timeline of employee actions (created, onboarded, etc.)

8. **Close Detail Panel**
   - Click X button in top right of panel
   - Or click overlay background

---

## For Developers

### Component Architecture

```
Directory.jsx (main page)
├── useEmployees hook (data fetching)
├── Filter section (search, department, status)
├── Employee table (displaying employees)
└── EmployeeDetailPanel (detail view)
    ├── Overview tab
    ├── Onboarding tab
    ├── Devices tab
    └── History tab
```

### Using the useEmployees Hook

```javascript
import { useEmployees } from '@/hooks/useEmployees';

function MyComponent() {
  const {
    employees,        // Array of employee objects
    loading,          // Boolean - true while fetching
    error,            // String - error message if any
    fetchEmployees,   // Function to fetch employees
    searchEmployees,  // Function to search locally
    filterByDepartment, // Function to filter by dept
    filterByStatus,   // Function to filter by status
    getDepartments,   // Function to get unique depts
    getCountByDepartment, // Function to count by dept
    getEmployee,      // Function to fetch single employee
    updateEmployee,   // Function to update employee
    getOnboardingChecklist, // Fetch onboarding checklist
    markChecklistItemComplete, // Mark task as done
    getEmployeeDevices, // Get assigned devices
    getEmployeeActivities, // Get activity log
  } = useEmployees();

  // Fetch all employees on component mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Fetch with filters
  const handleSearch = (term) => {
    fetchEmployees({ searchTerm: term });
  };

  // Update employee
  const updateTitle = async (employeeId, newTitle) => {
    await updateEmployee(employeeId, { title: newTitle });
  };

  // Get local filtered list
  const engineeringOnly = filterByDepartment('Engineering');

  // Mark onboarding item complete
  const completeTask = async (checklistId, itemId) => {
    await markChecklistItemComplete(checklistId, itemId, true);
  };
}
```

### Hook API Reference

#### fetchEmployees(filters)
Fetch employees from API with optional filters.

```javascript
// Fetch all employees
await fetchEmployees();

// Fetch with filters
await fetchEmployees({
  department: 'Engineering',
  status: 'active',
  searchTerm: 'John'
});
```

**Returns:** Promise resolving to `{ employees: [...] }` or array

**Query Params:**
- `department` - Filter by department name (string)
- `status` - Filter by status: 'active', 'inactive', 'onboarding'
- `searchTerm` - Search parameter (mapped to `search` query param)

---

#### getEmployee(id)
Fetch detailed employee by ID.

```javascript
const employee = await getEmployee('123');
// Returns: { id, name, email, title, department, ... }
```

---

#### updateEmployee(id, updates)
Update employee fields.

```javascript
await updateEmployee('123', {
  title: 'Senior Engineer',
  department: 'Engineering',
  manager: 'Jane Doe'
});
```

**Supported Fields:**
- name
- email
- title
- department
- startDate
- status
- manager

---

#### searchEmployees(searchTerm)
Local search filter (no API call).

```javascript
// Returns filtered array of employees
const results = searchEmployees('john');
// Searches: name and email fields (case-insensitive)
```

---

#### filterByDepartment(department)
Local filter by department (no API call).

```javascript
const engineering = filterByDepartment('Engineering');
// Returns array of engineers
```

---

#### filterByStatus(status)
Local filter by status (no API call).

```javascript
const active = filterByStatus('active');
// Returns array of active employees
```

---

#### getDepartments()
Get unique list of departments (no API call).

```javascript
const depts = getDepartments();
// Returns: ['Design', 'Engineering', 'Product'] (sorted)
```

---

#### getCountByDepartment()
Get employee count by department (no API call).

```javascript
const counts = getCountByDepartment();
// Returns: { Engineering: 5, Design: 3, Product: 2 }
```

---

#### getOnboardingChecklist(employeeId)
Fetch onboarding checklist for employee.

```javascript
const checklist = await getOnboardingChecklist('123');
// Returns: { id, employeeId, items: [...], progress: X% }
```

**Item Structure:**
```javascript
{
  id: 'item-1',
  task: 'Send welcome email',
  assignedTo: 'HR',
  dueDate: '2024-02-15',
  completed: true,
  notes: 'Sent on first day'
}
```

---

#### markChecklistItemComplete(checklistId, itemId, completed)
Mark onboarding task as complete/incomplete.

```javascript
// Mark complete
await markChecklistItemComplete('check-1', 'item-1', true);

// Mark incomplete
await markChecklistItemComplete('check-1', 'item-1', false);
```

---

#### getEmployeeDevices(employeeId)
Get devices assigned to employee.

```javascript
const devices = await getEmployeeDevices('123');
// Returns: [
//   { id, type: 'MacBook Pro', serial: 'ABC123', status: 'active' },
//   { id, type: 'iPhone 15', serial: 'XYZ789', status: 'active' }
// ]
```

---

#### getEmployeeActivities(employeeId)
Get activity timeline for employee.

```javascript
const activities = await getEmployeeActivities('123');
// Returns: [
//   { id, action: 'Employee created', timestamp: Date },
//   { id, action: 'Onboarding started', timestamp: Date }
// ]
```

---

### Component Props (EmployeeDetailPanel)

```javascript
<EmployeeDetailPanel
  employee={{           // Required - employee object
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    title: 'Engineer',
    department: 'Engineering',
    startDate: '2024-01-15',
    status: 'active',
    manager: 'Jane Manager'
  }}
  isOpen={true}         // Required - boolean to show/hide panel
  onClose={() => {}}    // Required - callback when close button clicked
/>
```

---

### Directory Page State Management

```javascript
// State variables
const [selectedEmployee, setSelectedEmployee] = useState(null);
const [isPanelOpen, setIsPanelOpen] = useState(false);
const [searchTerm, setSearchTerm] = useState('');
const [selectedDepartment, setSelectedDepartment] = useState('');
const [selectedStatus, setSelectedStatus] = useState('');
const [displayedEmployees, setDisplayedEmployees] = useState([]);

// Effects
useEffect(() => {
  fetchEmployees(); // Fetch on mount
}, [fetchEmployees]);

useEffect(() => {
  // Apply all filters to get displayed employees
  let filtered = employees;
  if (searchTerm) filtered = searchEmployees(searchTerm);
  if (selectedDepartment) filtered = filtered.filter(e => e.department === selectedDepartment);
  if (selectedStatus) filtered = filtered.filter(e => e.status === selectedStatus);
  setDisplayedEmployees(filtered);
}, [employees, searchTerm, selectedDepartment, selectedStatus, searchEmployees]);
```

---

## Testing

### Run Tests
```bash
npm test -- --testPathPattern="Directory|useEmployees"
```

### Coverage Report
```bash
npm test -- --testPathPattern="Directory|useEmployees" --coverage
```

### Individual Test Files
```bash
# Hook tests only
npm test -- app/src/__tests__/hooks/useEmployees.test.js

# Page tests only
npm test -- app/src/__tests__/pages/Directory.test.jsx
```

---

## Design System

### Colors Used

| Usage | Tailwind Class | Color | Hex |
|-------|---|---|---|
| Primary Active | `text-purple-600` | Purple | #7c3aed |
| Primary Border | `border-purple-600` | Purple | #7c3aed |
| Active Status | `bg-green-100` / `text-green-700` | Green | #dcfce7 / #15803d |
| Inactive Status | `bg-gray-100` / `text-gray-700` | Gray | #f3f4f6 / #374151 |
| Onboarding Status | `bg-blue-100` / `text-blue-700` | Blue | #dbeafe / #1d4ed8 |
| Hover | `hover:bg-gray-50` | Light Gray | #f9fafb |
| Background | `bg-white` / `bg-gray-50` | White/Gray | #ffffff / #f9fafb |
| Border | `border-gray-200` / `border-gray-100` | Gray | #e5e7eb / #f3f4f6 |

### Responsive Breakpoints

| Screen | Grid | Panel | Notes |
|--------|------|-------|-------|
| Mobile (<768px) | 1 column | Full-screen | Stacked vertically |
| Tablet (768px+) | 3 columns | Side panel (right 40%) | Side-by-side layout |

---

## Troubleshooting

### No Employees Display
1. Check if API is running on localhost:3001
2. Verify `/api/employees` endpoint is implemented
3. Check browser console for network errors
4. Ensure employees exist in database

### Search/Filter Not Working
1. Make sure hook methods are called correctly
2. Verify filters are passed to `fetchEmployees()`
3. Check that `displayedEmployees` state is updated

### Detail Panel Not Opening
1. Verify `isPanelOpen` state is being set to true
2. Check that `selectedEmployee` is not null
3. Ensure `EmployeeDetailPanel` is imported

### Onboarding Tab Empty
1. Verify `/api/onboarding/checklists?employeeId=X` endpoint exists
2. Check that checklist items have required fields
3. Ensure `getOnboardingChecklist` is called when panel opens

---

## Performance Considerations

### Optimization Tips
1. **Search:** Debounce search input to reduce renders
   ```javascript
   const [searchTerm, setSearchTerm] = useState('');
   const debouncedSearch = useCallback(
     debounce((term) => setSearchTerm(term), 300),
     []
   );
   ```

2. **Pagination:** Add pagination for large employee lists
   ```javascript
   const [page, setPage] = useState(1);
   const PAGE_SIZE = 25;
   const start = (page - 1) * PAGE_SIZE;
   const paginatedEmployees = displayedEmployees.slice(start, start + PAGE_SIZE);
   ```

3. **Memoization:** Memoize expensive computations
   ```javascript
   const departments = useMemo(() => getDepartments(), [employees]);
   ```

---

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## Dependencies

### External Libraries
- React 18+
- React Hooks (useState, useEffect, useCallback)
- Fetch API (or polyfill)

### Internal Components
- EmployeeDetailPanel (from Chunk-6)
- Badge (common component)
- ProgressBar (common component)
- Timeline (common component)

---

## Future Enhancements

1. **Bulk Operations**
   - Multi-select employees
   - Bulk status updates
   - Bulk department reassignment

2. **Advanced Filtering**
   - Date range (hire date)
   - Manager filter
   - Custom fields

3. **Export/Reporting**
   - CSV export
   - PDF reports
   - Department analytics

4. **Integrations**
   - Org chart visualization
   - Manager hierarchy
   - Direct report lists

5. **Mobile App**
   - React Native version
   - Offline support
   - Push notifications

---

## Support & Contact

For questions or issues, refer to:
- `/CHUNK_8_COMPLETION_REPORT.md` - Detailed technical report
- Test files for usage examples
- Hook documentation in code comments

---

*Generated: March 23, 2026 | Claude Haiku 4.5 | V.Two Ops Implementation*
