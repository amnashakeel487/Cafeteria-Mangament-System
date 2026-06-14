import { useState, useEffect, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ThemeToggle from '../components/ThemeToggle';
import DeferredSection from '../components/DeferredSection';
import PageSEO from '../seo/PageSEO';
import { PAGE_SEO } from '../seo/siteConfig';
import PWAInstallButton from '../components/PWAInstallButton';

const DevelopmentTeam = lazy(() => import('../components/DevelopmentTeam'));
const BrowseMenuSection = lazy(() => import('../components/BrowseMenuSection'));
const LandingSpecialsSection = lazy(() => import('../components/specials/LandingSpecialsSection'));
const TopRatedCafeterias = lazy(() => import('../components/landing/TopRatedCafeterias'));

const SectionFallback = ({ minHeight = '12rem' }) => (
  <div className="px-4 sm:px-6" style={{ minHeight }} aria-hidden />
);

// Portal routes (must match App.jsx)
const ROUTES = {
  customerLogin: '/student/login',
  cafeLogin: '/cafeteria/login',
};

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const features = [
  {
    icon: 'shopping_bag',
    title: 'Easy Online Ordering',
    description: 'Browse campus cafeterias, add items to your cart, and checkout in seconds.',
    accent: 'primary',
  },
  {
    icon: 'track_changes',
    title: 'Real-Time Order Tracking',
    description: 'Follow your order from kitchen to pickup with live status updates.',
    accent: 'tertiary',
  },
  {
    icon: 'restaurant_menu',
    title: 'Menu Management for Cafes',
    description: 'Staff can update menus, deals, and availability without hassle.',
    accent: 'primary',
  },
  {
    icon: 'payments',
    title: 'Fast & Secure Payments',
    description: 'Smooth checkout with secure payment handling built into the flow.',
    accent: 'tertiary',
  },
];

const customerSteps = [
  { icon: 'menu_book', label: 'Browse Menu', desc: 'Explore dishes across campus cafeterias' },
  { icon: 'add_shopping_cart', label: 'Place Order', desc: 'Customize your meal and checkout' },
  { icon: 'takeout_dining', label: 'Pick Up', desc: 'Track status and collect when ready' },
];

/** Sticky navbar with glass effect on scroll */
function LandingNavbar({ scrolled }) {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-surface-container/80 backdrop-blur-xl border-b border-outline-variant/10 shadow-lg shadow-black/10'
          : 'bg-transparent'
      }`}
    >
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-primary-container/20 border border-primary/25 flex items-center justify-center group-hover:scale-105 transition-transform">
            <span
              className="material-symbols-outlined text-primary text-xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              restaurant
            </span>
          </div>
          <span className="font-black text-on-surface editorial-text text-lg tracking-tight" style={{ fontFamily: 'Manrope' }}>
            COMSATS <span className="text-primary">Cafe</span>
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <PWAInstallButton />
          <Link
            to={ROUTES.customerLogin}
            className="hidden sm:inline-flex px-4 py-2 rounded-lg text-sm font-bold text-on-surface-variant hover:text-tertiary border border-outline-variant/15 hover:border-tertiary/40 transition-all"
          >
            Customer Login
          </Link>
          <Link
            to={ROUTES.cafeLogin}
            className="px-3 sm:px-4 py-2 rounded-lg text-sm font-bold bg-gradient-to-br from-primary-container to-[#ff6b35] text-on-primary hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md shadow-primary/20"
          >
            <span className="hidden sm:inline">Cafe </span>Login
          </Link>
        </div>
      </nav>
    </motion.header>
  );
}

/** Animated gradient mesh + floating shapes for hero background */
function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <div className="absolute inset-0 bg-gradient-to-b from-primary/8 via-transparent to-tertiary/5" />
      <motion.div
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-primary/15 blur-[100px]"
      />
      <motion.div
        animate={{ x: [0, -25, 0], y: [0, 25, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/3 -left-32 w-96 h-96 rounded-full bg-tertiary/12 blur-[120px]"
      />
      <motion.div
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
        className="absolute bottom-20 right-1/4 w-48 h-48 border border-primary/10 rounded-full"
      />
      <motion.div
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-32 left-[15%] w-3 h-3 rounded-full bg-primary-container/60"
      />
      <motion.div
        animate={{ y: [0, 12, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute top-48 right-[20%] w-2 h-2 rounded-full bg-tertiary/70"
      />
    </div>
  );
}

function FeatureCard({ feature, index }) {
  const isPrimary = feature.accent === 'primary';
  return (
    <motion.article
      variants={fadeUp}
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
      className="group relative p-6 sm:p-7 rounded-xl bg-surface-container-high border border-outline-variant/10 shadow-xl hover:shadow-2xl hover:shadow-primary/10 transition-shadow duration-300 overflow-hidden"
    >
      <div
        className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none blur-2xl ${
          isPrimary ? 'bg-primary/10' : 'bg-tertiary/10'
        }`}
      />
      <div
        className={`relative w-12 h-12 rounded-xl flex items-center justify-center mb-5 border ${
          isPrimary
            ? 'bg-primary-container/15 border-primary/25 text-primary'
            : 'bg-tertiary/10 border-tertiary/30 text-tertiary'
        }`}
      >
        <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
          {feature.icon}
        </span>
      </div>
      <h3 className="relative text-lg font-extrabold text-on-surface mb-2 editorial-text" style={{ fontFamily: 'Manrope' }}>
        {feature.title}
      </h3>
      <p className="relative text-sm text-on-surface-variant leading-relaxed font-label">{feature.description}</p>
    </motion.article>
  );
}

