import { Link } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import NotificationItem from './NotificationItem';
import NotificationSkeleton from './NotificationSkeleton';

const viewAllPath = {
  student: '/student/notifications',
  cafeteria: '/cafeteria/notifications',
  admin: null,
};

export default function NotificationDropdown({ onClose }) {
  const { role, notifications, loading, unreadCount, markAllAsRead } = useNotifications();
  const allPath = viewAllPath[role];

  return (
    <div
      className="fixed left-3 right-3 top-[3.25rem] z-[60] max-h-[min(70vh,calc(100vh-5rem))] flex flex-col rounded-xl bg-[#1E1E2F]/98 border border-[#594139]/20 shadow-2xl backdrop-blur-xl overflow-hidden sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[min(380px,calc(100vw-1.5rem))] sm:max-h-[min(480px,calc(100vh-6rem))]"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#594139]/15 flex-shrink-0">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-[#E3E0F8]">Notifications</h3>
          {unreadCount > 0 && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#FF6B35] text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={() => markAllAsRead()}
            className="text-[10px] sm:text-xs text-[#FFB59D] hover:text-[#FF6B35] font-medium whitespace-nowrap shrink-0"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="overflow-y-auto flex-1 min-h-0 p-2">
        {loading && <NotificationSkeleton />}
        {!loading && notifications.length === 0 && (
          <div className="py-12 text-center text-[#E1BFB5]/60">
            <span className="material-symbols-outlined text-4xl mb-2 opacity-40">notifications_off</span>
            <p className="text-sm">No notifications yet</p>
          </div>
        )}
        {!loading &&
          notifications.slice(0, 20).map((n) => (
            <NotificationItem key={n.id} notification={n} compact onNavigate={onClose} />
          ))}
      </div>

      {allPath && (
        <div className="border-t border-[#594139]/15 p-3 flex-shrink-0">
          <Link
            to={allPath}
            onClick={onClose}
            className="block text-center text-xs text-[#FFB59D] hover:text-[#FF6B35] font-medium"
          >
            View all notifications →
          </Link>
        </div>
      )}
    </div>
  );
}
