/** Visual tokens for landing-page special cards (type-based gradients & accents). */
export const LANDING_TYPE_THEME = {
  special: {
    gradient: 'from-amber-900/50 via-amber-950/30 to-[#1a1520]',
    border: 'border-amber-500/25',
    borderHover: 'group-hover:border-amber-400/50',
    bar: 'from-amber-400 via-amber-500 to-amber-600',
    glow: 'bg-amber-500/20',
    badge: 'bg-amber-500/15 text-amber-200 border-amber-400/35',
    price: 'text-amber-300',
    shadow: 'group-hover:shadow-amber-500/25',
    emoji: '🍽️',
  },
  discount: {
    gradient: 'from-emerald-900/50 via-green-950/30 to-[#101a14]',
    border: 'border-emerald-500/25',
    borderHover: 'group-hover:border-emerald-400/50',
    bar: 'from-emerald-400 via-green-500 to-emerald-600',
    glow: 'bg-emerald-500/20',
    badge: 'bg-emerald-500/15 text-emerald-200 border-emerald-400/35',
    price: 'text-emerald-300',
    shadow: 'group-hover:shadow-emerald-500/25',
    emoji: '🏷️',
  },
  new_item: {
    gradient: 'from-violet-900/50 via-purple-950/30 to-[#15101f]',
    border: 'border-violet-500/25',
    borderHover: 'group-hover:border-violet-400/50',
    bar: 'from-violet-400 via-purple-500 to-violet-600',
    glow: 'bg-violet-500/20',
    badge: 'bg-violet-500/15 text-violet-200 border-violet-400/35',
    price: 'text-violet-300',
    shadow: 'group-hover:shadow-violet-500/25',
    emoji: '🆕',
  },
  announcement: {
    gradient: 'from-sky-900/50 via-blue-950/30 to-[#0f1419]',
    border: 'border-sky-500/25',
    borderHover: 'group-hover:border-sky-400/50',
    bar: 'from-sky-400 via-blue-500 to-sky-600',
    glow: 'bg-sky-500/20',
    badge: 'bg-sky-500/15 text-sky-200 border-sky-400/35',
    price: 'text-sky-300',
    shadow: 'group-hover:shadow-sky-500/25',
    emoji: '📢',
  },
  limited_time: {
    gradient: 'from-rose-900/50 via-red-950/30 to-[#1a1012]',
    border: 'border-rose-500/25',
    borderHover: 'group-hover:border-rose-400/50',
    bar: 'from-rose-400 via-red-500 to-rose-600',
    glow: 'bg-rose-500/20',
    badge: 'bg-rose-500/15 text-rose-200 border-rose-400/35',
    price: 'text-rose-300',
    shadow: 'group-hover:shadow-rose-500/25',
    emoji: '⏰',
  },
};

export const LANDING_TYPE_LABELS = {
  special: "⭐ Today's Special",
  announcement: '📢 Announcement',
  discount: '🏷️ Discount',
  new_item: '🆕 New Item',
  limited_time: '⏰ Limited Time',
};

export function getLandingTheme(type) {
  return LANDING_TYPE_THEME[type] || LANDING_TYPE_THEME.special;
}

export function cafeteriaInitials(name) {
  if (!name) return '?';
  const parts = String(name).trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return parts[0].slice(0, 2).toUpperCase();
}
