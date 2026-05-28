import { useState, useEffect } from 'react';

const MIN_REASON = 10;

/** Cafeteria cancel modal — cancellation reason required */
export default function CafeteriaCancelModal({ isOpen, onClose, onConfirm, loading, orderId }) {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (!isOpen) setReason('');
  }, [isOpen]);

  if (!isOpen) return null;

  const trimmed = reason.trim();
  const valid = trimmed.length >= MIN_REASON;

  const handleSubmit = () => {
    if (!valid || loading) return;
    onConfirm(trimmed);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-container-lowest/80 backdrop-blur-sm">
      <div
        className="bg-[rgba(56,55,74,0.95)] backdrop-blur-2xl w-full max-w-lg rounded-3xl p-8 border border-white/10 shadow-[0_48px_96px_rgba(0,0,0,0.6)]"
        role="dialog"
        aria-modal="true"
      >
        <h2 className="text-2xl font-bold text-on-surface mb-2" style={{ fontFamily: 'Manrope' }}>
          Cancel Order #{orderId}?
        </h2>
        <p className="text-sm text-on-surface-variant mb-4">
          Provide a reason for the student. This is required and will be visible on their order.
        </p>
        <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
          Cancellation reason
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
          placeholder="Enter reason for cancellation (e.g. item unavailable, technical issue)"
          className="w-full bg-surface-container-lowest border-none rounded-xl px-4 py-3 text-sm text-on-surface focus:ring-2 focus:ring-primary/40 resize-none outline-none placeholder:text-on-surface-variant/40"
        />
        <p className={`text-xs mt-1 mb-6 ${valid ? 'text-[#28A745]' : 'text-on-surface-variant'}`}>
          {trimmed.length} / {MIN_REASON} characters minimum
        </p>
        <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2.5 rounded-xl font-bold text-on-surface-variant hover:text-on-surface transition-colors"
          >
            Keep Order
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!valid || loading}
            className="px-6 py-2.5 rounded-xl font-bold bg-error/90 text-white hover:bg-error transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <span className="material-symbols-outlined animate-spin text-lg">refresh</span> : null}
            Confirm Cancellation
          </button>
        </div>
      </div>
    </div>
  );
}
