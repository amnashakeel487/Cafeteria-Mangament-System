import { isMenuItemAvailable } from '../../utils/isMenuItemAvailable';

function timeAgo(iso) {
  if (!iso) return null;
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const SIZE = {
  sm: 'text-[10px] px-2 py-0.5 gap-1',
  md: 'text-xs px-2.5 py-1 gap-1.5',
  lg: 'text-sm px-3 py-1.5 gap-2',
};

export default function AvailabilityBadge({
  isAvailable: isAvailableProp,
  soldOutAt,
  size = 'md',
  animated = true,
  className = '',
}) {
  const available = isAvailableProp !== false;
  const sizeClass = SIZE[size] || SIZE.md;
  const ago = timeAgo(soldOutAt);

  if (available) {
    return (
      <span
        className={`inline-flex items-center font-bold rounded-full bg-[#28A745]/15 text-[#6ee7b7] border border-[#28A745]/30 ${sizeClass} ${className}`}
        title="Available to order"
      >
        <span
          className={`w-1.5 h-1.5 rounded-full bg-[#34d399] ${animated ? 'animate-pulse' : ''}`}
          aria-hidden
        />
        Available
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center font-bold rounded-full bg-error/15 text-error border border-error/30 ${sizeClass} ${className}`}
      title={ago ? `Sold out since ${ago}` : 'Sold out today'}
    >
      <span className="material-symbols-outlined text-[12px]" aria-hidden>
        block
      </span>
      Sold Out Today
    </span>
  );
}

export function AvailabilityBadgeFromItem({ item, ...props }) {
  return (
    <AvailabilityBadge
      isAvailable={isMenuItemAvailable(item)}
      soldOutAt={item?.sold_out_at}
      {...props}
    />
  );
}
