import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import CustomerLoginLayout, {
  CustomerLoginErrorAlert,
  CustomerLoginField,
} from '../../components/CustomerLoginLayout';
import PageSEO from '../../seo/PageSEO';
import { PAGE_SEO } from '../../seo/siteConfig';

/* SVG icons — match customer-login.html */
const MailIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const LockIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const EyeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const SignInLeftIcon = () => (
  <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
  </svg>
);

const ArrowIcon = () => (
  <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
  </svg>
);

const inputClass =
  'w-full bg-[#0d1117] border border-white/[0.07] rounded-[10px] py-3.5 pl-11 pr-4 text-sm text-[#f1f5f9] font-dm outline-none transition-all duration-250 placeholder:text-[#6b7280] focus:border-[#06d6c7] focus:shadow-[0_0_0_3px_rgba(6,214,199,0.18)] focus:bg-[#06d6c7]/[0.03] disabled:opacity-60';

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
            <label htmlFor="student-email" className="block text-xs font-medium uppercase tracking-wide text-[#6b7280] mb-2 font-dm">
              University Email
            </label>
            <div className="relative flex items-center group">
              <span className="absolute left-3.5 text-[#6b7280] flex group-focus-within:text-[#06d6c7] transition-colors">
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
            <label htmlFor="student-password" className="block text-xs font-medium uppercase tracking-wide text-[#6b7280] mb-2 font-dm">
              Password
            </label>
            <div className="relative flex items-center group">
              <span className="absolute left-3.5 text-[#6b7280] flex group-focus-within:text-[#06d6c7] transition-colors">
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
                className={`absolute right-3.5 flex p-0 bg-transparent border-0 cursor-pointer transition-colors ${showPassword ? 'text-[#06d6c7]' : 'text-[#6b7280] hover:text-[#06d6c7]'}`}
              >
                <EyeIcon />
              </button>
            </div>
          </CustomerLoginField>

          <CustomerLoginField delay={6}>
            <div className="text-right -mt-2 mb-6">
              <button type="button" className="text-xs text-[#04a89c] hover:text-[#06d6c7] bg-transparent border-0 cursor-pointer font-dm transition-colors">
                Forgot password?
              </button>
            </div>
          </CustomerLoginField>

          <CustomerLoginField delay={7}>
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={!isLoading ? { y: -2, boxShadow: '0 8px 24px rgba(6,214,199,0.3)' } : {}}
              whileTap={!isLoading ? { y: 0 } : {}}
              className="w-full py-[15px] rounded-[10px] border-0 font-syne text-[15px] font-bold tracking-wide text-[#0a1a1a] cursor-pointer flex items-center justify-center gap-2.5 transition-all duration-250 disabled:opacity-70 disabled:cursor-not-allowed bg-gradient-to-br from-[#06d6c7] to-[#0891b2] hover:brightness-105 relative overflow-hidden"
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
            <p className="text-center text-xs text-[#6b7280] mt-4 px-3.5 py-2.5 rounded-lg bg-white/[0.02] border border-white/[0.07] leading-relaxed font-dm">
              For demo purposes, logging in with any email will auto-register an account.
            </p>
          </CustomerLoginField>
        </form>
      </CustomerLoginLayout>
    </>
  );
}
