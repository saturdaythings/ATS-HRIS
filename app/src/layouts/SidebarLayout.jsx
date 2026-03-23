import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import RightPanel from '../components/RightPanel';

export default function SidebarLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedDetail, setSelectedDetail] = useState(null);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      {/* Detail panel */}
      <RightPanel detail={selectedDetail} onClose={() => setSelectedDetail(null)} />
    </div>
  );
}
