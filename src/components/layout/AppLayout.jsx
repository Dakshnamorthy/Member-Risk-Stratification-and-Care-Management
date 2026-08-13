import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import '../../styles/layout.css';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleMenuClick = () => setSidebarOpen((prev) => !prev);
  const handleSidebarClose = () => setSidebarOpen(false);

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={handleSidebarClose} />
      <Header onMenuClick={handleMenuClick} />

      <main className="app-layout__main">
        <div className="app-layout__content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
