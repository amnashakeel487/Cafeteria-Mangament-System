import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import LoginPageLayout, { LoginErrorAlert, LoginFormField, getVariantStyles } from '../../components/LoginPageLayout';
import PageSEO from '../../seo/PageSEO';
import { PAGE_SEO } from '../../seo/siteConfig';

export default function StudentLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const v = getVariantStyles('customer');

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/student/login', {
        email,
        password
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
    <LoginPageLayout
      variant="customer"
      heading="Welcome Back 👋"
      subtext="Sign in to browse menus, place orders, and track your pickup."
      footer={
        <p className="text-xs text-center text-on-surface-variant">
          Don&apos;t have an account?{' '}
          <button
            type="button"
            onClick={() => navigate('/student/register')}
            className="text-tertiary font-bold hover:underline"
          >
            Register →
          </button>
        </p>
      }
    >
      <LoginErrorAlert message={error} />

      <form onSubmit={handleLogin} className="space-y-5">
        <LoginFormField>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface-variant">University Email</label>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 group-focus-within:text-tertiary transition-colors">
                school
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                placeholder="student@university.edu"
                className={`w-full bg-surface-container-lowest border border-outline-variant/15 rounded-lg pl-12 pr-4 py-3.5 text-sm text-on-surface placeholder-on-surface-variant/30 transition-all duration-300 font-label outline-none focus:ring-2 ${v.accentRing}`}
                required
              />
            </div>
          </div>
        </LoginFormField>

        <LoginFormField>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface-variant">Password</label>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 group-focus-within:text-tertiary transition-colors">
                lock
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                placeholder="••••••••"
                className={`w-full bg-surface-container-lowest border border-outline-variant/15 rounded-lg pl-12 pr-12 py-3.5 text-sm text-on-surface placeholder-on-surface-variant/30 transition-all duration-300 font-label outline-none focus:ring-2 ${v.accentRing}`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 hover:text-tertiary transition-colors"
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
            whileHover={!isLoading ? { scale: 1.02, boxShadow: '0 0 28px rgba(89, 213, 251, 0.35)' } : {}}
            whileTap={!isLoading ? { scale: 0.98 } : {}}
            animate={isLoading ? { scale: [1, 1.02, 1] } : {}}
            transition={isLoading ? { duration: 1.2, repeat: Infinity } : {}}
            className={`w-full bg-gradient-to-br ${v.btnGradient} ${v.btnText} py-3.5 rounded-lg font-bold flex items-center justify-center gap-2 shadow-lg ${v.btnShadow} transition-all disabled:opacity-70`}
          >
            {isLoading ? (
              <span className="material-symbols-outlined animate-spin">refresh</span>
            ) : (
              <>
                <span>Sign In</span>
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </>
            )}
          </motion.button>
        </LoginFormField>

        <LoginFormField>
          <p className="text-xs text-center text-on-surface-variant">
            For demo purposes, logging in with any email will auto-register an account.
          </p>
        </LoginFormField>
      </form>
    </LoginPageLayout>
    </>
  );
}
