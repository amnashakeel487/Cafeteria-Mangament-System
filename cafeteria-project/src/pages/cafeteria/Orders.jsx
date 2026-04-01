import { useState, useEffect } from 'react';
import axios from 'axios';

const BASE = '';

const STATUS_COLORS = {
  pending:    'text-[#FFC107] bg-[#FFC107]/10 border border-[#FFC107]/30',
  processing: 'text-tertiary bg-tertiary/10 border border-tertiary/30',
  completed:  'text-[#28A745] bg-[#28A745]/10 border border-[#28A745]/30',
  cancelled:  'text-error bg-error-container/20 border border-error/30',
};

const PAY_COLORS = {
  pending:  'text-[#FFC107]',
  approved: 'text-[#28A745]',
  rejected: 'text-error',
};

export default function CafeteriaOrders() {
  const token = localStorage.getItem('cafeteriaToken');
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  const [tab, setTab] = useState('all'); // 'all' | 'verify'
  const [orders, setOrders] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all'); // for queue tab
  const [toast, setToast] = useState({ visible: false, message: '', type: '' });
  const [preview, setPreview] = useState(null); // fullscreen image

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [ordersRes, pendingRes] = await Promise.all([
        axios.get(`${BASE}/api/cafeteria/orders`, axiosConfig),
        axios.get(`${BASE}/api/cafeteria/orders/pending`, axiosConfig),
      ]);
      setOrders(ordersRes.data);
      setPending(pendingRes.data);
    } catch { showToast('Failed to load orders.', 'error'); }
    finally { setLoading(false); }
  };

  const handlePaymentAction = async (orderId, action) => {
    try {
      const res = await axios.put(`${BASE}/api/cafeteria/orders/${orderId}/payment`,
        { action }, axiosConfig);
      showToast(res.data.message, 'success');
      fetchAll();
    } catch (err) {
      showToast(err.response?.data?.message || 'Action failed.', 'error');
    }
  };

  const handleStatusChange = async (orderId, status) => {
    try {
      await axios.put(`${BASE}/api/cafeteria/orders/${orderId}/status`, { status }, axiosConfig);
      showToast(`Order marked as ${status}.`, 'success');
      fetchAll();
    } catch {
      showToast('Status update failed.', 'error');
    }
  };

  const showToast = (message, type) => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: '', type: '' }), 3500);
  };

  const filteredOrders = activeFilter === 'all'
    ? orders
    : orders.filter(o => o.status === activeFilter);

  return (
    <section className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 pt-6 md:pt-10">
      {/* Toast */}
      {toast.visible && (
        <div className={`fixed bottom-4 right-4 md:bottom-8 md:right-8 flex items-center gap-3 px-4 py-3 md:px-6 md:py-4 rounded-xl shadow-2xl border-l-4 z-50
            ${toast.type === 'success' ? 'bg-surface-container-highest border-[#28A745] text-on-surface' : 'bg-error-container/20 border-error text-error'}`}>
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
            {toast.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <p className="text-sm font-bold">{toast.message}</p>
        </div>
      )}

      {/* Screenshot fullscreen preview */}
      {preview && (
        <div onClick={() => setPreview(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-8 cursor-zoom-out">
          <img src={preview} alt="Payment screenshot" className="max-w-full max-h-full rounded-2xl shadow-2xl object-contain" />
          <button onClick={() => setPreview(null)}
            className="absolute top-6 right-6 w-10 h-10 bg-surface-container-highest rounded-full flex items-center justify-center text-on-surface hover:bg-error transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      )}

      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-on-surface" style={{ fontFamily: 'Manrope' }}>Order Management</h2>
          <p className="text-on-surface-variant mt-1 text-sm">Real-time terminal for cafeteria operations.</p>
        </div>
        <div className="flex gap-3 items-center">
          <div className="bg-surface-container-high rounded-xl p-2 px-4 flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold hidden sm:block">Kitchen</span>
            <span className="text-[#28A745] font-bold flex items-center gap-1 text-sm">
              <span className="w-2 h-2 bg-[#28A745] rounded-full animate-pulse"></span> LIVE
            </span>
          </div>
          <button onClick={fetchAll} className="p-2.5 bg-surface-container-high rounded-xl text-on-surface-variant hover:text-primary transition-all">
            <span className="material-symbols-outlined">refresh</span>
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 bg-surface-container-low p-1 rounded-xl w-fit">
        <button onClick={() => setTab('all')}
          className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'all' ? 'bg-surface-container-highest text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}>
          All Orders
          <span className="ml-2 bg-surface-container-lowest text-on-surface-variant text-[10px] px-2 py-0.5 rounded-full">{orders.length}</span>
        </button>
        <button onClick={() => setTab('verify')}
          className={`px-5 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${tab === 'verify' ? 'bg-surface-container-highest text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}>
          Payment Verification
          {pending.length > 0 && (
            <span className="bg-[#DC3545] text-white text-[10px] px-2 py-0.5 rounded-full font-bold">{pending.length} PENDING</span>
          )}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <span className="material-symbols-outlined animate-spin text-3xl text-primary">refresh</span>
        </div>
      ) : tab === 'verify' ? (
        /* ─────── PAYMENT VERIFICATION TAB ─────── */
        <div className="space-y-6">
          {pending.length === 0 ? (
            <div className="text-center py-20 bg-surface-container-high rounded-xl">
              <span className="material-symbols-outlined text-5xl text-[#28A745]/40 block mb-3">check_circle</span>
              <p className="text-on-surface font-bold text-lg">All Clear!</p>
              <p className="text-on-surface-variant text-sm mt-1">No payments awaiting verification.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {pending.map(order => (
                <div key={order.id} className="bg-surface-container-high rounded-xl p-6 space-y-5 border border-outline-variant/10 hover:border-primary/20 transition-all">
                  {/* Order Header */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-surface-container-lowest flex items-center justify-center">
                      <span className="material-symbols-outlined text-tertiary">receipt</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-on-surface">Order #{order.id}</p>
                      <p className="text-[10px] text-on-surface-variant truncate">
                        {order.student_name} · ${Number(order.total_amount).toFixed(2)}
                      </p>
                    </div>
                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${STATUS_COLORS[order.status] || ''}`}>
                      {order.status}
                    </span>
                  </div>

                  {/* Payment Method */}
                  <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-sm text-tertiary">payments</span>
                    <span className="font-medium">{order.payment_method || 'Online'}</span>
                    <span className={`ml-auto text-[10px] font-bold uppercase ${PAY_COLORS[order.payment_status]}`}>
                      {order.payment_status}
                    </span>
                  </div>

                  {/* Screenshot */}
                  {order.payment_screenshot ? (
                    <div className="relative group cursor-zoom-in rounded-xl overflow-hidden"
                      onClick={() => setPreview(order.payment_screenshot)}>
                      <img src={order.payment_screenshot} alt="Payment receipt"
                        className="w-full h-40 object-cover rounded-xl" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                        <span className="text-xs font-bold text-white bg-black/60 px-3 py-1 rounded-full">Click to Expand</span>
                      </div>
                    </div>
                  ) : (
                    <div className="h-40 bg-surface-container-lowest rounded-xl flex items-center justify-center border-2 border-dashed border-outline-variant/20">
                      <div className="text-center text-on-surface-variant/40">
                        <span className="material-symbols-outlined text-3xl block mb-1">image_not_supported</span>
                        <p className="text-xs">No screenshot uploaded</p>
                      </div>
                    </div>
                  )}

                  {/* Date */}
                  <p className="text-[10px] text-on-surface-variant/60">
                    {new Date(order.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => handlePaymentAction(order.id, 'approve')}
                      className="py-2.5 bg-[#28A745]/20 text-[#28A745] text-xs font-bold rounded-lg hover:bg-[#28A745] hover:text-white transition-colors flex items-center justify-center gap-1">
                      <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      Verify Receipt
                    </button>
                    <button onClick={() => handlePaymentAction(order.id, 'reject')}
                      className="py-2.5 bg-[#DC3545]/20 text-[#DC3545] text-xs font-bold rounded-lg hover:bg-[#DC3545] hover:text-white transition-colors flex items-center justify-center gap-1">
                      <span className="material-symbols-outlined text-sm">flag</span>
                      Flag Issue
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      ) : (
        /* ─────── ALL ORDERS TAB ─────── */
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8 space-y-6">
            {/* Status filter pills */}
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-on-surface" style={{ fontFamily: 'Manrope' }}>Orders Queue</h3>
              <div className="flex gap-2 bg-surface-container-low p-1 rounded-lg">
                {['all', 'pending', 'processing', 'completed'].map(s => (
                  <button key={s} onClick={() => setActiveFilter(s)}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide transition-all capitalize
                      ${activeFilter === s ? 'bg-surface-container-highest text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {filteredOrders.length === 0 ? (
                <div className="py-16 text-center bg-surface-container-high rounded-xl">
                  <span className="material-symbols-outlined text-5xl text-on-surface-variant/20 block mb-2">receipt_long</span>
                  <p className="text-on-surface-variant text-sm">No orders in this view.</p>
                </div>
              ) : filteredOrders.map(order => (
                <div key={order.id}
                  className={`bg-surface-container-high rounded-xl p-6 transition-all hover:bg-surface-container-highest group
                    ${order.status === 'processing' ? 'border-l-4 border-[#FFC107]' : order.status === 'completed' ? 'border-l-4 border-[#28A745]' : ''}`}>

                  <div className="flex justify-between items-start mb-5">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center
                        ${order.status === 'completed' ? 'bg-[#28A745]/10 text-[#28A745]' : 'bg-primary/10 text-primary'}`}>
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: order.status === 'completed' ? "'FILL' 1" : "'FILL' 0" }}>
                          {order.status === 'completed' ? 'done_all' : 'person'}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-lg text-on-surface" style={{ fontFamily: 'Manrope' }}>{order.student_name}</h4>
                        <p className="text-xs text-on-surface-variant">
                          #{order.id} · {new Date(order.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-extrabold text-on-surface" style={{ fontFamily: 'Manrope' }}>
                        ${Number(order.total_amount).toFixed(2)}
                      </span>
                      <p className={`text-[10px] uppercase tracking-tighter font-bold mt-0.5 ${PAY_COLORS[order.payment_status]}`}>
                        Payment: {order.payment_status}
                      </p>
                    </div>
                  </div>

                  {/* Order items + payment method */}
                  <div className="grid grid-cols-2 gap-6 mb-5 bg-surface-container-lowest/60 rounded-xl p-4">
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Order Items</p>
                      {order.items && order.items.length > 0 ? (
                        <ul className="text-sm space-y-1.5">
                          {order.items.map((item, i) => (
                            <li key={i} className="flex justify-between items-center">
                              <span className="text-on-surface">{item.item_name}</span>
                              <span className="text-on-surface-variant text-xs ml-3 shrink-0">×{item.quantity} · ${Number(item.price).toFixed(2)}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-on-surface-variant/40 italic">No items recorded</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Payment</p>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="material-symbols-outlined text-sm text-tertiary">payments</span>
                        <span className="text-on-surface capitalize">{order.payment_method || 'Cash'}</span>
                      </div>
                      {order.payment_screenshot && (
                        <button onClick={() => setPreview(order.payment_screenshot)}
                          className="flex items-center gap-1 text-[10px] font-bold text-tertiary hover:underline mt-1">
                          <span className="material-symbols-outlined text-xs">image</span> View Receipt
                        </button>
                      )}
                      <p className={`text-[10px] font-bold uppercase mt-1 ${PAY_COLORS[order.payment_status]}`}>
                        {order.payment_status}
                      </p>
                    </div>
                  </div>

                  {/* Action buttons based on status */}
                  <div className="flex gap-3">
                    {order.status === 'pending' && (
                      <>
                        <button onClick={() => handleStatusChange(order.id, 'processing')}
                          className="flex-1 py-2.5 bg-[#28A745]/10 text-[#28A745] rounded-lg font-bold text-sm hover:bg-[#28A745] hover:text-white transition-colors flex items-center justify-center gap-2">
                          <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                          Accept Order
                        </button>
                        <button onClick={() => handleStatusChange(order.id, 'cancelled')}
                          className="px-5 py-2.5 bg-[#DC3545]/10 text-[#DC3545] rounded-lg font-bold text-sm hover:bg-[#DC3545] hover:text-white transition-colors">
                          Reject
                        </button>
                      </>
                    )}
                    {order.status === 'processing' && (
                      <button onClick={() => handleStatusChange(order.id, 'completed')}
                        className="px-5 py-2 bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-lg font-bold text-xs shadow-lg flex items-center gap-2">
                        Mark as Ready
                        <span className="material-symbols-outlined text-xs">arrow_forward</span>
                      </button>
                    )}
                    {order.status === 'completed' && (
                      <span className="text-xs font-bold text-[#28A745] flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        Completed
                      </span>
                    )}
                    <span className={`ml-auto self-center px-3 py-1 rounded-full text-[10px] font-bold uppercase ${STATUS_COLORS[order.status] || ''}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Verification Summary Panel */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <div className="bg-surface-container p-6 rounded-xl space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-on-surface" style={{ fontFamily: 'Manrope' }}>Payment Verification</h3>
                <span className={`text-[10px] text-white px-2 py-0.5 rounded-full font-bold ${pending.length > 0 ? 'bg-[#DC3545]' : 'bg-[#28A745]'}`}>
                  {pending.length} PENDING
                </span>
              </div>
              {pending.slice(0, 2).map(order => (
                <div key={order.id} className="bg-surface-container-high rounded-xl p-4 space-y-4 border border-outline-variant/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-surface-container-lowest flex items-center justify-center">
                      <span className="material-symbols-outlined text-tertiary">receipt</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold">Order #{order.id}</p>
                      <p className="text-[10px] text-on-surface-variant">{order.student_name} · ${Number(order.total_amount).toFixed(2)}</p>
                    </div>
                  </div>
                  {order.payment_screenshot ? (
                    <div className="relative group cursor-zoom-in" onClick={() => setPreview(order.payment_screenshot)}>
                      <img src={order.payment_screenshot} alt="receipt"
                        className="w-full h-32 object-cover rounded-lg" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                        <span className="text-[10px] font-bold text-white bg-black/60 px-3 py-1 rounded-full">Click to Expand</span>
                      </div>
                    </div>
                  ) : (
                    <div className="h-32 bg-surface-container-lowest rounded-lg flex items-center justify-center border border-dashed border-outline-variant/20">
                      <span className="text-xs text-on-surface-variant/40">No screenshot</span>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => handlePaymentAction(order.id, 'approve')}
                      className="py-2 bg-[#28A745]/20 text-[#28A745] text-[10px] font-bold rounded-lg hover:bg-[#28A745] hover:text-white transition-colors">
                      Verify Receipt
                    </button>
                    <button onClick={() => handlePaymentAction(order.id, 'reject')}
                      className="py-2 bg-[#DC3545]/20 text-[#DC3545] text-[10px] font-bold rounded-lg hover:bg-[#DC3545] hover:text-white transition-colors">
                      Flag Issue
                    </button>
                  </div>
                </div>
              ))}
              {pending.length > 2 && (
                <button onClick={() => setTab('verify')} className="w-full text-center text-xs font-bold text-primary hover:underline">
                  +{pending.length - 2} more pending → View All
                </button>
              )}
              {pending.length === 0 && (
                <p className="text-center text-xs text-on-surface-variant py-4">No pending payments.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
