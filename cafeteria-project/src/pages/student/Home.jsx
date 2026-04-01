export default function StudentHome() {
  const student = JSON.parse(localStorage.getItem('studentData') || '{}');

  return (
    <div className="p-8 md:p-10 text-on-surface max-w-5xl mx-auto space-y-10 pt-10">
      {/* Welcome Hero */}
      <div className="bg-surface-container-high rounded-2xl p-8 md:p-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-tertiary/5 pointer-events-none"></div>
        <div className="relative z-10">
          <p className="text-on-surface-variant text-xs uppercase tracking-widest font-bold mb-2">Student Portal</p>
          <h1 className="text-3xl md:text-4xl font-extrabold" style={{ fontFamily: 'Manrope' }}>
            Welcome back, <span className="text-primary">{student.name || 'Student'}</span>!
          </h1>
          <p className="text-on-surface-variant mt-3 max-w-lg">
            Browse cafeterias, explore menus, place orders and track them in real time — all from your dashboard.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <a href="/student/cafeterias" className="bg-gradient-to-r from-primary to-primary-container text-on-primary px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-lg">
              <span className="material-symbols-outlined text-lg">restaurant</span>
              Browse Cafeterias
            </a>
            <a href="/student/orders" className="bg-surface-container-highest text-on-surface px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-surface-bright transition-all">
              <span className="material-symbols-outlined text-lg">receipt_long</span>
              My Orders
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
