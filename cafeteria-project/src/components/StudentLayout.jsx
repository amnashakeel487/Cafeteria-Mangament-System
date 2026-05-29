import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { NotificationProvider } from '../context/NotificationContext';
import { useFavorites } from '../context/FavoritesContext';
import NotificationBell from './notifications/NotificationBell';
import { fetchStudentTodaySpecials } from '../utils/specialsApi';

function StudentLayoutInner() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const student = JSON.parse(localStorage.getItem('studentData') || '{}');
  const { favoriteCount, clearFavorites } = useFavorites();
  const [specialsCount, setSpecialsCount] = useState(0);

  useEffect(() => {
    fetchStudentTodaySpecials()
      .then((data) => setSpecialsCount(Array.isArray(data) ? data.length : 0))
      .catch(() => setSpecialsCount(0));
  }, [location.pathname]);

  const handleLogout = () => {
    clearFavorites();
    localStorage.removeItem('studentToken');
    localStorage.removeItem('studentData');
    navigate('/student/login');
  };

  const navLinks = [
    { name: 'Cafeterias', path: '/student/cafeterias', icon: 'restaurant' },
    { name: "Today's Specials", path: '/student/specials', icon: 'campaign', badge: specialsCount },
    { name: 'My Favorites', path: '/student/favorites', icon: 'favorite', badge: favoriteCount },
    { name: 'My Orders', path: '/student/orders', icon: 'receipt_long' },
    { name: 'Track Order', path: '/student/track', icon: 'local_shipping' },
    { name: 'Profile', path: '/student/profile', icon: 'person' },
  ];

  const handleNavClick = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <NotificationProvider role="student" recipientId={student?.id}>
    <div className="bg-[#121222] text-[#E3E0F8] min-h-screen font-['Inter']">

      {/* Mobile Overlay */}
      <div
        className={`lg:hidden fixed inset-0 bg-black/60 z-[54] transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar — bottom inset on mobile so footer clears the bottom tab bar */}
      <aside
        className={`fixed left-0 top-14 sm:top-16 bottom-14 sm:bottom-16 lg:bottom-0 w-64 bg-[#1A1A2B] flex flex-col p-4 z-[55] transition-transform duration-300 overflow-hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:top-16 lg:h-[calc(100vh-64px)]`}
      >
        {/* Mobile sidebar header */}
        <div className="lg:hidden shrink-0 flex items-center justify-between px-2 mb-4 pt-2">
          <span className="text-lg font-black text-[#FF6B35] font-['Manrope']">COMSTAS Cafe</span>
          <button onClick={() => setSidebarOpen(false)} className="p-1 text-[#E1BFB5]/70 hover:text-[#E3E0F8]">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="mb-6 px-4 py-2 hidden lg:block shrink-0">
          <h3 className="text-lg font-black text-[#E3E0F8] font-['Inter']">University Portal</h3>
          <p className="text-xs text-[#E1BFB5]/70">Student Account</p>
        </div>

        <nav className="flex-1 min-h-0 overflow-y-auto space-y-2 -mx-1 px-1 custom-scrollbar">
          {navLinks.map((link) => {
            const isActive = location.pathname.startsWith(link.path);
            return (
              <button
                key={link.name}
                onClick={() => handleNavClick(link.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-all duration-300 ease-out font-['Inter'] text-sm tracking-wide ${
                  isActive
                    ? 'bg-[#FF6B35]/15 text-[#FFB59D]'
                    : 'text-[#E1BFB5]/70 hover:bg-[#38374A]/20 hover:text-[#E3E0F8]'
                }`}
              >
                <span className="material-symbols-outlined" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>{link.icon}</span>
                <span className="flex-1 text-left">{link.name}</span>
                {link.badge > 0 && (
                  <span className="bg-rose-500/20 text-rose-300 text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[1.25rem] text-center">
                    {link.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="shrink-0 space-y-2 pt-4 mt-2 border-t border-[#594139]/10 bg-[#1A1A2B]">
          <div className="lg:hidden flex items-center justify-between px-4 py-2.5 rounded-lg bg-[#38374A]/15">
            <span className="text-sm text-[#E1BFB5]/80">Theme</span>
            <ThemeToggle compact />
          </div>
          <Link
            to="/student/settings"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-[#E1BFB5]/70 hover:bg-[#38374A]/20 hover:text-[#E3E0F8] transition-all duration-300 ease-out font-['Inter'] text-sm tracking-wide rounded-lg"
          >
            <span className="material-symbols-outlined">settings</span>
            Settings
          </Link>
          <button
            type="button"
            onClick={() => {
              setSidebarOpen(false);
              handleLogout();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-[#E1BFB5]/70 hover:bg-[#38374A]/20 hover:text-[#E3E0F8] transition-all duration-300 ease-out font-['Inter'] text-sm tracking-wide rounded-lg"
          >
            <span className="material-symbols-outlined">logout</span>
            Logout
          </button>
        </div>
      </aside>

      {/* TopNavBar */}
      <header className="fixed top-0 w-full z-[60] flex items-center justify-between gap-2 px-2 sm:px-4 md:px-6 bg-[#1E1E2F] h-14 sm:h-16 shadow-2xl shadow-[#0c0c1d]/50 overflow-visible">
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 flex-1">
          {/* Hamburger — mobile only */}
          <button
            type="button"
            className="lg:hidden p-1.5 sm:p-2 shrink-0 text-[#E3E0F8] hover:text-[#FF6B35] transition-colors rounded-lg relative z-[61]"
            onClick={() => setSidebarOpen((open) => !open)}
            aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={sidebarOpen}
          >
            <span className="material-symbols-outlined text-[22px]">
              {sidebarOpen ? 'close' : 'menu'}
            </span>
          </button>

          <span className="text-sm sm:text-xl font-bold text-[#FF6B35] font-['Manrope'] truncate leading-tight">
            <span className="hidden min-[400px]:inline">COMSTAS </span>Cafe
          </span>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6 ml-2">
            <Link to="/student/cafeterias" className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname.includes('/cafeterias') || location.pathname.includes('/menu') ? 'text-[#FF6B35] font-bold border-b-2 border-[#FF6B35]' : 'text-[#E3E0F8]/80 hover:bg-[#38374A]/40 hover:text-[#FFB59D]'}`}>Cafeterias</Link>
            <Link to="/student/orders" className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/student/orders' ? 'text-[#FF6B35] font-bold border-b-2 border-[#FF6B35]' : 'text-[#E3E0F8]/80 hover:bg-[#38374A]/40 hover:text-[#FFB59D]'}`}>My Orders</Link>
            <Link to="/student/track" className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/student/track' ? 'text-[#FF6B35] font-bold border-b-2 border-[#FF6B35]' : 'text-[#E3E0F8]/80 hover:bg-[#38374A]/40 hover:text-[#FFB59D]'}`}>Track Order</Link>
          </nav>
        </div>

        <div className="flex items-center gap-0.5 sm:gap-2 shrink-0 text-[#FF6B35]">
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>
          <NotificationBell />
          <button
            onClick={() => navigate('/student/cart')}
            className="relative p-1.5 sm:p-2 hover:bg-[#38374A]/40 rounded-lg transition-colors active:scale-95"
            aria-label="Cart"
          >
            <span className="material-symbols-outlined text-[22px] sm:text-2xl">shopping_cart</span>
          </button>
          <button
            onClick={() => navigate('/student/profile')}
            className="p-1.5 sm:p-2 hover:bg-[#38374A]/40 rounded-lg transition-colors active:scale-95"
            aria-label="Profile"
          >
            <span className="material-symbols-outlined text-[22px] sm:text-2xl">account_circle</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="pt-14 sm:pt-20 px-3 sm:px-6 md:px-8 lg:pl-[calc(16rem+2rem)] lg:pr-10 pb-[4.25rem] sm:pb-24 lg:pb-12 bg-[#121222] min-h-screen overflow-x-hidden">
        <div className="pt-2 sm:pt-6 mobile-compact">
          <Outlet />
        </div>
      </main>

      {/* Bottom Navigation (Mobile Only) */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full bg-[#1A1A2B] h-14 sm:h-16 flex justify-around items-center px-1 z-50 shadow-[0_-8px_24px_rgba(12,12,29,0.5)]">
        <button onClick={() => navigate('/student/cafeterias')} className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${location.pathname.includes('/cafeterias') || location.pathname.includes('/menu') ? 'text-[#FFB59D]' : 'text-[#E1BFB5]/70'}`}>
          <span className="material-symbols-outlined text-lg sm:text-xl" style={{fontVariationSettings: (location.pathname.includes('/cafeterias') || location.pathname.includes('/menu')) ? "'FILL' 1" : "'FILL' 0"}}>restaurant</span>
          <span className="text-[9px] sm:text-[10px] font-medium">Cafeterias</span>
        </button>
        <button onClick={() => navigate('/student/orders')} className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${location.pathname === '/student/orders' ? 'text-[#FFB59D]' : 'text-[#E1BFB5]/70'}`}>
          <span className="material-symbols-outlined text-lg sm:text-xl" style={{fontVariationSettings: location.pathname === '/student/orders' ? "'FILL' 1" : "'FILL' 0"}}>receipt_long</span>
          <span className="text-[9px] sm:text-[10px] font-medium">Orders</span>
        </button>
        <button onClick={() => navigate('/student/track')} className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${location.pathname === '/student/track' ? 'text-[#FFB59D]' : 'text-[#E1BFB5]/70'}`}>
          <span className="material-symbols-outlined text-lg sm:text-xl" style={{fontVariationSettings: location.pathname === '/student/track' ? "'FILL' 1" : "'FILL' 0"}}>local_shipping</span>
          <span className="text-[9px] sm:text-[10px] font-medium">Track</span>
        </button>
        <button onClick={() => navigate('/student/profile')} className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${location.pathname === '/student/profile' ? 'text-[#FFB59D]' : 'text-[#E1BFB5]/70'}`}>
          <span className="material-symbols-outlined text-lg sm:text-xl" style={{fontVariationSettings: location.pathname === '/student/profile' ? "'FILL' 1" : "'FILL' 0"}}>person</span>
          <span className="text-[9px] sm:text-[10px] font-medium">Profile</span>
        </button>
      </nav>
    </div>
    </NotificationProvider>
  );
}

export default StudentLayoutInner;
