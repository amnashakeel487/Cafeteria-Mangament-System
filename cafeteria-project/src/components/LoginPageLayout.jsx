import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const panelSlide = {
  left: { hidden: { opacity: 0, x: -48 }, visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } } },
  right: { hidden: { opacity: 0, x: 48 }, visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 } } },
};

const fieldStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.25 } },
};

const fieldFade = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

const VARIANTS = {
  customer: {
    tagline: 'Fresh food, just a click away',
    portalLabel: 'Customer Portal',
    icon: 'school',
    floatingIcons: ['lunch_dining', 'local_pizza', 'coffee', 'icecream'],
    gradient: 'from-tertiary/25 via-surface-container to-primary/20',
    glowA: 'bg-tertiary/20',
    glowB: 'bg-primary/15',
    accentText: 'text-tertiary',
    accentBorder: 'border-tertiary/30',
    accentRing: 'focus:border-tertiary/60 focus:ring-tertiary/50',
    accentHover: 'hover:text-tertiary hover:border-tertiary/40',
    linkHover: 'hover:text-tertiary',
    btnGradient: 'from-tertiary to-tertiary-container',
    btnShadow: 'shadow-tertiary/30',
    btnText: 'text-on-tertiary',
  },
  cafe: {
    tagline: 'Manage your cafe with ease',
    portalLabel: 'Cafe Owner Portal',
    icon: 'restaurant',
    floatingIcons: ['restaurant', 'menu_book', 'storefront', 'local_cafe'],
    gradient: 'from-primary/25 via-surface-container to-tertiary/15',
    glowA: 'bg-primary/20',
    glowB: 'bg-tertiary/10',
    accentText: 'text-primary',
    accentBorder: 'border-primary/30',
    accentRing: 'focus:border-primary/60 focus:ring-primary/50',
    accentHover: 'hover:text-primary hover:border-primary/40',
    linkHover: 'hover:text-primary',
    btnGradient: 'from-primary-container to-[#ff6b35]',
    btnShadow: 'shadow-primary/30',
    btnText: 'text-on-primary',
  },
};

/** Back to Home — top-left ghost button with arrow slide on hover */
export function BackToHome({ className = '', accentHover = 'hover:text-tertiary hover:border-tertiary/40' }) {
  return (
    <Link
      to="/"
      className={`group inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-on-surface-variant border border-outline-variant/20 bg-surface-container/40 backdrop-blur-sm transition-all duration-300 hover:bg-surface-container-high/60 ${accentHover} ${className}`}
    >
      <span className="material-symbols-outlined text-lg transition-transform duration-300 group-hover:-translate-x-1">
        arrow_back
      </span>
      Back to Home
    </Link>
  );
}

/** Animated error alert with shake */
export function LoginErrorAlert({ message }) {
  if (!message) return null;
  return (
    <motion.div
      key={message}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0, x: [0, -10, 10, -8, 8, -4, 4, 0] }}
      transition={{ duration: 0.5 }}
      className="mb-5 p-3.5 rounded-lg bg-error-container/20 border border-error/50 flex items-center gap-3 text-error"
      role="alert"
    >
      <span className="material-symbols-outlined text-sm shrink-0">error</span>
      <p className="text-sm font-bold">{message}</p>
    </motion.div>
  );
}

