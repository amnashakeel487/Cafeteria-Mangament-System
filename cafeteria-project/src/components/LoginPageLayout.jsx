import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

/* ── Animation variants ── */
const panelSlide = {
  left: {
    hidden: { opacity: 0, x: -60 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
  },
  right: {
    hidden: { opacity: 0, x: 60 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.08 } },
  },
};

const fieldStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.35 } },
};

const fieldFade = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

const VARIANTS = {
  customer: {
    portalLabel: 'CUSTOMER PORTAL',
    tagline: 'Fresh food, just a click away',
    icon: 'school',
    emoji: '👋',
    features: ['Browse campus menus', 'Track orders in real time', 'Easy pickup & checkout'],
    trustLabel: 'Trusted by COMSATS students',
    avatars: [
      { initials: 'AK', bg: 'bg-tertiary/80' },
      { initials: 'MS', bg: 'bg-primary/70' },
      { initials: 'JD', bg: 'bg-[#4ade80]/70' },
      { initials: 'NB', bg: 'bg-[#a78bfa]/70' },
    ],
    panelBg: 'from-[#1a1f2e] via-[#1e2438] to-[#2d3561]',
    accentText: 'text-tertiary',
    accentHex: '#59d5fb',
    glowRing: 'ring-tertiary/40',
    orbA: 'bg-tertiary/25',
    orbB: 'bg-[#3b82f6]/20',
    illustrationGlow: 'from-tertiary/50 to-[#3b82f6]/30',
    accentBorder: 'border-tertiary/40',
    accentHover: 'hover:text-tertiary hover:border-tertiary/50',
    linkHover: 'hover:text-tertiary',
    accentRing:
      'focus:border-tertiary focus:ring-2 focus:ring-tertiary/40 focus:shadow-[0_0_20px_rgba(89,213,251,0.25)]',
    inputIconFocus: 'group-focus-within:text-tertiary',
    btnGradient: 'bg-gradient-to-r from-tertiary via-[#3b9ec9] to-tertiary-container',
    btnShadow: 'shadow-lg shadow-tertiary/30 hover:shadow-tertiary/50',
    btnText: 'text-on-tertiary',
    topAccent: 'from-tertiary via-[#3b82f6] to-tertiary-container',
    outlineBtn:
      'border-tertiary/40 text-tertiary hover:bg-tertiary/10 hover:border-tertiary/60',
    svgAccent: '#59d5fb',
  },
  cafe: {
    portalLabel: 'CAFE OWNER PORTAL',
    tagline: 'Manage your cafe with ease',
    icon: 'restaurant',
    emoji: '☕',
    features: ['Manage incoming orders', 'Update menu & deals', 'View sales analytics'],
    trustLabel: 'Built for campus cafeteria staff',
    avatars: [
      { initials: 'SR', bg: 'bg-primary-container/90' },
      { initials: 'HM', bg: 'bg-primary/80' },
      { initials: 'LC', bg: 'bg-[#fbbf24]/80' },
      { initials: 'KP', bg: 'bg-[#fb923c]/80' },
    ],
    panelBg: 'from-[#1a1f2e] via-[#231a18] to-[#3d2a1f]',
    accentText: 'text-primary',
    accentHex: '#ff6b35',
    glowRing: 'ring-primary/40',
    orbA: 'bg-primary/25',
    orbB: 'bg-[#f97316]/15',
    illustrationGlow: 'from-primary/50 to-[#ff6b35]/30',
    accentBorder: 'border-primary/40',
    accentHover: 'hover:text-primary hover:border-primary/50',
    linkHover: 'hover:text-primary',
    accentRing:
      'focus:border-primary-container focus:ring-2 focus:ring-primary/40 focus:shadow-[0_0_20px_rgba(255,107,53,0.3)]',
    inputIconFocus: 'group-focus-within:text-primary',
    btnGradient: 'bg-gradient-to-r from-primary via-primary-container to-[#ff6b35]',
    btnShadow: 'shadow-lg shadow-primary/30 hover:shadow-primary/50',
    btnText: 'text-on-primary',
    topAccent: 'from-primary via-primary-container to-[#ff6b35]',
    outlineBtn:
      'border-primary/40 text-primary hover:bg-primary/10 hover:border-primary/60',
    svgAccent: '#ff6b35',
  },
};

