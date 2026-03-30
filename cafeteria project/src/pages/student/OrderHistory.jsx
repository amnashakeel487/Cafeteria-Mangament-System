import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../../context/CartContext';

const BASE = 'http://localhost:5000';

const statusConfig = {
  completed: { label: 'Completed', bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' },
  pending: { label: 'Pending', bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20' },
  processing: { label: 'Processing', bg: 'bg-[#59d5fb]/10', text: 'text-[#59d5fb]', border: 'border-[#59d5fb]/20' },
  cancelled: { label: 'Cancelled', bg: 'bg-[#93000a]/20', text: 'text-[#ffb4ab]', border: 'border-[#ffb4ab]/20' },
};

const paymentLabels = {
  cash: 'Cash on Delivery',
  online: 'Online Payment',
};

export default function OrderHistory() {
  const navigate = useNavigate();
  const { addToCart, clearCart } = useCart();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('studentToken');
        const res = await axios.get(`${BASE}/api/student/orders`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrders(res.data);
      } catch (err) {
        console.error('Failed to load orders', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(o => {
    const matchesSearch = search === '' ||
      o.cafeteria_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toString().includes(search);
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleReorder = (order) => {
    clearCart();
    order.items?.forEach(item => {
      for (let i = 0; i < item.quantity; i++) {
        addToCart({ id: Date.now() + Math.random(), name: item.item_name, price: item.price }, order.cafeteria_id.toString());
      }
    });
    navigate(`/student/menu/${order.cafeteria_id}`);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="pt-32 flex justify-center">
        <span className="material-symbols-outlined animate-spin text-4xl text-[#FFB59D]">refresh</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto font-['Inter']">
      {/* Header */}
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-[#E3E0F8] tracking-tight mb-2 font-['Manrope']">Order History</h1>
          <p className="text-[#e1bfb5] max-w-lg">Review and manage your past culinary selections. Track your spending and quickly re-order your campus favorites.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-[#e1bfb5]">{orders.length} Total Orders</span>
        </div>
      </header>

      {/* Filters Bar */}
      <section className="bg-[#1E1E2F] rounded-xl p-4 mb-8 shadow-xl flex flex-wrap items-end gap-6 border border-[#594139]/20">
        <div className="flex-1 min-w-[240px]">
          <label className="block text-xs font-bold text-[#e1bfb5] uppercase tracking-widest mb-1.5 ml-1">Search Orders</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#e1bfb5] text-sm">search</span>
            <input
              className="w-full bg-[#0c0c1d] border-none rounded-lg pl-10 pr-4 py-2.5 text-sm text-[#E3E0F8] focus:ring-2 focus:ring-[#FF6B35] transition-all placeholder:text-[#e1bfb5]/50 outline-none"
              placeholder="Order ID or cafeteria..."
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="w-full md:w-auto">
          <label className="block text-xs font-bold text-[#e1bfb5] uppercase tracking-widest mb-1.5 ml-1">Status</label>
          <select
            className="bg-[#0c0c1d] border-none rounded-lg px-4 py-2.5 text-sm text-[#E3E0F8] focus:ring-2 focus:ring-[#FF6B35] w-full min-w-[160px] outline-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="processing">Processing</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </section>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
          <span className="material-symbols-outlined text-6xl text-[#e1bfb5]/30 mb-4">receipt_long</span>
          <h2 className="text-2xl font-bold text-[#E3E0F8] font-['Manrope'] mb-2">No Orders Found</h2>
          <p className="text-[#e1bfb5] max-w-sm mb-6">
            {orders.length === 0 ? "You haven't placed any orders yet." : "No orders match your current filters."}
          </p>
          {orders.length === 0 && (
            <button onClick={() => navigate('/student/cafeterias')} className="bg-[#FFB59D] text-[#5d1900] px-6 py-3 rounded-lg font-bold hover:opacity-90 transition-opacity">
              Browse Cafeterias
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => {
            const status = statusConfig[order.status] || statusConfig.pending;
            const itemsSummary = order.items?.map(i => i.item_name).join(', ') || 'N/A';

            return (
              <div key={order.id} className="bg-[#28283a] hover:bg-[#333345] transition-all duration-300 rounded-xl p-5 group flex flex-col md:flex-row items-center gap-6 border border-[#594139]/10">
                {/* Left: icon + info */}
                <div className="flex items-center gap-5 flex-1 w-full">
                  <div className="w-14 h-14 bg-[#0c0c1d] rounded-xl flex items-center justify-center text-[#FF6B35] shrink-0">
                    <span className="material-symbols-outlined text-3xl">restaurant</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <h3 className="font-bold text-lg text-[#E3E0F8] font-['Manrope']">{order.cafeteria_name}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${status.bg} ${status.text} border ${status.border}`}>
                        {status.label}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#e1bfb5]">
                      <span className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-xs">tag</span>
                        #ORD-{order.id.toString().padStart(5, '0')}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-xs">calendar_today</span>
                        {formatDate(order.created_at)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-xs">{order.payment_method === 'online' ? 'account_balance_wallet' : 'credit_card'}</span>
                        {paymentLabels[order.payment_method] || order.payment_method}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Middle: items + total */}
                <div className={`flex items-center gap-8 w-full md:w-auto px-4 md:px-0 ${order.status === 'cancelled' ? 'opacity-60' : ''}`}>
                  <div className="text-left md:text-right flex-1 md:flex-none">
                    <p className="text-xs text-[#e1bfb5] font-medium uppercase tracking-tighter">Items</p>
                    <p className="text-sm text-[#E3E0F8] truncate max-w-[200px]">{itemsSummary}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#e1bfb5] font-medium uppercase tracking-tighter">Total</p>
                    <p className={`text-xl font-bold ${order.status === 'cancelled' ? 'text-[#E3E0F8]' : 'text-[#FFB59D]'}`}>
                      ${Number(order.total_amount).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Right: actions */}
                <div className="flex items-center gap-2 w-full md:w-auto">
                  {order.status === 'completed' ? (
                    <button
                      onClick={() => handleReorder(order)}
                      className="flex-1 md:flex-none px-5 py-2.5 bg-gradient-to-br from-[#FFB59D] to-[#FF6B35] text-[#5d1900] text-sm font-bold rounded-lg hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-[#FF6B35]/20 flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-sm">refresh</span>
                      Re-order
                    </button>
                  ) : order.status === 'cancelled' ? (
                    <button className="flex-1 md:flex-none px-5 py-2.5 border border-[#FF6B35]/30 text-[#FF6B35] text-sm font-bold rounded-lg hover:bg-[#FF6B35]/10 transition-all flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-sm">receipt</span>
                      View Reason
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate('/student/track')}
                      className="flex-1 md:flex-none px-5 py-2.5 border border-[#59d5fb]/30 text-[#59d5fb] text-sm font-bold rounded-lg hover:bg-[#59d5fb]/10 transition-all flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-sm">local_shipping</span>
                      Track
                    </button>
                  )}
                  <button className="p-2.5 rounded-lg text-[#e1bfb5] hover:bg-[#38374a] transition-colors">
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
