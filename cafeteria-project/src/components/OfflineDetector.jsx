/**
 * OfflineDetector — shows offline page overlay when network is lost
 * Uses browser's navigator.onLine + online/offline events.
 * Only activates when user is genuinely offline — never on first load.
 */
import { useState, useEffect } from 'react';

export default function OfflineDetector() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Check on mount AND listen for changes
    setIsOffline(!navigator.onLine);

    const goOffline = () => setIsOffline(true);
    const goOnline  = () => setIsOffline(false);

    window.addEventListener('offline', goOffline);
    window.addEventListener('online',  goOnline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online',  goOnline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999,
      background: '#121222',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px', fontFamily: 'Inter, Arial, sans-serif',
    }}>
      <div style={{
        background: '#1e1e2f',
        border: '1px solid rgba(255,181,157,0.12)',
        borderRadius: 20, padding: '40px 28px',
        maxWidth: 360, width: '100%', textAlign: 'center',
      }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🍽️</div>

        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#e3e0f8', marginBottom: 8 }}>
          COMSATS <span style={{ color: '#ffb59d' }}>Cafe</span>
        </h2>

        <h3 style={{ fontSize: 20, fontWeight: 700, color: '#e3e0f8', marginBottom: 8 }}>
          You&apos;re offline
        </h3>
        <p style={{ fontSize: 14, color: '#e1bfb5', marginBottom: 24 }}>
          No internet connection detected.
        </p>

        <div style={{
          background: 'rgba(255,181,157,0.05)',
          border: '1px solid rgba(255,181,157,0.12)',
          borderRadius: 12, padding: '14px 16px',
          marginBottom: 24, textAlign: 'left',
        }}>
          {['Your cart items are still saved', 'Your favorites are still available', 'Connect to place or track orders'].map((t, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 0', fontSize: 13, color: '#e1bfb5' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ffb59d', flexShrink: 0 }} />
              {t}
            </div>
          ))}
        </div>

        <button
          onClick={() => window.location.reload()}
          style={{
            width: '100%', padding: '14px',
            background: 'linear-gradient(135deg, #ffb59d, #FF6B35)',
            color: '#5d1900', border: 'none', borderRadius: 12,
            fontSize: 15, fontWeight: 700, cursor: 'pointer',
          }}
        >
          🔄 Try Again
        </button>
      </div>
    </div>
  );
}
