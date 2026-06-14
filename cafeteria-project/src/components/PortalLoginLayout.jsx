import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PORTAL_THEMES } from './portalLoginThemes';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] },
  }),
};

const panelLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};

const panelRight = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.08 } },
};

function CheckIcon({ color }) {
  return (
    <svg fill="none" stroke={color} strokeWidth="2.5" viewBox="0 0 24 24" className="w-[11px] h-[11px]">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

/** Error alert — auth logic stays in parent page */
export function PortalLoginErrorAlert({ message }) {
  if (!message) return null;
  return (
    <motion.div
      key={message}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0, x: [0, -10, 10, -6, 6, 0] }}
      transition={{ duration: 0.45 }}
      className="mb-5 p-3.5 rounded-[10px] bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-red-400 text-sm font-medium font-dm"
      role="alert"
    >
      <span className="material-symbols-outlined text-base shrink-0">error</span>
      {message}
    </motion.div>
  );
}

export function PortalLoginSuccessAlert({ message, accent = '#ffb59d' }) {
  if (!message) return null;
  return (
    <motion.div
      key={message}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-5 p-3.5 rounded-[10px] flex items-start gap-3 text-sm font-medium font-dm"
      style={{
        backgroundColor: `${accent}14`,
        border: `1px solid ${accent}4D`,
        color: accent,
      }}
      role="status"
    >
      <span className="material-symbols-outlined text-base shrink-0">check_circle</span>
      <span className="leading-relaxed">{message}</span>
    </motion.div>
  );
}

export function PortalLoginField({ children, delay = 0, className = '' }) {
  return (
    <motion.div
      variants={fadeUp}
      custom={delay}
      initial="hidden"
      animate="visible"
      className={className || 'mb-5 last:mb-0'}
    >
      {children}
    </motion.div>
  );
}

/**
 * Split-panel login shell (customer-login.html layout).
 * @param themeKey — 'customer' | 'cafe' | 'admin'
 * @param secondaryAction — optional node below "or" divider (register / admin link)
 * @param showSecondary — show or-divider + secondary (default true if secondaryAction passed)
 */
