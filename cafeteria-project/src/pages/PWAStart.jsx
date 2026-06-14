/**
 * PWAStart — Silent auth-based redirect for PWA startup
 * ─────────────────────────────────────────────────────
 * Route: /pwa-start (manifest start_url)
 * Logic:
 *   1. If logged in → go directly to their portal
 *   2. If role was previously selected → go to that login page
 *   3. First time ever → go to /pwa-onboarding (role selection)
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PWAStart() {
  const navigate = useNavigate();

  useEffect(() => {
    // ── Step 1: Check active auth tokens ──────────────────────────────
    const studentToken   = localStorage.getItem('studentToken');
    const cafeteriaToken = localStorage.getItem('cafeteriaToken');
    const adminToken     = localStorage.getItem('adminToken');

    if (studentToken) {
      navigate('/student/cafeterias', { replace: true });
      return;
    }
    if (cafeteriaToken) {
      navigate('/cafeteria/dashboard', { replace: true });
      return;
    }
    if (adminToken) {
      navigate('/admin/dashboard', { replace: true });
      return;
    }

    // ── Step 2: Check previously selected role ────────────────────────
    const savedRole = localStorage.getItem('pwa_selected_role');

    if (savedRole === 'student') {
      navigate('/student/login', { replace: true });
      return;
    }
    if (savedRole === 'cafeteria') {
      navigate('/cafeteria/login', { replace: true });
      return;
    }
    if (savedRole === 'admin') {
      navigate('/admin/login', { replace: true });
      return;
    }

    // ── Step 3: First launch — show role selection onboarding ─────────
    navigate('/pwa-onboarding', { replace: true });
  }, [navigate]);

  return (
    <div style={{
      background: '#121222', minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
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
