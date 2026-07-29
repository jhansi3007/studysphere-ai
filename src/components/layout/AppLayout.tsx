import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { Breadcrumb } from '@/components/Breadcrumb';
import { KeepAliveOutlet } from '@/components/KeepAliveOutlet';

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen mesh-bg flex">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
            <Breadcrumb showBack />
            <div key={location.pathname} className="animate-fade-in">
              <KeepAliveOutlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
