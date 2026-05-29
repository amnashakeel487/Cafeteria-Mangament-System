import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import CustomerRegisterLayout from '../../components/CustomerRegisterLayout';
import {
  PortalLoginErrorAlert,
  PortalLoginField,
} from '../../components/PortalLoginLayout';
import {
  ArrowIcon,
  EyeIcon,
  LockIcon,
  MailIcon,
  PersonIcon,
  PhoneIcon,
  UserPlusIcon,
} from '../../components/loginFormIcons';
import {
  getIconFocusClass,
  getInputFocusClass,
  getPrimaryButtonClass,
  getTheme,
} from '../../components/portalLoginThemes';
import PageSEO from '../../seo/PageSEO';
import { PAGE_SEO } from '../../seo/siteConfig';

const inputClass = getInputFocusClass('customer');
const iconFocus = getIconFocusClass('customer');
const btnClass = getPrimaryButtonClass('customer');
const theme = getTheme('customer');

export default function StudentRegister() {
  const [form, setForm] = useState({ name: '', email: '', password: '', contact: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const goToPendingApproval = (data) => {
    sessionStorage.setItem('pendingApprovalEmail', form.email.trim());
    sessionStorage.setItem('pendingApprovalName', form.name.trim());
    sessionStorage.removeItem('pendingApprovalEmailDelayed');
    navigate('/student/pending-approval', {
      state: {
        email: data?.email || form.email,
        name: data?.name || form.name,
      },
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/student/register', form);
      if (res.data?.success) {
        goToPendingApproval(res.data?.data);
        return;
      }
      setError(res.data?.message || 'Registration could not be completed.');
    } catch (err) {
      if (!err.response) {
        setError(
          'Cannot reach the API. Start the backend (cd backend && node server.js) while using npm run dev, or deploy with Vercel env variables set.'
        );
      } else if (err.response.status === 409) {
        setError(err.response?.data?.message || 'This email is already registered.');
      } else {
        // Account may have been created even if the response failed (e.g. email timeout)
        try {
          const check = await axios.get('/api/student/approval-status', {
            params: { email: form.email.trim() },
          });
          if (check.data?.approvalStatus === 'pending') {
            goToPendingApproval({
              email: form.email.trim(),
              name: check.data?.name || form.name,
            });
            return;
          }
        } catch {
          /* ignore */
        }
        setError(err.response?.data?.message || `Registration failed (${err.response.status}).`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <PageSEO {...PAGE_SEO.studentRegister} />
      <CustomerRegisterLayout onSignInClick={() => navigate('/student/login')}>
        <PortalLoginErrorAlert message={error} />
        <form onSubmit={handleRegister}>
          <PortalLoginField delay={4}>
            <label htmlFor="reg-name" className="block text-xs font-medium uppercase tracking-wide text-on-surface-variant mb-2 font-dm">
              Full Name
            </label>
            <div className="relative flex items-center group">
              <span className={`absolute left-3.5 text-on-surface-variant/60 flex transition-colors ${iconFocus}`}>
                <PersonIcon />
              </span>
              <input
                id="reg-name"
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                disabled={isLoading}
                placeholder="Your full name"
                className={inputClass}
                required
              />
            </div>
          </PortalLoginField>

          <PortalLoginField delay={5}>
            <label htmlFor="reg-email" className="block text-xs font-medium uppercase tracking-wide text-on-surface-variant mb-2 font-dm">
              University Email
            </label>
            <div className="relative flex items-center group">
              <span className={`absolute left-3.5 text-on-surface-variant/60 flex transition-colors ${iconFocus}`}>
                <MailIcon />
              </span>
              <input
                id="reg-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                disabled={isLoading}
                placeholder="you@comsats.edu.pk"
                className={inputClass}
                required
              />
            </div>
          </PortalLoginField>

          <PortalLoginField delay={6}>
            <label htmlFor="reg-contact" className="block text-xs font-medium uppercase tracking-wide text-on-surface-variant mb-2 font-dm">
              Contact <span className="normal-case text-on-surface-variant/50">(optional)</span>
            </label>
            <div className="relative flex items-center group">
              <span className={`absolute left-3.5 text-on-surface-variant/60 flex transition-colors ${iconFocus}`}>
                <PhoneIcon />
              </span>
              <input
                id="reg-contact"
                type="text"
                value={form.contact}
                onChange={(e) => setForm({ ...form, contact: e.target.value })}
                disabled={isLoading}
                placeholder="+92 300 0000000"
                className={inputClass}
              />
            </div>
          </PortalLoginField>

          <PortalLoginField delay={7}>
            <label htmlFor="reg-password" className="block text-xs font-medium uppercase tracking-wide text-on-surface-variant mb-2 font-dm">
              Password
            </label>
            <div className="relative flex items-center group">
              <span className={`absolute left-3.5 text-on-surface-variant/60 flex transition-colors ${iconFocus}`}>
                <LockIcon />
              </span>
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                disabled={isLoading}
                placeholder="Min. 6 characters"
                className={`${inputClass} pr-11`}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                className={`absolute right-3.5 flex p-0 bg-transparent border-0 cursor-pointer transition-colors disabled:opacity-50 ${
                  showPassword ? 'text-primary' : 'text-on-surface-variant/60 hover:text-primary'
                }`}
              >
                <EyeIcon />
              </button>
            </div>
          </PortalLoginField>

          <PortalLoginField delay={8} className="mb-0">
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={!isLoading ? { y: -2, boxShadow: theme.btnHoverShadow } : {}}
              whileTap={!isLoading ? { y: 0 } : {}}
              className={btnClass}
            >
              {isLoading ? (
                <span className="material-symbols-outlined animate-spin text-xl">refresh</span>
              ) : (
                <>
                  <UserPlusIcon />
                  Submit Registration
                  <ArrowIcon />
                </>
              )}
            </motion.button>
          </PortalLoginField>

          <PortalLoginField delay={9}>
            <p className="text-center text-xs text-on-surface-variant mt-4 px-3.5 py-2.5 rounded-lg bg-surface-container/50 border border-outline-variant/15 leading-relaxed font-dm">
              After you register, an administrator will approve your account. You&apos;ll receive access once approved.
            </p>
          </PortalLoginField>
        </form>
      </CustomerRegisterLayout>
    </>
  );
}
