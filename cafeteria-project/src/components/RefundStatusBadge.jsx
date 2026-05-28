/** Refund status pill — matches existing badge styles in student/cafeteria portals */

const REFUND_STYLES = {
  pending: 'bg-[#FFC107]/20 text-[#FFC107] border border-[#FFC107]/30',
  approved: 'bg-[#28A745]/20 text-[#28A745] border border-[#28A745]/30',
  rejected: 'bg-error/10 text-error border border-error/30',
  not_applicable: 'bg-surface-container-highest text-on-surface-variant border border-outline-variant/20',
};

const REFUND_LABELS = {
  pending: 'Refund Pending',
  approved: 'Refund Approved',
  rejected: 'Refund Rejected',
  not_applicable: 'No Refund',
};

export default function RefundStatusBadge({ refundStatus, className = '' }) {
  if (!refundStatus || refundStatus === 'not_applicable') return null;

  return (
    <span
      className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${REFUND_STYLES[refundStatus] || REFUND_STYLES.pending} ${className}`}
    >
      {REFUND_LABELS[refundStatus] || refundStatus}
    </span>
  );
}
