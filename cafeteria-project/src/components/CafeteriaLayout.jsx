import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { NotificationProvider } from '../context/NotificationContext';
import NotificationBell from './notifications/NotificationBell';
import { fetchCafeteriaSpecials } from '../utils/specialsApi';

export default function CafeteriaLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [specialsBadge, setSpecialsBadge] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  const [cafeteria, setCafeteria] = useState(() => {
    try {
      const data = localStorage.getItem('cafeteriaData');
      return data
        ? JSON.parse(data)
        : { name: 'Staff Portal', location: '', profile_picture: null };
    } catch {
      localStorage.removeItem('cafeteriaData');
      return { name: 'Staff Portal', location: '', profile_picture: null };
    }
  });

  useEffect(() => {
    const handleStorage = () => {
      const data = localStorage.getItem('cafeteriaData');
      if (data) setCafeteria(JSON.parse(data));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    fetchCafeteriaSpecials(undefined, 'active')
      .then((rows) => setSpecialsBadge(Array.isArray(rows) ? rows.length : 0))
      .catch(() => setSpecialsBadge(0));
  }, [location.pathname]);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out of the Staff Portal?')) {
      localStorage.removeItem('cafeteriaToken');
      localStorage.removeItem('cafeteriaData');
      const isPWA = window.matchMedia('(display-mode: standalone)').matches;
      navigate(isPWA ? '/welcome' : '/cafeteria/login');
    }
  };

  const links = [
    { name: 'Dashboard', path: '/cafeteria/dashboard', icon: 'dashboard' },
    { name: 'Analytics', path: '/cafeteria/analytics', icon: 'bar_chart' },
    { name: 'Orders', path: '/cafeteria/orders', icon: 'receipt_long' },
    { name: 'Menu', path: '/cafeteria/menu', icon: 'restaurant_menu' },
    { name: 'Daily Specials', path: '/cafeteria/specials', icon: 'campaign', badge: specialsBadge },
    { name: 'Deals', path: '/cafeteria/deals', icon: 'local_offer' },
    { name: 'Ratings & Reviews', path: '/cafeteria/ratings', icon: 'star' },
    { name: 'History', path: '/cafeteria/history', icon: 'history' },
    { name: 'Payments', path: '/cafeteria/payments', icon: 'payments' },
    { name: 'Profile', path: '/cafeteria/profile', icon: 'account_circle' },
  ];

  const cafeteriaId = cafeteria?.id;

  return (
    <NotificationProvider role="cafeteria" recipientId={cafeteriaId}>
    <div className="flex min-h-screen bg-surface text-on-surface font-['Manrope']">
      {/* Mobile Overlay */}
      <div 
        className={`md:hidden fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setMobileMenuOpen(false)}
      ></div>

      {/* Sidebar */}
      <aside className={`w-64 fixed left-0 top-14 sm:top-16 h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] z-40 bg-[#1A1A2B] flex-col py-6 transition-transform duration-300 md:translate-x-0 md:top-0 md:h-screen flex ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
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
                <span className={`flex-1 ${isActive ? 'font-semibold' : ''}`}>{link.name}</span>
                {link.badge > 0 && (
                  <span className="bg-rose-500/20 text-rose-300 text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[1.25rem] text-center">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="px-2 pt-4 border-t border-outline-variant/10">
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-10 h-10 rounded-full border-2 border-primary/20 flex items-center justify-center overflow-hidden flex-shrink-0 bg-surface-container-highest">
                {cafeteria.profile_picture ? (
                   ['.mp4', '.webm', '.ogg', '.mov'].some(ext => cafeteria.profile_picture.toLowerCase().split('?')[0].endsWith(ext)) ? (
                    <video src={cafeteria.profile_picture} className="w-full h-full object-cover" autoPlay muted loop />
                  ) : (
                    <img src={cafeteria.profile_picture} className="w-full h-full object-cover" alt={`${cafeteria.name || 'Cafeteria'} staff profile`} loading="lazy" decoding="async" />
                  )
                ) : (
                  <span className="material-symbols-outlined text-primary/70">restaurant</span>
                )}
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
      <main className="flex-1 md:ml-64 min-h-screen w-full overflow-x-hidden">
        {/* Topbar */}
        <header className="bg-[#1E1E2F] fixed top-0 w-full md:w-[calc(100%-16rem)] z-[60] h-14 sm:h-16 flex items-center justify-between gap-2 px-2 sm:px-4 md:px-8 border-b border-outline-variant/5 shadow-[0_8px_32px_rgba(12,12,29,0.5)] overflow-visible">
          <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 flex-1">
            <button
              type="button"
              className="md:hidden shrink-0 text-on-surface hover:text-primary transition-colors p-1.5 -ml-1 rounded-lg relative z-[61]"
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              <span className="material-symbols-outlined text-[22px]">{mobileMenuOpen ? 'close' : 'menu'}</span>
            </button>
            <span className="text-sm sm:text-lg font-bold text-on-surface truncate">
              {links.find(l => location.pathname.startsWith(l.path))?.name || 'Portal'}
              <span className="ml-1 sm:ml-2 text-xs sm:text-sm font-medium text-on-surface-variant opacity-60 hidden sm:inline">| Staff</span>
            </span>
          </div>
          <div className="flex items-center gap-0.5 sm:gap-2 shrink-0">
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>
            <NotificationBell />
            <Link to="/cafeteria/profile" className="flex items-center group p-1 sm:pr-3 rounded-lg hover:bg-surface-container-highest transition-all" aria-label="Profile">
              <div className="w-8 h-8 rounded-full border border-outline-variant/30 overflow-hidden bg-surface-container flex items-center justify-center shrink-0">
                 {cafeteria.profile_picture ? (
                   ['.mp4', '.webm', '.ogg', '.mov'].some(ext => cafeteria.profile_picture.toLowerCase().split('?')[0].endsWith(ext)) ? (
                    <video src={cafeteria.profile_picture} className="w-full h-full object-cover" autoPlay muted loop />
                  ) : (
                    <img src={cafeteria.profile_picture} className="w-full h-full object-cover" alt={`${cafeteria.name || 'Cafeteria'} staff profile`} loading="lazy" decoding="async" />
                  )
                ) : (
                  <span className="material-symbols-outlined text-sm">person</span>
                )}
              </div>
              <span className="text-xs font-bold text-on-surface-variant group-hover:text-primary transition-colors hidden sm:block">Settings</span>
            </Link>
          </div>
        </header>

        <div className="pt-14 sm:pt-16 px-3 sm:px-0 pb-16 md:pb-0 mobile-compact">
          <Outlet />
        </div>
      </main>

      {/* ── MOBILE BOTTOM NAV — md:hidden, desktop unaffected ── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
        style={{ background: '#1A1A2B', borderTop: '0.5px solid rgba(255,255,255,0.06)', height: 56 }}
      >
        <div className="flex h-full">
          {[
            { path: '/cafeteria/dashboard',  icon: 'dashboard',       label: 'Home'     },
            { path: '/cafeteria/orders',     icon: 'receipt_long',    label: 'Orders'   },
            { path: '/cafeteria/menu',       icon: 'restaurant_menu', label: 'Menu'     },
            { path: '/cafeteria/analytics',  icon: 'bar_chart',       label: 'Stats'    },
            { path: '/cafeteria/profile',    icon: 'account_circle',  label: 'Profile'  },
          ].map(item => {
            const isActive = location.pathname.startsWith(item.path);
            const color = isActive ? '#FF6B35' : '#6b7280';
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex-1 flex flex-col items-center justify-center gap-0.5"
                style={{ color }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: 22,
                    fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                  }}
                >
                  {item.icon}
                </span>
                <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 500 }}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
    </NotificationProvider>
  );
}
