import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DevelopmentTeam from '../../components/DevelopmentTeam';

export default function StudentRegister() {
  const [form, setForm] = useState({ name: '', email: '', password: '', contact: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      await axios.post('/api/student/register', form);
      setSuccess('Registration submitted! Please wait for admin approval before logging in.');
      setTimeout(() => navigate('/student/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const registerForm = (
    <div className="bg-surface-container-high rounded-xl p-8 border border-outline-variant/10 shadow-2xl h-full flex flex-col justify-between">
      <div>
        <div className="mb-6 text-center">
          <div className="w-12 h-12 bg-surface-container-highest rounded-full flex items-center justify-center mx-auto mb-3 border border-outline-variant/10">
            <span className="material-symbols-outlined text-2xl text-tertiary">person_add</span>
          </div>
          <h1 className="text-2xl font-extrabold text-on-surface mb-1" style={{ fontFamily: 'Manrope' }}>Create Account</h1>
          <p className="text-xs text-on-surface-variant uppercase tracking-wide">Student Portal — COMSTAS Cafe</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-error-container/20 border border-error/50 flex items-center gap-2 text-error">
            <span className="material-symbols-outlined text-sm">error</span>
            <p className="text-sm font-bold">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 rounded-lg bg-tertiary/10 border border-tertiary/30 flex items-center gap-2 text-tertiary">
            <span className="material-symbols-outlined text-sm">check_circle</span>
            <p className="text-sm font-bold">{success}</p>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface-variant">Full Name</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50">person</span>
              <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Your full name"
                className="w-full bg-surface-container-lowest border border-outline-variant/15 focus:border-tertiary/60 rounded-lg pl-12 pr-4 py-3 text-sm focus:ring-1 focus:ring-tertiary/50 text-on-surface placeholder-on-surface-variant/30 transition-all outline-none" required />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface-variant">University Email</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50">mail</span>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="student@university.edu"
                className="w-full bg-surface-container-lowest border border-outline-variant/15 focus:border-tertiary/60 rounded-lg pl-12 pr-4 py-3 text-sm focus:ring-1 focus:ring-tertiary/50 text-on-surface placeholder-on-surface-variant/30 transition-all outline-none" required />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface-variant">Contact (Optional)</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50">phone</span>
              <input type="text" value={form.contact} onChange={e => setForm({...form, contact: e.target.value})} placeholder="+92 300 0000000"
                className="w-full bg-surface-container-lowest border border-outline-variant/15 focus:border-tertiary/60 rounded-lg pl-12 pr-4 py-3 text-sm focus:ring-1 focus:ring-tertiary/50 text-on-surface placeholder-on-surface-variant/30 transition-all outline-none" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface-variant">Password</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50">lock</span>
              <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Min. 6 characters"
                className="w-full bg-surface-container-lowest border border-outline-variant/15 focus:border-tertiary/60 rounded-lg pl-12 pr-12 py-3 text-sm focus:ring-1 focus:ring-tertiary/50 text-on-surface placeholder-on-surface-variant/30 transition-all outline-none" required minLength={6} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 hover:text-tertiary transition-colors">
                <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>
          </div>
          <button type="submit" disabled={isLoading}
            className="w-full bg-gradient-to-br from-tertiary to-tertiary-container text-on-tertiary py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all">
            {isLoading ? <span className="material-symbols-outlined animate-spin">refresh</span> : <><span>Submit Registration</span><span className="material-symbols-outlined text-lg">arrow_forward</span></>}
          </button>
        </form>
      </div>

      <p className="text-xs text-center text-on-surface-variant mt-6">
        Already have an account?{' '}
        <button onClick={() => navigate('/student/login')} className="text-tertiary font-bold hover:underline">Sign In →</button>
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4 text-on-surface font-['Inter']">
      <DevelopmentTeam loginSlot={registerForm} />
    </div>
  );
}
