/**
 * PWAStart — Silent auth-based redirect for PWA startup
 * Route: /pwa-start (manifest start_url)
 *
 * Logic:
 *   1. Logged in → go directly to their portal
 *   2. Not logged in → go to /welcome (clean welcome screen)
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PWAStart() {
  const navigate = useNavigate();

  useEffect(() => {
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
      // Always show the clean welcome screen — not the role selection onboarding
      navigate('/welcome', { replace: true });
    }
  }, [navigate]);

  return (
    <div style={{ background: '#121222', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, border: '3px solid rgba(255,181,157,0.15)', borderTop: '3px solid #ffb59d', borderRadius: '50%', animation: 'pwa-spin 0.8s linear infinite' }} />
      <style>{`@keyframes pwa-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
