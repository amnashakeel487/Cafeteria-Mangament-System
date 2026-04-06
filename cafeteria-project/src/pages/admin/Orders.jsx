import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterCafeteria, setFilterCafeteria] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const token = localStorage.getItem('adminToken');
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/admin/orders', axiosConfig);
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const uniqueCafeterias = [...new Set(orders.map(o => o.cafeteria_name))];
  const uniqueStatuses = [...new Set(orders.map(o => o.status || 'pending'))];

  const filtered = orders.filter(o => {
      // date from database is typically YYYY-MM-DD HH:MM:SS or an ISO string
      const fullDate = o.date ? new Date(o.date) : null;
      // create YYYY-MM-DD for comparison matching the input element value pattern Formats "2023-10-24"
      const stringDateMatch = fullDate ? fullDate.toISOString().split('T')[0] : '';
      
      const dbDate = o.date ? o.date.split(' ')[0] : o.date;
      const compareDate = o.date && o.date.includes('T') ? stringDateMatch : dbDate;
      const tStatus = o.status || 'pending';

      return (
        (filterCafeteria ? o.cafeteria_name === filterCafeteria : true) &&
        (filterStatus ? tStatus === filterStatus : true) &&
        (filterDate ? compareDate === filterDate : true)
      );
  });

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-tertiary/10 text-tertiary';
      case 'preparing': return 'bg-secondary/10 text-secondary border border-secondary/20';
      case 'ready': return 'bg-primary/20 text-primary border border-primary/20';
      case 'pending': return 'bg-surface-bright text-on-surface-variant';
      case 'cancelled': return 'bg-error-container/20 text-error';
      default: return 'bg-surface-bright text-on-surface-variant';
    }
  };

  return (
    <div className="pt-20 md:pt-28 px-4 md:px-10 pb-12 font-['Inter'] relative min-h-screen">
      {/* Page Title */}
      <div className="flex flex-col gap-4 mb-6 md:mb-10">
        <div>
          <h2 className="text-2xl md:text-4xl font-extrabold font-headline tracking-tight">Orders Overview</h2>
          <p className="text-on-surface-variant max-w-md mt-1 text-sm">Monitor campus-wide culinary transactions in real-time.</p>
        </div>
        {/* Filters - stacked on mobile */}
        <div className="flex flex-wrap gap-3 bg-surface-container-high rounded-xl p-3 border border-outline-variant/10">
            <div className="flex flex-col min-w-[120px] flex-1">
                <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold px-1 mb-1">Cafeteria</label>
                <select value={filterCafeteria} onChange={e => setFilterCafeteria(e.target.value)} className="bg-surface-container-lowest border border-outline-variant/5 rounded-lg text-sm px-3 py-2 text-on-surface focus:ring-1 focus:ring-primary/50 outline-none">
                    <option value="">All</option>
                    {uniqueCafeterias.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
            <div className="flex flex-col min-w-[120px] flex-1">
                <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold px-1 mb-1">Status</label>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="bg-surface-container-lowest border border-outline-variant/5 rounded-lg text-sm px-3 py-2 text-on-surface capitalize focus:ring-1 focus:ring-primary/50 outline-none">
                    <option value="">All</option>
                    {uniqueStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
            <div className="flex flex-col min-w-[130px] flex-1">
                <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold px-1 mb-1">Date</label>
                <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} className="bg-surface-container-lowest border border-outline-variant/5 rounded-lg text-sm px-3 py-2 text-on-surface focus:ring-1 focus:ring-primary/50 outline-none" style={{colorScheme: 'dark'}} />
            </div>
            {(filterCafeteria || filterStatus || filterDate) && (
                <div className="flex items-end">
                    <button onClick={() => { setFilterCafeteria(''); setFilterStatus(''); setFilterDate(''); }} className="h-9 px-3 text-xs bg-error-container/10 text-error hover:bg-error-container/30 rounded-lg transition-colors font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">close</span> Clear
                    </button>
                </div>
            )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-surface-container rounded-xl overflow-hidden relative border border-outline-variant/5 shadow-2xl">
        {loading && <div className="absolute inset-0 bg-surface-container-highest/60 backdrop-blur-md z-10 flex items-center justify-center text-primary"><span className="material-symbols-outlined animate-spin text-4xl">refresh</span></div>}
        <div className="p-4 md:p-8 flex justify-between items-center border-b border-outline-variant/5 bg-surface-container-low/50">
          <div className="flex items-center gap-3 md:gap-4">
             <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                 <span className="material-symbols-outlined">analytics</span>
             </div>
             <div>
                <h3 className="text-base md:text-xl font-bold font-headline">Transaction Log</h3>
                <p className="text-xs text-on-surface-variant hidden sm:block">Read-only global overview of all processed orders.</p>
             </div>
          </div>
          <div className="bg-surface-container-highest px-3 py-1.5 rounded-lg flex items-center gap-2 border border-outline-variant/5">
            <span className="material-symbols-outlined text-tertiary text-sm">receipt_long</span>
            <span className="font-bold text-on-surface text-sm">{filtered.length}</span>
          </div>
        </div>

        {/* Mobile card view */}
        <div className="md:hidden divide-y divide-outline-variant/5">
          {filtered.map(order => (
            <div key={order.id} className="p-4 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-sm text-on-surface">{order.student_name}</p>
                  <p className="text-xs text-on-surface-variant">{order.cafeteria_name}</p>
                </div>
                <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full uppercase ${getStatusColor(order.status)}`}>{order.status || 'Pending'}</span>
              </div>
              <div className="flex justify-between text-xs text-on-surface-variant">
                <span>{new Date(order.date).toLocaleDateString()}</span>
                <span className="font-bold text-primary">Rs. ${Number(order.total_amount).toFixed(2)}</span>
              </div>
            </div>
          ))}
          {filtered.length === 0 && !loading && <p className="p-8 text-center text-on-surface-variant text-sm">No transactions match your filters.</p>}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-on-surface-variant bg-surface-container-lowest/30">
                <th className="px-8 py-5 font-bold">Order ID</th>
                <th className="px-8 py-5 font-bold">Student</th>
                <th className="px-8 py-5 font-bold">Cafeteria Hub</th>
                <th className="px-8 py-5 font-bold">Total Amount</th>
                <th className="px-8 py-5 font-bold">Date & Time</th>
                <th className="px-8 py-5 font-bold text-right">Fulfillment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {filtered.map(order => (
                <tr key={order.id} className="hover:bg-surface-container-highest/60 transition-colors group">
                  <td className="px-8 py-6 text-on-surface-variant font-bold text-sm">ORD-{order.id.toString().padStart(4, '0')}</td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold uppercase">{order.student_name.charAt(0)}</div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-on-surface">{order.student_name}</span>
                        <span className="text-[10px] text-on-surface-variant opacity-80">{order.student_email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-bold text-on-surface flex items-center gap-2"><span className="material-symbols-outlined text-sm text-tertiary">store</span>{order.cafeteria_name}</span>
                  </td>
                  <td className="px-8 py-6 font-extrabold text-sm text-primary">Rs. ${Number(order.total_amount).toFixed(2)}</td>
                  <td className="px-8 py-6 text-sm font-medium text-on-surface-variant">{new Date(order.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</td>
                  <td className="px-8 py-6 text-right">
                    <span className={`px-4 py-1.5 text-[10px] font-extrabold rounded-full uppercase tracking-widest ${getStatusColor(order.status)}`}>{order.status || 'Pending'}</span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && !loading && (
                <tr><td colSpan="6" className="px-8 py-24 text-center"><p className="text-on-surface-variant font-bold">No transactions match your current filters.</p></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
