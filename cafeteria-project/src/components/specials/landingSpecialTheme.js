/**
 * Type accents for landing specials — only top bar + badge use type color.
 * Base card uses landing page surface tokens (bg-surface-container-high).
 */
export const LANDING_TYPE_THEME = {
  special: {
    bar: 'from-amber-400 via-amber-500 to-amber-600',
    badgeBg: 'bg-amber-500/12',
    badgeBorder: 'border-amber-500/25',
    badgeText: 'text-amber-300',
    tint: 'rgba(245, 158, 11, 0.04)',
    borderTint: 'border-amber-500/20',
    borderHover: 'group-hover:border-amber-500/35',
    emoji: '🍽️',
  },
  discount: {
    bar: 'from-emerald-400 via-green-500 to-emerald-600',
    badgeBg: 'bg-emerald-500/12',
    badgeBorder: 'border-emerald-500/25',
    badgeText: 'text-emerald-300',
    tint: 'rgba(16, 185, 129, 0.04)',
    borderTint: 'border-emerald-500/20',
    borderHover: 'group-hover:border-emerald-500/35',
    emoji: '🏷️',
  },
  new_item: {
    bar: 'from-violet-400 via-purple-500 to-violet-600',
    badgeBg: 'bg-violet-500/12',
    badgeBorder: 'border-violet-500/25',
    badgeText: 'text-violet-300',
    tint: 'rgba(139, 92, 246, 0.04)',
    borderTint: 'border-violet-500/20',
    borderHover: 'group-hover:border-violet-500/35',
    emoji: '🍕',
  },
  announcement: {
    bar: 'from-sky-400 via-blue-500 to-sky-600',
    badgeBg: 'bg-sky-500/12',
    badgeBorder: 'border-sky-500/25',
    badgeText: 'text-sky-300',
    tint: 'rgba(56, 189, 248, 0.04)',
    borderTint: 'border-sky-500/20',
    borderHover: 'group-hover:border-sky-500/35',
    emoji: '📢',
  },
  limited_time: {
    bar: 'from-rose-400 via-red-500 to-rose-600',
    badgeBg: 'bg-rose-500/12',
    badgeBorder: 'border-rose-500/25',
    badgeText: 'text-rose-300',
    tint: 'rgba(244, 63, 94, 0.04)',
    borderTint: 'border-rose-500/20',
    borderHover: 'group-hover:border-rose-500/35',
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

/** Hide auto-filled descriptions that mirror the special type label. */
export function hasMeaningfulDescription(special) {
  const desc = special?.description?.trim();
  if (!desc) return false;
  const normalized = desc.toLowerCase();
  const typeLabel = (special.special_type || '').replace(/_/g, ' ').toLowerCase();
  if (normalized === typeLabel) return false;
  if (normalized === special.title?.trim().toLowerCase()) return false;
  return desc.length > 3;
}
