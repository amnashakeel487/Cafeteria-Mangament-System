import { Link } from 'react-router-dom';

export default function Topbar({ setMobileMenuOpen }) {
  return (
    <header className="bg-[#121222]/80 backdrop-blur-xl fixed top-0 flex w-full md:w-[calc(100%-16rem)] z-30 justify-between items-center px-4 md:px-8 h-20 font-['Manrope'] font-semibold border-b border-outline-variant/5">
      <div className="flex items-center flex-1 max-w-xl gap-3">
        {setMobileMenuOpen && (
          <button className="md:hidden text-on-surface hover:text-primary transition-colors flex items-center justify-center p-2 -ml-2" onClick={() => setMobileMenuOpen(true)}>
            <span className="material-symbols-outlined text-2xl">menu</span>
          </button>
        )}
        <div className="relative w-full hidden sm:block">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50">search</span>
          <input className="w-full bg-surface-container-lowest border-none rounded-xl pl-12 pr-4 py-2.5 text-sm focus:ring-1 focus:ring-primary/50 text-on-surface placeholder-on-surface-variant/30" placeholder="Search students, venues, or orders..." type="text"/>
        </div>
      </div>
      <div className="flex items-center space-x-6">
        <button className="relative text-[#E3E0F8] opacity-70 hover:text-[#FFB59D] transition-all">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-0 right-0 w-2 h-2 bg-primary-container rounded-full"></span>
        </button>
        <Link to="/admin/profile" className="text-[#E3E0F8] opacity-70 hover:text-[#FFB59D] transition-all" title="Settings">
          <span className="material-symbols-outlined">settings</span>
        </Link>
        <div className="h-8 w-[1px] bg-outline-variant/20 mx-2"></div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-on-surface-variant">Status:</span>
          <span className="flex items-center text-xs text-tertiary">
            <span className="w-2 h-2 rounded-full bg-tertiary mr-1.5 animate-pulse"></span>
            Systems Live
          </span>
        </div>
      </div>
    </header>
  );
}
