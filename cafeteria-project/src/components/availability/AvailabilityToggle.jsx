import { useEffect, useRef, useState } from 'react';
import axios from 'axios';

const REASONS = [
  { value: 'sold_out', label: 'Sold Out Today' },
  { value: 'out_of_stock', label: 'Out of Stock' },
  { value: 'temporarily_unavailable', label: 'Temporarily Unavailable' },
  { value: 'other', label: 'Other' },
];

function timeAgo(iso) {
  if (!iso) return null;
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

export default function AvailabilityToggle({
  menuItem,
  onToggle,
  showLabel = true,
  size = 'md',
  axiosConfig,
  onToast,
}) {
  const available = menuItem?.is_available !== false;
  const [optimistic, setOptimistic] = useState(available);
  const [loading, setLoading] = useState(false);
  const [showReason, setShowReason] = useState(false);
  const [reason, setReason] = useState('sold_out');
  const submitTimer = useRef(null);

  useEffect(() => {
    setOptimistic(menuItem?.is_available !== false);
  }, [menuItem?.id, menuItem?.is_available]);

  const pillW = size === 'sm' ? 'w-10 h-5' : 'w-12 h-[26px]';
  const thumb = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  const translateOn = size === 'sm' ? 'translate-x-5' : 'translate-x-[22px]';

  const patchAvailability = async (isAvailable, reasonValue) => {
    setLoading(true);
    try {
      const res = await axios.patch(
        `/api/cafeteria/availability/${menuItem.id}`,
        { isAvailable, reason: reasonValue },
        axiosConfig
      );
      setOptimistic(isAvailable);
      onToggle?.(res.data);
      onToast?.(
        isAvailable
          ? `${menuItem.name} is now available`
          : `${menuItem.name} marked as sold out`,
        'success'
      );
    } catch (err) {
      setOptimistic(menuItem?.is_available !== false);
      onToast?.(err.response?.data?.message || 'Failed to update availability', 'error');
    } finally {
      setLoading(false);
      setShowReason(false);
    }
  };

  const handleToggle = () => {
    if (loading) return;
    if (optimistic) {
      setShowReason(true);
      setReason('sold_out');
      if (submitTimer.current) clearTimeout(submitTimer.current);
      submitTimer.current = setTimeout(() => {
        setOptimistic(false);
        patchAvailability(false, reason);
      }, 800);
      return;
    }
    setOptimistic(true);
    patchAvailability(true, null);
  };

  const handleReasonChange = (value) => {
    setReason(value);
    if (submitTimer.current) clearTimeout(submitTimer.current);
    submitTimer.current = setTimeout(() => {
      setOptimistic(false);
      patchAvailability(false, value);
    }, 800);
  };

  const cancelReason = () => {
    if (submitTimer.current) clearTimeout(submitTimer.current);
    setShowReason(false);
    setOptimistic(true);
  };

  return (
    <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={optimistic}
          aria-label={optimistic ? 'Mark as sold out' : 'Mark as available'}
          disabled={loading}
          onClick={handleToggle}
          className={`relative shrink-0 rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-50 ${pillW} ${
            optimistic
              ? 'bg-[#28A745]/80 shadow-[0_0_12px_rgba(40,167,69,0.35)]'
              : 'bg-on-surface-variant/40'
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 rounded-full bg-white shadow transition-transform duration-200 flex items-center justify-center ${thumb} ${
              optimistic ? translateOn : 'translate-x-0'
            }`}
          >
            {loading && (
              <span className="material-symbols-outlined text-[14px] animate-spin text-on-surface-variant">
                progress_activity
              </span>
            )}
          </span>
        </button>
        {showLabel && (
          <div className="min-w-0">
            <p
              className={`text-sm font-bold flex items-center gap-1.5 ${
                optimistic ? 'text-[#6ee7b7]' : 'text-error'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${optimistic ? 'bg-[#34d399] animate-pulse' : 'bg-error'}`}
              />
              {optimistic ? 'Available' : 'Sold Out'}
            </p>
            {!optimistic && menuItem?.sold_out_at && (
              <p className="text-[10px] text-on-surface-variant/70">
                Marked sold out {timeAgo(menuItem.sold_out_at)}
              </p>
            )}
          </div>
        )}
      </div>

      {showReason && optimistic && (
        <div className="rounded-lg border border-outline-variant/15 bg-surface-container-lowest p-2 space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">
            Reason
          </label>
          <select
            value={reason}
            onChange={(e) => handleReasonChange(e.target.value)}
            className="w-full text-xs rounded-lg bg-surface-container-high border border-outline-variant/10 px-2 py-1.5 text-on-surface outline-none focus:ring-1 focus:ring-primary/40"
          >
            {REASONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={cancelReason}
            className="text-[10px] text-on-surface-variant hover:text-on-surface underline"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
