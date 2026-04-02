import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';

export default function StudentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const student = JSON.parse(localStorage.getItem('studentData') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('studentToken');
    localStorage.removeItem('studentData');
    navigate('/student/login');
  };

  const navLinks = [
    { name: 'Cafeterias', path: '/student/cafeterias', icon: 'restaurant' },
    { name: 'My Orders', path: '/student/orders', icon: 'receipt_long' },
    { name: 'Track Order', path: '/student/track', icon: 'local_shipping' },
    { name: 'Profile', path: '/student/profile', icon: 'person' },
  ];

  const handleNavClick = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  return (
    <div className="bg-[#121222] text-[#E3E0F8] min-h-screen font-['Inter']">

      {/* Mobile Overlay */}
      <div
        className={`lg:hidden fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-screen w-64 bg-[#1A1A2B] flex flex-col p-4 z-50 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:top-16 lg:h-[calc(100vh-64px)]`}>
        {/* Mobile sidebar header */}
        <div className="lg:hidden flex items-center justify-between px-2 mb-6 pt-2">
          <span className="text-lg font-black text-[#FF6B35] font-['Manrope']">COMSTAS Cafe</span>
          <button onClick={() => setSidebarOpen(false)} className="p-1 text-[#E1BFB5]/70 hover:text-[#E3E0F8]">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="mb-8 px-4 py-2 hidden lg:block">
          <h3 className="text-lg font-black text-[#E3E0F8] font-['Inter']">University Portal</h3>
          <p className="text-xs text-[#E1BFB5]/70">Student Account</p>
        </div>

        <nav className="flex-1 space-y-2">
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
                {link.name}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto space-y-2 pt-4 border-t border-[#594139]/10">
          <Link to="/student/settings" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 text-[#E1BFB5]/70 hover:bg-[#38374A]/20 hover:text-[#E3E0F8] transition-all duration-300 ease-out font-['Inter'] text-sm tracking-wide rounded-lg">
            <span className="material-symbols-outlined">settings</span>
            Settings
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-[#E1BFB5]/70 hover:bg-[#38374A]/20 hover:text-[#E3E0F8] transition-all duration-300 ease-out font-['Inter'] text-sm tracking-wide rounded-lg">
            <span className="material-symbols-outlined">logout</span>
            Logout
          </button>
        </div>
      </aside>

      {/* TopNavBar */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-4 md:px-6 bg-[#1E1E2F] h-16 shadow-2xl shadow-[#0c0c1d]/50">
        <div className="flex items-center gap-3 md:gap-8">
          {/* Hamburger — mobile only */}
          <button
            className="lg:hidden p-2 text-[#E3E0F8] hover:text-[#FF6B35] transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="material-symbols-outlined">menu</span>
          </button>

          <span className="text-xl font-bold text-[#FF6B35] tracking-tighter font-['Manrope']">COMSTAS Cafe</span>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/student/cafeterias" className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname.includes('/cafeterias') || location.pathname.includes('/menu') ? 'text-[#FF6B35] font-bold border-b-2 border-[#FF6B35]' : 'text-[#E3E0F8]/80 hover:bg-[#38374A]/40 hover:text-[#FFB59D]'}`}>Cafeterias</Link>
            <Link to="/student/orders" className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/student/orders' ? 'text-[#FF6B35] font-bold border-b-2 border-[#FF6B35]' : 'text-[#E3E0F8]/80 hover:bg-[#38374A]/40 hover:text-[#FFB59D]'}`}>My Orders</Link>
            <Link to="/student/track" className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/student/track' ? 'text-[#FF6B35] font-bold border-b-2 border-[#FF6B35]' : 'text-[#E3E0F8]/80 hover:bg-[#38374A]/40 hover:text-[#FFB59D]'}`}>Track Order</Link>
          </nav>
        </div>

        <div className="flex items-center gap-3 text-[#FF6B35]">
          <button onClick={() => navigate('/student/cart')} className="relative p-2 hover:bg-[#38374A]/40 rounded-full transition-colors active:scale-95">
            <span className="material-symbols-outlined">shopping_cart</span>
          </button>
          <button onClick={() => navigate('/student/profile')} className="p-2 hover:bg-[#38374A]/40 rounded-full transition-colors active:scale-95">
            <span className="material-symbols-outlined">account_circle</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="lg:pl-64 pt-20 px-6 md:px-8 lg:pl-72 lg:pr-10 pb-20 lg:pb-12 bg-[#121222] min-h-screen">
        <div className="pt-6">
          <Outlet />
        </div>
      </main>

      {/* Bottom Navigation (Mobile Only) */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full bg-[#1A1A2B] h-16 flex justify-around items-center px-2 z-50 shadow-[0_-8px_24px_rgba(12,12,29,0.5)]">
        <button onClick={() => navigate('/student/cafeterias')} className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${location.pathname.includes('/cafeterias') || location.pathname.includes('/menu') ? 'text-[#FFB59D]' : 'text-[#E1BFB5]/70'}`}>
          <span className="material-symbols-outlined text-xl" style={{fontVariationSettings: (location.pathname.includes('/cafeterias') || location.pathname.includes('/menu')) ? "'FILL' 1" : "'FILL' 0"}}>restaurant</span>
          <span className="text-[10px] font-medium">Cafeterias</span>
        </button>
        <button onClick={() => navigate('/student/orders')} className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${location.pathname === '/student/orders' ? 'text-[#FFB59D]' : 'text-[#E1BFB5]/70'}`}>
          <span className="material-symbols-outlined text-xl" style={{fontVariationSettings: location.pathname === '/student/orders' ? "'FILL' 1" : "'FILL' 0"}}>receipt_long</span>
          <span className="text-[10px] font-medium">Orders</span>
        </button>
        <button onClick={() => navigate('/student/track')} className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${location.pathname === '/student/track' ? 'text-[#FFB59D]' : 'text-[#E1BFB5]/70'}`}>
          <span className="material-symbols-outlined text-xl" style={{fontVariationSettings: location.pathname === '/student/track' ? "'FILL' 1" : "'FILL' 0"}}>local_shipping</span>
          <span className="text-[10px] font-medium">Track</span>
        </button>
        <button onClick={() => navigate('/student/profile')} className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${location.pathname === '/student/profile' ? 'text-[#FFB59D]' : 'text-[#E1BFB5]/70'}`}>
          <span className="material-symbols-outlined text-xl" style={{fontVariationSettings: location.pathname === '/student/profile' ? "'FILL' 1" : "'FILL' 0"}}>person</span>
          <span className="text-[10px] font-medium">Profile</span>
        </button>
      </nav>
    </div>
  );
}