/** Fixed top-left pill — Back to Home */
export function BackToHome({ accentHover = 'hover:text-tertiary hover:border-tertiary/50' }) {
  const isPWA = window.matchMedia('(display-mode: standalone)').matches;
  const dest = isPWA ? '/welcome' : '/';
  return (
    <Link
      to={dest}
      className={`group fixed top-4 left-4 z-50 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-on-surface/90 border border-white/10 bg-[#121222]/60 backdrop-blur-xl transition-all duration-300 hover:bg-[#1e1e2f]/80 hover:border-white/20 ${accentHover}`}
    >
      <span className="material-symbols-outlined text-lg transition-transform duration-300 group-hover:-translate-x-1.5">
        arrow_back
      </span>
      {isPWA ? 'Back to App' : 'Back to Home'}
    </Link>
  );
}

/** Error alert with shake */
export function LoginErrorAlert({ message }) {
  if (!message) return null;
  return (
    <motion.div
      key={message}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0, x: [0, -10, 10, -8, 8, -4, 4, 0] }}
      transition={{ duration: 0.5 }}
      className="mb-6 p-4 rounded-xl bg-error-container/20 border border-error/50 flex items-center gap-3 text-error"
      role="alert"
    >
      <span className="material-symbols-outlined shrink-0">error</span>
      <p className="text-sm font-bold">{message}</p>
    </motion.div>
  );
}

/** Stagger wrapper for form fields */
export function LoginFormField({ children }) {
  return <motion.div variants={fieldFade}>{children}</motion.div>;
}

export function getVariantStyles(variant) {
  return VARIANTS[variant];
}

