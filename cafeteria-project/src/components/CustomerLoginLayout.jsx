import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const FEATURES = [
  'Browse daily menus & specials',
  'Place orders in seconds',
  'Track your order in real-time',
  'Easy campus pickup',
];

const AVATARS = [
  { initials: 'AK', className: 'bg-[#1d4ed8]' },
  { initials: 'SH', className: 'bg-[#7c3aed]' },
  { initials: 'MR', className: 'bg-[#059669]' },
  { initials: 'ZB', className: 'bg-[#d97706]' },
];

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

function CheckIcon() {
  return (
    <svg fill="none" stroke="#06d6c7" strokeWidth="2.5" viewBox="0 0 24 24" className="w-[11px] h-[11px]">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

/** Error alert with shake — auth logic unchanged in parent */
export function CustomerLoginErrorAlert({ message }) {
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

/** Stagger wrapper for form fields */
export function CustomerLoginField({ children, delay = 0 }) {
  return (
    <motion.div variants={fadeUp} custom={delay} initial="hidden" animate="visible">
      {children}
    </motion.div>
  );
}

/**
 * Customer login shell — matches customer-login.html design.
 * children = form fields + submit (auth handlers stay in StudentLogin.jsx).
 */
export default function CustomerLoginLayout({ children, onRegisterClick }) {
  return (
    <div className="customer-login-page min-h-screen h-screen overflow-hidden bg-[#0d1117] text-[#f1f5f9] font-dm">
      {/* Fixed Back to Home */}
      <Link
        to="/"
        className="group fixed top-5 left-5 z-[100] flex items-center gap-2 px-[18px] py-[9px] rounded-full text-[13px] text-[#9ca3af] no-underline border border-white/[0.07] bg-white/[0.05] backdrop-blur-xl transition-all duration-250 hover:bg-[#06d6c7]/[0.08] hover:border-[#06d6c7]/30 hover:text-[#06d6c7] hover:-translate-x-0.5 font-dm"
      >
        <svg className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
        Back to Home
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen h-full">
        {/* ── LEFT PANEL (45%) ── */}
        <motion.aside
          variants={panelLeft}
          initial="hidden"
          animate="visible"
          className="relative hidden lg:flex flex-col justify-center items-start px-14 py-20 bg-[#111827] overflow-hidden"
        >
          {/* Grid overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-100"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />

          {/* Animated orbs */}
          <div className="absolute w-[300px] h-[300px] rounded-full blur-[80px] bg-[#06d6c7]/[0.12] -top-20 -right-16 login-orb-pulse" />
          <div className="absolute w-[200px] h-[200px] rounded-full blur-[80px] bg-[#0696c7]/[0.08] bottom-16 -left-10 login-orb-pulse login-orb-delay-1" />
          <div className="absolute w-[150px] h-[150px] rounded-full blur-[80px] bg-[#06d6c7]/[0.06] top-1/2 right-[30%] login-orb-pulse login-orb-delay-2" />

          <div className="relative z-10 w-full">
            {/* Visual ring + graduation cap */}
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="relative w-[140px] h-[140px] mb-10"
            >
              <div className="absolute inset-0 rounded-full border-2 border-[#06d6c7]/30 login-spin-slow" />
              <div className="absolute inset-4 rounded-full border-2 border-dashed border-[#06d6c7]/15 login-spin-slow-reverse" />
              <div className="absolute inset-8 rounded-full bg-[#06d6c7]/[0.08] border border-[#06d6c7]/25 flex items-center justify-center">
                <span className="text-4xl">🎓</span>
              </div>
            </motion.div>

            <p className="text-[11px] tracking-[0.2em] uppercase text-[#6b7280] mb-3 font-dm">Customer Portal</p>

            <h1 className="font-syne text-[46px] font-extrabold leading-none mb-1">
              COMSTAS <span className="text-[#06d6c7]">Cafe</span>
            </h1>
            <p className="text-[15px] text-[#9ca3af] font-light mt-2.5 mb-10">Fresh food, just a click away</p>

            <ul className="flex flex-col gap-3.5 mb-11">
              {FEATURES.map((feat) => (
                <li key={feat} className="flex items-center gap-3 text-sm text-[#9ca3af]">
                  <span className="w-[22px] h-[22px] shrink-0 rounded-full bg-[#06d6c7]/10 border border-[#06d6c7]/30 flex items-center justify-center">
                    <CheckIcon />
                  </span>
                  {feat}
                </li>
              ))}
            </ul>

            {/* Social proof */}
            <div className="inline-flex items-center gap-3 px-[18px] py-3.5 rounded-[14px] bg-white/[0.03] border border-white/[0.07]">
              <div className="flex">
                {AVATARS.map((a, i) => (
                  <div
                    key={a.initials}
                    className={`w-[30px] h-[30px] rounded-full border-2 border-[#111827] flex items-center justify-center text-[11px] font-semibold text-white ${a.className} ${i > 0 ? '-ml-2' : ''}`}
                  >
                    {a.initials}
                  </div>
                ))}
              </div>
              <p className="text-xs text-[#6b7280] leading-snug">
                <strong className="text-[#9ca3af] font-medium">500+ students</strong> ordering daily
                <br />
                at COMSTAS campus
              </p>
            </div>
          </div>
        </motion.aside>

        {/* Mobile compact banner */}
        <div className="lg:hidden relative px-8 pt-20 pb-8 bg-[#111827] border-b border-white/[0.07] overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#06d6c7]/10 border border-[#06d6c7]/20 flex items-center justify-center text-2xl">
              🎓
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#6b7280]">Customer Portal</p>
              <p className="font-syne text-xl font-bold">
                COMSTAS <span className="text-[#06d6c7]">Cafe</span>
              </p>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL (55%) — form ── */}
        <motion.main
          variants={panelRight}
          initial="hidden"
          animate="visible"
          className="relative flex flex-col justify-center items-center px-6 sm:px-14 py-12 lg:py-16 bg-[#0d1117] overflow-y-auto"
        >
          {/* Top cyan accent line */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#06d6c7] to-transparent" />

          <div className="w-full max-w-[400px]">
            <motion.div variants={fadeUp} custom={0} initial="hidden" animate="visible" className="w-[54px] h-[54px] rounded-2xl bg-[#06d6c7]/[0.08] border border-[#06d6c7]/20 flex items-center justify-center text-[26px] mb-6">
              👋
            </motion.div>

            <motion.h2 variants={fadeUp} custom={1} initial="hidden" animate="visible" className="font-syne text-[30px] font-bold mb-1.5">
              Welcome Back
            </motion.h2>

            <motion.p variants={fadeUp} custom={2} initial="hidden" animate="visible" className="text-sm text-[#6b7280] mb-8 leading-relaxed">
              Sign in to browse menus, place orders,
              <br />
              and track your pickup.
            </motion.p>

            <motion.div variants={fadeUp} custom={3} initial="hidden" animate="visible" className="h-px bg-white/[0.07] mb-7" />

            {children}

            <motion.div variants={fadeUp} custom={8} initial="hidden" animate="visible" className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-white/[0.07]" />
              <span className="text-xs text-[#6b7280]">or</span>
              <div className="flex-1 h-px bg-white/[0.07]" />
            </motion.div>

            <motion.button
              variants={fadeUp}
              custom={9}
              initial="hidden"
              animate="visible"
              type="button"
              onClick={onRegisterClick}
              whileHover={{ borderColor: 'rgba(6,214,199,0.3)', color: '#06d6c7' }}
              className="w-full py-[13px] rounded-[10px] bg-transparent border border-white/[0.07] text-[#9ca3af] text-sm font-dm cursor-pointer transition-all duration-250 hover:bg-[#06d6c7]/[0.04] hover:border-[#06d6c7]/30 hover:text-[#06d6c7]"
            >
              Don&apos;t have an account? Register →
            </motion.button>

            <motion.div variants={fadeUp} custom={10} initial="hidden" animate="visible" className="mt-7 text-center">
              <Link
                to="/"
                className="group inline-flex items-center gap-1.5 text-[13px] text-[#6b7280] no-underline transition-colors hover:text-[#06d6c7] font-dm"
              >
                <svg className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 5l-7 7 7 7" />
                </svg>
                Back to Home
              </Link>
            </motion.div>
          </div>
        </motion.main>
      </div>
    </div>
  );
}
