import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Sidebar({ mobileMenuOpen, setMobileMenuOpen }) {
  const location = useLocation();
  const navigate = useNavigate();

  const adminDataString = localStorage.getItem('adminData');
  const admin = adminDataString ? JSON.parse(adminDataString) : { name: 'Admin', role: 'System Admin' };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out of the Admin Console?")) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      navigate('/admin/login');
    }
  };

  const links = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: 'dashboard' },
    { name: 'Students', path: '/admin/students', icon: 'group' },
    { name: 'Cafeterias', path: '/admin/cafeterias', icon: 'restaurant' },
    { name: 'Orders', path: '/admin/orders', icon: 'assessment' },
    { name: 'Profile', path: '/admin/profile', icon: 'account_circle' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`md:hidden fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setMobileMenuOpen && setMobileMenuOpen(false)}
      ></div>

      <aside className={`bg-[#1A1A2B] dark:bg-[#1A1A2B] font-['Manrope'] tracking-tight h-screen w-64 fixed left-0 top-0 flex-col py-6 z-50 transition-transform duration-300 md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0 flex' : '-translate-x-full md:flex'}`}>
      <div className="px-6 mb-10">
        <h1 className="text-xl font-bold text-[#FF6B35]">COMSTAS Cafe</h1>
        <p className="text-xs text-on-surface-variant opacity-60 uppercase tracking-widest mt-1">Admin Console</p>
      </div>
      <nav className="flex-1 space-y-2">
        {links.map((link) => {
          const isActive = location.pathname.includes(link.path);
          return (
            <Link
              key={link.name}
              to={link.path}
              className={
                isActive
                  ? "bg-[#FF6B35]/15 text-[#FFB59D] rounded-lg mx-2 flex items-center px-4 py-3 transition-colors duration-200 group"
                  : "text-[#E1BFB5] hover:bg-[#38374A]/10 mx-2 flex items-center px-4 py-3 transition-colors duration-200 group"
              }
            >
              <span 
                className={`material-symbols-outlined mr-3 ${isActive ? 'text-[#FF6B35]' : 'opacity-70 group-hover:opacity-100'}`}
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {link.icon}
              </span>
              <span className={isActive ? "font-semibold" : ""}>{link.name}</span>
            </Link>
          );
        })}
      </nav>
      <div className="px-6 pt-6 border-t border-outline-variant/10">
        <div className="flex items-center justify-between group/logout block">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-primary/50 overflow-hidden">
               {admin.profile_image ? (
                  <img src={admin.profile_image} alt="Admin" className="w-full h-full object-cover" />
               ) : (
                  <span className="material-symbols-outlined">account_circle</span>
               )}
            </div>
            <div>
              <p className="text-sm font-bold text-on-surface max-w-[100px] overflow-hidden whitespace-nowrap text-ellipsis" title={admin.name}>{admin.name}</p>
              <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/60 relative -top-0.5">{admin.role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            title="Logout"
            className="w-8 h-8 rounded-full bg-error-container/20 text-error flex items-center justify-center hover:bg-error hover:text-on-error transition-colors"
          >
            <span className="material-symbols-outlined text-[16px] pl-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>logout</span>
          </button>
        </div>
      </div>
    </aside>
    </>
  );
}
