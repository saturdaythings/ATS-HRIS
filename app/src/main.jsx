import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import SidebarLayout from './layouts/SidebarLayout'
import './index.css'

// Pages — Core
import Dashboard from './pages/Dashboard'

// Pages — People
import Directory from './pages/people/Directory'
import Hiring from './pages/people/Hiring'
import Onboarding from './pages/people/Onboarding'
import Offboarding from './pages/people/Offboarding'

// Pages — Devices
import Inventory from './pages/devices/Inventory'
import Assignments from './pages/devices/Assignments'

// Pages — Workspace
import Reports from './pages/Reports'
import Search from './pages/Search'
import Tracks from './pages/Tracks'
import Settings from './pages/Settings'

// Pages — Admin
import CustomFields from './pages/admin/CustomFields'
import Templates from './pages/admin/Templates'
import AdminSettings from './pages/admin/Settings'
import FeatureRequests from './pages/admin/FeatureRequests'
import Health from './pages/admin/Health'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <SidebarLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/people/directory" element={<Directory />} />
          <Route path="/people/hiring" element={<Hiring />} />
          <Route path="/people/onboarding" element={<Onboarding />} />
          <Route path="/people/offboarding" element={<Offboarding />} />
          <Route path="/devices/inventory" element={<Inventory />} />
          <Route path="/devices/assignments" element={<Assignments />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/search" element={<Search />} />
          <Route path="/tracks" element={<Tracks />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/admin/custom-fields" element={<CustomFields />} />
          <Route path="/admin/templates" element={<Templates />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/feature-requests" element={<FeatureRequests />} />
          <Route path="/admin/health" element={<Health />} />
        </Routes>
      </SidebarLayout>
    </BrowserRouter>
  </React.StrictMode>,
)
