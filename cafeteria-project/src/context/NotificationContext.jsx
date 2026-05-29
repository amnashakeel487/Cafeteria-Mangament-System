import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import axios from 'axios';
import { supabase } from '../supabaseClient';
import {
  getNotificationIcon,
  NOTIFICATION_API,
  playNotificationSound,
} from '../utils/notificationHelpers';

const NotificationContext = createContext(null);

const BASE = '';

function NotificationToast({ toast, onDismiss }) {
  if (!toast) return null;
  return (
    <div
      className={`fixed top-20 right-4 z-[100] max-w-sm w-full pointer-events-auto transition-all duration-300 ${
        toast.visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
      }`}
      role="alert"
    >
      <div className="flex gap-3 p-4 rounded-xl bg-[#1E1E2F] border border-[#594139]/30 shadow-2xl">
        <span className="text-2xl flex-shrink-0">{getNotificationIcon(toast.type)}</span>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-[#E3E0F8] text-sm">{toast.title}</p>
          <p className="text-xs text-[#E1BFB5]/80 mt-0.5 line-clamp-2">{toast.message}</p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="text-[#E1BFB5]/50 hover:text-[#E3E0F8] self-start"
          aria-label="Dismiss"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>
      </div>
    </div>
  );
}

export function NotificationProvider({ role, recipientId, children }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const config = NOTIFICATION_API[role];

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.is_read).length,
    [notifications]
  );

  const showToast = useCallback((notification) => {
    setToast({ ...notification, visible: true });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => {
      setToast((t) => (t ? { ...t, visible: false } : null));
      setTimeout(() => setToast(null), 300);
    }, 5000);
  }, []);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem(config?.tokenKey);
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [config]);

  const fetchNotifications = useCallback(async () => {
    if (!config || !recipientId) {
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get(`${BASE}${config.path}`, { headers: getAuthHeaders() });
      setNotifications(res.data || []);
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setLoading(false);
    }
  }, [config, recipientId, getAuthHeaders]);

  const handleIncoming = useCallback(
    (row) => {
      if (
        row.recipient_type !== role ||
        String(row.recipient_id) !== String(recipientId)
      ) {
        return;
      }
      setNotifications((prev) => {
        if (prev.some((n) => n.id === row.id)) return prev;
        return [row, ...prev];
      });
      showToast(row);
      if (role === 'cafeteria' && row.type === 'new_order') {
        playNotificationSound();
      }
    },
    [role, recipientId, showToast]
  );

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (!recipientId) return undefined;

    const channel = supabase
      .channel(`notifications-${role}-${recipientId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => handleIncoming(payload.new)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [role, recipientId, handleIncoming]);

  const markAsRead = useCallback(
    async (id) => {
      try {
        await axios.patch(`${BASE}${config.path}/${id}/read`, null, {
          headers: getAuthHeaders(),
        });
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        );
      } catch (err) {
        console.error('markAsRead failed', err);
      }
    },
    [config, getAuthHeaders]
  );

  const markAllAsRead = useCallback(async () => {
    try {
      await axios.patch(`${BASE}${config.path}/read-all`, null, {
        headers: getAuthHeaders(),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('markAllAsRead failed', err);
    }
  }, [config, getAuthHeaders]);

  const deleteNotification = useCallback(
    async (id) => {
      try {
        await axios.delete(`${BASE}${config.path}/${id}`, { headers: getAuthHeaders() });
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      } catch (err) {
        console.error('deleteNotification failed', err);
      }
    },
    [config, getAuthHeaders]
  );

  const value = useMemo(
    () => ({
      role,
      notifications,
      loading,
      unreadCount,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      refresh: fetchNotifications,
    }),
    [
      role,
      notifications,
      loading,
      unreadCount,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      fetchNotifications,
    ]
  );

  if (!recipientId) {
    return children;
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationToast
        toast={toast}
        onDismiss={() => {
          setToast((t) => (t ? { ...t, visible: false } : null));
          setTimeout(() => setToast(null), 300);
        }}
      />
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    return {
      role: null,
      notifications: [],
      loading: false,
      unreadCount: 0,
      markAsRead: async () => {},
      markAllAsRead: async () => {},
      deleteNotification: async () => {},
      refresh: async () => {},
    };
  }
  return ctx;
}
