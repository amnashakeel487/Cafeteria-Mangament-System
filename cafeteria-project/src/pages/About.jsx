import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageSEO from '../seo/PageSEO';
import { PAGE_SEO } from '../seo/siteConfig';
import { BackToHome } from '../components/LoginPageLayout';

/** SEO: About page — public content for search indexing and site trust */
export default function About() {
  return (
    <>
      <PageSEO {...PAGE_SEO.about} />
      <div className="min-h-screen bg-surface text-on-surface font-body mobile-compact-public">
        <header className="p-4 sm:p-6 border-b border-outline-variant/10">
          <BackToHome />
        </header>

        <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-4 block">About Us</span>
            <h1 className="text-3xl sm:text-4xl font-black editorial-text mb-6" style={{ fontFamily: 'Manrope' }}>
              COMSTAS <span className="text-primary">Cafe</span>
            </h1>
            <p className="text-on-surface-variant leading-relaxed mb-6">
              COMSTAS Cafe is a modern cafeteria management system built for university campuses. Students can browse
              menus, place orders online, and track pickups in real time. Cafe staff manage menus, orders, deals, and
              payments from a dedicated dashboard.
            </p>
            <p className="text-on-surface-variant leading-relaxed mb-8">
              Our mission is to make campus dining faster, warmer, and more transparent — for everyone from hungry
              students to busy cafeteria teams.
            </p>
            <nav className="flex flex-wrap gap-4" aria-label="Related pages">
              <Link to="/contact" className="text-tertiary font-bold hover:underline">
                Contact Us →
              </Link>
              <Link to="/student/login" className="text-primary font-bold hover:underline">
                Customer Login →
              </Link>
            </nav>
          </motion.section>
        </main>

        <footer className="border-t border-outline-variant/10 py-8 text-center text-xs text-on-surface-variant">
          © {new Date().getFullYear()} COMSTAS Cafe
        </footer>
      </div>
    </>
  );
}
