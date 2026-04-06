import { useState, useEffect } from 'react';
import axios from 'axios';

const BASE = '';

const STATUS_PILLS = {
  pending:    'bg-[#FFC107]/10 text-[#FFC107] border-[#FFC107]/20',
  processing: 'bg-tertiary/10 text-tertiary border-tertiary/20',
  completed:  'bg-[#28A745]/10 text-[#28A745] border-[#28A745]/20',
  cancelled:  'bg-error-container/20 text-error border-error/20',
};

const ICONS = {
  pending: 'hourglass_empty',
  processing: 'soup_kitchen',
  completed: 'done_all',
  cancelled: 'cancel',
};

export default function CafeteriaOrderHistory() {
  const token = localStorage.getItem('cafeteriaToken');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE}/api/cafeteria/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(o => {
    // Search by student name or order ID
    const matchesSearch = searchTerm === '' || 
      o.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.id.toString().includes(searchTerm);
      
    // Status
    const formattedStatus = o.status.charAt(0).toUpperCase() + o.status.slice(1);
    const matchesStatus = statusFilter === 'All Statuses' || formattedStatus === statusFilter;
    
    // Date
    let matchesDate = true;
    const orderDate = new Date(o.created_at).toISOString().split('T')[0];
    if (dateFrom && orderDate < dateFrom) matchesDate = false;
    if (dateTo && orderDate > dateTo) matchesDate = false;
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <section className="p-8 max-w-6xl mx-auto space-y-8 pt-10 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-on-surface tracking-tight mb-2" style={{ fontFamily: 'Manrope' }}>Order History</h1>
          <p className="text-on-surface-variant max-w-lg text-sm">Review past culinary transactions, track revenue, and monitor cafeteria activity across all statuses.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex -space-x-3 overflow-hidden">
             {/* Fake avatars purely for the UI aesthetic requested by the design */}
            <div className="h-10 w-10 rounded-full bg-surface-container-highest border-2 border-surface flex items-center justify-center text-primary"><span className="material-symbols-outlined text-sm">receipt_long</span></div>
            <div className="h-10 w-10 rounded-full bg-surface-container-highest border-2 border-surface flex items-center justify-center text-tertiary"><span className="material-symbols-outlined text-sm">analytics</span></div>
            <div className="h-10 w-10 rounded-full bg-surface-container-highest border-2 border-surface flex items-center justify-center text-[#28A745]"><span className="material-symbols-outlined text-sm">payments</span></div>
          </div>
          <span className="text-sm font-medium text-on-surface-variant ml-2">Total {orders.length} Records</span>
        </div>
      </header>

      {/* Filters Bar */}
      <section className="bg-surface-container rounded-xl p-4 shadow-xl flex flex-wrap items-end gap-6">
        <div className="flex-1 min-w-[240px]">
          <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 ml-1">Search Records</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
            <input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface-container-lowest border-none rounded-lg pl-10 pr-4 py-2.5 text-sm text-on-surface focus:ring-2 focus:ring-primary-container transition-all" 
              placeholder="Order ID or Student Name..." 
              type="text"
            />
          </div>
        </div>
        <div className="w-full md:w-auto">
          <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 ml-1">Status</label>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-surface-container-lowest border-none rounded-lg px-4 py-2.5 text-sm text-on-surface focus:ring-2 focus:ring-primary-container w-full min-w-[160px]">
            <option>All Statuses</option>
            <option>Completed</option>
            <option>Processing</option>
            <option>Pending</option>
            <option>Cancelled</option>
          </select>
        </div>
        <div className="w-full xl:w-auto">
          <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 ml-1">Date Range</label>
          <div className="flex items-center gap-2">
            <input 
              value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
              className="bg-surface-container-lowest border-none rounded-lg px-3 py-2 text-sm text-on-surface focus:ring-2 focus:ring-primary-container" type="date"
            />
            <span className="text-on-surface-variant">to</span>
            <input 
              value={dateTo} onChange={(e) => setDateTo(e.target.value)}
              className="bg-surface-container-lowest border-none rounded-lg px-3 py-2 text-sm text-on-surface focus:ring-2 focus:ring-primary-container" type="date"
            />
          </div>
        </div>
      </section>

      {/* Orders List */}
      <div className="space-y-4">
        {loading ? (
           <div className="flex items-center justify-center py-20">
             <span className="material-symbols-outlined animate-spin text-3xl text-primary">autorenew</span>
           </div>
        ) : filteredOrders.length === 0 ? (
           <div className="text-center py-20 bg-surface-container-high rounded-xl">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant/20 block mb-2">history</span>
              <p className="text-on-surface-variant text-sm">No records found matching your filters.</p>
           </div>
        ) : filteredOrders.map(order => (
          <div key={order.id} className="bg-surface-container-high hover:bg-surface-container-highest transition-all duration-300 rounded-xl p-5 flex flex-col md:flex-row items-center gap-6 border border-outline-variant/5 hover:border-outline-variant/20">
            <div className="flex items-center gap-5 flex-1 w-full">
              <div className={`w-14 h-14 bg-surface-container-lowest rounded-xl flex items-center justify-center 
                ${order.status === 'completed' ? 'text-[#28A745]' : 
                  order.status === 'cancelled' ? 'text-error' : 
                  order.status === 'processing' ? 'text-tertiary' : 'text-[#FFC107]'}`}>
                <span className="material-symbols-outlined text-3xl">{ICONS[order.status] || 'receipt'}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-bold text-lg text-on-surface capitalize" style={{ fontFamily: 'Manrope' }}>{order.student_name}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${STATUS_PILLS[order.status]}`}>
                    {order.status}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-on-surface-variant">
                  <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-xs">tag</span>#{order.id}</span>
                  <span className="flex items-center gap-1.5 border-l border-outline-variant/20 pl-4"><span className="material-symbols-outlined text-xs">calendar_today</span>
                    {new Date(order.created_at).toLocaleString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="flex items-center gap-1.5 border-l border-outline-variant/20 pl-4 capitalize"><span className="material-symbols-outlined text-xs">payments</span>
                    {order.payment_method || 'Cash'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-8 w-full md:w-auto px-4 md:px-0 opacity-80">
              <div className="text-left md:text-right flex-1 md:flex-none">
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mb-1.5">Items Summary</p>
                <div className="text-sm text-on-surface space-y-1">
                  {order.items && order.items.length > 0 ? (
                    order.items.map((i, idx) => (
                       <p key={idx} className="truncate max-w-[200px]">{i.item_name} <span className="text-xs text-on-surface-variant ml-1">×{i.quantity}</span></p> 
                    ))
                  ) : <p className="italic text-on-surface-variant/50">No items</p>}
                </div>
              </div>
              <div className="text-right pl-4 border-l border-outline-variant/10">
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mb-1.5">Total Amount</p>
                <p className="text-xl font-extrabold text-primary" style={{ fontFamily: 'Manrope' }}>Rs. ${Number(order.total_amount).toFixed(2)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
