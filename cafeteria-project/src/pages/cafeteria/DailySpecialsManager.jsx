import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import PageSEO from '../../seo/PageSEO';
import SpecialTypeBadge from '../../components/specials/SpecialTypeBadge';
import CreateSpecialModal from '../../components/specials/CreateSpecialModal';
import {
  deleteCafeteriaSpecial,
  fetchCafeteriaSpecials,
  reorderCafeteriaSpecials,
  toggleCafeteriaSpecial,
  updateCafeteriaSpecial,
} from '../../utils/specialsApi';
import { formatPrice } from '../../utils/currency';
import { formatSpecialTimeWindow } from '../../utils/specialsApi';

const BASE = '';

function pktDateStr(offsetDays = 0) {
  const d = new Date(Date.now() + 5 * 60 * 60 * 1000);
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

export default function DailySpecialsManager() {
  const [dateTab, setDateTab] = useState('today');
  const [specials, setSpecials] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [initialType, setInitialType] = useState('special');
  const [editSpecial, setEditSpecial] = useState(null);
  const [orderDirty, setOrderDirty] = useState(false);
  const [dragId, setDragId] = useState(null);
  const [toast, setToast] = useState('');
  const [tipsOpen, setTipsOpen] = useState(true);

  const selectedDate = useMemo(() => {
    if (dateTab === 'tomorrow') return pktDateStr(1);
    return pktDateStr(0);
  }, [dateTab]);

  const token = localStorage.getItem('cafeteriaToken');
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  const loadMenu = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE}/api/cafeteria/menu`, axiosConfig);
      setMenuItems(res.data || []);
    } catch {
      setMenuItems([]);
    }
  }, [token]);

  const loadSpecials = useCallback(async () => {
    setLoading(true);
    try {
      if (dateTab === 'week') {
        const dates = Array.from({ length: 7 }, (_, i) => pktDateStr(-i));
        const batches = await Promise.all(
          dates.map((d) => fetchCafeteriaSpecials(d, 'all'))
        );
        setSpecials(batches.flat());
      } else {
        const rows = await fetchCafeteriaSpecials(selectedDate, 'all');
        setSpecials(rows || []);
      }
    } catch {
      setSpecials([]);
    } finally {
      setLoading(false);
      setOrderDirty(false);
    }
  }, [dateTab, selectedDate]);

  useEffect(() => {
    loadMenu();
  }, [loadMenu]);

  useEffect(() => {
    loadSpecials();
  }, [loadSpecials]);

  const todayActive = specials.filter(
    (s) => s.valid_date === pktDateStr(0) && s.is_active
  );
  const stats = {
    active: todayActive.length,
    views: todayActive.reduce((n, s) => n + (s.view_count || 0), 0),
    featured: todayActive.filter((s) => s.is_featured).length,
    announcements: todayActive.filter((s) => s.special_type === 'announcement').length,
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const openCreate = (type = 'special') => {
    setEditSpecial(null);
    setInitialType(type);
    setModalOpen(true);
  };

  const openEdit = (s) => {
    setEditSpecial(s);
    setInitialType(s.special_type);
    setModalOpen(true);
  };

  const handleToggle = async (s) => {
    try {
      await toggleCafeteriaSpecial(s.id);
      loadSpecials();
    } catch {
      showToast('Failed to update status');
    }
  };

  const handleFeatured = async (s) => {
    try {
      await updateCafeteriaSpecial(s.id, { isFeatured: !s.is_featured });
      loadSpecials();
    } catch {
      showToast('Failed to update featured');
    }
  };

  const handleDelete = async (s) => {
    if (!window.confirm(`Remove "${s.title}"?`)) return;
    try {
      await deleteCafeteriaSpecial(s.id);
      showToast('Special removed');
      loadSpecials();
    } catch {
      showToast('Delete failed');
    }
  };

  const moveItem = (id, dir) => {
    const idx = specials.findIndex((s) => s.id === id);
    if (idx < 0) return;
    const next = idx + dir;
    if (next < 0 || next >= specials.length) return;
    const copy = [...specials];
    [copy[idx], copy[next]] = [copy[next], copy[idx]];
    setSpecials(copy);
    setOrderDirty(true);
  };

  const saveOrder = async () => {
    try {
      await reorderCafeteriaSpecials(
        specials.map((s, i) => ({ id: s.id, display_order: i }))
      );
      showToast('Order saved');
      setOrderDirty(false);
    } catch {
      showToast('Failed to save order');
    }
  };

  const onDragStart = (id) => setDragId(id);
  const onDrop = (targetId) => {
    if (!dragId || dragId === targetId) return;
    const from = specials.findIndex((s) => s.id === dragId);
    const to = specials.findIndex((s) => s.id === targetId);
    if (from < 0 || to < 0) return;
    const copy = [...specials];
    const [item] = copy.splice(from, 1);
    copy.splice(to, 0, item);
    setSpecials(copy);
    setOrderDirty(true);
    setDragId(null);
  };

  const listForTab =
    dateTab === 'week'
      ? specials
      : specials.filter((s) => s.valid_date === selectedDate);

  return (
    <>
      <PageSEO title="Daily Specials" description="Manage today's specials and announcements" />
      {toast && (
        <div className="fixed top-20 right-4 z-[80] px-4 py-3 rounded-xl bg-[#28283a] border border-[#594139]/30 text-sm font-bold shadow-xl">
          {toast}
        </div>
      )}

      <div className="p-4 md:p-8 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black text-on-surface">Daily Specials Manager</h1>
            <p className="text-sm text-on-surface-variant mt-1">
              Post today&apos;s specials and announcements for students
            </p>
          </div>
          <button
            type="button"
            onClick={() => openCreate('special')}
            className="px-5 py-2.5 rounded-lg font-bold bg-gradient-to-br from-[#FFB59D] to-[#FF6B35] text-[#5d1900]"
          >
            Post New Special
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Active Today', value: stats.active },
            { label: 'Views Today', value: stats.views },
            { label: 'On Landing', value: stats.featured },
            { label: 'Announcements', value: stats.announcements },
          ].map((c) => (
            <div
              key={c.label}
              className="p-4 rounded-xl bg-surface-container-high border border-outline-variant/10"
            >
              <p className="text-2xl font-black text-primary">{c.value}</p>
              <p className="text-xs text-on-surface-variant mt-1">{c.label}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { id: 'today', label: 'Today' },
            { id: 'tomorrow', label: 'Tomorrow' },
            { id: 'week', label: 'Past 7 days' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setDateTab(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-bold ${
                dateTab === t.id ? 'bg-[#FF6B35]/20 text-[#FFB59D]' : 'bg-surface-container-high text-on-surface-variant'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { type: 'announcement', label: '📢 Quick Announcement' },
            { type: 'discount', label: '🏷️ Post Discount' },
            { type: 'special', label: "⭐ Today's Special" },
            { type: 'new_item', label: '🆕 New Item Alert' },
          ].map((q) => (
            <button
              key={q.type}
              type="button"
              onClick={() => openCreate(q.type)}
              className="text-xs font-bold px-3 py-2 rounded-lg border border-outline-variant/20 hover:border-primary/40"
            >
              {q.label}
            </button>
          ))}
        </div>

        {orderDirty && (
          <div className="mb-4 flex justify-end">
            <button
              type="button"
              onClick={saveOrder}
              className="px-4 py-2 rounded-lg font-bold bg-primary text-on-primary"
            >
              Save Order
            </button>
          </div>
        )}

        {loading ? (
          <div className="py-16 text-center text-on-surface-variant">Loading...</div>
        ) : !listForTab.length ? (
          <div className="py-16 text-center rounded-2xl border border-dashed border-outline-variant/30">
            <p className="text-lg font-bold mb-2">No specials posted yet</p>
            <button
              type="button"
              onClick={() => openCreate('special')}
              className="text-[#FFB59D] font-bold"
            >
              Post Your First Special →
            </button>
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {['special', 'announcement', 'discount', 'new_item'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => openCreate(t)}
                  className="text-xs px-3 py-1.5 rounded-full bg-surface-container-high"
                >
                  {t.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <ul className="space-y-4">
            {listForTab.map((s) => (
              <li
                key={s.id}
                draggable
                onDragStart={() => onDragStart(s.id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDrop(s.id)}
                className="p-4 rounded-xl bg-surface-container-high border border-outline-variant/10 flex flex-col sm:flex-row gap-4"
              >
                <div className="flex items-start gap-2 sm:w-8 cursor-grab text-on-surface-variant">
                  <span className="material-symbols-outlined">drag_indicator</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <SpecialTypeBadge type={s.special_type} size="sm" />
                    {s.is_featured && (
                      <span className="text-[10px] font-bold text-amber-400">✨ Featured</span>
                    )}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        s.is_active ? 'bg-emerald-500/20 text-emerald-300' : 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      {s.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg">{s.title}</h3>
                  {s.description && (
                    <p className="text-sm text-on-surface-variant line-clamp-2 mt-1">{s.description}</p>
                  )}
                  <p className="text-xs text-on-surface-variant mt-2">
                    {s.valid_date}
                    {formatSpecialTimeWindow(s.start_time, s.end_time)
                      ? ` · ${formatSpecialTimeWindow(s.start_time, s.end_time)}`
                      : ''}
                    {s.special_price != null && ` · ${formatPrice(s.special_price)}`}
                  </p>
                  <p className="text-xs text-on-surface-variant mt-1">👁 {s.view_count || 0} views</p>
                </div>
                <div className="flex flex-col gap-2 sm:items-end">
                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={s.is_active}
                      onChange={() => handleToggle(s)}
                    />
                    Active
                  </label>
                  <label className="flex items-center gap-2 text-xs" title="Featured specials appear on landing page">
                    <input
                      type="checkbox"
                      checked={s.is_featured}
                      onChange={() => handleFeatured(s)}
                    />
                    Featured
                  </label>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      className="p-1 text-on-surface-variant"
                      onClick={() => moveItem(s.id, -1)}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="p-1 text-on-surface-variant"
                      onClick={() => moveItem(s.id, 1)}
                    >
                      ↓
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(s)}
                      className="text-xs font-bold text-[#FFB59D] px-3 py-1.5 rounded border border-[#594139]/30"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(s)}
                      className="text-xs font-bold text-rose-400 px-3 py-1.5 rounded border border-rose-500/30"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        <button
          type="button"
          onClick={() => setTipsOpen((o) => !o)}
          className="mt-10 w-full text-left p-4 rounded-xl bg-surface-container-low border border-outline-variant/10"
        >
          <span className="font-bold">💡 Tips for better engagement</span>
          {tipsOpen && (
            <ul className="mt-3 text-sm text-on-surface-variant space-y-1 list-disc pl-5">
              <li>Featured specials get more visibility on the landing page</li>
              <li>Post before 9 AM for maximum visibility</li>
              <li>Discount specials drive the most orders</li>
            </ul>
          )}
        </button>
      </div>

      <CreateSpecialModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditSpecial(null);
        }}
        onSuccess={() => {
          setModalOpen(false);
          setEditSpecial(null);
          showToast('Special saved!');
          loadSpecials();
        }}
        menuItems={menuItems}
        initialType={initialType}
        editSpecial={editSpecial}
      />
    </>
  );
}
