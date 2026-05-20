import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import PortalLoginLayout, {
  PortalLoginErrorAlert,
  PortalLoginField,
} from '../../components/PortalLoginLayout';
import { PORTAL_THEMES, getInputFocusClass, getIconFocusClass } from '../../components/portalLoginThemes';
import { MailIcon, LockIcon, EyeIcon, SignInLeftIcon, ArrowIcon } from '../../components/loginFormIcons';
import PageSEO from '../../seo/PageSEO';
import { PAGE_SEO } from '../../seo/siteConfig';

const themeKey = 'admin';
const t = PORTAL_THEMES[themeKey];
const inputClass = getInputFocusClass(themeKey);
const iconFocus = getIconFocusClass(themeKey);

const securityNotes = [
  { icon: 'verified_user', text: 'Secured with JWT authentication', color: 'text-[#ff6b35]' },
  { icon: 'admin_panel_settings', text: 'Full system access — authorized personnel only', color: 'text-[#59d5fb]' },
  { icon: 'support_agent', text: 'Need help? Contact your system administrator', color: 'text-[#ffb59d]' },
];

export default function Login() {
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
      const response = await axios.post('/api/admin/login', {
        email,
        password,
      });

      if (response.data.token) {
        localStorage.setItem('adminToken', response.data.token);
        localStorage.setItem('adminData', JSON.stringify(response.data.admin));
        navigate('/admin/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <PageSEO {...PAGE_SEO.adminLogin} />
      <PortalLoginLayout themeKey={themeKey} showSecondary={false}>
        <PortalLoginErrorAlert message={error} />

        <form onSubmit={handleLogin}>
          <PortalLoginField delay={4}>
            <label htmlFor="admin-email" className="block text-xs font-medium uppercase tracking-wide text-[#6b7280] mb-2 font-dm">
              Email Address
            </label>
            <div className="relative flex items-center group">
              <span className={`absolute left-3.5 text-[#6b7280] flex transition-colors ${iconFocus}`}>
                <MailIcon />
              </span>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                placeholder="admin@culinary.edu"
                className={inputClass}
                required
              />
            </div>
          </PortalLoginField>

          <PortalLoginField delay={5}>
            <label htmlFor="admin-password" className="block text-xs font-medium uppercase tracking-wide text-[#6b7280] mb-2 font-dm">
              Password
            </label>
            <div className="relative flex items-center group">
              <span className={`absolute left-3.5 text-[#6b7280] flex transition-colors ${iconFocus}`}>
                <LockIcon />
              </span>
              <input
                id="admin-password"
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
                  <SignInLeftIcon />
                  Sign In to Console
                  <ArrowIcon />
                </>
              )}
            </motion.button>
          </PortalLoginField>

          <PortalLoginField delay={7}>
            <div className="mt-6 pt-6 border-t border-white/[0.07] space-y-3">
              {securityNotes.map((note) => (
                <div key={note.text} className="flex items-center gap-3 text-xs text-[#6b7280] font-dm">
                  <span className={`material-symbols-outlined text-sm shrink-0 ${note.color}`}>{note.icon}</span>
                  <span>{note.text}</span>
                </div>
              ))}
            </div>
          </PortalLoginField>
        </form>
      </PortalLoginLayout>
    </>
  );
}
