import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DevelopmentTeam from '../../components/DevelopmentTeam';

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

  const loginForm = (
    <div className="bg-surface-container-high rounded-xl p-8 border border-outline-variant/10 shadow-2xl">
      <div className="mb-8 text-center">
        <div className="w-12 h-12 rounded-2xl bg-primary-container/20 flex items-center justify-center mx-auto mb-3 border border-primary/20">
          <span className="material-symbols-outlined text-2xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant</span>
        </div>
        <h1 className="text-2xl font-extrabold text-primary mb-1" style={{ fontFamily: 'Manrope, sans-serif' }}>COMSTAS Cafe</h1>
        <p className="text-xs text-on-surface-variant font-bold uppercase tracking-widest">Staff Portal Login</p>
      </div>

      {error && (
        <div className="mb-5 p-3 rounded-lg bg-error-container/20 border border-error/50 flex items-center space-x-3 text-error">
          <span className="material-symbols-outlined text-sm">error</span>
          <p className="text-sm font-bold">{error}</p>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Staff Email</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50">mail</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} placeholder="staff@cafeteria.edu"
              className="w-full bg-surface-container-lowest border border-outline-variant/15 focus:border-tertiary/60 rounded-lg pl-12 pr-4 py-3 text-sm focus:ring-1 focus:ring-tertiary/50 text-on-surface placeholder-on-surface-variant/30 transition-all outline-none" required />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Password</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50">lock</span>
            <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} placeholder="••••••••"
              className="w-full bg-surface-container-lowest border border-outline-variant/15 focus:border-tertiary/60 rounded-lg pl-12 pr-12 py-3 text-sm focus:ring-1 focus:ring-tertiary/50 text-on-surface placeholder-on-surface-variant/30 transition-all outline-none" required />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
            </button>
          </div>
        </div>
        <button type="submit" disabled={isLoading}
          className="w-full bg-gradient-to-br from-primary-container to-[#ff6b35] text-on-primary py-3 rounded-lg font-bold flex items-center justify-center space-x-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-primary/20">
          {isLoading ? <span className="material-symbols-outlined animate-spin">refresh</span> : <><span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant</span><span>Access Staff Portal</span><span className="material-symbols-outlined text-lg">arrow_forward</span></>}
        </button>
      </form>

      <p className="text-center text-xs text-on-surface-variant/50 mt-6">
        Are you an admin?{' '}
        <a href="/admin/login" className="text-primary font-bold hover:underline">Admin Console →</a>
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4 text-on-surface font-['Inter']">
      <DevelopmentTeam loginSlot={loginForm} />
    </div>
  );
}