/* ── CSS-only dot grid overlay ── */
function DotGrid() {
  return (
    <div
      className="absolute inset-0 opacity-[0.35] pointer-events-none"
      style={{
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    />
  );
}

/* ── Animated background orbs ── */
function GradientOrbs({ v }) {
  return (
    <>
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className={`absolute -top-32 -left-32 w-[420px] h-[420px] rounded-full blur-[100px] ${v.orbA}`}
      />
      <motion.div
        animate={{ scale: [1.1, 1, 1.1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className={`absolute bottom-[-120px] right-[-80px] w-[380px] h-[380px] rounded-full blur-[110px] ${v.orbB}`}
      />
      <motion.div
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full blur-[80px] opacity-30 ${v.orbA}`}
      />
    </>
  );
}

/* ── Centerpiece SVG illustration (customer: dining / cafe: storefront) ── */
function PortalIllustration({ variant, v }) {
  const isCustomer = variant === 'customer';

  return (
    <motion.div
      animate={{ y: [-10, 10, -10] }}
      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      className="relative mx-auto w-[220px] h-[220px] sm:w-[260px] sm:h-[260px] mb-8"
    >
      {/* Outer glow rings */}
      <motion.div
        animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className={`absolute inset-0 rounded-full bg-gradient-to-br ${v.illustrationGlow} blur-2xl`}
      />
      <div className={`absolute inset-4 rounded-full border-2 border-dashed ${v.accentBorder} opacity-30`} />
      <div className={`absolute inset-8 rounded-full border ${v.accentBorder} opacity-20`} />

      {/* SVG scene */}
      <svg
        viewBox="0 0 200 200"
        className="relative z-10 w-full h-full drop-shadow-2xl"
        aria-hidden
      >
        <defs>
          <linearGradient id={`glow-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={v.svgAccent} stopOpacity="0.9" />
            <stop offset="100%" stopColor={isCustomer ? '#3b82f6' : '#fbbf24'} stopOpacity="0.7" />
          </linearGradient>
        </defs>

        {isCustomer ? (
          <>
            {/* Plate */}
            <ellipse cx="100" cy="130" rx="55" ry="12" fill={v.svgAccent} opacity="0.2" />
            <ellipse cx="100" cy="125" rx="48" ry="10" fill="#1e2337" stroke={v.svgAccent} strokeWidth="2" />
            {/* Bowl */}
            <path
              d="M65 115 Q100 95 135 115 L130 125 Q100 140 70 125 Z"
              fill={`url(#glow-${variant})`}
              opacity="0.9"
            />
            {/* Steam */}
            <path d="M85 75 Q80 55 85 40" stroke={v.svgAccent} strokeWidth="3" fill="none" opacity="0.6" strokeLinecap="round" />
            <path d="M100 70 Q95 48 100 32" stroke={v.svgAccent} strokeWidth="3" fill="none" opacity="0.8" strokeLinecap="round" />
            <path d="M115 75 Q120 55 115 40" stroke={v.svgAccent} strokeWidth="3" fill="none" opacity="0.6" strokeLinecap="round" />
            {/* Cart badge */}
            <circle cx="145" cy="95" r="28" fill="#1e2337" stroke={v.svgAccent} strokeWidth="2" />
            <rect x="133" y="88" width="24" height="18" rx="3" fill={v.svgAccent} opacity="0.9" />
            <circle cx="138" cy="110" r="3" fill={v.svgAccent} />
            <circle cx="152" cy="110" r="3" fill={v.svgAccent} />
          </>
        ) : (
          <>
            {/* Storefront */}
            <rect x="45" y="90" width="110" height="70" rx="6" fill="#1e2337" stroke={v.svgAccent} strokeWidth="2" />
            <path d="M40 95 L100 55 L160 95 Z" fill={`url(#glow-${variant})`} opacity="0.85" stroke={v.svgAccent} strokeWidth="2" />
            {/* Awning stripes */}
            {[0, 1, 2, 3, 4].map((i) => (
              <rect
                key={i}
                x={52 + i * 20}
                y="95"
                width="10"
                height="8"
                fill={i % 2 === 0 ? v.svgAccent : '#1e2337'}
                opacity="0.8"
              />
            ))}
            {/* Door */}
            <rect x="82" y="115" width="36" height="45" rx="4" fill="#2d3561" stroke={v.svgAccent} strokeWidth="1.5" />
            {/* Window */}
            <rect x="55" y="108" width="22" height="22" rx="3" fill={v.svgAccent} opacity="0.3" stroke={v.svgAccent} strokeWidth="1" />
            <rect x="123" y="108" width="22" height="22" rx="3" fill={v.svgAccent} opacity="0.3" stroke={v.svgAccent} strokeWidth="1" />
            {/* Chart badge */}
            <circle cx="155" cy="75" r="22" fill="#1e2337" stroke={v.svgAccent} strokeWidth="2" />
            <polyline
              points="142,82 150,72 158,78 166,65"
              fill="none"
              stroke={v.svgAccent}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        )}
      </svg>

      {/* Center icon badge */}
      <div
        className={`absolute bottom-2 right-2 w-14 h-14 rounded-2xl flex items-center justify-center border-2 ${v.accentBorder} bg-[#121222] shadow-xl`}
      >
        <span className={`material-symbols-outlined text-3xl ${v.accentText}`} style={{ fontVariationSettings: "'FILL' 1" }}>
          {v.icon}
        </span>
      </div>
    </motion.div>
  );
}

/* ── LEFT PANEL (45%) ── */
function VisualPanel({ variant }) {
  const v = VARIANTS[variant];

  return (
    <motion.aside
      variants={panelSlide.left}
      initial="hidden"
      animate="visible"
      className={`relative hidden lg:flex lg:w-[45%] flex-col justify-between overflow-hidden bg-gradient-to-br ${v.panelBg}`}
    >
      <DotGrid />
      <GradientOrbs v={v} />

      <div className="relative z-10 flex flex-col flex-1 justify-center px-10 xl:px-14 py-16">
        <PortalIllustration variant={variant} v={v} />

        <p className={`text-[11px] font-black uppercase tracking-[0.25em] ${v.accentText} opacity-80 mb-2`}>
          {v.portalLabel}
        </p>
        <h1 className="text-4xl xl:text-[2.75rem] font-black leading-tight mb-3" style={{ fontFamily: 'Manrope' }}>
          <span className="text-white">COMSATS</span>{' '}
          <span className={v.accentText}>Cafe</span>
        </h1>
        <p className="text-on-surface-variant/90 text-base font-medium mb-8 max-w-sm">{v.tagline}</p>

        <ul className="space-y-3 mb-10">
          {v.features.map((feat) => (
            <li key={feat} className="flex items-center gap-3 text-sm text-on-surface/90">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${v.accentText} bg-white/5 border ${v.accentBorder}`}
              >
                <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check
                </span>
              </span>
              {feat}
            </li>
          ))}
        </ul>
      </div>

      {/* Social proof — bottom */}
      <div className="relative z-10 px-10 xl:px-14 pb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex -space-x-2">
            {v.avatars.map((a) => (
              <div
                key={a.initials}
                className={`w-9 h-9 rounded-full border-2 border-[#1a1f2e] flex items-center justify-center text-[10px] font-black text-white ${a.bg}`}
              >
                {a.initials}
              </div>
            ))}
          </div>
          <span className="text-xs text-on-surface-variant font-medium">{v.trustLabel}</span>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
          <span className="material-symbols-outlined text-sm text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
            verified
          </span>
          COMSATS University Campus
        </div>
      </div>
    </motion.aside>
  );
}

/* ── Mobile compact banner ── */
function MobileBanner({ variant }) {
  const v = VARIANTS[variant];
  return (
    <div
      className={`lg:hidden relative overflow-hidden px-6 py-8 bg-gradient-to-br ${v.panelBg} border-b border-white/5`}
    >
      <DotGrid />
      <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full blur-3xl ${v.orbA}`} />
      <div className="relative z-10 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${v.accentBorder} bg-black/20`}>
          <span className={`material-symbols-outlined text-2xl ${v.accentText}`} style={{ fontVariationSettings: "'FILL' 1" }}>
            {v.icon}
          </span>
        </div>
        <div>
          <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${v.accentText}`}>{v.portalLabel}</p>
          <p className="text-lg font-black text-white" style={{ fontFamily: 'Manrope' }}>
            COMSATS <span className={v.accentText}>Cafe</span>
          </p>
          <p className="text-xs text-on-surface-variant">{v.tagline}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Full-screen login shell: 45% visual panel + 55% form panel.
 * Auth logic stays in page components (children).
 */
export default function LoginPageLayout({
  variant,
  heading,
  subtext,
  children,
  secondaryAction,
}) {
  const v = VARIANTS[variant];

  return (
    <div className="h-screen overflow-hidden bg-[#121222] text-on-surface font-body flex flex-col">
      <BackToHome accentHover={v.accentHover} />

      <div className="flex flex-1 flex-col lg:flex-row h-full min-h-0">
        <VisualPanel variant={variant} />
        <MobileBanner variant={variant} />

        {/* ── RIGHT PANEL (55%) — form fills panel, no nested card ── */}
        <motion.main
          variants={panelSlide.right}
          initial="hidden"
          animate="visible"
          className="relative flex-1 lg:w-[55%] flex flex-col min-h-0 bg-[#1e2337] overflow-y-auto"
        >
          {/* Top accent gradient line */}
          <div className={`h-[3px] w-full bg-gradient-to-r ${v.topAccent} shrink-0`} />

          <div className="flex-1 flex flex-col justify-center px-6 sm:px-10 lg:px-14 xl:px-20 py-10 lg:py-12 max-w-xl mx-auto w-full">
            <motion.div initial="hidden" animate="visible" variants={fieldStagger} className="w-full">
              {/* Portal badge */}
              <motion.div variants={fieldFade} className="flex justify-center mb-6">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border ${v.accentBorder} bg-[#28283a]/80 shadow-lg`}
                >
                  {v.emoji}
                </div>
              </motion.div>

              <motion.div variants={fieldFade} className="text-center mb-2">
                <h2
                  className="text-2xl sm:text-3xl font-black text-on-surface editorial-text"
                  style={{ fontFamily: 'Manrope' }}
                >
                  {heading}
                </h2>
              </motion.div>

              {subtext && (
                <motion.p variants={fieldFade} className="text-center text-sm text-on-surface-variant mb-6">
                  {subtext}
                </motion.p>
              )}

              <motion.div variants={fieldFade} className="h-px bg-gradient-to-r from-transparent via-outline-variant/30 to-transparent mb-8" />

              <motion.div variants={fieldStagger} initial="hidden" animate="visible">
                {children}
              </motion.div>

              {secondaryAction && (
                <>
                  <motion.div variants={fieldFade} className="flex items-center gap-4 my-6">
                    <div className="flex-1 h-px bg-outline-variant/20" />
                    <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60">or</span>
                    <div className="flex-1 h-px bg-outline-variant/20" />
                  </motion.div>
                  <motion.div variants={fieldFade}>{secondaryAction}</motion.div>
                </>
              )}

              <motion.div variants={fieldFade} className="mt-10 text-center">
                <Link
                  to="/"
                  className={`group inline-flex items-center gap-2 text-sm font-bold text-on-surface-variant transition-colors ${v.linkHover}`}
                >
                  <span className="material-symbols-outlined text-lg transition-transform duration-300 group-hover:-translate-x-1">
                    arrow_back
                  </span>
                  Back to Home
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </motion.main>
      </div>
    </div>
  );
}
