import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import LoginPageLayout, { LoginErrorAlert, LoginFormField, getVariantStyles } from '../../components/LoginPageLayout';

export default function CafeteriaLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const v = getVariantStyles('cafe');

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/cafeteria/login', { email, password });

      if (response.data.token) {
        localStorage.setItem('cafeteriaToken', response.data.token);
        localStorage.setItem('cafeteriaData', JSON.stringify(response.data.cafeteria));
        navigate('/cafeteria/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LoginPageLayout
      variant="cafe"
      heading="Cafe Owner Login ☕"
      subtext="Access your dashboard to manage menus, orders, and payments."
      footer={
        <p className="text-center text-xs text-on-surface-variant/70">
          Are you an admin?{' '}
          <a href="/admin/login" className="text-primary font-bold hover:underline">
            Admin Console →
          </a>
        </p>
      }
    >
      <LoginErrorAlert message={error} />

      <form onSubmit={handleLogin} className="space-y-5">
        <LoginFormField>
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Staff Email</label>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 group-focus-within:text-primary transition-colors">
                mail
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                placeholder="staff@cafeteria.edu"
                className={`w-full bg-surface-container-lowest border border-outline-variant/15 rounded-lg pl-12 pr-4 py-3.5 text-sm text-on-surface placeholder-on-surface-variant/30 transition-all duration-300 outline-none focus:ring-2 ${v.accentRing}`}
                required
              />
            </div>
          </div>
        </LoginFormField>

        <LoginFormField>
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Password</label>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 group-focus-within:text-primary transition-colors">
                lock
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                placeholder="••••••••"
                className={`w-full bg-surface-container-lowest border border-outline-variant/15 rounded-lg pl-12 pr-12 py-3.5 text-sm text-on-surface placeholder-on-surface-variant/30 transition-all duration-300 outline-none focus:ring-2 ${v.accentRing}`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>
          </div>
        </LoginFormField>

        <LoginFormField>
          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={!isLoading ? { scale: 1.02, boxShadow: '0 0 28px rgba(255, 107, 53, 0.4)' } : {}}
            whileTap={!isLoading ? { scale: 0.98 } : {}}
            animate={isLoading ? { scale: [1, 1.02, 1] } : {}}
            transition={isLoading ? { duration: 1.2, repeat: Infinity } : {}}
            className={`w-full bg-gradient-to-br ${v.btnGradient} ${v.btnText} py-3.5 rounded-lg font-bold flex items-center justify-center gap-2 shadow-lg ${v.btnShadow} transition-all disabled:opacity-70`}
          >
            {isLoading ? (
              <span className="material-symbols-outlined animate-spin">refresh</span>
            ) : (
              <>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  restaurant
                </span>
                <span>Access Staff Portal</span>
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </>
            )}
          </motion.button>
        </LoginFormField>
      </form>
    </LoginPageLayout>
  );
}
