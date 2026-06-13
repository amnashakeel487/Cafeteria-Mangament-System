/**
 * PWAUpdateNotification
 * ─────────────────────────────────────────────────────────────────────────────
 * Shown as a fixed toast at the bottom of the screen whenever a new version
 * of the app has been deployed to Vercel and the service worker has picked it
 * up. Prompts the user to reload and get the latest build.
 *
 * Uses vite-plugin-pwa's virtual module — no extra package required.
 * Styled to match the dark-themed UI (surface-container bg, primary accent).
 */
import { useRegisterSW } from 'virtual:pwa-register/react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PWAUpdateNotification() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      // Service worker registered — check for updates every 60 minutes
      if (r) {
        setInterval(() => r.update(), 60 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.error('[PWA] SW registration error:', error);
    },
  });

  return (
    <AnimatePresence>
      {needRefresh && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#1e1e2f',
            border: '1px solid rgba(255,181,157,0.25)',
            borderRadius: 14,
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            zIndex: 9998,
            boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
            whiteSpace: 'nowrap',
            maxWidth: 'calc(100vw - 32px)',
          }}
        >
          <span style={{ fontSize: 22 }} aria-hidden>🔄</span>

          <div style={{ minWidth: 0 }}>
            <p style={{ color: '#e3e0f8', fontSize: 14, fontWeight: 700, marginBottom: 2 }}>
              New version available!
            </p>
            <p style={{ color: '#e1bfb5', fontSize: 12 }}>
              Refresh to get the latest features
            </p>
          </div>

          <button
            onClick={() => updateServiceWorker(true)}
            style={{
              flexShrink: 0,
              background: 'linear-gradient(135deg, #ffb59d, #ff6b35)',
              color: '#5d1900',
              border: 'none',
              borderRadius: 8,
              padding: '8px 16px',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            Update
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
