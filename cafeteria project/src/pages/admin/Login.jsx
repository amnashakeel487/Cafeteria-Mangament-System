import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
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
      const response = await axios.post('http://localhost:5000/api/admin/login', {
        email,
        password
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
    <div className="min-h-screen bg-surface flex items-center justify-center p-6 text-on-surface font-['Inter']">
      <div className="max-w-md w-full relative group">
        {/* Subtle glow behind the card */}
        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-primary-container opacity-20 blur group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
        
        <div className="relative bg-surface-container-high rounded-xl p-10 ambient-shadow border border-outline-variant/10">
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-extrabold editorial-text text-primary mb-2">COMSTAS Cafe</h1>
            <p className="text-sm text-on-surface-variant font-label tracking-wide uppercase">Admin Console</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-error-container/20 border border-error/50 flex items-center space-x-3 text-error">
              <span className="material-symbols-outlined">error</span>
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-on-surface-variant">Email Address</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50">mail</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  placeholder="admin@culinary.edu"
                  className="w-full bg-surface-container-lowest border border-outline-variant/15 focus:border-primary/60 rounded-lg pl-12 pr-4 py-3 text-sm focus:ring-1 focus:ring-primary/50 text-on-surface placeholder-on-surface-variant/30 transition-all font-label"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-on-surface-variant">Password</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50">lock</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  placeholder="••••••••"
                  className="w-full bg-surface-container-lowest border border-outline-variant/15 focus:border-primary/60 rounded-lg pl-12 pr-4 py-3 text-sm focus:ring-1 focus:ring-primary/50 text-on-surface placeholder-on-surface-variant/30 transition-all font-label"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-br from-primary to-primary-container text-on-primary py-3.5 rounded-lg font-bold flex items-center justify-center space-x-2 hover:opacity-90 active:scale-[0.98] transition-all"
            >
              {isLoading ? (
                <span className="material-symbols-outlined animate-spin">refresh</span>
              ) : (
                <>
                  <span>Sign In to Console</span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
