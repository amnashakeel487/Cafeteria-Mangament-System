/** Shared cancellation payload for orders table updates */

function refundStatusForPayment(paymentMethod) {
  return paymentMethod === 'online' ? 'pending' : 'not_applicable';
}

function buildCancellationUpdate({ cancelledBy, cancellationReason, paymentMethod }) {
  return {
    status: 'cancelled',
    cancelled_by: cancelledBy,
    cancelled_at: new Date().toISOString(),
    cancellation_reason: cancellationReason || null,
    refund_status: refundStatusForPayment(paymentMethod),
    refund_note: null,
  };
}

/** Student: pending or confirmed only (processing = preparation started) */
const STUDENT_CANCELLABLE = ['pending', 'confirmed'];

function assertStudentCanCancel(order) {
  if (order.status === 'cancelled') {
    return { ok: false, status: 400, message: 'This order has already been cancelled' };
  }
  if (STUDENT_CANCELLABLE.includes(order.status)) {
    return { ok: true };
  }
  if (order.status === 'processing') {
    return {
      ok: false,
      status: 400,
      message: 'Order cannot be cancelled after preparation has started',
    };
  }
  return { ok: false, status: 400, message: 'This order can no longer be cancelled' };
}

function assertCafeteriaCanCancel(order) {
  if (order.status === 'cancelled') {
    return { ok: false, status: 400, message: 'This order has already been cancelled' };
  }
  if (order.status === 'completed') {
    return { ok: false, status: 400, message: 'Completed orders cannot be cancelled' };
  }
  return { ok: true };
}

module.exports = {
  buildCancellationUpdate,
  refundStatusForPayment,
  assertStudentCanCancel,
  assertCafeteriaCanCancel,
};
