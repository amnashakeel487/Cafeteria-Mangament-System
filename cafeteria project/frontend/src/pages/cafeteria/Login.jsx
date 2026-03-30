import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function CafeteriaLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/cafeteria/login', { email, password });

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
    <div className="min-h-screen bg-surface flex items-center justify-center p-6 text-on-surface font-['Inter'] relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary-container opacity-10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-tertiary opacity-5 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="max-w-md w-full relative group">
        {/* Glow border */}
        <div className="absolute -inset-1 bg-gradient-to-r from-tertiary to-primary-container opacity-20 blur-sm group-hover:opacity-30 transition duration-1000 rounded-xl"></div>

        <div className="relative bg-surface-container-high rounded-xl p-10 border border-outline-variant/10 shadow-2xl shadow-[#0C0C1D]/60">
          {/* Logo / Header */}
          <div className="mb-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary-container/20 flex items-center justify-center mx-auto mb-4 border border-primary/20">
              <span className="material-symbols-outlined text-3xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant</span>
            </div>
            <h1 className="text-3xl font-extrabold text-primary mb-1" style={{ fontFamily: 'Manrope, sans-serif' }}>COMSTAS Cafe</h1>
            <p className="text-sm text-on-surface-variant font-bold uppercase tracking-widest">Staff Portal Login</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-error-container/20 border border-error/50 flex items-center space-x-3 text-error">
              <span className="material-symbols-outlined">error</span>
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Staff Email</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50">mail</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  placeholder="staff@cafeteria.edu"
                  className="w-full bg-surface-container-lowest border border-outline-variant/15 focus:border-tertiary/60 rounded-lg pl-12 pr-4 py-3 text-sm focus:ring-1 focus:ring-tertiary/50 text-on-surface placeholder-on-surface-variant/30 transition-all outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Password</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50">lock</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  placeholder="••••••••"
                  className="w-full bg-surface-container-lowest border border-outline-variant/15 focus:border-tertiary/60 rounded-lg pl-12 pr-4 py-3 text-sm focus:ring-1 focus:ring-tertiary/50 text-on-surface placeholder-on-surface-variant/30 transition-all outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-br from-primary-container to-[#ff6b35] text-on-primary py-3.5 rounded-lg font-bold flex items-center justify-center space-x-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
            >
              {isLoading ? (
                <span className="material-symbols-outlined animate-spin">refresh</span>
              ) : (
                <>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant</span>
                  <span>Access Staff Portal</span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-on-surface-variant/50 mt-8">
            Are you an admin?{' '}
            <a href="/admin/login" className="text-primary font-bold hover:underline">Admin Console →</a>
          </p>
        </div>
      </div>
    </div>
  );
}
