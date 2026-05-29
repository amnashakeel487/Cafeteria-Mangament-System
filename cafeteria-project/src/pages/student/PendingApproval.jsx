import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import PageSEO from '../../seo/PageSEO';
import { PAGE_SEO } from '../../seo/siteConfig';

const STORAGE_EMAIL = 'pendingApprovalEmail';
const STORAGE_NAME = 'pendingApprovalName';
const STORAGE_EMAIL_NOTE = 'pendingApprovalEmailDelayed';

export default function PendingApproval() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [emailDelayed, setEmailDelayed] = useState(false);
  const [status, setStatus] = useState('pending');
  const [rejectionReason, setRejectionReason] = useState('');
  const [checking, setChecking] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });
  const [pollError, setPollError] = useState(false);

  const showToast = (message, type = 'info') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: '', type: 'info' }), 4000);
  };

  useEffect(() => {
    const storedEmail = sessionStorage.getItem(STORAGE_EMAIL);
    const storedName = sessionStorage.getItem(STORAGE_NAME);
    if (!storedEmail) {
      navigate('/student/register', { replace: true });
      return;
    }
    setEmail(storedEmail);
    setName(storedName || 'Student');
    setEmailDelayed(sessionStorage.getItem(STORAGE_EMAIL_NOTE) === '1');
  }, [navigate]);

  const fetchStatus = useCallback(
    async (silent = false) => {
      if (!email) return;
      if (!silent) setChecking(true);
      try {
        const res = await axios.get('/api/student/approval-status', {
          params: { email },
        });
        setPollError(false);
        const next = res.data.approvalStatus;
        setStatus(next);
        setRejectionReason(res.data.rejectionReason || '');

        if (next === 'approved') {
          sessionStorage.removeItem(STORAGE_EMAIL);
          sessionStorage.removeItem(STORAGE_NAME);
          sessionStorage.removeItem(STORAGE_EMAIL_NOTE);
          navigate('/student/login', {
            replace: true,
            state: { message: 'Your account is approved! Please log in.' },
          });
          return;
        }
        if (!silent && next === 'pending') {
          showToast('Still pending review. We will email you when approved.');
        }
      } catch {
        setPollError(true);
        if (!silent) {
          showToast('Unable to check status. Please refresh or check your email.', 'error');
        }
      } finally {
        if (!silent) setChecking(false);
      }
    },
    [email, navigate]
  );

  useEffect(() => {
    if (!email) return;
    fetchStatus(true);
    const interval = setInterval(() => fetchStatus(true), 30000);
    return () => clearInterval(interval);
  }, [email, fetchStatus]);

  if (!email) return null;

  if (status === 'rejected') {
    return (
      <>
        <PageSEO title="Registration Not Approved" description="Registration status" />
        <div className="min-h-screen bg-[#0c0c1d] flex items-center justify-center p-4 font-['Inter']">
          {toast.visible && (
            <div
              className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-xl text-sm font-bold shadow-lg ${
                toast.type === 'error' ? 'bg-[#93000a] text-[#ffb4ab]' : 'bg-[#28283a] text-[#E3E0F8]'
              }`}
            >
              {toast.message}
            </div>
          )}
          <div className="w-full max-w-md bg-[#1E1E2F] rounded-3xl border border-[#594139]/20 p-8 text-center shadow-2xl">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-500/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-amber-400">info</span>
            </div>
            <h1 className="text-2xl font-bold text-[#E3E0F8] font-['Manrope'] mb-2">Registration Not Approved</h1>
            <p className="text-sm text-[#e1bfb5] mb-6">Hi {name}, we could not approve your account at this time.</p>
            {rejectionReason && (
              <div className="text-left mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <p className="text-xs font-bold text-amber-400 uppercase mb-1">Reason</p>
                <p className="text-sm text-[#E3E0F8]">{rejectionReason}</p>
              </div>
            )}
            <div className="flex flex-col gap-3">
              <Link
                to="/student/register"
                className="w-full py-3 rounded-xl bg-gradient-to-br from-[#FFB59D] to-[#FF6B35] text-[#5d1900] font-bold text-sm"
                onClick={() => {
                  sessionStorage.removeItem(STORAGE_EMAIL);
                  sessionStorage.removeItem(STORAGE_NAME);
                }}
              >
                Register Again
              </Link>
              <Link
                to="/contact"
                className="w-full py-3 rounded-xl border border-[#594139]/40 text-[#e1bfb5] font-bold text-sm hover:bg-[#38374a]/50"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageSEO {...PAGE_SEO.studentRegister} />
      <div className="min-h-screen bg-[#0c0c1d] flex items-center justify-center p-4 font-['Inter']">
        {toast.visible && (
          <div
            className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-xl text-sm font-bold shadow-lg ${
              toast.type === 'error' ? 'bg-[#93000a] text-[#ffb4ab]' : 'bg-[#28283a] text-[#E3E0F8] border border-[#59d5fb]/30'
            }`}
          >
            {toast.message}
          </div>
        )}

        <div className="w-full max-w-md bg-[#1E1E2F] rounded-3xl border border-[#594139]/20 p-8 shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full bg-amber-500/20 animate-pulse" />
              <div className="absolute inset-2 rounded-full bg-[#1E1E2F] flex items-center justify-center border-2 border-amber-500/40">
                <span
                  className="material-symbols-outlined text-4xl text-amber-400"
                  style={{ animation: 'spin 8s linear infinite' }}
                >
                  hourglass_top
                </span>
              </div>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center text-[#E3E0F8] font-['Manrope'] mb-1">
            Registration Submitted! 🎉
          </h1>
          <p className="text-center text-sm text-[#e1bfb5] mb-4">
            Hi <span className="text-[#FFB59D] font-semibold">{name}</span>, we received your registration
          </p>
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse">
              <span className="material-symbols-outlined text-sm">schedule</span>
              Pending Approval
            </span>
          </div>

          <p className="text-sm text-[#e1bfb5] text-center leading-relaxed mb-8">
            Your account is being reviewed by our admin team. This usually takes less than 24 hours. We&apos;ll send an
            email to <strong className="text-[#E3E0F8]">{email}</strong> once your account is approved.
          </p>

          {emailDelayed && (
            <p className="text-xs text-amber-400/90 text-center mb-6 px-2">
              Email confirmation may be delayed. You can still check status below.
            </p>
          )}

          {pollError && (
            <p className="text-xs text-[#ffb4ab] text-center mb-4">
              Unable to check status automatically. Use Check Status or check your email.
            </p>
          )}

          <div className="mb-8 pl-2">
            <p className="text-xs font-bold uppercase tracking-wider text-[#9ca3af] mb-4">What happens next</p>
            <ol className="space-y-4 relative">
              <li className="flex gap-3 items-start">
                <span className="w-7 h-7 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center shrink-0 text-sm font-bold">
                  ✓
                </span>
                <div>
                  <p className="text-sm font-semibold text-green-400">Registration Submitted</p>
                  <p className="text-xs text-[#9ca3af]">Completed</p>
                </div>
              </li>
              <li className="flex gap-3 items-start">
                <span className="w-7 h-7 rounded-full bg-amber-500/25 text-amber-300 flex items-center justify-center shrink-0 animate-pulse">
                  <span className="material-symbols-outlined text-base">manage_search</span>
                </span>
                <div>
                  <p className="text-sm font-semibold text-amber-300">Admin Review</p>
                  <p className="text-xs text-[#9ca3af]">In progress</p>
                </div>
              </li>
              <li className="flex gap-3 items-start opacity-50">
                <span className="w-7 h-7 rounded-full bg-[#38374a] text-[#9ca3af] flex items-center justify-center shrink-0 text-sm">
                  ○
                </span>
                <div>
                  <p className="text-sm font-medium text-[#9ca3af]">Account Activated</p>
                  <p className="text-xs text-[#6b7280]">Pending</p>
                </div>
              </li>
            </ol>
          </div>

          <div className="rounded-xl border border-[#594139]/25 bg-[#121222]/80 p-4 mb-6 flex gap-3">
            <span className="material-symbols-outlined text-[#FFB59D] shrink-0">mail</span>
            <div>
              <p className="text-sm font-semibold text-[#E3E0F8]">Check your inbox</p>
              <p className="text-xs text-[#e1bfb5] mt-1">{email}</p>
              <p className="text-xs text-[#9ca3af] mt-1">Don&apos;t see it? Check your spam folder.</p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <a
              href="/#browse-menu"
              className="w-full py-3 rounded-xl text-center bg-gradient-to-br from-[#FFB59D] to-[#FF6B35] text-[#5d1900] font-bold text-sm hover:opacity-95 transition-opacity"
            >
              Browse Menu Without Login
            </a>
            <Link
              to="/"
              className="w-full py-3 rounded-xl text-center border border-[#594139]/40 text-[#e1bfb5] font-bold text-sm hover:bg-[#38374a]/40 transition-colors"
            >
              Back to Home
            </Link>
          </div>

          <button
            type="button"
            onClick={() => fetchStatus(false)}
            disabled={checking}
            className="mt-6 w-full text-sm font-medium text-[#59d5fb] hover:underline disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {checking ? (
              <>
                <span className="material-symbols-outlined animate-spin text-base">refresh</span>
                Checking...
              </>
            ) : (
              'Check Status'
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
