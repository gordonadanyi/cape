import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import api from "../api/axios";
import {
  connectNotificationSocket,
  disconnectNotificationSocket,
  type ActivityPayload,
  type NotificationPayload,
} from "../services/notificationSocket";

export interface Activity {
  _id: string;
  userId: string;
  type: string;
  title: string;
  description: string;
  invoiceId?: string;
  paymentReference?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface AppNotification {
  _id: string;
  userId: string;
  type: string;
  title: string;
  message?: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationContextValue {
  activities: Activity[];
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  refreshActivities: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;
}

const NotificationContext =
  createContext<NotificationContextValue | null>(null);

export function NotificationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [notifications, setNotifications] = useState<
    AppNotification[]
  >([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Tracks whether the socket has already been connected, so the
  // token-polling effect below doesn't reconnect on every render.
  const hasConnected = useRef(false);

  const refreshActivities = useCallback(async () => {
    try {
      const response = await api.get<Activity[]>("/activities");
      setActivities(response.data || []);
    } catch (err) {
      console.error("Failed to load activities:", err);
    }
  }, []);

  const refreshNotifications = useCallback(async () => {
    try {
      const response =
        await api.get<AppNotification[]>("/notifications");
      setNotifications(response.data || []);
      setUnreadCount(
        (response.data || []).filter((n) => !n.isRead).length,
      );
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }
  }, []);

  const markNotificationAsRead = useCallback(async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);

      setNotifications((current) =>
        current.map((notification) =>
          notification._id === id
            ? { ...notification, isRead: true }
            : notification,
        ),
      );
      setUnreadCount((count) => Math.max(0, count - 1));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await api.patch("/notifications/read-all");

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          isRead: true,
        })),
      );
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark notifications as read:", err);
    }
  }, []);

  const deleteActivity = useCallback(async (id: string) => {
    try {
      await api.delete(`/activities/${id}`);

      setActivities((current) =>
        current.filter((activity) => activity._id !== id),
      );
    } catch (err) {
      console.error("Failed to delete activity:", err);
    }
  }, []);

  // Initial REST load — runs once, regardless of whether the socket
  // is connected yet.
  useEffect(() => {
    setLoading(true);

    Promise.all([refreshActivities(), refreshNotifications()]).finally(
      () => setLoading(false),
    );
  }, [refreshActivities, refreshNotifications]);

  // Own the single app-wide socket connection. Login sets the auth
  // token without a full page reload, so this provider (mounted once,
  // at the app root) polls briefly for the token to appear rather than
  // only checking once on mount.
  useEffect(() => {
    function tryConnect() {
      if (hasConnected.current) return;
      if (!localStorage.getItem("token")) return;

      hasConnected.current = true;

      connectNotificationSocket(
        (notification: NotificationPayload) => {
          setNotifications((current) => [
            notification as AppNotification,
            ...current,
          ]);
          setUnreadCount((count) => count + 1);
        },
        (activity: ActivityPayload) => {
          setActivities((current) => [
            activity as Activity,
            ...current,
          ]);
        },
      );
    }

    tryConnect();
    const interval = setInterval(tryConnect, 1000);

    return () => {
      clearInterval(interval);
      disconnectNotificationSocket();
      hasConnected.current = false;
    };
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        activities,
        notifications,
        unreadCount,
        loading,
        refreshActivities,
        refreshNotifications,
        markNotificationAsRead,
        markAllAsRead,
        deleteActivity,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider",
    );
  }

  return context;
}
