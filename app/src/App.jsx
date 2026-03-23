import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SidebarLayout from './layouts/SidebarLayout';
import ClaudeChat from './components/ClaudeChat';
import Dashboard from './pages/Dashboard';
import PeopleDirectory from './pages/people/Directory';
import PeopleHiring from './pages/people/Hiring';
import PeopleOnboarding from './pages/people/Onboarding';
import PeopleOffboarding from './pages/people/Offboarding';
import DevicesInventory from './pages/devices/Inventory';
import DevicesAssignments from './pages/devices/Assignments';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import AdminCustomFields from './pages/admin/CustomFields';
import AdminTemplates from './pages/admin/Templates';
import AdminSettings from './pages/admin/Settings';
import AdminFeatureRequests from './pages/admin/FeatureRequests';
import AdminHealth from './pages/admin/Health';

function App() {
  return (
    <Router>
      <SidebarLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/people/directory" element={<PeopleDirectory />} />
          <Route path="/people/hiring" element={<PeopleHiring />} />
          <Route path="/people/onboarding" element={<PeopleOnboarding />} />
          <Route path="/people/offboarding" element={<PeopleOffboarding />} />
          <Route path="/devices/inventory" element={<DevicesInventory />} />
          <Route path="/devices/assignments" element={<DevicesAssignments />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/admin/custom-fields" element={<AdminCustomFields />} />
          <Route path="/admin/templates" element={<AdminTemplates />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/feature-requests" element={<AdminFeatureRequests />} />
          <Route path="/admin/health" element={<AdminHealth />} />
        </Routes>
      </SidebarLayout>
      <ClaudeChat />
    </Router>
  );
}

export default App;
