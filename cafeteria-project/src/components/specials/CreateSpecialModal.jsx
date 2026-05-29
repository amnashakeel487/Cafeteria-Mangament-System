import { useEffect, useMemo, useState } from 'react';
import SpecialTypeBadge from './SpecialTypeBadge';
import { createCafeteriaSpecial, updateCafeteriaSpecial } from '../../utils/specialsApi';

const TYPES = [
  { id: 'special', label: "Today's Special", icon: 'star' },
  { id: 'announcement', label: 'Announcement', icon: 'campaign' },
  { id: 'discount', label: 'Discount', icon: 'sell' },
  { id: 'new_item', label: 'New Item', icon: 'new_releases' },
  { id: 'limited_time', label: 'Limited Time', icon: 'timer' },
];

function todayStr() {
  const pkt = new Date(Date.now() + 5 * 60 * 60 * 1000);
  return `${pkt.getUTCFullYear()}-${String(pkt.getUTCMonth() + 1).padStart(2, '0')}-${String(pkt.getUTCDate()).padStart(2, '0')}`;
}

export default function CreateSpecialModal({
  isOpen,
  onClose,
  onSuccess,
  menuItems = [],
  initialType = 'special',
  editSpecial = null,
}) {
  const [specialType, setSpecialType] = useState(initialType);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [menuItemId, setMenuItemId] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [specialPrice, setSpecialPrice] = useState('');
  const [discountPct, setDiscountPct] = useState('');
  const [usePctDirect, setUsePctDirect] = useState(false);
  const [validDate, setValidDate] = useState(todayStr());
  const [allDay, setAllDay] = useState(true);
  const [startTime, setStartTime] = useState('12:00');
  const [endTime, setEndTime] = useState('15:00');
  const [isFeatured, setIsFeatured] = useState(false);
  const [displayOrder, setDisplayOrder] = useState(0);
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [itemSearch, setItemSearch] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setSpecialType(editSpecial?.special_type || initialType);
    if (editSpecial) {
      setTitle(editSpecial.title || '');
      setDescription(editSpecial.description || '');
      setMenuItemId(editSpecial.menu_item_id ? String(editSpecial.menu_item_id) : '');
      setOriginalPrice(editSpecial.original_price ?? '');
      setSpecialPrice(editSpecial.special_price ?? '');
      setDiscountPct(editSpecial.discount_percentage ?? '');
      setValidDate(editSpecial.valid_date || todayStr());
      setAllDay(
        !editSpecial.start_time ||
          (editSpecial.start_time.startsWith('00:00') && editSpecial.end_time?.startsWith('23:59'))
      );
      setStartTime(String(editSpecial.start_time || '12:00').slice(0, 5));
      setEndTime(String(editSpecial.end_time || '15:00').slice(0, 5));
      setIsFeatured(Boolean(editSpecial.is_featured));
      setDisplayOrder(editSpecial.display_order || 0);
      setImageUrl(editSpecial.image_url || '');
    } else {
      setTitle('');
      setDescription('');
      setMenuItemId('');
      setOriginalPrice('');
      setSpecialPrice('');
      setDiscountPct('');
      setValidDate(todayStr());
      setAllDay(true);
      setIsFeatured(false);
      setDisplayOrder(0);
      setImageUrl('');
    }
    setError('');
  }, [isOpen, editSpecial, initialType]);

  const filteredItems = useMemo(() => {
    const q = itemSearch.toLowerCase();
    return menuItems.filter((m) => !q || (m.name || '').toLowerCase().includes(q));
  }, [menuItems, itemSearch]);

  const computedPct = useMemo(() => {
    const o = parseFloat(originalPrice);
    const s = parseFloat(specialPrice);
    if (!o || Number.isNaN(s)) return null;
    return Math.round(((o - s) / o) * 100);
  }, [originalPrice, specialPrice]);

  const showPricing = specialType === 'discount' || menuItemId;

  const handleItemPick = (id) => {
    setMenuItemId(String(id));
    const item = menuItems.find((m) => String(m.id) === String(id));
    if (item?.price != null) setOriginalPrice(String(item.price));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const body = {
      title,
      description: description || undefined,
      specialType,
      menuItemId: menuItemId || undefined,
      originalPrice: originalPrice !== '' ? parseFloat(originalPrice) : undefined,
      specialPrice: specialPrice !== '' ? parseFloat(specialPrice) : undefined,
      discountPercentage: usePctDirect && discountPct !== '' ? parseInt(discountPct, 10) : undefined,
      validDate,
      startTime: allDay ? '00:00' : startTime,
      endTime: allDay ? '23:59' : endTime,
      isFeatured,
      displayOrder,
      imageUrl: imageUrl || undefined,
    };
    try {
      const result = editSpecial
        ? await updateCafeteriaSpecial(editSpecial.id, body)
        : await createCafeteriaSpecial(body);
      onSuccess?.(result);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save special');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div
        className="bg-[#28283a] rounded-2xl border border-[#594139]/30 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-[#594139]/20">
          <h2 className="text-xl font-bold text-[#E3E0F8] font-['Manrope']">
            {editSpecial ? 'Edit Special' : 'Post New Special'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="text-xs font-bold text-[#e1bfb5] uppercase mb-2 block">Type</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSpecialType(t.id)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    specialType === t.id
                      ? 'border-[#FF6B35] bg-[#FF6B35]/10'
                      : 'border-[#594139]/30 hover:border-[#594139]/60'
                  }`}
                >
                  <span className="material-symbols-outlined text-[#FFB59D] text-lg">{t.icon}</span>
                  <p className="text-xs font-bold text-[#E3E0F8] mt-1">{t.label}</p>
                  <div className="mt-2">
                    <SpecialTypeBadge type={t.id} size="sm" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#e1bfb5] uppercase">Title *</label>
            <input
              className="mt-1 w-full bg-[#0c0c1d] border border-[#594139]/30 rounded-lg px-3 py-2 text-[#E3E0F8]"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={100}
              placeholder="e.g. Biryani Special Today!"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#e1bfb5] uppercase">
              Description ({description.length}/300)
            </label>
            <textarea
              className="mt-1 w-full bg-[#0c0c1d] border border-[#594139]/30 rounded-lg px-3 py-2 text-[#E3E0F8] min-h-[80px]"
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 300))}
              maxLength={300}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#e1bfb5] uppercase">Link menu item (optional)</label>
            <input
              className="mt-1 w-full bg-[#0c0c1d] border border-[#594139]/30 rounded-lg px-3 py-2 text-sm text-[#E3E0F8]"
              placeholder="Search items..."
              value={itemSearch}
              onChange={(e) => setItemSearch(e.target.value)}
            />
            <select
              className="mt-2 w-full bg-[#0c0c1d] border border-[#594139]/30 rounded-lg px-3 py-2 text-[#E3E0F8]"
              value={menuItemId}
              onChange={(e) => handleItemPick(e.target.value)}
            >
              <option value="">— None —</option>
              {filteredItems.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} — Rs {m.price}
                </option>
              ))}
            </select>
          </div>

          {showPricing && (
            <div className="space-y-3 p-4 rounded-lg bg-[#0c0c1d]/50 border border-[#594139]/20">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={usePctDirect}
                  onChange={(e) => setUsePctDirect(e.target.checked)}
                  id="pctDirect"
                />
                <label htmlFor="pctDirect" className="text-sm text-[#e1bfb5]">
                  Enter % directly
                </label>
              </div>
              {usePctDirect ? (
                <input
                  type="number"
                  min={1}
                  max={99}
                  className="w-full bg-[#0c0c1d] border border-[#594139]/30 rounded-lg px-3 py-2 text-[#E3E0F8]"
                  value={discountPct}
                  onChange={(e) => setDiscountPct(e.target.value)}
                  placeholder="Discount %"
                />
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    step="0.01"
                    className="bg-[#0c0c1d] border border-[#594139]/30 rounded-lg px-3 py-2 text-[#E3E0F8]"
                    placeholder="Original"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                  />
                  <input
                    type="number"
                    step="0.01"
                    className="bg-[#0c0c1d] border border-[#594139]/30 rounded-lg px-3 py-2 text-[#E3E0F8]"
                    placeholder="Special"
                    value={specialPrice}
                    onChange={(e) => setSpecialPrice(e.target.value)}
                  />
                </div>
              )}
              {computedPct != null && !usePctDirect && (
                <p className="text-xs text-emerald-400">= {computedPct}% discount</p>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[140px]">
              <label className="text-xs font-bold text-[#e1bfb5] uppercase">Valid date</label>
              <input
                type="date"
                min={todayStr()}
                className="mt-1 w-full bg-[#0c0c1d] border border-[#594139]/30 rounded-lg px-3 py-2 text-[#E3E0F8]"
                value={validDate}
                onChange={(e) => setValidDate(e.target.value)}
              />
            </div>
            <button
              type="button"
              className="px-3 py-2 text-xs font-bold text-[#FFB59D] border border-[#594139]/30 rounded-lg"
              onClick={() => setValidDate(todayStr())}
            >
              Today Only
            </button>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm text-[#e1bfb5]">
              <input type="checkbox" checked={allDay} onChange={(e) => setAllDay(e.target.checked)} />
              All day
            </label>
            {!allDay && (
              <div className="grid grid-cols-2 gap-3 mt-2">
                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="bg-[#0c0c1d] border border-[#594139]/30 rounded-lg px-3 py-2 text-[#E3E0F8]" />
                <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="bg-[#0c0c1d] border border-[#594139]/30 rounded-lg px-3 py-2 text-[#E3E0F8]" />
              </div>
            )}
          </div>

          <label className="flex items-start gap-2 text-sm text-[#e1bfb5]">
            <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
            <span>Feature on landing page (max 6 shown)</span>
          </label>

          <div>
            <label className="text-xs font-bold text-[#e1bfb5] uppercase">Image URL (optional)</label>
            <input
              className="mt-1 w-full bg-[#0c0c1d] border border-[#594139]/30 rounded-lg px-3 py-2 text-[#E3E0F8]"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
            {imageUrl && (
              <img src={imageUrl} alt="" className="mt-2 h-20 rounded-lg object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
            )}
          </div>

          {error && <p className="text-sm text-[#ffb4ab]">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-lg border border-[#594139]/30 text-[#e1bfb5] font-bold">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-lg bg-gradient-to-br from-[#FFB59D] to-[#FF6B35] text-[#5d1900] font-bold disabled:opacity-60"
            >
              {loading ? 'Saving...' : editSpecial ? 'Update' : 'Post Special'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
