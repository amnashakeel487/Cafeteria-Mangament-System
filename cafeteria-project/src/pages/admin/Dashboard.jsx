import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [stats, setStats] = useState({ totalStudents: 0, totalCafeterias: 0, totalOrders: 0, totalRevenue: 0, newestStudents: [], topCafeteria: null, cafeteriaLoads: [] });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
     const fetchDashboard = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };
            
            setLoading(true);
            const statsRes = await axios.get('/api/admin/dashboard/stats', axiosConfig);
            setStats(statsRes.data);

            const ordersRes = await axios.get('/api/admin/orders', axiosConfig);
            setRecentOrders(ordersRes.data.slice(0, 5)); // First 5 recent

        } catch (err) {
            console.error(err);
            setError("Failed to fetch dashboard data.");
        } finally {
            setLoading(false);
        }
     };
     fetchDashboard();
  }, []);

  const handleCreateReport = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "COMSTAS Cafe - System Report\r\n";
    csvContent += `Generated,${new Date().toLocaleString()}\r\n\r\n`;
    csvContent += "METRIC,VALUE\r\n";
    csvContent += `Total Students,${stats.totalStudents}\r\n`;
    csvContent += `Total Cafeterias,${stats.totalCafeterias}\r\n`;
    csvContent += `Total Orders,${stats.totalOrders}\r\n`;
    csvContent += `Total Revenue,Rs. {Number(stats.totalRevenue).toFixed(2)}\r\n\r\n`;
    
    if (stats.topCafeteria) {
       csvContent += "TOP VENUE,ORDERS\r\n";
       csvContent += `${stats.topCafeteria.name},${stats.topCafeteria.order_count}\r\n\r\n`;
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `admin_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section className="pt-20 md:pt-28 px-4 md:px-8 pb-12 space-y-6 md:space-y-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3">
        <div>
          <h2 className="text-2xl md:text-4xl font-extrabold editorial-text text-on-surface">Overview</h2>
          <p className="text-on-surface-variant mt-1 text-sm md:text-base">Real-time pulse of the university's culinary network.</p>
        </div>
        <button onClick={handleCreateReport} className="bg-gradient-to-br from-primary to-primary-container text-on-primary px-4 py-2.5 md:px-6 md:py-3 rounded-xl font-bold flex items-center space-x-2 ambient-shadow hover:scale-[1.02] active:scale-95 transition-all text-sm w-fit">
          <span className="material-symbols-outlined text-lg">download</span>
          <span>Download Report</span>
        </button>
      </div>

      {loading && (
          <div className="absolute inset-0 bg-surface/50 backdrop-blur-sm z-10 flex items-center justify-center text-primary rounded-xl">
             <span className="material-symbols-outlined animate-spin text-4xl">refresh</span>
          </div>
      )}
      {error && !loading && (
          <div className="p-4 mb-6 bg-error-container text-on-error rounded-xl font-bold flex items-center gap-2">
             <span className="material-symbols-outlined">error</span> {error}
          </div>
      )}

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 relative">
        <div className="bg-surface-container-high rounded-xl p-4 md:p-6 flex flex-col justify-between group hover:bg-surface-container-highest transition-all duration-300 shadow-md">
          <div className="flex justify-between items-start">
            <div className="p-2 md:p-3 rounded-lg bg-primary/10 text-primary">
              <span className="material-symbols-outlined text-lg md:text-2xl">group</span>
            </div>
          </div>
          <div className="mt-3 md:mt-4">
            <p className="text-on-surface-variant text-xs font-label uppercase tracking-wider">Total Students</p>
            <h3 className="text-2xl md:text-3xl font-extrabold editorial-text mt-1">{loading ? '-' : stats.totalStudents}</h3>
          </div>
        </div>

        <div className="bg-surface-container-high rounded-xl p-4 md:p-6 flex flex-col justify-between group hover:bg-surface-container-highest transition-all duration-300 shadow-md">
          <div className="flex justify-between items-start">
            <div className="p-2 md:p-3 rounded-lg bg-tertiary/10 text-tertiary">
              <span className="material-symbols-outlined text-lg md:text-2xl">restaurant</span>
            </div>
          </div>
          <div className="mt-3 md:mt-4">
            <p className="text-on-surface-variant text-xs font-label uppercase tracking-wider">Total Cafeterias</p>
            <h3 className="text-2xl md:text-3xl font-extrabold editorial-text mt-1">{loading ? '-' : stats.totalCafeterias}</h3>
          </div>
        </div>

        <div className="bg-surface-container-high rounded-xl p-4 md:p-6 flex items-center justify-between group hover:bg-surface-container-highest transition-all duration-300 shadow-md">
          <div className="space-y-2 md:space-y-4">
            <div>
              <p className="text-on-surface-variant text-xs font-label uppercase tracking-wider">Total Revenue</p>
              <h3 className="text-2xl md:text-3xl font-extrabold editorial-text mt-1 text-primary">Rs. {loading ? '0' : Number(stats.totalRevenue).toFixed(2)}</h3>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-high rounded-xl p-4 md:p-6 flex col-span-1 items-center justify-between group hover:bg-surface-container-highest transition-all duration-300 shadow-md">
          <div className="space-y-2 md:space-y-4">
            <div>
              <p className="text-on-surface-variant text-xs font-label uppercase tracking-wider">Total Orders</p>
              <h3 className="text-2xl md:text-3xl font-extrabold editorial-text mt-1 text-secondary">{loading ? '-' : stats.totalOrders}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Main Insights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Student Distribution Chart (Asymmetric) */}
        <div className="lg:col-span-2 bg-surface-container rounded-xl p-8 border border-outline-variant/5">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h4 className="text-xl font-bold editorial-text">Student Load per Cafeteria</h4>
              <p className="text-sm text-on-surface-variant">Real-time distribution of active diners</p>
            </div>
            <select className="bg-surface-container-lowest border-none rounded-lg text-xs font-bold text-on-surface-variant py-1.5 pl-3 pr-8 focus:ring-0">
              <option>Last 24 Hours</option>
              <option>Last 7 Days</option>
            </select>
          </div>
          <div className="space-y-6">
            {stats.cafeteriaLoads?.map((cafeteria) => {
              // Create dynamic relative widths scaled against max volume
              const maxOrders = Math.max(...(stats.cafeteriaLoads?.map(c => c.active_orders) || []), 10);
              const loadPercentage = (cafeteria.active_orders / maxOrders) * 100;
              
              // Colors logic derived from semantic mapping
              const getBarColor = (name) => {
                if (name.toLowerCase().includes('central')) return 'bg-tertiary';
                if (name.toLowerCase().includes('wing')) return 'bg-primary';
                if (name.toLowerCase().includes('deli')) return 'bg-primary/40';
                return 'bg-secondary';
              };

              return (
                <div key={cafeteria.id} className="space-y-2 group cursor-pointer hover:opacity-80 transition-opacity">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-tighter">
                    <span className="text-on-surface">{cafeteria.name}</span>
                    <span className="text-on-surface-variant">{cafeteria.active_orders} Total Load</span>
                  </div>
                  <div className="h-3 bg-surface-container-lowest rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-1000 ${getBarColor(cafeteria.name)}`} style={{ width: `${Math.max(loadPercentage, 2)}%` }}></div>
                  </div>
                </div>
              );
            })}
            
            {stats.cafeteriaLoads?.length === 0 && !loading && (
               <p className="text-center text-sm text-on-surface-variant py-4">No load data available yet.</p>
            )}
          </div>

          <div className="mt-10 p-6 bg-surface-container-low rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center text-error">
                <span className="material-symbols-outlined">warning</span>
              </div>
              <div>
                <p className="text-sm font-bold text-on-surface">South Campus Overload</p>
                <p className="text-xs text-on-surface-variant">Reached 95% capacity 10 mins ago.</p>
              </div>
            </div>
            <button className="text-xs font-bold text-primary underline underline-offset-4">Dispatch Crew</button>
          </div>
        </div>

        {/* Recent Activity Panel */}
        <div className="bg-surface-container rounded-xl p-8 border border-outline-variant/5">
          <div className="flex justify-between items-center mb-6">
             <h4 className="text-xl font-bold editorial-text">Recent Orders</h4>
             <Link to="/admin/orders" className="text-primary text-sm font-bold hover:underline">View Full Log</Link>
          </div>
          <div className="space-y-6 relative">
            <div className="absolute left-4 top-2 bottom-2 w-[1px] bg-outline-variant/20"></div>
            
            {recentOrders.map(order => (
               <div key={order.id} className="relative pl-10 group cursor-pointer hover:bg-surface-container-highest/20 transition-all p-2 rounded-xl -ml-2">
                 <div className="absolute left-2 top-3 w-8 h-8 rounded-full bg-surface-container-highest border-4 border-surface-container flex items-center justify-center">
                   <span className="material-symbols-outlined text-xs text-tertiary">restaurant</span>
                 </div>
                 <div>
                   <p className="text-sm text-on-surface line-clamp-2"><span className="font-bold">{order.student_name}</span> spent <span className="text-primary font-bold">Rs. {Number(order.total_amount).toFixed(2)}</span> at {order.cafeteria_name}.</p>
                   <div className="flex justify-between items-center mt-1">
                      <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">{new Date(order.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</p>
                      <span className={`px-2 py-0.5 rounded uppercase tracking-widest text-[8px] font-bold ${order.status === 'completed' ? 'bg-tertiary/10 text-tertiary' : 'bg-surface-bright text-on-surface-variant'}`}>{order.status || 'Pending'}</span>
                   </div>
                 </div>
               </div>
            ))}
            {recentOrders.length === 0 && !loading && (
               <p className="text-on-surface-variant text-sm py-4 text-center">No recent orders found.</p>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Management Section (Modular Asymmetry) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="bg-surface-container-high/50 rounded-xl p-8 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-xl font-bold editorial-text">Newest Student Enrollments</h4>
            <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary">more_horiz</span>
          </div>
          <div className="space-y-1">
            {stats.newestStudents?.map(student => (
            <div key={student.id} className="flex items-center justify-between p-4 rounded-xl hover:bg-surface-container-highest transition-all group">
              <div className="flex items-center space-x-4">
                 <div className="w-10 h-10 rounded-full bg-surface-container-highest border border-surface-container-highest flex items-center justify-center text-primary/50 grayscale group-hover:grayscale-0 transition-all">
                    <span className="material-symbols-outlined">person</span>
                 </div>
                <div>
                  <p className="text-sm font-bold text-on-surface">{student.name}</p>
                  <p className="text-xs text-on-surface-variant max-w-[150px] overflow-hidden whitespace-nowrap text-ellipsis">{student.email}</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-tertiary/10 text-tertiary text-[10px] font-bold uppercase tracking-widest leading-none">ID: {student.id}</span>
            </div>
            ))}
            {stats.newestStudents?.length === 0 && !loading && (
               <p className="text-on-surface-variant text-sm py-4 text-center">No recent enrollments.</p>
            )}
          </div>
        </div>

        <div className="relative rounded-xl overflow-hidden group">
          <img alt="Featured Cafeteria" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBY1jMEYh2_-hcttV-KV6AljH1Gd6EiXB_XQ64cUNA_pxrOkqN-j78iiFPu7ute7EXAaTQiko6klpt02Ud7p0z2OzqcH20dd2UxaCKdcb90SFD-yYva-JNypQXLJGrgmO2rsnSaoMcLC8OF2xxrt_rnOLNT1hADYLD1_qYFQQnDDkG2vNoZH7583FPWCxAbshXdit-SEEnImc3CNuNSNsckNrIc8Jpn77BQh22hWgXo7QjfOsu-KCmFe-ES6EWN70n28wy37dMQ-Q"/>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c1d] via-[#0c0c1d]/40 to-transparent"></div>
          <div className="relative h-full p-8 flex flex-col justify-end">
            <span className="bg-primary px-3 py-1 rounded text-[10px] font-bold text-on-primary w-fit mb-2 uppercase tracking-widest">Top Rated Venue</span>
            <h4 className="text-2xl font-extrabold editorial-text text-white">{stats.topCafeteria ? stats.topCafeteria.name : "No Data Yet"}</h4>
            <div className="flex items-center space-x-4 mt-2 text-on-surface-variant">
              <div className="flex items-center text-sm font-bold text-[#FFB59D]">
                <span className="material-symbols-outlined text-sm text-[#FFB59D] mr-1" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                {stats.topCafeteria ? stats.topCafeteria.order_count : 0} Total Orders
              </div>
              <div className="flex items-center text-sm">
                <span className="material-symbols-outlined text-sm mr-1">schedule</span>
                Open until 11 PM
              </div>
            </div>
            <div className="mt-6 flex space-x-3">
               <Link to="/admin/cafeterias" className="flex-1 text-center bg-white/10 backdrop-blur-md hover:bg-white/20 text-white text-xs font-bold py-3 rounded-lg transition-all">Manage Directory</Link>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}
