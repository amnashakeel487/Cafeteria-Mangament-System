/**
 * PWAInstallButton — Always visible install button
 * Shows on all devices. Triggers native install on Android/Desktop Chrome,
 * shows step guide on iOS, and shows browser instructions as fallback.
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const IS_IOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
const IS_ANDROID = /Android/.test(navigator.userAgent);
const IS_STANDALONE = window.matchMedia('(display-mode: standalone)').matches
  || window.navigator.standalone === true;

export default function PWAInstallButton() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled]     = useState(IS_STANDALONE);
  const [isInstalling, setIsInstalling]   = useState(false);
  const [showGuide, setShowGuide]         = useState(false);
  const [guideType, setGuideType]         = useState('android'); // 'android' | 'ios' | 'desktop'

  useEffect(() => {
    if (IS_STANDALONE) return;

    const onPrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    });
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  // Don't show if already installed as PWA
  if (isInstalled) return null;

  const handleInstall = async () => {
    if (IS_IOS) {
      setGuideType('ios');
      setShowGuide(true);
      return;
    }

    // If we have the native prompt, use it
    if (installPrompt) {
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
      return;
    }

    // No native prompt yet — show manual instructions
    setGuideType(IS_ANDROID ? 'android' : 'desktop');
    setShowGuide(true);
  };

  const guides = {
    ios: {
      title: 'Install on iPhone',
      subtitle: 'Follow these steps in Safari:',
      steps: [
        { icon: '1️⃣', text: 'Tap the Share button (bottom of Safari)' },
        { icon: '2️⃣', text: 'Scroll and tap "Add to Home Screen"' },
        { icon: '3️⃣', text: 'Tap "Add" in the top right' },
        { icon: '4️⃣', text: 'Find COMSTAS Cafe on your home screen!' },
      ],
    },
    android: {
      title: 'Install on Android',
      subtitle: 'Open this site in Chrome, then:',
      steps: [
        { icon: '1️⃣', text: 'Tap the 3-dot menu (⋮) in Chrome' },
        { icon: '2️⃣', text: 'Tap "Add to Home Screen"' },
        { icon: '3️⃣', text: 'Tap "Install" or "Add"' },
        { icon: '4️⃣', text: 'COMSTAS Cafe is now on your home screen!' },
      ],
    },
    desktop: {
      title: 'Install on Desktop',
      subtitle: 'In Chrome or Edge:',
      steps: [
        { icon: '1️⃣', text: 'Click the install icon (⊕) in the address bar' },
        { icon: '2️⃣', text: 'Or click the 3-dot menu → "Install COMSTAS Cafe"' },
        { icon: '3️⃣', text: 'Click "Install" in the dialog' },
        { icon: '4️⃣', text: 'App opens as a standalone window!' },
      ],
    },
  };

  const guide = guides[guideType];

  return (
    <>
      <motion.button
        onClick={handleInstall}
        disabled={isInstalling}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold transition-all border"
        style={{
          background: 'rgba(255,181,157,0.10)',
          border: '1px solid rgba(255,181,157,0.30)',
          color: '#ffb59d',
          cursor: isInstalling ? 'not-allowed' : 'pointer',
          opacity: isInstalling ? 0.7 : 1,
          whiteSpace: 'nowrap',
        }}
        aria-label="Install COMSTAS Cafe as an app"
      >
        {isInstalling ? (
          <>
            <span
              aria-hidden
              style={{
                display: 'inline-block', width: 13, height: 13,
                border: '2px solid rgba(255,181,157,0.25)',
                borderTop: '2px solid #ffb59d',
                borderRadius: '50%',
                animation: 'pwa-spin 0.7s linear infinite',
              }}
            />
            <span className="hidden sm:inline">Installing…</span>
          </>
        ) : (
          <>
            <span style={{ fontSize: 14 }}>📲</span>
            <span className="hidden sm:inline">Install App</span>
            <span className="sm:hidden">Install</span>
          </>
        )}
      </motion.button>

      {/* Guide Modal */}
      <AnimatePresence>
        {showGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.70)',
              display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
              zIndex: 9999, padding: '0 16px 28px',
            }}
            onClick={() => setShowGuide(false)}
            role="dialog" aria-modal="true"
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
                borderRadius: 20, padding: '28px 24px',
                maxWidth: 400, width: '100%',
              }}
            >
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#e3e0f8', marginBottom: 4, fontFamily: 'Manrope' }}>
                {guide.title}
              </h3>
              <p style={{ color: '#e1bfb5', fontSize: 13, marginBottom: 20 }}>
                {guide.subtitle}
              </p>

              {guide.steps.map((step, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 0',
                  borderBottom: i < guide.steps.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                }}>
                  <span style={{ fontSize: 20 }}>{step.icon}</span>
                  <span style={{ color: '#e3e0f8', fontSize: 14 }}>{step.text}</span>
                </div>
              ))}

              <button
                onClick={() => setShowGuide(false)}
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

      <style>{`@keyframes pwa-spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