function PortalCard({ variant, title, description, icon, cta, to, delay }) {
  const isCustomer = variant === 'customer';
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className={`relative flex flex-col p-8 sm:p-10 rounded-2xl border overflow-hidden group ${
        isCustomer
          ? 'bg-surface-container-high border-tertiary/20 hover:border-tertiary/40'
          : 'bg-surface-container-high border-primary/20 hover:border-primary/40'
      }`}
    >
      <div
        className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${
          isCustomer
            ? 'bg-gradient-to-br from-tertiary/10 to-transparent'
            : 'bg-gradient-to-br from-primary/10 to-transparent'
        }`}
      />
      <div
        className={`relative w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border ${
          isCustomer
            ? 'bg-tertiary/15 border-tertiary/30 text-tertiary'
            : 'bg-primary-container/20 border-primary/25 text-primary'
        }`}
      >
        <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
          {icon}
        </span>
      </div>
      <h3 className="relative text-2xl font-black text-on-surface mb-3 editorial-text" style={{ fontFamily: 'Manrope' }}>
        {title}
      </h3>
      <p className="relative text-on-surface-variant text-sm mb-8 flex-1 leading-relaxed">{description}</p>
      <Link
        to={to}
        className={`relative inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-lg font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] ${
          isCustomer
            ? 'bg-gradient-to-br from-tertiary to-tertiary-container text-on-tertiary shadow-lg shadow-tertiary/20'
            : 'bg-gradient-to-br from-primary-container to-[#ff6b35] text-on-primary shadow-lg shadow-primary/20'
        }`}
      >
        {cta}
        <span className="material-symbols-outlined text-lg">arrow_forward</span>
      </Link>
    </motion.div>
  );
}

export default function LandingPage() {
  const [browseCafeteriaId, setBrowseCafeteriaId] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      {/* SEO: Dynamic meta for home route */}
      <PageSEO {...PAGE_SEO.home} />
    <div className="min-h-screen bg-surface text-on-surface font-body overflow-x-hidden mobile-compact-public">
      <LandingNavbar scrolled={scrolled} />

      {/* ── HERO ── */}
      <section className="relative min-h-[92vh] flex items-center pt-20 pb-16 px-4 sm:px-6">
        <HeroBackground />
        <motion.div className="relative max-w-6xl mx-auto w-full z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center max-w-3xl mx-auto"
          >
            <motion.span
              variants={fadeUp}
              custom={0}
              className="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 px-5 py-1.5 rounded-full text-xs font-black uppercase tracking-[0.2em] mb-6"
            >
              <span className="material-symbols-outlined text-[14px]">local_cafe</span>
              Campus Dining, Reimagined
            </motion.span>

            <motion.h1
              custom={1}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black editorial-text text-on-surface tracking-tight leading-[1.08] mb-6"
              style={{ fontFamily: 'Manrope' }}
            >
              Fresh Food,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary-container to-tertiary">
                Seamless Orders
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-base sm:text-lg text-on-surface-variant max-w-2xl mx-auto mb-10 leading-relaxed font-medium"
            >
              COMSATS Cafe connects students and cafeteria staff in one warm, modern platform — order campus meals online,
              track them in real time, and manage menus with ease.
            </motion.p>

            <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to={ROUTES.customerLogin}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg font-bold bg-gradient-to-br from-tertiary to-tertiary-container text-on-tertiary hover:opacity-90 hover:scale-[1.03] active:scale-[0.98] transition-all shadow-xl shadow-tertiary/25"
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  school
                </span>
                I&apos;m a Customer
              </Link>
              <Link
                to={ROUTES.cafeLogin}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg font-bold bg-gradient-to-br from-primary-container to-[#ff6b35] text-on-primary hover:opacity-90 hover:scale-[1.03] active:scale-[0.98] transition-all shadow-xl shadow-primary/25"
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  restaurant
                </span>
                I&apos;m a Cafe Owner
              </Link>
            </motion.div>
          </motion.div>

          {/* Decorative food icons */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-16 flex justify-center gap-6 sm:gap-10 flex-wrap"
          >
            {['lunch_dining', 'local_pizza', 'coffee', 'icecream'].map((icon, i) => (
              <motion.div
                key={icon}
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-surface-container-high/80 border border-outline-variant/10 flex items-center justify-center text-primary/80 backdrop-blur-sm"
              >
                <span className="material-symbols-outlined text-2xl sm:text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {icon}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-20 sm:py-28 px-4 sm:px-6 bg-surface-container-low/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="text-xs font-black uppercase tracking-[0.2em] text-tertiary mb-3 block">Why COMSATS Cafe</span>
            <h2 className="text-3xl sm:text-4xl font-black editorial-text text-on-surface" style={{ fontFamily: 'Manrope' }}>
              Everything You Need to <span className="text-primary">Dine Smarter</span>
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6"
          >
            {features.map((f, i) => (
              <FeatureCard key={f.title} feature={f} index={i} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-3 block">For Students</span>
            <h2 className="text-3xl sm:text-4xl font-black editorial-text text-on-surface" style={{ fontFamily: 'Manrope' }}>
              How It <span className="text-tertiary">Works</span>
            </h2>
            <p className="text-on-surface-variant text-sm mt-3 max-w-md mx-auto">Three simple steps from craving to collection.</p>
          </motion.div>

          <motion.ol
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={staggerContainer}
            className="relative grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6"
          >
            {/* Connecting line (desktop) */}
            <div
              className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-tertiary/40 via-primary/50 to-tertiary/40"
              aria-hidden
            />

            {customerSteps.map((step, i) => (
              <motion.li key={step.label} variants={fadeUp} custom={i} className="relative flex flex-col items-center text-center">
                <div className="relative z-10 w-20 h-20 rounded-2xl bg-surface-container-high border border-outline-variant/15 flex items-center justify-center mb-5 shadow-lg group">
                  <span
                    className="material-symbols-outlined text-3xl text-primary"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {step.icon}
                  </span>
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary-container text-on-primary text-xs font-black flex items-center justify-center border-2 border-surface">
                    {i + 1}
                  </span>
                </div>
                <h3 className="text-lg font-extrabold text-on-surface mb-2 editorial-text" style={{ fontFamily: 'Manrope' }}>
                  {step.label}
                </h3>
                <p className="text-sm text-on-surface-variant max-w-[220px]">{step.desc}</p>
              </motion.li>
            ))}
          </motion.ol>
        </div>
      </section>

      {/* ── TOP RATED CAFETERIAS ── */}
      <DeferredSection minHeight="20rem">
        <Suspense fallback={<SectionFallback minHeight="20rem" />}>
          <TopRatedCafeterias
            onSelectCafeteria={(id) => {
              setBrowseCafeteriaId(id);
              document.getElementById('browse-menu')?.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        </Suspense>
      </DeferredSection>

      {/* ── BROWSE MENU (PUBLIC) ── */}
      <DeferredSection minHeight="24rem">
        <Suspense fallback={<SectionFallback minHeight="24rem" />}>
          <BrowseMenuSection preselectCafeteriaId={browseCafeteriaId} />
        </Suspense>
      </DeferredSection>

      {/* ── TODAY'S SPECIALS (placed below Explore Menu) ── */}
      <DeferredSection minHeight="18rem">
        <Suspense fallback={<SectionFallback minHeight="18rem" />}>
          <LandingSpecialsSection />
        </Suspense>
      </DeferredSection>

      {/* ── PORTAL SELECTION ── */}
      <section id="portals" className="py-20 sm:py-28 px-4 sm:px-6 bg-surface-container-low/40">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-black editorial-text text-on-surface" style={{ fontFamily: 'Manrope' }}>
              Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-tertiary to-primary">Portal</span>
            </h2>
            <p className="text-on-surface-variant text-sm mt-3">Select the experience built for you.</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            <PortalCard
              variant="customer"
              title="Customer Portal"
              description="Browse menus, place orders, and track your pickup status — all from your phone or laptop."
              icon="school"
              cta="Enter Customer Portal"
              to={ROUTES.customerLogin}
              delay={0}
            />
            <PortalCard
              variant="cafe"
              title="Cafe Owner Portal"
              description="Manage your menu, view incoming orders, update statuses, and handle payments in one dashboard."
              icon="restaurant"
              cta="Enter Cafe Portal"
              to={ROUTES.cafeLogin}
              delay={0.15}
            />
          </div>
        </div>
      </section>

      {/* ── DEVELOPER TEAM ── */}
      <section id="team" className="px-4 sm:px-6 pb-8 sm:pb-12">
        <DeferredSection minHeight="16rem">
          <Suspense fallback={<SectionFallback minHeight="16rem" />}>
            <DevelopmentTeam />
          </Suspense>
        </DeferredSection>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-outline-variant/10 bg-surface-container-lowest/50 px-4 sm:px-6 py-14">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                restaurant
              </span>
              <span className="font-black text-on-surface editorial-text text-lg" style={{ fontFamily: 'Manrope' }}>
                COMSATS Cafe
              </span>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed max-w-xs">
              The official campus cafeteria management system — ordering made warm, fast, and effortless.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-on-surface-variant mb-4">Operating Hours</h4>
            <ul className="text-sm text-on-surface-variant space-y-2 font-label">
              <li>Mon – Fri: 8:00 AM – 8:00 PM</li>
              <li>Saturday: 9:00 AM – 6:00 PM</li>
              <li>Sunday: 10:00 AM – 4:00 PM</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-on-surface-variant mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to={ROUTES.customerLogin} className="text-tertiary font-bold hover:underline">
                  Customer Login →
                </Link>
              </li>
              <li>
                <Link to={ROUTES.cafeLogin} className="text-primary font-bold hover:underline">
                  Cafe Staff Login →
                </Link>
              </li>
              <li>
                <Link to="/student/register" className="text-on-surface-variant hover:text-on-surface transition-colors">
                  Student Registration
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-on-surface-variant hover:text-on-surface transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-on-surface-variant hover:text-on-surface transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-outline-variant/10 text-center text-xs text-on-surface-variant/70">
          © {new Date().getFullYear()} COMSATS Cafe. All rights reserved.
        </div>
      </footer>
    </div>
    </>
  );
}
