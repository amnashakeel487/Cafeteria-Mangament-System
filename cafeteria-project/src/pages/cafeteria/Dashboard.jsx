import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import PageSEO from '../../seo/PageSEO';
import { PAGE_SEO } from '../../seo/siteConfig';
import LazyImage from '../../components/LazyImage';
import { formatPrice } from '../../utils/currency';
import MenuAvailabilityWidget from '../../components/availability/MenuAvailabilityWidget';
import StatCard from '../../components/analytics/StatCard';
import SimpleSparkline from '../../components/analytics/SimpleSparkline';

const STATUS_STYLES = {
  pending:    'bg-primary-container/20 text-primary border border-primary/30',
  processing: 'bg-tertiary/10 text-tertiary border border-tertiary/30',
  completed:  'bg-[#28A745]/10 text-[#28A745] border border-[#28A745]/30',
  cancelled:  'bg-error-container/20 text-error border border-error/30',
};

function readCafeteriaFromStorage() {
  try {
    const raw = localStorage.getItem('cafeteriaData');
    return raw ? JSON.parse(raw) : {};
  } catch {
    localStorage.removeItem('cafeteriaData');
    return {};
  }
}

export default function CafeteriaDashboard() {
  const cafeteria = readCafeteriaFromStorage();

  const [stats, setStats] = useState({
    totalOrders: 0, totalRevenue: 0,
    pendingOrders: 0, completedOrders: 0,
    todayOrders: 0, todayRevenue: 0
  });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyticsToday, setAnalyticsToday] = useState(null);
  const [sparkTrend, setSparkTrend] = useState([]);
  const [topItemsToday, setTopItemsToday] = useState([]);

  // Manual Order States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  useEffect(() => {
    fetchAll();
    fetchMenu();
    fetchAnalyticsExtras();
  }, []);

  const fetchAnalyticsExtras = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${localStorage.getItem('cafeteriaToken')}` } };
      const [ov, trend, best] = await Promise.all([
        axios.get('/api/cafeteria/analytics/overview', { ...config, params: { period: 'today' } }),
        axios.get('/api/cafeteria/analytics/revenue-trend', { ...config, params: { period: '30days' } }),
        axios.get('/api/cafeteria/analytics/best-selling', { ...config, params: { period: 'today', limit: 3 } }),
      ]);
      setAnalyticsToday(ov.data);
      setSparkTrend((trend.data?.trend || []).slice(-7));
      setTopItemsToday(best.data?.items || []);
    } catch {
      /* non-critical */
    }
  };

  const fetchAll = async () => {
    try {
      const token = localStorage.getItem('cafeteriaToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const [statsRes, ordersRes] = await Promise.all([
        axios.get('/api/cafeteria/dashboard/stats', config),
        axios.get('/api/cafeteria/dashboard/orders', config),
      ]);
      setStats(statsRes.data);
      setOrders(ordersRes.data);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const token = localStorage.getItem('cafeteriaToken');
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  const fetchMenu = async () => {
    try {
      const token = localStorage.getItem('cafeteriaToken');
      const res = await axios.get('/api/cafeteria/menu', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMenuItems(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: '', type: 'success' }), 3000);
  };

  // Cart Functions for Manual Order
  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(i => {
      if (i.id === id) {
        const newQ = i.quantity + delta;
        return newQ > 0 ? { ...i, quantity: newQ } : i;
      }
      return i;
    }));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleSubmitManualOrder = async () => {
    if (cart.length === 0) return showToast('Cart is empty!');
    setSubmitting(true);
    try {
      const token = localStorage.getItem('cafeteriaToken');
      await axios.post('/api/cafeteria/orders/manual', {
        items: cart,
        total_amount: cartTotal
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      showToast('Manual order created!', 'success');
      setCart([]);
      setIsModalOpen(false);
      fetchAll(); // Refresh dashboard stats
    } catch (err) {
      showToast(err.response?.data?.message || 'Error creating order', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const maxTopQty = topItemsToday[0]?.totalQuantity || 1;

  return (
    <>
      <PageSEO {...PAGE_SEO.cafeDashboard} />
    <section className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-10 pt-6 md:pt-10">
      {toast.visible && (
        <div className={`fixed bottom-8 right-8 px-6 py-3 rounded-lg shadow-2xl z-50 flex items-center gap-2 font-bold animate-pulse text-white
          ${toast.type === 'error' ? 'bg-error' : 'bg-[#28A745]'}`}>
          <span className="material-symbols-outlined">
            {toast.type === 'error' ? 'error' : 'check_circle'}
          </span>
          {toast.message}
        </div>
      )}

      {/* Hero Bento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
        {/* Welcome / Revenue Hero */}
        <div className="md:col-span-2 bg-surface-container-high rounded-xl p-6 md:p-8 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute right-0 bottom-0 w-1/2 h-full opacity-10 pointer-events-none">
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
              <path d="M0,100 L10,80 L20,85 L30,60 L40,70 L50,40 L60,45 L70,20 L80,30 L90,10 L100,15 L100,100 Z" fill="url(#heroGrad)" />
              <defs>
                <linearGradient id="heroGrad" x1="0%" x2="0%" y1="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#FF6B35', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#FF6B35', stopOpacity: 0 }} />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="relative z-10">
            <p className="text-on-surface-variant font-medium text-xs mb-1 uppercase tracking-widest">Total Revenue</p>
            <h2 className="font-headline text-3xl md:text-5xl font-extrabold text-on-surface">
              {loading ? '—' : formatPrice(stats.totalRevenue)}
            </h2>
            <div className="mt-4 flex items-center space-x-6">
              <div className="flex items-center text-tertiary space-x-1">
                <span className="material-symbols-outlined text-sm">today</span>
                <span className="text-sm font-bold">Today: {loading ? formatPrice(0) : formatPrice(stats.todayRevenue)}</span>
              </div>
              <div className="flex items-center text-primary space-x-1">
                <span className="material-symbols-outlined text-sm">receipt_long</span>
                <span className="text-sm font-bold">Today's Orders: {loading ? '0' : stats.todayOrders}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Total Orders Hero */}
        <div className="bg-primary-container rounded-xl p-6 md:p-8 text-on-primary relative overflow-hidden">
          <p className="font-medium text-sm mb-1 uppercase tracking-widest opacity-80">Total Orders</p>
          <h2 className="font-headline text-3xl md:text-5xl font-extrabold">{loading ? '—' : stats.totalOrders}</h2>
          <p className="mt-2 text-sm font-medium opacity-70">{loading ? '' : `${stats.pendingOrders} pending right now`}</p>
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <span className="material-symbols-outlined text-[120px]">restaurant</span>
          </div>
        </div>
      </div>

      {/* KPI metrics — full-width row with comfortable spacing */}
      <section aria-label="Today's overview" className="space-y-5 md:space-y-6">
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
          <StatCard
            title="Today's Revenue"
            value={analyticsToday?.totalRevenue ?? stats.todayRevenue}
            isCurrency
            color="cyan"
            icon="payments"
            loading={loading}
            trend={analyticsToday ? `${analyticsToday.revenueGrowth >= 0 ? '+' : ''}${analyticsToday.revenueGrowth}% vs yesterday` : undefined}
            trendValue={analyticsToday?.revenueGrowth}
            sparkline={<SimpleSparkline data={sparkTrend} />}
          />
          <StatCard
            title="Today's Orders"
            value={analyticsToday?.totalOrders ?? stats.todayOrders}
            color="blue"
            icon="receipt_long"
            loading={loading}
            trend={analyticsToday ? `${analyticsToday.orderGrowth >= 0 ? '+' : ''}${analyticsToday.orderGrowth}% vs yesterday` : undefined}
            trendValue={analyticsToday?.orderGrowth}
          />
          <StatCard
            title="Pending Orders"
            value={stats.pendingOrders}
            subtitle="Awaiting preparation"
            color="primary"
            icon="schedule"
            loading={loading}
          />
          <StatCard
            title="Completed Orders"
            value={stats.completedOrders}
            subtitle="Successfully served"
            color="amber"
            icon="check_circle"
            loading={loading}
          />
        </div>

        <MenuAvailabilityWidget axiosConfig={axiosConfig} />
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="md:col-span-2 bg-surface-container-high rounded-xl p-6 border border-outline-variant/10">
          <h3 className="text-sm font-bold text-on-surface uppercase tracking-widest mb-4">Top 3 Items Today</h3>
          {topItemsToday.length === 0 ? (
            <p className="text-sm text-on-surface-variant">No sales recorded today yet.</p>
          ) : (
            <ul className="space-y-3">
              {topItemsToday.map((item, i) => (
                <li key={item.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-bold text-on-surface">
                      {['🥇', '🥈', '🥉'][i]} {item.name}
                    </span>
                    <span className="text-on-surface-variant">{item.totalQuantity} sold</span>
                  </div>
                  <div className="h-2 rounded-full bg-surface-container-lowest overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#06d6c7] to-primary rounded-full"
                      style={{ width: `${(item.totalQuantity / maxTopQty) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="bg-surface-container-high rounded-xl p-6 border border-outline-variant/10 flex flex-col justify-center items-center text-center">
          <span className="material-symbols-outlined text-4xl text-primary mb-2">bar_chart</span>
          <p className="text-sm text-on-surface-variant mb-4">Full charts, exports, and peak-hour insights</p>
          <Link
            to="/cafeteria/analytics"
            className="px-5 py-2.5 rounded-lg bg-primary text-on-primary font-bold text-sm hover:opacity-90"
          >
            View Full Analytics →
          </Link>
        </div>
      </div>

      {/* Live Orders Table */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-on-surface" style={{ fontFamily: 'Manrope' }}>Live Orders</h3>
            <p className="text-on-surface-variant text-sm mt-1">Real-time queue · {cafeteria.name}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <Link to="/cafeteria/orders" className="flex-1 sm:flex-none text-center bg-surface-container-highest hover:bg-surface-bright px-4 py-2 rounded-lg text-sm font-bold transition-colors">
              Filter
            </Link>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex-1 sm:flex-none justify-center bg-[#FF6B35] hover:bg-[#ff8555] text-white px-4 sm:px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-lg active:scale-95 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span className="whitespace-nowrap">New Manual Order</span>
            </button>
          </div>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {loading ? (
            <div className="py-12 text-center">
              <span className="material-symbols-outlined animate-spin text-3xl text-primary">refresh</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="py-12 text-center bg-surface-container rounded-xl">
              <p className="text-on-surface-variant text-sm">No orders yet.</p>
            </div>
          ) : (
            orders.slice(0, 8).map((order) => (
              <div key={order.id} className="bg-surface-container-high rounded-xl p-4 border border-outline-variant/10 space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <span className="font-bold text-on-surface text-sm">#{order.id}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${STATUS_STYLES[order.status] || STATUS_STYLES.pending}`}>
                    {order.status || 'pending'}
                  </span>
                </div>
                <p className="text-sm text-on-surface font-medium">{order.student_name}</p>
                <p className="text-xs text-on-surface-variant line-clamp-2">
                  {order.items?.map((i) => i.item_name).join(', ') || 'Manual Items'}
                </p>
                <p className="text-sm font-bold text-primary">{formatPrice(order.total_amount)}</p>
              </div>
            ))
          )}
        </div>

        <div className="hidden md:block bg-surface-container rounded-xl overflow-hidden shadow-2xl shadow-[#0C0C1D]/40">
          <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[640px]">
            <thead>
              <tr className="bg-surface-container-high/50 text-on-surface-variant text-[10px] uppercase tracking-[0.2em] font-bold">
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Items Summary</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {loading ? (
                <tr><td colSpan={5} className="py-16 text-center">
                  <span className="material-symbols-outlined animate-spin text-3xl text-primary">refresh</span>
                </td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={5} className="py-16 text-center">
                  <span className="material-symbols-outlined text-5xl text-on-surface-variant/20 block mb-3">receipt_long</span>
                  <p className="text-on-surface-variant text-sm">No orders yet. They'll appear here in real time.</p>
                </td></tr>
              ) : orders.slice(0, 8).map(order => (
                <tr key={order.id} className="group hover:bg-surface-container-highest transition-all duration-200">
                  <td className="px-6 py-5">
                    <div className="flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full ${order.status === 'pending' ? 'bg-primary animate-pulse' : order.status === 'processing' ? 'bg-tertiary' : 'bg-[#28A745]'}`}></span>
                      <span className="font-bold text-on-surface text-sm">#{order.id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-surface-container-lowest border border-outline-variant/10 flex items-center justify-center text-xs font-bold text-primary uppercase">
                        {order.student_name?.slice(0, 2) || '?'}
                      </div>
                      <span className="text-on-surface font-medium text-sm">{order.student_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-sm text-on-surface-variant truncate max-w-[200px]">
                      {order.items?.map(i => i.item_name).join(', ') || 'Manual Items'}
                    </p>
                  </td>
                  <td className="px-6 py-5 font-bold text-on-surface">{formatPrice(order.total_amount)}</td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLES[order.status] || STATUS_STYLES.pending}`}>
                      {order.status || 'pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      </div>

      {/* Manual Order Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 min-h-screen">
          <div className="bg-surface-container rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-outline-variant/10">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-high">
              <h2 className="text-xl font-bold" style={{ fontFamily: 'Manrope' }}>Create Manual Order</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-on-surface-variant hover:text-error transition-colors p-1">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
              {/* Menu Items List */}
              <div className="flex-[2] overflow-y-auto p-6 space-y-4 border-r border-outline-variant/10 custom-scrollbar">
                <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">Available Menu Items</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {menuItems.map(item => (
                    <div key={item.id} className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/5 flex gap-4 hover:border-primary/30 transition-colors">
                       <LazyImage src={item.image_url ? item.image_url : 'https://placehold.co/100?text=No+Image'} alt={item.name || 'Menu item'} className="w-16 h-16 rounded-lg object-cover" />
                       <div className="flex-1 flex flex-col justify-between">
                         <p className="font-bold text-sm text-on-surface leading-snug">{item.name}</p>
                         <div className="flex justify-between items-end mt-2">
                           <span className="text-primary font-bold">{formatPrice(item.price)}</span>
                           <button onClick={() => addToCart(item)} className="bg-primary/10 hover:bg-primary/20 text-primary w-8 h-8 rounded-lg flex items-center justify-center transition-colors">
                             <span className="material-symbols-outlined text-[18px]">add</span>
                           </button>
                         </div>
                       </div>
                    </div>
                  ))}
                  {menuItems.length === 0 && (
                    <div className="col-span-2 text-center py-10 opacity-50">No items available in the menu.</div>
                  )}
                </div>
              </div>

              {/* Cart Pane */}
              <div className="flex-1 bg-surface-container-high flex flex-col h-[50vh] md:h-auto">
                <div className="p-6 border-b border-outline-variant/10 bg-surface-container-high/50">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">shopping_cart</span>
                    Current Order
                  </h3>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                  {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-on-surface-variant/40">
                      <span className="material-symbols-outlined text-4xl mb-2">shopping_bag</span>
                      <p className="text-sm">Cart is empty</p>
                    </div>
                  ) : (
                    cart.map(item => (
                      <div key={item.id} className="flex items-center justify-between border-b border-outline-variant/5 pb-3">
                        <div className="flex-1 pr-2">
                          <p className="text-sm font-bold truncate max-w-[120px]">{item.name}</p>
                          <p className="text-xs text-on-surface-variant">{formatPrice(item.price)} ea</p>
                        </div>
                        <div className="flex items-center gap-2 bg-surface-container-lowest rounded-lg p-1 border border-outline-variant/10">
                          <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 rounded hover:bg-surface-bright flex items-center justify-center"><span className="material-symbols-outlined text-[14px]">remove</span></button>
                          <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 rounded hover:bg-surface-bright flex items-center justify-center"><span className="material-symbols-outlined text-[14px]">add</span></button>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="ml-3 text-error hover:bg-error/10 w-8 h-8 rounded shrink-0 flex items-center justify-center">
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-6 bg-surface-container-highest mt-auto border-t border-outline-variant/10 space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-sm text-on-surface-variant uppercase tracking-widest font-bold">Total</span>
                    <span className="text-3xl font-extrabold text-[#FF6B35]" style={{ fontFamily: 'Manrope' }}>{formatPrice(cartTotal)}</span>
                  </div>
                  <button 
                    onClick={handleSubmitManualOrder}
                    disabled={cart.length === 0 || submitting}
                    className="w-full bg-[#FF6B35] hover:bg-[#ff8555] disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors">
                    {submitting ? 'Creating...' : 'Place Manual Order'}
                    <span className="material-symbols-outlined text-[20px]">check_circle</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </section>
    </>
  );
}
