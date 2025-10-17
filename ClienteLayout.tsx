import React, { useState } from 'react';
import ClienteSidebar from './ClienteSidebar';
import ClienteHeader from './ClienteHeader';

interface ClienteLayoutProps {
  children: React.ReactNode;
}

const ClienteLayout: React.FC<ClienteLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen">
      <div className="flex h-screen overflow-hidden">
        <ClienteSidebar isMobileOpen={sidebarOpen} onToggle={toggleSidebar} />
        
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-72">
          <ClienteHeader onMenuToggle={toggleSidebar} />
          
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default ClienteLayout;
