const STYLES = {
  special: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  announcement: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
  discount: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  new_item: 'bg-violet-500/20 text-violet-300 border-violet-500/40',
  limited_time: 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse',
};

const LABELS = {
  special: "⭐ Today's Special",
  announcement: '📢 Announcement',
  discount: '🏷️ Discount',
  new_item: '🆕 New Item',
  limited_time: '⏰ Limited Time',
};

export default function SpecialTypeBadge({ type, size = 'md' }) {
  const cls = STYLES[type] || STYLES.special;
  const text = size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-1';
  return (
    <span className={`inline-flex font-bold rounded-full border ${cls} ${text}`}>
      {LABELS[type] || type}
    </span>
  );
}
