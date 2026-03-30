import { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';

export default function CafeteriaLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const cafeteriaDataString = localStorage.getItem('cafeteriaData');
  const cafeteria = cafeteriaDataString ? JSON.parse(cafeteriaDataString) : { name: 'Staff Portal', location: '' };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out of the Staff Portal?')) {
      localStorage.removeItem('cafeteriaToken');
      localStorage.removeItem('cafeteriaData');
      navigate('/cafeteria/login');
    }
  };

  const links = [
    { name: 'Dashboard', path: '/cafeteria/dashboard', icon: 'dashboard' },
    { name: 'Orders', path: '/cafeteria/orders', icon: 'receipt_long' },
    { name: 'Menu', path: '/cafeteria/menu', icon: 'restaurant_menu' },
    { name: 'History', path: '/cafeteria/history', icon: 'history' },
    { name: 'Payments', path: '/cafeteria/payments', icon: 'payments' },
    { name: 'Profile', path: '/cafeteria/profile', icon: 'account_circle' },
  ];

  return (
    <div className="flex min-h-screen bg-surface text-on-surface font-['Manrope']">
      {/* Mobile Overlay */}
      <div 
        className={`md:hidden fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setMobileMenuOpen(false)}
      ></div>

      {/* Sidebar */}
      <aside className={`h-screen w-64 fixed left-0 top-0 z-50 bg-[#1A1A2B] flex-col py-6 transition-transform duration-300 md:translate-x-0 flex ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="px-6 mb-8">
          <h1 className="text-lg font-extrabold text-on-surface">COMSTAS Cafe</h1>
          <p className="text-xs text-on-surface-variant opacity-80 uppercase tracking-widest mt-0.5">Staff Portal</p>
        </div>

        <nav className="flex-1 px-2 space-y-1">
          {links.map(link => {
            const isActive = location.pathname.startsWith(link.path);
            return (
              <Link
                key={link.name}
                to={link.path}
                className={isActive
                  ? 'bg-[#FF6B35]/15 text-[#FFB59D] rounded-lg flex items-center space-x-3 p-3 transition-all'
                  : 'text-[#E1BFB5] hover:bg-[#38374A]/20 rounded-lg flex items-center space-x-3 p-3 transition-all duration-200'
                }
              >
                <span className="material-symbols-outlined" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>{link.icon}</span>
                <span className={isActive ? 'font-semibold' : ''}>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-2 pt-4 border-t border-outline-variant/10">
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-primary-container/20 border border-primary/20 flex items-center justify-center text-primary/70 flex-shrink-0">
                <span className="material-symbols-outlined text-lg">restaurant</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-on-surface truncate max-w-[110px]" title={cafeteria.name}>{cafeteria.name}</p>
                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant/60">Staff</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="w-8 h-8 rounded-full bg-error-container/20 text-error flex items-center justify-center hover:bg-error hover:text-on-error transition-colors flex-shrink-0"
            >
              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 md:ml-64 min-h-screen w-full">
        {/* Topbar */}
        <header className="bg-[#1E1E2F]/90 backdrop-blur-xl fixed top-0 w-full md:w-[calc(100%-16rem)] z-30 h-16 flex items-center justify-between px-4 md:px-8 border-b border-outline-variant/5 shadow-[0_8px_32px_rgba(12,12,29,0.5)]">
          <div className="flex items-center gap-3">
            <button className="md:hidden text-on-surface hover:text-primary transition-colors p-2 -ml-2" onClick={() => setMobileMenuOpen(true)}>
              <span className="material-symbols-outlined mt-1">menu</span>
            </button>
            <span className="text-lg font-bold text-on-surface">
              {links.find(l => location.pathname.startsWith(l.path))?.name || 'Portal'}
              <span className="ml-2 text-sm font-medium text-on-surface-variant opacity-60 hidden sm:inline">| Staff Portal</span>
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <button className="p-2 text-on-surface-variant hover:bg-surface-container-highest rounded-full transition-all">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <Link to="/cafeteria/profile" className="p-2 text-on-surface-variant hover:bg-surface-container-highest rounded-full transition-all" title="Settings">
              <span className="material-symbols-outlined">settings</span>
            </Link>
          </div>
        </header>

        <div className="pt-16">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
