/** Frontend helpers for order cancellation UI */

export function canStudentCancelOrder(order) {
  if (!order) return false;
  if (order.status === 'cancelled' || order.status === 'completed') return false;
  if (order.status === 'processing') return false;
  return order.status === 'pending' || order.status === 'confirmed';
}

export function canCafeteriaCancelOrder(order) {
  if (!order) return false;
  return order.status !== 'completed' && order.status !== 'cancelled';
}

export function cancelledByLabel(cancelledBy) {
  if (cancelledBy === 'student') return 'Cancelled by you';
  if (cancelledBy === 'cafeteria') return 'Cancelled by cafeteria';
  return 'Order cancelled';
}
