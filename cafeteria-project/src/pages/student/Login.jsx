import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import CustomerLoginLayout, {
  CustomerLoginErrorAlert,
  CustomerLoginField,
} from '../../components/CustomerLoginLayout';
import {
  ArrowIcon,
  EyeIcon,
  LockIcon,
  MailIcon,
  SignInLeftIcon,
} from '../../components/loginFormIcons';
import {
  getIconFocusClass,
  getInputFocusClass,
  getLinkAccentClass,
  getPrimaryButtonClass,
  getTheme,
} from '../../components/portalLoginThemes';
import PageSEO from '../../seo/PageSEO';
import { PAGE_SEO } from '../../seo/siteConfig';

const inputClass = getInputFocusClass('customer');
const iconFocus = getIconFocusClass('customer');
const linkAccent = getLinkAccentClass('customer');
const btnClass = getPrimaryButtonClass('customer');
const theme = getTheme('customer');

export default function StudentLogin() {
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
      const response = await axios.post('/api/student/login', {
        email,
        password,
      });

      if (response.data.token) {
        localStorage.setItem('studentToken', response.data.token);
        localStorage.setItem('studentData', JSON.stringify(response.data.student));
        navigate('/student/home');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <PageSEO {...PAGE_SEO.studentLogin} />
      <CustomerLoginLayout onRegisterClick={() => navigate('/student/register')}>
        <CustomerLoginErrorAlert message={error} />

        <form onSubmit={handleLogin}>
          <CustomerLoginField delay={4}>
            <label htmlFor="student-email" className="block text-xs font-medium uppercase tracking-wide text-on-surface-variant mb-2 font-dm">
              University Email
            </label>
            <div className="relative flex items-center group">
              <span className={`absolute left-3.5 text-on-surface-variant/60 flex transition-colors ${iconFocus}`}>
                <MailIcon />
              </span>
              <input
                id="student-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                placeholder="you@comsats.edu.pk"
                className={inputClass}
                required
              />
            </div>
          </CustomerLoginField>

          <CustomerLoginField delay={5}>
            <label htmlFor="student-password" className="block text-xs font-medium uppercase tracking-wide text-on-surface-variant mb-2 font-dm">
              Password
            </label>
            <div className="relative flex items-center group">
              <span className={`absolute left-3.5 text-on-surface-variant/60 flex transition-colors ${iconFocus}`}>
                <LockIcon />
              </span>
              <input
                id="student-password"
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
                className={`absolute right-3.5 flex p-0 bg-transparent border-0 cursor-pointer transition-colors ${
                  showPassword ? 'text-primary' : 'text-on-surface-variant/60 hover:text-primary'
                }`}
              >
                <EyeIcon />
              </button>
            </div>
          </CustomerLoginField>

          <CustomerLoginField delay={6}>
            <div className="text-right -mt-2 mb-6">
              <button
                type="button"
                className={`text-xs bg-transparent border-0 cursor-pointer font-dm transition-colors ${linkAccent}`}
              >
                Forgot password?
              </button>
            </div>
          </CustomerLoginField>

          <CustomerLoginField delay={7}>
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
                  <SignInLeftIcon />
                  Sign In
                  <ArrowIcon />
                </>
              )}
            </motion.button>
          </CustomerLoginField>

          <CustomerLoginField delay={8}>
            <p className="text-center text-xs text-on-surface-variant mt-4 px-3.5 py-2.5 rounded-lg bg-surface-container/50 border border-outline-variant/15 leading-relaxed font-dm">
              For demo purposes, logging in with any email will auto-register an account.
            </p>
          </CustomerLoginField>
        </form>
      </CustomerLoginLayout>
    </>
  );
}