export default function PortalLoginLayout({
  themeKey,
  children,
  secondaryAction = null,
  showSecondary = true,
  copyOverrides = null,
}) {
  const base = PORTAL_THEMES[themeKey] || PORTAL_THEMES.customer;
  const t = copyOverrides ? { ...base, ...copyOverrides } : base;
  const hasSecondary = showSecondary && secondaryAction;

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-surface text-on-surface font-body mobile-compact-public">
      <Link
        to={window.matchMedia('(display-mode: standalone)').matches ? '/welcome' : '/'}
        className="group fixed top-5 left-5 z-[100] flex items-center gap-2 px-[18px] py-[9px] rounded-full text-[13px] text-on-surface-variant no-underline border border-outline-variant/15 bg-surface-container/60 backdrop-blur-xl transition-all duration-250 hover:-translate-x-0.5 font-dm"
        style={{ ['--hover-accent']: t.accent }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = t.accentHoverBg;
          e.currentTarget.style.borderColor = t.accentBorderHover;
          e.currentTarget.style.color = t.accent;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
          e.currentTarget.style.color = '';
        }}
      >
        <svg className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
        {window.matchMedia('(display-mode: standalone)').matches ? 'Back to App' : 'Back to Home'}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen lg:h-screen lg:overflow-hidden">
        {/* LEFT PANEL */}
        <motion.aside
          variants={panelLeft}
          initial="hidden"
          animate="visible"
          className={`relative hidden lg:flex flex-col justify-center items-start px-14 py-20 overflow-hidden ${t.leftPanelTint}`}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
          <div className={`absolute w-[300px] h-[300px] rounded-full blur-[80px] ${t.orb1} -top-20 -right-16 login-orb-pulse`} />
          <div className={`absolute w-[200px] h-[200px] rounded-full blur-[80px] ${t.orb2} bottom-16 -left-10 login-orb-pulse login-orb-delay-1`} />
          <div className={`absolute w-[150px] h-[150px] rounded-full blur-[80px] ${t.orb3} top-1/2 right-[30%] login-orb-pulse login-orb-delay-2`} />

          <div className="relative z-10 w-full">
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="relative w-[140px] h-[140px] mb-10"
            >
              <div
                className="absolute inset-0 rounded-full border-2 login-spin-slow"
                style={{ borderColor: `${t.accent}4D` }}
              />
              <div
                className="absolute inset-4 rounded-full border-2 border-dashed login-spin-slow-reverse"
                style={{ borderColor: `${t.accent}26` }}
              />
              <div
                className="absolute inset-8 rounded-full flex items-center justify-center border"
                style={{ backgroundColor: `${t.accent}14`, borderColor: `${t.accent}40` }}
              >
                <span className="text-4xl">{t.centerEmoji}</span>
              </div>
            </motion.div>

            <p className="text-[11px] tracking-[0.2em] uppercase text-on-surface-variant/80 mb-3 font-dm">{t.portalLabel}</p>
            <h1 className="font-syne text-[46px] font-extrabold leading-none mb-1 text-on-surface">
              COMSTAS <span style={{ color: t.accent }}>Cafe</span>
            </h1>
            <p className="text-[15px] text-on-surface-variant font-light mt-2.5 mb-10">{t.tagline}</p>

            <ul className="flex flex-col gap-3.5 mb-11">
              {t.features.map((feat) => (
                <li key={feat} className="flex items-center gap-3 text-sm text-on-surface-variant">
                  <span
                    className="w-[22px] h-[22px] shrink-0 rounded-full flex items-center justify-center border"
                    style={{ backgroundColor: `${t.accent}1A`, borderColor: `${t.accent}4D` }}
                  >
                    <CheckIcon color={t.accent} />
                  </span>
                  {feat}
                </li>
              ))}
            </ul>

            <div className="inline-flex items-center gap-3 px-[18px] py-3.5 rounded-[14px] bg-surface-container/80 border border-outline-variant/15">
              <div className="flex">
                {t.avatars.map((a, i) => (
                  <div
                    key={a.initials}
                    className={`w-[30px] h-[30px] rounded-full border-2 border-surface flex items-center justify-center text-[11px] font-semibold text-on-primary ${a.className} ${i > 0 ? '-ml-2' : ''}`}
                  >
                    {a.initials}
                  </div>
                ))}
              </div>
              <p className="text-xs text-on-surface-variant leading-snug">
                <strong className="text-on-surface font-medium">{t.proofStrong}</strong>
                <br />
                {t.proofLine}
              </p>
            </div>
          </div>
        </motion.aside>

        {/* Mobile banner */}
        <div className={`lg:hidden relative px-8 pt-20 pb-8 border-b border-outline-variant/15 overflow-hidden ${t.leftPanelTint}`}>
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
          <div className="relative z-10 flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border"
              style={{ backgroundColor: `${t.accent}1A`, borderColor: `${t.accent}33` }}
            >
              {t.centerEmoji}
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">{t.portalLabel}</p>
              <p className="font-syne text-xl font-bold text-on-surface">
                COMSTAS <span style={{ color: t.accent }}>Cafe</span>
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <motion.main
          variants={panelRight}
          initial="hidden"
          animate="visible"
          className="relative min-h-0 lg:h-full bg-surface overflow-y-auto overflow-x-hidden"
        >
          <div
            className="absolute top-0 left-0 right-0 h-[3px] z-10 pointer-events-none"
            style={{ background: `linear-gradient(90deg, transparent, ${t.accent}, transparent)` }}
          />

          {/* min-h-full + justify-center: centers short forms without clipping tall ones */}
          <div className="min-h-full flex flex-col justify-center items-center px-6 sm:px-14 py-12 pt-20 sm:pt-24 lg:py-16 lg:pt-16 pb-16">
            <div className="w-full max-w-[400px]">
            <motion.div
              variants={fadeUp}
              custom={0}
              initial="hidden"
              animate="visible"
              className="w-[54px] h-[54px] rounded-2xl flex items-center justify-center text-[26px] leading-none mb-6 border overflow-visible shrink-0"
              style={{ backgroundColor: `${t.accent}14`, borderColor: `${t.accent}33` }}
            >
              {t.formEmoji}
            </motion.div>

            <motion.h2 variants={fadeUp} custom={1} initial="hidden" animate="visible" className="font-syne text-[30px] font-bold mb-1.5 text-on-surface">
              {t.heading}
            </motion.h2>

            <motion.p variants={fadeUp} custom={2} initial="hidden" animate="visible" className="text-sm text-on-surface-variant mb-8 leading-relaxed whitespace-pre-line">
              {t.subtext}
            </motion.p>

            <motion.div variants={fadeUp} custom={3} initial="hidden" animate="visible" className="h-px bg-outline-variant/20 mb-7" />

            {children}

            {hasSecondary && (
              <>
                <motion.div variants={fadeUp} custom={8} initial="hidden" animate="visible" className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px bg-outline-variant/20" />
                  <span className="text-xs text-on-surface-variant">or</span>
                  <div className="flex-1 h-px bg-outline-variant/20" />
                </motion.div>
                <motion.div variants={fadeUp} custom={9} initial="hidden" animate="visible">
                  {secondaryAction}
                </motion.div>
              </>
            )}

            <motion.div variants={fadeUp} custom={10} initial="hidden" animate="visible" className="mt-7 text-center">
              <Link
                to={window.matchMedia('(display-mode: standalone)').matches ? '/welcome' : '/'}
                className="group inline-flex items-center gap-1.5 text-[13px] text-on-surface-variant no-underline transition-colors font-dm hover:opacity-90"
                style={{ ['--accent']: t.accent }}
                onMouseEnter={(e) => { e.currentTarget.style.color = t.accent; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = ''; }}
              >
                <svg className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 5l-7 7 7 7" />
                </svg>
                {window.matchMedia('(display-mode: standalone)').matches ? 'Back to App' : 'Back to Home'}
              </Link>
            </motion.div>
            </div>
          </div>
        </motion.main>
      </div>
    </div>
  );
}
