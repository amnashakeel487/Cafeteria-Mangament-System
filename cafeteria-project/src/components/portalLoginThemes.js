/** Theme tokens for split-panel login pages — aligned with landing page (surface / primary / tertiary). */

export const PORTAL_THEMES = {
  customer: {
    accent: '#ffb59d',
    accentDim: '#ff6b35',
    accentTertiary: '#59d5fb',
    accentGlow: 'rgba(255, 107, 53, 0.22)',
    accentHoverBg: 'rgba(255, 181, 157, 0.08)',
    accentBorderHover: 'rgba(255, 107, 53, 0.35)',
    orb1: 'bg-primary-container/15',
    orb2: 'bg-primary/12',
    orb3: 'bg-tertiary/10',
    leftPanelTint: 'bg-surface-container-low',
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
      { initials: 'AK', className: 'bg-primary-container' },
      { initials: 'SH', className: 'bg-secondary-container' },
      { initials: 'MR', className: 'bg-tertiary/80' },
      { initials: 'ZB', className: 'bg-primary' },
    ],
    proofStrong: '500+ students',
    proofLine: 'ordering daily at COMSTAS campus',
    formEmoji: '👋',
    heading: 'Welcome Back',
    subtext: 'Sign in to browse menus, place orders,\nand track your pickup.',
    btnGradient: 'bg-gradient-to-br from-primary-container to-[#ff6b35]',
    btnText: 'text-on-primary',
    btnHoverShadow: '0 8px 24px rgba(255, 107, 53, 0.35)',
    btnLoadingShadow: [
      '0 0 0 rgba(255, 107, 53, 0)',
      '0 0 24px rgba(255, 107, 53, 0.45)',
      '0 0 0 rgba(255, 107, 53, 0)',
    ],
    registerCopy: {
      formEmoji: '✨',
      heading: 'Create Account',
      subtext:
        'Register with your university email.\nYour account will be reviewed by an admin before you can sign in.',
      features: [
        'Free student registration',
        'Admin-verified campus accounts',
        'Browse menus from every cafeteria',
        'Order & track once approved',
      ],
      proofStrong: 'Join 500+ students',
      proofLine: 'already ordering on COMSTAS campus',
    },
  },
  cafe: {
    accent: '#ff6b35',
    accentDim: '#e85a20',
    accentTertiary: '#59d5fb',
    accentGlow: 'rgba(255,107,53,0.22)',
    accentHoverBg: 'rgba(255,107,53,0.08)',
    accentBorderHover: 'rgba(255,107,53,0.35)',
    orb1: 'bg-[#ff6b35]/[0.14]',
    orb2: 'bg-[#ffb59d]/[0.10]',
    orb3: 'bg-tertiary/10',
    leftPanelTint: 'bg-surface-container-low',
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
    btnText: 'text-on-primary',
    btnHoverShadow: '0 8px 24px rgba(255,107,53,0.35)',
    btnLoadingShadow: ['0 0 0 rgba(255,107,53,0)', '0 0 24px rgba(255,107,53,0.45)', '0 0 0 rgba(255,107,53,0)'],
  },
  admin: {
    accent: '#ff6b35',
    accentDim: '#ffb59d',
    accentTertiary: '#59d5fb',
    accentGlow: 'rgba(255,107,53,0.2)',
    accentHoverBg: 'rgba(255,107,53,0.08)',
    accentBorderHover: 'rgba(255,107,53,0.35)',
    orb1: 'bg-[#ff6b35]/[0.12]',
    orb2: 'bg-[#59d5fb]/[0.08]',
    orb3: 'bg-[#ffb59d]/[0.07]',
    leftPanelTint: 'bg-surface-container-low',
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
    btnText: 'text-on-primary',
    btnHoverShadow: '0 8px 24px rgba(255,107,53,0.35)',
    btnLoadingShadow: ['0 0 0 rgba(255,107,53,0)', '0 0 24px rgba(255,107,53,0.45)', '0 0 0 rgba(255,107,53,0)'],
  },
};

const INPUT_BASE =
  'w-full bg-surface-container-lowest border border-outline-variant/15 rounded-[10px] py-3.5 pl-11 pr-4 text-sm text-on-surface font-dm outline-none transition-all duration-250 placeholder:text-on-surface-variant/40 disabled:opacity-60 ';

export function getInputFocusClass(themeKey) {
  const map = {
    customer:
      'focus:border-primary focus:shadow-[0_0_0_3px_rgba(255,181,157,0.2)] focus:bg-primary/[0.04]',
    cafe: 'focus:border-primary-container focus:shadow-[0_0_0_3px_rgba(255,107,53,0.22)] focus:bg-primary-container/[0.04]',
    admin: 'focus:border-primary-container focus:shadow-[0_0_0_3px_rgba(255,107,53,0.2)] focus:bg-primary-container/[0.04]',
  };
  return INPUT_BASE + (map[themeKey] || map.customer);
}

export function getIconFocusClass(themeKey) {
  const map = {
    customer: 'group-focus-within:text-primary',
    cafe: 'group-focus-within:text-primary-container',
    admin: 'group-focus-within:text-primary-container',
  };
  return map[themeKey] || map.customer;
}

export function getSecondaryButtonClass(themeKey) {
  const map = {
    customer: 'hover:border-primary/35 hover:bg-primary/[0.06] hover:text-primary',
    cafe: 'hover:border-primary-container/35 hover:bg-primary-container/[0.06] hover:text-primary-container',
    admin: 'hover:border-primary-container/35 hover:bg-primary-container/[0.06] hover:text-primary-container',
  };
  return (
    'w-full py-3.5 rounded-[10px] text-sm font-medium font-dm border border-outline-variant/15 bg-surface-container/50 text-on-surface-variant cursor-pointer transition-all duration-250 no-underline flex items-center justify-center gap-2 ' +
    (map[themeKey] || map.customer)
  );
}

export function getPrimaryButtonClass(themeKey) {
  const t = PORTAL_THEMES[themeKey] || PORTAL_THEMES.customer;
  return `w-full py-[15px] rounded-[10px] border-0 font-syne text-[15px] font-bold tracking-wide cursor-pointer flex items-center justify-center gap-2.5 transition-all duration-250 disabled:opacity-70 disabled:cursor-not-allowed hover:brightness-105 shadow-md shadow-primary/20 ${t.btnGradient} ${t.btnText}`;
}

export function getLinkAccentClass(themeKey) {
  const map = {
    customer: 'text-primary-container hover:text-primary',
    cafe: 'text-primary-container hover:text-primary',
    admin: 'text-primary-container hover:text-primary',
  };
  return map[themeKey] || map.customer;
}

export function getTheme(themeKey) {
  return PORTAL_THEMES[themeKey] || PORTAL_THEMES.customer;
}