/** Visual panel — gradient, logo, tagline, floating icons */
function VisualPanel({ variant }) {
  const v = VARIANTS[variant];
  return (
    <motion.aside
      variants={panelSlide.left}
      initial="hidden"
      animate="visible"
      className={`relative hidden lg:flex lg:w-[48%] xl:w-[52%] flex-col justify-center p-12 xl:p-16 overflow-hidden bg-gradient-to-br ${v.gradient}`}
    >
      <div className={`absolute -top-20 -right-20 w-80 h-80 rounded-full blur-[100px] pointer-events-none ${v.glowA}`} />
      <div className={`absolute bottom-0 -left-24 w-96 h-96 rounded-full blur-[120px] pointer-events-none ${v.glowB}`} />

      {v.floatingIcons.map((icon, i) => (
        <motion.div
          key={icon}
          animate={{ y: [0, -12, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 5 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
          className="absolute w-12 h-12 rounded-2xl bg-surface-container-high/50 border border-white/10 backdrop-blur-sm flex items-center justify-center opacity-60"
          style={{
            top: `${18 + i * 18}%`,
            left: i % 2 === 0 ? `${12 + i * 8}%` : 'auto',
            right: i % 2 === 1 ? `${8 + i * 6}%` : 'auto',
          }}
        >
          <span className={`material-symbols-outlined text-2xl ${v.accentText}`} style={{ fontVariationSettings: "'FILL' 1" }}>
            {icon}
          </span>
        </motion.div>
      ))}

      <div className="relative z-10 max-w-md">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 border ${v.accentBorder} bg-surface-container-high/60 backdrop-blur-md`}>
          <span className={`material-symbols-outlined text-4xl ${v.accentText}`} style={{ fontVariationSettings: "'FILL' 1" }}>
            {v.icon}
          </span>
        </div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-on-surface-variant mb-3">{v.portalLabel}</p>
        <h1 className="text-4xl xl:text-5xl font-black text-on-surface editorial-text leading-tight mb-4" style={{ fontFamily: 'Manrope' }}>
          COMSTAS <span className={v.accentText}>Cafe</span>
        </h1>
        <p className="text-lg text-on-surface-variant font-medium leading-relaxed">{v.tagline}</p>
      </div>
    </motion.aside>
  );
}

/**
 * SEO: Semantic two-column login shell — <header> back link, <aside> visual panel, <main> form.
 * Children = form content; pass variant for customer vs cafe accent.
 */
export default function LoginPageLayout({ variant, heading, subtext, children, footer }) {
  const v = VARIANTS[variant];

  return (
    <div className="min-h-screen bg-surface text-on-surface font-body flex flex-col">
      {/* Top bar: Back to Home */}
      <header className="absolute top-0 left-0 right-0 z-20 p-4 sm:p-6">
        <BackToHome accentHover={v.accentHover} />
      </header>

      <div className="flex flex-1 flex-col lg:flex-row min-h-screen">
        <VisualPanel variant={variant} />

        {/* Form panel */}
        <motion.main
          variants={panelSlide.right}
          initial="hidden"
          animate="visible"
          className="flex-1 flex flex-col justify-center px-4 sm:px-8 lg:px-12 xl:px-20 py-24 lg:py-12"
        >
          {/* Mobile visual header */}
          <div className="lg:hidden mb-8 text-center">
            <div className={`w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center border ${v.accentBorder} bg-surface-container-high`}>
              <span className={`material-symbols-outlined text-3xl ${v.accentText}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                {v.icon}
              </span>
            </div>
            <p className="text-sm text-on-surface-variant font-medium">{v.tagline}</p>
          </div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fieldStagger}
            className="w-full max-w-md mx-auto lg:mx-0"
          >
            <motion.div variants={fieldFade} className="bg-surface-container-high rounded-2xl p-8 sm:p-10 border border-outline-variant/10 shadow-2xl ambient-shadow">
              <motion.div variants={fieldFade} className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-black text-on-surface editorial-text mb-2" style={{ fontFamily: 'Manrope' }}>
                  {heading}
                </h2>
                {subtext && <p className="text-sm text-on-surface-variant">{subtext}</p>}
              </motion.div>

              <motion.div variants={fieldStagger} initial="hidden" animate="visible">
                {children}
              </motion.div>

              {footer && (
                <motion.div variants={fieldFade} className="mt-6">
                  {footer}
                </motion.div>
              )}

              <motion.div variants={fieldFade} className="mt-8 pt-6 border-t border-outline-variant/10 text-center">
                <Link
                  to="/"
                  className={`group inline-flex items-center gap-2 text-sm font-bold text-on-surface-variant transition-colors duration-300 ${v.linkHover}`}
                >
                  <span className="material-symbols-outlined text-lg transition-transform duration-300 group-hover:-translate-x-1">
                    arrow_back
                  </span>
                  Back to Home
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.main>
      </div>
    </div>
  );
}

/** Re-export motion field wrapper + input/button helpers for stagger */
export function LoginFormField({ children }) {
  return <motion.div variants={fieldFade}>{children}</motion.div>;
}

export function getVariantStyles(variant) {
  return VARIANTS[variant];
}
