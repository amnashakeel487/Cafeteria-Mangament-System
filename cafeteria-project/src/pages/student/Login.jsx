import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import DevelopmentTeam from '../../components/DevelopmentTeam';

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

  const loginForm = (
    <div className="bg-surface-container-high rounded-xl p-8 border border-outline-variant/10 shadow-2xl">
      <div className="mb-8 text-center">
        <div className="w-12 h-12 bg-surface-container-highest rounded-full flex items-center justify-center mx-auto mb-3 border border-outline-variant/10">
          <span className="material-symbols-outlined text-2xl text-tertiary">school</span>
        </div>
        <h1 className="text-2xl font-extrabold editorial-text text-on-surface mb-1" style={{ fontFamily: 'Manrope' }}>Student Portal</h1>
        <p className="text-xs text-on-surface-variant font-label tracking-wide uppercase">COMSTAS Cafe</p>
      </div>

      {error && (
        <div className="mb-5 p-3 rounded-lg bg-error-container/20 border border-error/50 flex items-center space-x-3 text-error">
          <span className="material-symbols-outlined text-sm">error</span>
          <p className="text-sm font-bold">{error}</p>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-on-surface-variant">University Email</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50">school</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} placeholder="student@university.edu"
              className="w-full bg-surface-container-lowest border border-outline-variant/15 focus:border-tertiary/60 rounded-lg pl-12 pr-4 py-3 text-sm focus:ring-1 focus:ring-tertiary/50 text-on-surface placeholder-on-surface-variant/30 transition-all font-label" required />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-on-surface-variant">Password</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50">lock</span>
            <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} placeholder="••••••••"
              className="w-full bg-surface-container-lowest border border-outline-variant/15 focus:border-tertiary/60 rounded-lg pl-12 pr-12 py-3 text-sm focus:ring-1 focus:ring-tertiary/50 text-on-surface placeholder-on-surface-variant/30 transition-all font-label" required />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 hover:text-tertiary transition-colors">
              <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
            </button>
          </div>
        </div>
        <button type="submit" disabled={isLoading}
          className="w-full bg-gradient-to-br from-tertiary to-tertiary-container text-on-tertiary py-3 rounded-lg font-bold flex items-center justify-center space-x-2 hover:opacity-90 active:scale-[0.98] transition-all">
          {isLoading ? <span className="material-symbols-outlined animate-spin">refresh</span> : <><span>Sign In</span><span className="material-symbols-outlined text-lg">arrow_forward</span></>}
        </button>
        <p className="text-xs text-center text-on-surface-variant">For demo purposes, logging in with any email will auto-register an account.</p>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4 text-on-surface font-['Inter']">
      <DevelopmentTeam loginSlot={loginForm} />
    </div>
  );
}
