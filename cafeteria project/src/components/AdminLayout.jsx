import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AdminLayout() {
  return (
    <div className="text-on-surface bg-surface min-h-screen flex relative">
      <Sidebar />
      <main className="flex-1 w-full md:ml-64 min-h-screen bg-surface overflow-x-hidden relative">
        <Topbar />
        <Outlet />
      </main>
    </div>
  );
}
