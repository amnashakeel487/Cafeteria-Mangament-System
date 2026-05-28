import { useMemo, useState } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import NotificationItem from './NotificationItem';
import NotificationSkeleton from './NotificationSkeleton';

const TABS = ['all', 'unread', 'read'];

export default function NotificationsPageView({ title = 'Notifications' }) {
  const { notifications, loading, unreadCount, markAllAsRead } = useNotifications();
  const [tab, setTab] = useState('all');

  const filtered = useMemo(() => {
    if (tab === 'unread') return notifications.filter((n) => !n.is_read);
    if (tab === 'read') return notifications.filter((n) => n.is_read);
    return notifications;
  }, [notifications, tab]);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#E3E0F8] font-['Manrope']">{title}</h1>
          <p className="text-sm text-[#E1BFB5]/70 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread` : 'You are all caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={() => markAllAsRead()}
            className="text-sm font-medium text-[#FFB59D] hover:text-[#FF6B35] px-4 py-2 rounded-lg border border-[#FF6B35]/30"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="flex gap-2 mb-6">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              tab === t
                ? 'bg-[#FF6B35]/15 text-[#FFB59D]'
                : 'text-[#E1BFB5]/70 hover:bg-[#38374A]/30'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {loading && <NotificationSkeleton rows={5} />}
        {!loading && filtered.length === 0 && (
          <div className="py-16 text-center rounded-xl bg-[#1A1A2B]/50 border border-[#594139]/10">
            <span className="material-symbols-outlined text-5xl text-[#E1BFB5]/30 mb-3">notifications_off</span>
            <p className="text-[#E1BFB5]/60">
              {tab === 'all' ? 'No notifications yet' : `No ${tab} notifications`}
            </p>
          </div>
        )}
        {!loading &&
          filtered.map((n) => (
            <NotificationItem key={n.id} notification={n} />
          ))}
      </div>
    </div>
  );
}
