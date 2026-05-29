import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageSEO from '../seo/PageSEO';
import { PAGE_SEO } from '../seo/siteConfig';
import { BackToHome } from '../components/LoginPageLayout';

/** SEO: Contact page — support info for users and search engines */
export default function Contact() {
  return (
    <>
      <PageSEO {...PAGE_SEO.contact} />
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
            <span className="text-xs font-black uppercase tracking-[0.2em] text-tertiary mb-4 block">Get in Touch</span>
            <h1 className="text-3xl sm:text-4xl font-black editorial-text mb-6" style={{ fontFamily: 'Manrope' }}>
              Contact <span className="text-tertiary">Us</span>
            </h1>
            <p className="text-on-surface-variant leading-relaxed mb-8">
              Questions about ordering, cafe management, or technical support? Reach out to the COMSTAS Cafe team.
            </p>

            <address className="not-italic space-y-4 bg-surface-container-high rounded-xl p-6 border border-outline-variant/10">
              <p>
                <span className="text-xs font-bold uppercase text-on-surface-variant block mb-1">Campus Support</span>
                <a href="mailto:support@comstas.cafe" className="text-tertiary font-bold hover:underline">
                  support@comstas.cafe
                </a>
              </p>
              <p>
                <span className="text-xs font-bold uppercase text-on-surface-variant block mb-1">Operating Hours</span>
                <span className="text-on-surface">Mon – Fri: 8:00 AM – 8:00 PM</span>
              </p>
              <p>
                <span className="text-xs font-bold uppercase text-on-surface-variant block mb-1">Location</span>
                <span className="text-on-surface">COMSATS University Campus Cafeteria</span>
              </p>
            </address>

            <nav className="flex flex-wrap gap-4 mt-8" aria-label="Related pages">
              <Link to="/about" className="text-primary font-bold hover:underline">
                About Us →
              </Link>
              <Link to="/" className="text-on-surface-variant font-bold hover:underline">
                Back to Home →
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
