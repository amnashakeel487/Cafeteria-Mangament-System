import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import LoginPageLayout, { LoginErrorAlert, LoginFormField, getVariantStyles } from '../../components/LoginPageLayout';
import PageSEO from '../../seo/PageSEO';
import { PAGE_SEO } from '../../seo/siteConfig';

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

  const inputBase = `w-full bg-[#28283a]/80 border border-outline-variant/20 rounded-xl pl-14 pr-5 py-4 text-sm text-on-surface placeholder-on-surface-variant/40 transition-all duration-300 outline-none ${v.accentRing}`;

  return (
    <>
      <PageSEO {...PAGE_SEO.cafeLogin} />
      <LoginPageLayout
        variant="cafe"
        heading="Cafe Owner Login ☕"
        subtext="Access your dashboard to manage menus, orders, and payments."
        secondaryAction={
          <Link
            to="/admin/login"
            className={`w-full py-3.5 rounded-xl font-bold text-sm border-2 flex items-center justify-center gap-2 transition-all duration-300 ${v.outlineBtn}`}
          >
            <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
            Admin Console
          </Link>
        }
      >
        <LoginErrorAlert message={error} />

        <form onSubmit={handleLogin} className="space-y-5">
          <LoginFormField>
            <label htmlFor="cafe-email" className="block text-xs font-bold text-on-surface-variant mb-2 uppercase tracking-wide">
              Staff Email
            </label>
            <div className="relative group">
              <span
                className={`material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant/50 transition-colors ${v.inputIconFocus}`}
              >
                mail
              </span>
              <input
                id="cafe-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                placeholder="staff@cafeteria.edu"
                className={inputBase}
                required
              />
            </div>
          </LoginFormField>

          <LoginFormField>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="cafe-password" className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">
                Password
              </label>
              <button
                type="button"
                className={`text-xs font-bold ${v.accentText} opacity-80 hover:opacity-100 transition-opacity`}
              >
                Forgot password?
              </button>
            </div>
            <div className="relative group">
              <span
                className={`material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant/50 transition-colors ${v.inputIconFocus}`}
              >
                lock
              </span>
              <input
                id="cafe-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                placeholder="Enter your password"
                className={`${inputBase} pr-14`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-5 top-1/2 -translate-y-1/2 text-on-surface-variant/50 transition-colors ${v.linkHover}`}
              >
                <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>
          </LoginFormField>

          <LoginFormField>
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={!isLoading ? { scale: 1.02 } : {}}
              whileTap={!isLoading ? { scale: 0.98 } : {}}
              animate={isLoading ? { boxShadow: ['0 0 0 rgba(255,107,53,0)', '0 0 24px rgba(255,107,53,0.45)', '0 0 0 rgba(255,107,53,0)'] } : {}}
              transition={isLoading ? { duration: 1.5, repeat: Infinity } : {}}
              className={`w-full ${v.btnGradient} ${v.btnText} py-4 rounded-xl font-bold flex items-center justify-center gap-3 ${v.btnShadow} transition-all disabled:opacity-60`}
            >
              {isLoading ? (
                <span className="material-symbols-outlined animate-spin text-xl">refresh</span>
              ) : (
                <>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                    restaurant
                  </span>
                  <span className="flex-1">Access Staff Portal</span>
                  <span className="material-symbols-outlined text-xl">arrow_forward</span>
                </>
              )}
            </motion.button>
          </LoginFormField>
        </form>
      </LoginPageLayout>
    </>
  );
}
