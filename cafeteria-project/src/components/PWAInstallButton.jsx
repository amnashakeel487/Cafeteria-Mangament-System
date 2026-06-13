/**
 * PWAInstallButton
 * ─────────────────────────────────────────────────────────────────────────────
 * Shows an "Install App" button in the landing navbar.
 *
 * • Android / Desktop Chrome: triggers the native beforeinstallprompt dialog
 * • iOS Safari: shows a step-by-step bottom-sheet guide
 * • Already installed / display-mode standalone: renders nothing
 *
 * Styled to match the existing LandingNavbar button style (border + primary
 * accent) — no new dependencies needed (framer-motion already installed).
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const IS_IOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

export default function PWAInstallButton() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled]     = useState(false);
  const [isInstalling, setIsInstalling]   = useState(false);
  const [showIOSGuide, setShowIOSGuide]   = useState(false);

  useEffect(() => {
    // Already running as installed PWA — hide button
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Android / Desktop — capture the browser's install prompt
    const onPrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);

    // App was successfully installed
    const onInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };
    window.addEventListener('appinstalled', onInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  // Nothing to show: already installed, or non-iOS without an install prompt
  if (isInstalled) return null;
  if (!installPrompt && !IS_IOS) return null;

  const handleInstall = async () => {
    if (IS_IOS) {
      setShowIOSGuide(true);
      return;
    }
    if (!installPrompt) return;
    setIsInstalling(true);
    try {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setInstallPrompt(null);
      }
    } catch (err) {
      console.error('[PWA] Install failed:', err);
    } finally {
      setIsInstalling(false);
    }
  };

  const iosSteps = [
    { icon: '1️⃣', text: 'Tap the Share button at the bottom of Safari' },
    { icon: '2️⃣', text: 'Scroll down and tap "Add to Home Screen"' },
    { icon: '3️⃣', text: 'Tap "Add" in the top right corner' },
    { icon: '4️⃣', text: 'Find COMSTAS Cafe on your home screen!' },
  ];

  return (
    <>
      {/* ── Install button — matches LandingNavbar border-button style ── */}
      <motion.button
        onClick={handleInstall}
        disabled={isInstalling}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all border"
        style={{
          background: 'rgba(255,181,157,0.08)',
          border: '1px solid rgba(255,181,157,0.30)',
          color: '#ffb59d',
          cursor: isInstalling ? 'not-allowed' : 'pointer',
          opacity: isInstalling ? 0.7 : 1,
        }}
        aria-label="Install COMSTAS Cafe as an app"
      >
        {isInstalling ? (
          <>
            <span
              aria-hidden
              style={{
                display: 'inline-block',
                width: 13,
                height: 13,
                border: '2px solid rgba(255,181,157,0.25)',
                borderTop: '2px solid #ffb59d',
                borderRadius: '50%',
                animation: 'pwa-spin 0.7s linear infinite',
              }}
            />
            Installing…
          </>
        ) : (
          <>
            <span className="text-base leading-none">📱</span>
            Install App
          </>
        )}
      </motion.button>

      {/* ── iOS step-by-step bottom sheet ── */}
      <AnimatePresence>
        {showIOSGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.65)',
              display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
              zIndex: 9999,
              padding: '0 16px 28px',
            }}
            onClick={() => setShowIOSGuide(false)}
            role="dialog"
            aria-modal="true"
            aria-label="iOS install instructions"
          >
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#1e1e2f',
                border: '1px solid rgba(255,181,157,0.15)',
                borderRadius: 20,
                padding: '28px 24px',
                maxWidth: 400,
                width: '100%',
              }}
            >
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#e3e0f8', marginBottom: 6, fontFamily: 'Manrope' }}>
                Install on iPhone
              </h3>
              <p style={{ color: '#e1bfb5', fontSize: 13, marginBottom: 20 }}>
                Follow these steps in Safari:
              </p>

              {iosSteps.map((step, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 0',
                    borderBottom: i < iosSteps.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                  }}
                >
                  <span style={{ fontSize: 20 }}>{step.icon}</span>
                  <span style={{ color: '#e3e0f8', fontSize: 14 }}>{step.text}</span>
                </div>
              ))}

              <button
                onClick={() => setShowIOSGuide(false)}
                style={{
                  marginTop: 20, width: '100%', padding: '12px',
                  background: 'rgba(255,181,157,0.10)',
                  border: '1px solid rgba(255,181,157,0.30)',
                  borderRadius: 10, color: '#ffb59d',
                  fontSize: 14, fontWeight: 700, cursor: 'pointer',
                }}
              >
                Got it!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spinner keyframe — injected once */}
      <style>{`@keyframes pwa-spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
