/** Theme tokens for split-panel login pages (customer-login.html layout). */

export const PORTAL_THEMES = {
  customer: {
    accent: '#06d6c7',
    accentDim: '#04a89c',
    accentGlow: 'rgba(6,214,199,0.18)',
    accentHoverBg: 'rgba(6,214,199,0.08)',
    accentBorderHover: 'rgba(6,214,199,0.3)',
    orb1: 'bg-[#06d6c7]/[0.12]',
    orb2: 'bg-[#0696c7]/[0.08]',
    orb3: 'bg-[#06d6c7]/[0.06]',
    leftPanelTint: 'bg-[#111827]',
    centerEmoji: '🎓',
    portalLabel: 'Customer Portal',
    tagline: 'Fresh food, just a click away',
    features: [
      'Browse daily menus & specials',
      'Place orders in seconds',
      'Track your order in real-time',
      'Easy campus pickup',
    ],
    avatars: [
      { initials: 'AK', className: 'bg-[#1d4ed8]' },
      { initials: 'SH', className: 'bg-[#7c3aed]' },
      { initials: 'MR', className: 'bg-[#059669]' },
      { initials: 'ZB', className: 'bg-[#d97706]' },
    ],
    proofStrong: '500+ students',
    proofLine: 'ordering daily at COMSTAS campus',
    formEmoji: '👋',
    heading: 'Welcome Back',
    subtext: 'Sign in to browse menus, place orders,\nand track your pickup.',
    btnGradient: 'bg-gradient-to-br from-[#06d6c7] to-[#0891b2]',
    btnText: 'text-[#0a1a1a]',
    btnHoverShadow: '0 8px 24px rgba(6,214,199,0.3)',
    btnLoadingShadow: ['0 0 0 rgba(6,214,199,0)', '0 0 24px rgba(6,214,199,0.4)', '0 0 0 rgba(6,214,199,0)'],
  },
  cafe: {
    accent: '#ff6b35',
    accentDim: '#e85a20',
    accentGlow: 'rgba(255,107,53,0.22)',
    accentHoverBg: 'rgba(255,107,53,0.08)',
    accentBorderHover: 'rgba(255,107,53,0.35)',
    orb1: 'bg-[#ff6b35]/[0.14]',
    orb2: 'bg-[#ffb59d]/[0.10]',
    orb3: 'bg-[#f97316]/[0.08]',
    leftPanelTint: 'bg-[#111827]',
    centerEmoji: '☕',
    portalLabel: 'Cafe Owner Portal',
    tagline: 'Manage your cafe with ease',
    features: [
      'Manage incoming orders',
      'Update menu & daily deals',
      'Track payments & history',
      'View sales at a glance',
    ],
    avatars: [
      { initials: 'SR', className: 'bg-[#ff6b35]' },
      { initials: 'HM', className: 'bg-[#76331b]' },
      { initials: 'LC', className: 'bg-[#fbbf24]' },
      { initials: 'KP', className: 'bg-[#fb923c]' },
    ],
    proofStrong: 'Trusted by staff',
    proofLine: 'across COMSTAS campus cafeterias',
    formEmoji: '☕',
    heading: 'Cafe Owner Login',
    subtext: 'Access your dashboard to manage menus,\norders, and payments.',
    btnGradient: 'bg-gradient-to-br from-[#ffb59d] via-[#ff6b35] to-[#e85a20]',
    btnText: 'text-[#5f1900]',
    btnHoverShadow: '0 8px 24px rgba(255,107,53,0.35)',
    btnLoadingShadow: ['0 0 0 rgba(255,107,53,0)', '0 0 24px rgba(255,107,53,0.45)', '0 0 0 rgba(255,107,53,0)'],
  },
  admin: {
    accent: '#ff6b35',
    accentDim: '#ffb59d',
    accentGlow: 'rgba(255,107,53,0.2)',
    accentHoverBg: 'rgba(255,107,53,0.08)',
    accentBorderHover: 'rgba(255,107,53,0.35)',
    orb1: 'bg-[#ff6b35]/[0.12]',
    orb2: 'bg-[#59d5fb]/[0.08]',
    orb3: 'bg-[#ffb59d]/[0.07]',
    leftPanelTint: 'bg-[#111827]',
    centerEmoji: '🛡️',
    portalLabel: 'Admin Console',
    tagline: 'Full control of the cafeteria system',
    features: [
      'Manage students & cafeterias',
      'Oversee all campus orders',
      'System-wide analytics',
      'Secured JWT authentication',
    ],
    avatars: [
      { initials: 'AD', className: 'bg-[#ff6b35]' },
      { initials: 'IT', className: 'bg-[#59d5fb]' },
      { initials: 'OP', className: 'bg-[#76331b]' },
      { initials: 'HQ', className: 'bg-[#7c3aed]' },
    ],
    proofStrong: 'Authorized access',
    proofLine: 'for COMSTAS Cafe administrators only',
    formEmoji: '⚙️',
    heading: 'Admin Console',
    subtext: 'Sign in with your administrator credentials\nto access the full system.',
    btnGradient: 'bg-gradient-to-br from-[#ffb59d] to-[#ff6b35]',
    btnText: 'text-[#5f1900]',
    btnHoverShadow: '0 8px 24px rgba(255,107,53,0.35)',
    btnLoadingShadow: ['0 0 0 rgba(255,107,53,0)', '0 0 24px rgba(255,107,53,0.45)', '0 0 0 rgba(255,107,53,0)'],
  },
};

export function getInputFocusClass(themeKey) {
  const map = {
    customer:
      'focus:border-[#06d6c7] focus:shadow-[0_0_0_3px_rgba(6,214,199,0.18)] focus:bg-[#06d6c7]/[0.03]',
    cafe: 'focus:border-[#ff6b35] focus:shadow-[0_0_0_3px_rgba(255,107,53,0.22)] focus:bg-[#ff6b35]/[0.03]',
    admin: 'focus:border-[#ff6b35] focus:shadow-[0_0_0_3px_rgba(255,107,53,0.2)] focus:bg-[#ff6b35]/[0.03]',
  };
  return (
    'w-full bg-[#0d1117] border border-white/[0.07] rounded-[10px] py-3.5 pl-11 pr-4 text-sm text-[#f1f5f9] font-dm outline-none transition-all duration-250 placeholder:text-[#6b7280] disabled:opacity-60 ' +
    (map[themeKey] || map.customer)
  );
}

export function getIconFocusClass(themeKey) {
  const map = {
    customer: 'group-focus-within:text-[#06d6c7]',
    cafe: 'group-focus-within:text-[#ff6b35]',
    admin: 'group-focus-within:text-[#ff6b35]',
  };
  return map[themeKey] || map.customer;
}

export function getSecondaryButtonClass(themeKey) {
  const map = {
    customer:
      'hover:border-[#06d6c7]/30 hover:bg-[#06d6c7]/[0.06] hover:text-[#06d6c7]',
    cafe: 'hover:border-[#ff6b35]/35 hover:bg-[#ff6b35]/[0.06] hover:text-[#ff6b35]',
    admin: 'hover:border-[#ff6b35]/35 hover:bg-[#ff6b35]/[0.06] hover:text-[#ff6b35]',
  };
  return (
    'w-full py-3.5 rounded-[10px] text-sm font-medium font-dm border border-white/[0.07] bg-white/[0.03] text-[#9ca3af] cursor-pointer transition-all duration-250 no-underline flex items-center justify-center gap-2 ' +
    (map[themeKey] || map.customer)
  );
}
