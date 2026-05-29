import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import {
  getNotificationAccent,
  getNotificationIcon,
  getNotificationRoute,
  getTimeAgo,
} from '../../utils/notificationHelpers';

export default function NotificationItem({ notification, compact = false, onNavigate }) {
  const { role, markAsRead, deleteNotification } = useNotifications();
  const navigate = useNavigate();
  const unread = !notification.is_read;

  const handleClick = async () => {
    if (unread) await markAsRead(notification.id);
    const path = getNotificationRoute(notification.type, role);
    if (onNavigate) onNavigate();
    navigate(path);
  };

  return (
    <div
      className={`group relative flex gap-3 p-3 rounded-lg border-l-4 cursor-pointer transition-colors ${
        getNotificationAccent(notification.type)
      } ${
        compact
          ? unread
            ? 'bg-[#28283a] hover:bg-[#333345]'
            : 'bg-[#1A1A2B] hover:bg-[#28283a]'
          : unread
            ? 'bg-[#38374A]/25'
            : 'bg-[#1A1A2B]/50 opacity-80'
      } ${!compact ? 'hover:bg-[#38374A]/40' : ''}`}
      onClick={handleClick}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      role="button"
      tabIndex={0}
    >
      {unread && (
        <span className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#FF6B35]" />
      )}
      <span className={`text-xl flex-shrink-0 ${compact ? 'text-lg' : ''}`}>
        {getNotificationIcon(notification.type)}
      </span>
      <div className="min-w-0 flex-1 pl-1">
        <p className={`text-sm ${unread ? 'font-bold text-[#E3E0F8]' : 'font-medium text-[#E3E0F8]/90'}`}>
          {notification.title}
        </p>
        <p className="text-xs text-[#E1BFB5]/70 mt-0.5 line-clamp-2">{notification.message}</p>
        <p className="text-[10px] text-[#E1BFB5]/50 mt-1">{getTimeAgo(notification.created_at)}</p>
      </div>
      <button
        type="button"
        className="opacity-0 group-hover:opacity-100 p-1 text-[#E1BFB5]/50 hover:text-red-400 transition-opacity self-start"
        onClick={(e) => {
          e.stopPropagation();
          deleteNotification(notification.id);
        }}
        aria-label="Delete notification"
      >
        <span className="material-symbols-outlined text-base">close</span>
      </button>
    </div>
  );
}
