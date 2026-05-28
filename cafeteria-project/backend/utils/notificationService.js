const supabase = require('../database');

/**
 * Insert a notification row (never throws — failures are logged only).
 */
const createNotification = async ({
  recipientType,
  recipientId,
  type,
  title,
  message,
  data = {},
}) => {
  try {
    const { error } = await supabase.from('notifications').insert({
      recipient_type: recipientType,
      recipient_id: String(recipientId),
      type,
      title,
      message,
      data,
    });
    if (error) console.error('Notification insert error:', error);
  } catch (err) {
    console.error('Failed to create notification:', err);
  }
};

/** Map order status values used in this project → student-facing copy */
const STATUS_COPY = {
  pending: {
    title: 'Order Received 📋',
    message: (cafe) => `Your order at ${cafe} has been received and is pending confirmation.`,
  },
  processing: {
    title: 'Order Being Prepared 👨‍🍳',
    message: () => 'Your order is now being prepared.',
  },
  completed: {
    title: 'Order Completed ✅',
    message: () => 'Your order has been completed. Enjoy!',
  },
  cancelled: {
    title: 'Order Cancelled ❌',
    message: (cafe, reason) =>
      reason
        ? `Your order was cancelled. Reason: ${reason}`
        : `Your order at ${cafe} was cancelled.`,
  },
};

function getStatusNotification(status, cafeteriaName, cancellationReason) {
  const cafe = cafeteriaName || 'the cafeteria';
  const copy = STATUS_COPY[status] || {
    title: 'Order Update',
    message: () => `Your order status is now: ${status}`,
  };
  const message =
    status === 'cancelled'
      ? copy.message(cafe, cancellationReason)
      : typeof copy.message === 'function'
        ? copy.message(cafe)
        : copy.message;
  return { title: copy.title, message };
}

module.exports = { createNotification, getStatusNotification };
