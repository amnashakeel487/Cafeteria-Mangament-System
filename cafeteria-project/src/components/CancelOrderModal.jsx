/** Student confirmation modal before cancelling an order */

export default function CancelOrderModal({ isOpen, onClose, onConfirm, loading, isOnlinePayment }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0c0c1d]/80 backdrop-blur-sm">
      <div
        className="bg-[#1E1E2F] w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl p-5 sm:p-8 border border-[#594139]/20 shadow-2xl mx-2"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cancel-order-title"
      >
        <h2 id="cancel-order-title" className="text-xl font-bold text-[#E3E0F8] mb-3 font-['Manrope']">
          Cancel this order?
        </h2>
        <p className="text-sm text-[#e1bfb5] mb-4 leading-relaxed">
          Are you sure you want to cancel? This cannot be undone.
        </p>
        {isOnlinePayment && (
          <p className="text-sm text-[#FFC107] bg-[#FFC107]/10 border border-[#FFC107]/30 rounded-lg p-3 mb-5">
            Since you paid online, your refund request will be submitted for review.
          </p>
        )}
        <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2.5 rounded-lg font-bold text-sm border border-[#594139]/40 text-[#e1bfb5] hover:bg-[#28283a] transition-colors disabled:opacity-60"
          >
            Keep Order
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-5 py-2.5 rounded-lg font-bold text-sm bg-error text-white hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <span className="material-symbols-outlined animate-spin text-lg">refresh</span>
            ) : null}
            Yes, Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
