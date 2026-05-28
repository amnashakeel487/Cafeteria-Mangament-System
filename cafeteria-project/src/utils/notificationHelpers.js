/** Icons and routing for notification UI */

export function getNotificationIcon(type) {
  switch (type) {
    case 'new_order':
      return '🛒';
    case 'order_status':
      return '📦';
    case 'order_cancelled':
      return '❌';
    case 'new_registration':
      return '👤';
    case 'refund_update':
      return '💰';
    default:
      return '🔔';
  }
}

export function getNotificationAccent(type) {
  switch (type) {
    case 'new_order':
      return 'border-l-emerald-500';
    case 'order_status':
      return 'border-l-sky-500';
    case 'order_cancelled':
      return 'border-l-red-500';
    case 'new_registration':
      return 'border-l-amber-500';
    case 'refund_update':
      return 'border-l-purple-500';
    default:
      return 'border-l-[#FF6B35]';
  }
}

export function getNotificationRoute(type, role) {
  if (role === 'student') {
    if (type === 'order_status') return '/student/track';
    if (type === 'refund_update') return '/student/orders';
    return '/student/notifications';
  }
  if (role === 'cafeteria') {
    if (type === 'new_order' || type === 'order_cancelled') return '/cafeteria/orders';
    return '/cafeteria/notifications';
  }
  if (role === 'admin') {
    if (type === 'new_registration') return '/admin/students';
    return '/admin/dashboard';
  }
  return '/';
}

export function getTimeAgo(dateInput) {
  const date = new Date(dateInput);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString();
}

export function playNotificationSound() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
    oscillator.frequency.setValueAtTime(600, audioCtx.currentTime + 0.1);
    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.3);
  } catch {
    /* audio unavailable */
  }
}

export const NOTIFICATION_API = {
  student: { path: '/api/student/notifications', tokenKey: 'studentToken' },
  cafeteria: { path: '/api/cafeteria/notifications', tokenKey: 'cafeteriaToken' },
  admin: { path: '/api/admin/notifications', tokenKey: 'adminToken' },
};
