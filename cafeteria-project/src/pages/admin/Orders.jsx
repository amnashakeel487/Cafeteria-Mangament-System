import { useState, useEffect } from 'react';
import axios from 'axios';
import PageSEO from '../../seo/PageSEO';
import { PAGE_SEO } from '../../seo/siteConfig';
import RefundStatusBadge from '../../components/RefundStatusBadge';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [refundQueue, setRefundQueue] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('all');
  const [filterCafeteria, setFilterCafeteria] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectNote, setRejectNote] = useState('');
  const [refundLoading, setRefundLoading] = useState(false);

  const token = localStorage.getItem('adminToken');
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: '', type }), 3500);
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const [allRes, refundRes] = await Promise.all([
        axios.get('/api/admin/orders', axiosConfig),
        axios.get('/api/admin/orders/cancelled', axiosConfig),
      ]);
      setOrders(allRes.data);
      setRefundQueue(refundRes.data);
    } catch (err) {
      console.error(err);
      showToast('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleRefund = async (orderId, refund_status, refund_note = '') => {
    setRefundLoading(true);
    try {
      await axios.patch(
        `/api/admin/orders/${orderId}/refund`,
        { refund_status, refund_note },
        axiosConfig
      );
      showToast(refund_status === 'approved' ? 'Refund approved' : 'Refund rejected');
      setRejectTarget(null);
      setRejectNote('');
      fetchOrders();
    } catch (err) {
      showToast(err.response?.data?.message || 'Refund update failed', 'error');
    } finally {
      setRefundLoading(false);
    }
  };

  const uniqueCafeterias = [...new Set(orders.map((o) => o.cafeteria_name))];
  const uniqueStatuses = [...new Set(orders.map((o) => o.status || 'pending'))];
  if (!uniqueStatuses.includes('cancelled')) uniqueStatuses.push('cancelled');

  const filtered = orders.filter((o) => {
    const fullDate = o.date ? new Date(o.date) : null;
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
      case 'completed':
        return 'bg-tertiary/10 text-tertiary';
      case 'processing':
        return 'bg-secondary/10 text-secondary border border-secondary/20';
      case 'pending':
        return 'bg-surface-bright text-on-surface-variant';
      case 'cancelled':
        return 'bg-error-container/20 text-error';
      default:
        return 'bg-surface-bright text-on-surface-variant';
    }
  };

  return (
    <>
      <PageSEO {...PAGE_SEO.adminOrders} />
      <section className="pt-20 md:pt-28 px-4 md:px-10 pb-12 font-['Inter'] relative min-h-screen" aria-label="All orders">
        {toast.visible && (
          <div
            className={`fixed bottom-8 right-8 z-50 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-sm font-bold border-l-4 ${
              toast.type === 'error'
                ? 'bg-error-container/20 text-error border-error'
                : 'bg-tertiary/20 text-tertiary border-tertiary'
            }`}
          >
            <span className="material-symbols-outlined text-lg">{toast.type === 'error' ? 'error' : 'check_circle'}</span>
            {toast.message}
          </div>
        )}

        <div className="flex flex-col gap-4 mb-6 md:mb-10">
          <div>
            <h2 className="text-2xl md:text-4xl font-extrabold font-headline tracking-tight">Orders Overview</h2>
            <p className="text-on-surface-variant max-w-md mt-1 text-sm">Monitor campus-wide transactions and manage refund requests.</p>
          </div>

          <div className="flex gap-2 bg-surface-container-high p-1 rounded-xl w-fit">
            <button
              type="button"
              onClick={() => setTab('all')}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'all' ? 'bg-surface-container-highest text-primary shadow-sm' : 'text-on-surface-variant'}`}
            >
              All Orders
            </button>
            <button
              type="button"
              onClick={() => setTab('refunds')}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${tab === 'refunds' ? 'bg-surface-container-highest text-primary shadow-sm' : 'text-on-surface-variant'}`}
            >
              Refund Requests
              {refundQueue.length > 0 && (
                <span className="bg-error text-white text-[10px] px-2 py-0.5 rounded-full">{refundQueue.length}</span>
              )}
            </button>
          </div>
        </div>

        {tab === 'refunds' ? (
          <div className="space-y-4">
            {loading ? (
              <div className="py-20 flex justify-center text-primary">
                <span className="material-symbols-outlined animate-spin text-4xl">refresh</span>
              </div>
            ) : refundQueue.length === 0 ? (
              <div className="text-center py-16 bg-surface-container rounded-xl border border-outline-variant/10">
                <span className="material-symbols-outlined text-5xl text-tertiary/40">payments</span>
                <p className="text-on-surface font-bold mt-3">No pending refund requests</p>
              </div>
            ) : (
              refundQueue.map((order) => (
                <div
                  key={order.id}
                  className="bg-surface-container-high rounded-xl p-6 border border-outline-variant/10 space-y-4"
                >
                  <div className="flex flex-wrap justify-between gap-3">
                    <div>
                      <p className="font-bold text-on-surface">Order #{order.id}</p>
                      <p className="text-xs text-on-surface-variant">
                        {order.date ? new Date(order.date).toLocaleString() : '—'}
                      </p>
                    </div>
                    <RefundStatusBadge refundStatus="pending" />
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                    <p>
                      <span className="text-on-surface-variant font-bold">Student:</span> {order.student_name}
                    </p>
                    <p>
                      <span className="text-on-surface-variant font-bold">Cafeteria:</span> {order.cafeteria_name}
                    </p>
                    <p>
                      <span className="text-on-surface-variant font-bold">Amount:</span> Rs.{' '}
                      {Number(order.total_amount).toFixed(2)}
                    </p>
                    <p>
                      <span className="text-on-surface-variant font-bold">Cancelled by:</span> {order.cancelled_by}
                    </p>
                  </div>
                  {order.cancellation_reason && (
                    <p className="text-sm text-on-surface-variant bg-surface-container-lowest rounded-lg p-3">
                      <span className="font-bold">Reason:</span> {order.cancellation_reason}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      disabled={refundLoading}
                      onClick={() => handleRefund(order.id, 'approved')}
                      className="px-5 py-2.5 rounded-lg font-bold text-sm bg-[#28A745]/20 text-[#28A745] hover:bg-[#28A745] hover:text-white transition-colors"
                    >
                      Approve Refund
                    </button>
                    <button
                      type="button"
                      disabled={refundLoading}
                      onClick={() => setRejectTarget(order)}
                      className="px-5 py-2.5 rounded-lg font-bold text-sm border border-error/40 text-error hover:bg-error/10 transition-colors"
                    >
                      Reject Refund
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-3 bg-surface-container-high rounded-xl p-3 border border-outline-variant/10 mb-6">
              <div className="flex flex-col min-w-[120px] flex-1">
                <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold px-1 mb-1">Cafeteria</label>
                <select
                  value={filterCafeteria}
                  onChange={(e) => setFilterCafeteria(e.target.value)}
                  className="bg-surface-container-lowest border border-outline-variant/5 rounded-lg text-sm px-3 py-2 text-on-surface focus:ring-1 focus:ring-primary/50 outline-none"
                >
                  <option value="">All</option>
                  {uniqueCafeterias.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col min-w-[120px] flex-1">
                <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold px-1 mb-1">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-surface-container-lowest border border-outline-variant/5 rounded-lg text-sm px-3 py-2 text-on-surface capitalize focus:ring-1 focus:ring-primary/50 outline-none"
                >
                  <option value="">All</option>
                  {uniqueStatuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col min-w-[130px] flex-1">
                <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold px-1 mb-1">Date</label>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="bg-surface-container-lowest border border-outline-variant/5 rounded-lg text-sm px-3 py-2 text-on-surface focus:ring-1 focus:ring-primary/50 outline-none"
                  style={{ colorScheme: 'dark' }}
                />
              </div>
              {(filterCafeteria || filterStatus || filterDate) && (
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => {
                      setFilterCafeteria('');
                      setFilterStatus('');
                      setFilterDate('');
                    }}
                    className="h-9 px-3 text-xs bg-error-container/10 text-error hover:bg-error-container/30 rounded-lg transition-colors font-bold flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">close</span> Clear
                  </button>
                </div>
              )}
            </div>

            <div className="bg-surface-container rounded-xl overflow-hidden relative border border-outline-variant/5 shadow-2xl">
              {loading && (
                <div className="absolute inset-0 bg-surface-container-highest/60 backdrop-blur-md z-10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined animate-spin text-4xl">refresh</span>
                </div>
              )}
              <div className="p-4 md:p-8 flex justify-between items-center border-b border-outline-variant/5 bg-surface-container-low/50">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">analytics</span>
                  </div>
                  <div>
                    <h3 className="text-base md:text-xl font-bold font-headline">Transaction Log</h3>
                    <p className="text-xs text-on-surface-variant hidden sm:block">Global overview of all processed orders.</p>
                  </div>
                </div>
                <div className="bg-surface-container-highest px-3 py-1.5 rounded-lg flex items-center gap-2 border border-outline-variant/5">
                  <span className="material-symbols-outlined text-tertiary text-sm">receipt_long</span>
                  <span className="font-bold text-on-surface text-sm">{filtered.length}</span>
                </div>
              </div>

              <div className="md:hidden divide-y divide-outline-variant/5">
                {filtered.map((order) => (
                  <div key={order.id} className="p-4 space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <p className="font-bold text-sm text-on-surface">{order.student_name}</p>
                        <p className="text-xs text-on-surface-variant">{order.cafeteria_name}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full uppercase ${getStatusColor(order.status)}`}>
                          {order.status || 'Pending'}
                        </span>
                        {order.status === 'cancelled' && order.refund_status && order.refund_status !== 'not_applicable' && (
                          <RefundStatusBadge refundStatus={order.refund_status} />
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-on-surface-variant">
                      <span>{new Date(order.date).toLocaleDateString()}</span>
                      <span className="font-bold text-primary">Rs. {Number(order.total_amount).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
                {filtered.length === 0 && !loading && (
                  <p className="p-8 text-center text-on-surface-variant text-sm">No transactions match your filters.</p>
                )}
              </div>

              <div className="hidden md:block overflow-x-auto min-h-[400px]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-widest text-on-surface-variant bg-surface-container-lowest/30">
                      <th className="px-8 py-5 font-bold">Order ID</th>
                      <th className="px-8 py-5 font-bold">Student</th>
                      <th className="px-8 py-5 font-bold">Cafeteria Hub</th>
                      <th className="px-8 py-5 font-bold">Total Amount</th>
                      <th className="px-8 py-5 font-bold">Date & Time</th>
                      <th className="px-8 py-5 font-bold text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/5">
                    {filtered.map((order) => (
                      <tr key={order.id} className="hover:bg-surface-container-highest/60 transition-colors group">
                        <td className="px-8 py-6 text-on-surface-variant font-bold text-sm">ORD-{order.id.toString().padStart(4, '0')}</td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold uppercase">
                              {order.student_name?.charAt(0)}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-on-surface">{order.student_name}</span>
                              <span className="text-[10px] text-on-surface-variant opacity-80">{order.student_email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="text-sm font-bold text-on-surface flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm text-tertiary">store</span>
                            {order.cafeteria_name}
                          </span>
                        </td>
                        <td className="px-8 py-6 font-extrabold text-sm text-primary">Rs. {Number(order.total_amount).toFixed(2)}</td>
                        <td className="px-8 py-6 text-sm font-medium text-on-surface-variant">
                          {new Date(order.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex flex-col items-end gap-1">
                            <span className={`px-4 py-1.5 text-[10px] font-extrabold rounded-full uppercase tracking-widest ${getStatusColor(order.status)}`}>
                              {order.status || 'Pending'}
                            </span>
                            {order.status === 'cancelled' && order.refund_status && order.refund_status !== 'not_applicable' && (
                              <RefundStatusBadge refundStatus={order.refund_status} />
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && !loading && (
                      <tr>
                        <td colSpan="6" className="px-8 py-24 text-center">
                          <p className="text-on-surface-variant font-bold">No transactions match your current filters.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {rejectTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0c0c1d]/80 backdrop-blur p-4">
            <div className="bg-surface-container-high w-full max-w-md rounded-3xl p-8 border border-outline-variant/10 shadow-2xl">
              <h3 className="text-xl font-bold text-on-surface mb-2">Reject Refund</h3>
              <p className="text-sm text-on-surface-variant mb-4">Order #{rejectTarget.id} — provide a note for the student.</p>
              <textarea
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                rows={4}
                placeholder="Reason for rejection..."
                className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-xl px-4 py-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30 resize-none mb-4"
              />
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setRejectTarget(null);
                    setRejectNote('');
                  }}
                  className="px-4 py-2 rounded-lg font-bold text-on-surface-variant"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={refundLoading || !rejectNote.trim()}
                  onClick={() => handleRefund(rejectTarget.id, 'rejected', rejectNote.trim())}
                  className="px-4 py-2 rounded-lg font-bold bg-error text-white disabled:opacity-50"
                >
                  Submit Rejection
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
