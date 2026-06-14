/**
 * PWAWelcome — Lightweight PWA welcome screen
 * ────────────────────────────────────────────
 * Route: /welcome
 * Shown only when no user is logged in and the PWA is opened.
 * Mobile-first, fast to load, action-focused.
 * NOT the landing page — no heavy marketing sections.
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const IS_PWA = window.matchMedia('(display-mode: standalone)').matches
  || window.navigator.standalone === true;

export default function PWAWelcome() {
  const navigate = useNavigate();

  // Safety: redirect already-logged-in users to their portal
  useEffect(() => {
    const studentToken   = localStorage.getItem('studentToken');
    const cafeteriaToken = localStorage.getItem('cafeteriaToken');
    const adminToken     = localStorage.getItem('adminToken');

    if (studentToken)   navigate('/student/cafeterias', { replace: true });
    else if (cafeteriaToken) navigate('/cafeteria/dashboard', { replace: true });
    else if (adminToken) navigate('/admin/dashboard', { replace: true });
  }, [navigate]);

  const features = [
    { icon: '🍽️', label: 'Browse' },
    { icon: '🛒', label: 'Order' },
    { icon: '📦', label: 'Track' },
  ];

  return (
    <div style={{
      background: '#121222',
      minHeight: '100vh',
      minHeight: '100dvh', // dynamic viewport height — accounts for mobile browser chrome
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '48px 24px 40px',
      maxWidth: 420,
      margin: '0 auto',
      overflowX: 'hidden',
    }}>

      {/* ── TOP: Branding ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        {/* Animated food icon */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            width: 100, height: 100,
            borderRadius: 28,
            background: 'rgba(255,181,157,0.10)',
            border: '1px solid rgba(255,181,157,0.20)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 50,
            marginBottom: 28,
          }}
        >
          🍽️
        </motion.div>

        {/* App name */}
        <h1 style={{
          fontSize: 32, fontWeight: 800,
          color: '#e3e0f8', marginBottom: 6,
          fontFamily: 'Manrope, Arial, sans-serif',
          letterSpacing: '-0.5px',
        }}>
          COMSATS{' '}
          <span style={{ color: '#ffb59d' }}>Cafe</span>
        </h1>

        <p style={{
          fontSize: 15, color: '#e1bfb5',
          marginBottom: 28, lineHeight: 1.5,
        }}>
          Campus food, made easy
        </p>

        {/* Feature chips */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          {features.map((chip, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '6px 12px',
                borderRadius: 100,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                fontSize: 12, color: '#e1bfb5',
              }}
            >
              <span>{chip.icon}</span>
              <span>{chip.label}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── BOTTOM: Actions ── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        style={{ width: '100%' }}
      >
        {/* Student button — primary */}
        <button
          onClick={() => navigate('/student/login')}
          style={{
            width: '100%', padding: '15px',
            borderRadius: 12, border: 'none',
            background: 'linear-gradient(135deg, #ffb59d, #ff6b35)',
            color: '#5d1900',
            fontSize: 15, fontWeight: 700,
            cursor: 'pointer', marginBottom: 10,
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 8,
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.88')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          🎓 I&apos;m a Student
          <span style={{ fontSize: 18 }}>→</span>
        </button>

        {/* Cafeteria owner button — secondary */}
        <button
          onClick={() => navigate('/cafeteria/login')}
          style={{
            width: '100%', padding: '15px',
            borderRadius: 12,
            background: 'transparent',
            border: '1px solid rgba(255,181,157,0.30)',
            color: '#ffb59d',
            fontSize: 15, fontWeight: 600,
            cursor: 'pointer', marginBottom: 20,
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 8,
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,181,157,0.08)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          ☕ Cafe Owner Login
        </button>

        {/* Admin link */}
        <p style={{ textAlign: 'center', fontSize: 13, color: '#6b7280', marginBottom: 16 }}>
          Admin?{' '}
          <span
            onClick={() => navigate('/admin/login')}
            style={{ color: '#e1bfb5', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Sign in here
          </span>
        </p>

        {/* Full website link — only show if in PWA mode */}
        {IS_PWA && (
          <p
            onClick={() => navigate('/')}
            style={{
              textAlign: 'center', fontSize: 12,
              color: '#4b5563', cursor: 'pointer',
            }}
          >
            Open full website →
          </p>
        )}
      </motion.div>
    </div>
  );
}
