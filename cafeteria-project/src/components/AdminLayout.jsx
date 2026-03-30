import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AdminLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="text-on-surface bg-surface min-h-screen flex relative">
      <Sidebar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      <main className="flex-1 w-full md:ml-64 min-h-screen bg-surface overflow-x-hidden relative">
        <Topbar setMobileMenuOpen={setMobileMenuOpen} />
        <Outlet />
      </main>
    </div>
  );
}
