/**
 * PWAOnboarding — Role selection screen for first-time PWA users
 * ─────────────────────────────────────────────────────────────
 * Route: /pwa-onboarding
 * Shown ONCE when no pwa_selected_role is saved in localStorage.
 * After selection, role is saved and user goes to the correct login page.
 * Never shown to browser visitors — only PWA users reach this via /pwa-start.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const roles = [
  {
    id: 'student',
    emoji: '🎓',
    title: 'Student',
    subtitle: 'I browse menus\n& place orders',
    accentColor: '#ffb59d',
    bgColor: 'rgba(255,181,157,0.08)',
    borderColor: 'rgba(255,181,157,0.25)',
    activeBg: 'rgba(255,181,157,0.15)',
    activeBorder: 'rgba(255,181,157,0.6)',
    features: ['🍽️ Browse daily menus', '🛒 Place orders easily', '📦 Track your pickup', '⭐ Rate your meals'],
  },
  {
    id: 'cafeteria',
    emoji: '☕',
    title: 'Cafe Owner',
    subtitle: 'I manage orders\n& my cafeteria',
    accentColor: '#ff6b35',
    bgColor: 'rgba(255,107,53,0.08)',
    borderColor: 'rgba(255,107,53,0.25)',
    activeBg: 'rgba(255,107,53,0.15)',
    activeBorder: 'rgba(255,107,53,0.6)',
    features: ['📋 Manage orders', '🍕 Update menu', '📊 View analytics', '💰 Track revenue'],
  },
];

export default function PWAOnboarding() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = async (roleId) => {
    if (loading) return;
    setSelected(roleId);
    setLoading(true);

    // Brief animation pause before navigating
    await new Promise((r) => setTimeout(r, 600));

    // Persist role so onboarding is skipped on future launches
    localStorage.setItem('pwa_selected_role', roleId);

    if (roleId === 'student') {
      navigate('/student/login', { replace: true });
    } else if (roleId === 'cafeteria') {
      navigate('/cafeteria/login', { replace: true });
    }
  };

  return (
    <div style={{
      background: '#121222',
      minHeight: '100vh',
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      padding: '48px 20px 40px',
      maxWidth: 440,
      margin: '0 auto',
      overflowX: 'hidden',
    }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: 'center', marginBottom: 36 }}
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{ fontSize: 52, marginBottom: 16 }}
        >
          🍽️
        </motion.div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#e3e0f8', marginBottom: 6, fontFamily: 'Manrope, Arial, sans-serif' }}>
          Welcome to{' '}
          <span style={{ color: '#ffb59d' }}>COMSATS Cafe</span>
        </h1>
        <p style={{ fontSize: 15, color: '#e1bfb5', lineHeight: 1.5 }}>
          Tell us who you are so we can set up your experience
        </p>
      </motion.div>

      {/* Role Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24, flex: 1 }}>
        {roles.map((role, i) => (
          <motion.button
            key={role.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.1 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleRoleSelect(role.id)}
            disabled={loading}
            style={{
              background: selected === role.id ? role.activeBg : role.bgColor,
              border: `2px solid ${selected === role.id ? role.activeBorder : role.borderColor}`,
              borderRadius: 20,
              padding: '24px 16px',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 10,
              transition: 'all 0.25s ease',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Selected checkmark */}
            <AnimatePresence>
              {selected === role.id && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  style={{
                    position: 'absolute', top: 10, right: 10,
                    width: 22, height: 22, borderRadius: '50%',
                    background: role.accentColor,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, color: '#5d1900', fontWeight: 700,
                  }}
                >
                  ✓
                </motion.div>
              )}
            </AnimatePresence>

            {/* Icon */}
            <div style={{
              width: 64, height: 64, borderRadius: 18,
              background: selected === role.id ? role.accentColor + '22' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${selected === role.id ? role.accentColor + '44' : 'rgba(255,255,255,0.08)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 30, transition: 'all 0.25s ease',
            }}>
              {loading && selected === role.id ? '⏳' : role.emoji}
            </div>

            {/* Title */}
            <div style={{
              fontSize: 15, fontWeight: 700,
              color: selected === role.id ? role.accentColor : '#e3e0f8',
              transition: 'color 0.2s', textAlign: 'center',
            }}>
              {role.title}
            </div>

            {/* Subtitle */}
            <div style={{ fontSize: 11, color: '#e1bfb5', textAlign: 'center', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
              {role.subtitle}
            </div>

            {/* Features */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignSelf: 'stretch', marginTop: 4 }}>
              {role.features.map((f, fi) => (
                <div key={fi} style={{
                  fontSize: 10, textAlign: 'left', transition: 'color 0.2s',
                  color: selected === role.id ? role.accentColor + 'cc' : '#6b7280',
                }}>
                  {f}
                </div>
              ))}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Bottom section */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
          <span style={{ fontSize: 12, color: '#6b7280' }}>or</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
        </div>

        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>
          Admin?{' '}
          <span
            onClick={() => { localStorage.setItem('pwa_selected_role', 'admin'); navigate('/admin/login'); }}
            style={{ color: '#e1bfb5', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Sign in here →
          </span>
        </p>

        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 10, padding: '10px 14px', marginBottom: 16,
        }}>
          <p style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.5 }}>
            💾 Your choice is saved automatically. You can switch roles anytime from your profile settings.
          </p>
        </div>

        <p
          onClick={() => navigate('/')}
          style={{ fontSize: 12, color: '#374151', cursor: 'pointer' }}
        >
          Open full website instead →
        </p>
      </motion.div>
    </div>
  );
}
