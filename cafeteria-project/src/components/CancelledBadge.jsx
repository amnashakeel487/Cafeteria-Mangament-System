import { cancelledByLabel } from '../utils/orderCancellation';
import RefundStatusBadge from './RefundStatusBadge';

/** Cancelled order summary: who cancelled, reason, refund state */
export default function CancelledBadge({ order, className = '' }) {
  if (!order || order.status !== 'cancelled') return null;

  return (
    <div className={`space-y-2 ${className}`}>
      <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-error/10 text-error border border-error/30">
        Order Cancelled
      </span>
      <p className="text-sm font-semibold text-on-surface-variant">{cancelledByLabel(order.cancelled_by)}</p>
      {order.cancellation_reason && (
        <p className="text-sm text-on-surface-variant/90">
          <span className="font-bold text-on-surface-variant">Reason:</span> {order.cancellation_reason}
        </p>
      )}
      {order.payment_method === 'online' && <RefundStatusBadge refundStatus={order.refund_status} />}
      {order.refund_status === 'rejected' && order.refund_note && (
        <p className="text-xs text-error/90 border border-error/20 rounded-lg p-2 bg-error/5">{order.refund_note}</p>
      )}
    </div>
  );
}
