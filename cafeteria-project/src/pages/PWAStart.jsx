/**
 * PWAStart — Silent auth-based redirect for PWA startup
 * ─────────────────────────────────────────────────────
 * Route: /pwa-start
 * This is the PWA start_url — NOT a visible page.
 * Runs instantly, checks auth tokens, redirects appropriately.
 * Browser visitors never see this — only PWA users do.
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PWAStart() {
  const navigate = useNavigate();

  useEffect(() => {
    // Token key names confirmed from existing auth code:
    // studentAuth.js → 'studentToken'
    // cafeteriaAuth.js → 'cafeteriaToken'
    // adminAuth.js → 'adminToken'
    const studentToken   = localStorage.getItem('studentToken');
    const cafeteriaToken = localStorage.getItem('cafeteriaToken');
    const adminToken     = localStorage.getItem('adminToken');

    if (studentToken) {
      navigate('/student/cafeterias', { replace: true });
    } else if (cafeteriaToken) {
      navigate('/cafeteria/dashboard', { replace: true });
    } else if (adminToken) {
      navigate('/admin/dashboard', { replace: true });
    } else {
      navigate('/welcome', { replace: true });
    }
  }, [navigate]);

  // Render a minimal branded spinner while redirecting (takes <100ms)
  return (
    <div style={{
      background: '#121222',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        width: 40, height: 40,
        border: '3px solid rgba(255,181,157,0.15)',
        borderTop: '3px solid #ffb59d',
        borderRadius: '50%',
        animation: 'pwa-spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes pwa-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
