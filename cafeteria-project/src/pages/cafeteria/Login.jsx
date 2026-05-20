import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import PortalLoginLayout, {
  PortalLoginErrorAlert,
  PortalLoginField,
} from '../../components/PortalLoginLayout';
import { PORTAL_THEMES, getInputFocusClass, getIconFocusClass, getSecondaryButtonClass } from '../../components/portalLoginThemes';
import { MailIcon, LockIcon, EyeIcon, ArrowIcon } from '../../components/loginFormIcons';
import PageSEO from '../../seo/PageSEO';
import { PAGE_SEO } from '../../seo/siteConfig';

const themeKey = 'cafe';
const t = PORTAL_THEMES[themeKey];
const inputClass = getInputFocusClass(themeKey);
const iconFocus = getIconFocusClass(themeKey);

export default function CafeteriaLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

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
    <>
      <PageSEO {...PAGE_SEO.cafeLogin} />
      <PortalLoginLayout
        themeKey={themeKey}
        secondaryAction={
          <Link to="/admin/login" className={getSecondaryButtonClass(themeKey)}>
            <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
            Admin Console
          </Link>
        }
      >
        <PortalLoginErrorAlert message={error} />

        <form onSubmit={handleLogin}>
          <PortalLoginField delay={4}>
            <label htmlFor="cafe-email" className="block text-xs font-medium uppercase tracking-wide text-[#6b7280] mb-2 font-dm">
              Staff Email
            </label>
            <div className="relative flex items-center group">
              <span className={`absolute left-3.5 text-[#6b7280] flex transition-colors ${iconFocus}`}>
                <MailIcon />
              </span>
              <input
                id="cafe-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                placeholder="staff@cafeteria.edu"
                className={inputClass}
                required
              />
            </div>
          </PortalLoginField>

          <PortalLoginField delay={5}>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="cafe-password" className="text-xs font-medium uppercase tracking-wide text-[#6b7280] font-dm">
                Password
              </label>
              <button
                type="button"
                className="text-xs text-[#ffb59d] hover:text-[#ff6b35] bg-transparent border-0 cursor-pointer font-dm transition-colors"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative flex items-center group">
              <span className={`absolute left-3.5 text-[#6b7280] flex transition-colors ${iconFocus}`}>
                <LockIcon />
              </span>
              <input
                id="cafe-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                placeholder="••••••••"
                className={`${inputClass} pr-11`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3.5 flex p-0 bg-transparent border-0 cursor-pointer transition-colors ${showPassword ? 'text-[#ff6b35]' : 'text-[#6b7280] hover:text-[#ff6b35]'}`}
              >
                <EyeIcon />
              </button>
            </div>
          </PortalLoginField>

          <PortalLoginField delay={6}>
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={!isLoading ? { y: -2, boxShadow: t.btnHoverShadow } : {}}
              whileTap={!isLoading ? { y: 0 } : {}}
              animate={isLoading ? { boxShadow: t.btnLoadingShadow } : {}}
              transition={isLoading ? { duration: 1.5, repeat: Infinity } : {}}
              className={`w-full py-[15px] rounded-[10px] border-0 font-syne text-[15px] font-bold tracking-wide cursor-pointer flex items-center justify-center gap-2.5 transition-all duration-250 disabled:opacity-70 disabled:cursor-not-allowed hover:brightness-105 ${t.btnGradient} ${t.btnText}`}
            >
              {isLoading ? (
                <span className="material-symbols-outlined animate-spin text-xl">refresh</span>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    restaurant
                  </span>
                  Access Staff Portal
                  <ArrowIcon />
                </>
              )}
            </motion.button>
          </PortalLoginField>
        </form>
      </PortalLoginLayout>
    </>
  );
}
