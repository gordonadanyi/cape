import { useEffect, useState } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  CreditCard,
  Clock,
  AlertTriangle,
  Calendar,
  Mail,
  XCircle,
} from "lucide-react";

import AppShell from "../components/AppShell";
import api from "../api/axios";
import {
  connectNotificationSocket,
} from "../services/notificationSocket";

interface NotificationItem {
  _id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  invoiceId?: string;
  paymentReference?: string;
  metadata?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
  updatedAt?: string;
}

function Notifications() {
  const [notifications, setNotifications] = useState<
    NotificationItem[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // =========================================================
  // LOAD NOTIFICATIONS
  // =========================================================

  async function fetchNotifications() {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get<NotificationItem[]>(
        "/notifications",
      );

      setNotifications(response.data || []);
    } catch (err) {
      console.error("Failed to load notifications:", err);

      setError(
        "Failed to load notifications. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchNotifications();
  }, []);

  // =========================================================
  // REAL-TIME NOTIFICATIONS
  // =========================================================

  useEffect(() => {
    const socket = connectNotificationSocket();

    if (!socket) {
      return;
    }

    const handleNotification = (
      notification: NotificationItem,
    ) => {
      console.log(
        "New notification received:",
        notification,
      );

      setNotifications((previous) => {
        // Prevent duplicates
        const alreadyExists = previous.some(
          (item) => item._id === notification._id,
        );

        if (alreadyExists) {
          return previous;
        }

        return [
          {
            ...notification,
            isRead: false,
          },
          ...previous,
        ];
      });
    };

    socket.on(
      "notification",
      handleNotification,
    );

    return () => {
      socket.off(
        "notification",
        handleNotification,
      );
    };
  }, []);

  // =========================================================
  // MARK ONE AS READ
  // =========================================================

  async function markAsRead(id: string) {
    try {
      await api.patch(
        `/notifications/${id}/read`,
      );

      setNotifications((previous) =>
        previous.map((notification) =>
          notification._id === id
            ? {
                ...notification,
                isRead: true,
              }
            : notification,
        ),
      );
    } catch (err) {
      console.error(
        "Failed to mark notification as read:",
        err,
      );
    }
  }

  // =========================================================
  // MARK ALL AS READ
  // =========================================================

  async function markAllAsRead() {
    try {
      await api.patch(
        "/notifications/read-all",
      );

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          isRead: true,
        })),
      );
    } catch (err) {
      console.error(
        "Failed to mark all notifications as read:",
        err,
      );
    }
  }

  // =========================================================
  // DELETE NOTIFICATION
  // =========================================================

  async function deleteNotification(
    id: string,
  ) {
    try {
      await api.delete(
        `/notifications/${id}`,
      );

      setNotifications((previous) =>
        previous.filter(
          (notification) =>
            notification._id !== id,
        ),
      );
    } catch (err) {
      console.error(
        "Failed to delete notification:",
        err,
      );
    }
  }

  // =========================================================
  // HELPERS
  // =========================================================

  function getNotificationIcon(type: string) {
    const normalizedType =
      type?.toLowerCase();

    if (
      normalizedType.includes("paid") ||
      normalizedType.includes("payment")
    ) {
      return (
        <CreditCard className="h-4 w-4" />
      );
    }

    if (
      normalizedType.includes("overdue")
    ) {
      return (
        <AlertTriangle className="h-4 w-4" />
      );
    }

    if (
      normalizedType.includes("due")
    ) {
      return (
        <Clock className="h-4 w-4" />
      );
    }

    if (
      normalizedType.includes("schedule")
    ) {
      return (
        <Calendar className="h-4 w-4" />
      );
    }

    if (
      normalizedType.includes("reminder")
    ) {
      return (
        <Mail className="h-4 w-4" />
      );
    }

    if (
      normalizedType.includes("failed")
    ) {
      return (
        <XCircle className="h-4 w-4" />
      );
    }

    return (
      <Bell className="h-4 w-4" />
    );
  }

  function formatDate(date: string) {
    const notificationDate =
      new Date(date);

    const now = new Date();

    const difference =
      now.getTime() -
      notificationDate.getTime();

    const minutes = Math.floor(
      difference / 60000,
    );

    if (minutes < 1) {
      return "Just now";
    }

    if (minutes < 60) {
      return `${minutes}m ago`;
    }

    const hours = Math.floor(
      minutes / 60,
    );

    if (hours < 24) {
      return `${hours}h ago`;
    }

    const days = Math.floor(
      hours / 24,
    );

    if (days < 7) {
      return `${days}d ago`;
    }

    return notificationDate.toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      },
    );
  }

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.isRead,
    ).length;

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <AppShell>
      <div className="min-h-screen bg-[#FEF9EE] p-4 sm:p-6">

        {/* ===================================================
            HEADER
        =================================================== */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h1 className="text-xl font-medium text-[#0F1B3D]">
              Notifications
            </h1>

            <p className="mt-1 text-[13px] text-[#6B7280]">
              Important updates about your invoices and payments.
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="flex items-center justify-center gap-2 self-start rounded-xl border border-[#EFEAE0] bg-white px-3.5 py-2 text-[12px] font-medium text-[#1E56CD] transition hover:bg-[#F7F9FD]"
            >
              <CheckCheck className="h-4 w-4" />

              Mark all as read
            </button>
          )}
        </div>

        {/* ===================================================
            ERROR
        =================================================== */}

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* ===================================================
            CONTENT
        =================================================== */}

        <div className="rounded-2xl border border-[#EFEAE0] bg-white">

          {/* TOP BAR */}

          <div className="flex items-center justify-between border-b border-[#EFEAE0] px-4 py-3.5 sm:px-5">

            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-[#1E56CD]" />

              <span className="text-[13px] font-medium text-[#0F1B3D]">
                All notifications
              </span>

              {unreadCount > 0 && (
                <span className="rounded-full bg-[#E7EEFB] px-2 py-0.5 text-[10px] font-medium text-[#1E56CD]">
                  {unreadCount} unread
                </span>
              )}
            </div>
          </div>

          {/* LOADING */}

          {loading && (
            <div className="px-5 py-12 text-center text-sm text-[#8A93AC]">
              Loading notifications...
            </div>
          )}

          {/* EMPTY */}

          {!loading &&
            notifications.length === 0 && (
              <div className="flex flex-col items-center justify-center px-5 py-16 text-center">

                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#F3F6FC]">
                  <Bell className="h-5 w-5 text-[#8A93AC]" />
                </div>

                <h2 className="text-sm font-medium text-[#0F1B3D]">
                  No notifications yet
                </h2>

                <p className="mt-1 max-w-sm text-[12px] text-[#8A93AC]">
                  Important invoice, payment and reminder updates will appear here.
                </p>
              </div>
            )}

          {/* NOTIFICATION LIST */}

          {!loading &&
            notifications.length > 0 && (
              <div className="divide-y divide-[#EFEAE0]">

                {notifications.map(
                  (notification) => (
                    <div
                      key={
                        notification._id
                      }
                      className={`group flex gap-3 px-4 py-4 transition sm:px-5 ${
                        notification.isRead
                          ? "bg-white"
                          : "bg-[#F8FAFF]"
                      }`}
                    >

                      {/* ICON */}

                      <div
                        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                          notification.isRead
                            ? "bg-[#F4F1E9] text-[#8A93AC]"
                            : "bg-[#E7EEFB] text-[#1E56CD]"
                        }`}
                      >
                        {getNotificationIcon(
                          notification.type,
                        )}
                      </div>

                      {/* CONTENT */}

                      <div className="min-w-0 flex-1">

                        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">

                          <div className="min-w-0">

                            <div className="flex items-center gap-2">

                              <h3
                                className={`text-[13px] ${
                                  notification.isRead
                                    ? "font-medium text-[#4B5563]"
                                    : "font-semibold text-[#0F1B3D]"
                                }`}
                              >
                                {
                                  notification.title
                                }
                              </h3>

                              {!notification.isRead && (
                                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#1E56CD]" />
                              )}
                            </div>

                            <p className="mt-1 text-[12px] leading-5 text-[#6B7280]">
                              {
                                notification.message
                              }
                            </p>

                          </div>

                          <span className="shrink-0 text-[10px] text-[#9AA1B3]">
                            {formatDate(
                              notification.createdAt,
                            )}
                          </span>

                        </div>

                        {/* ACTIONS */}

                        <div className="mt-2.5 flex items-center gap-3">

                          {!notification.isRead && (
                            <button
                              type="button"
                              onClick={() =>
                                markAsRead(
                                  notification._id,
                                )
                              }
                              className="flex items-center gap-1 text-[11px] font-medium text-[#1E56CD] hover:underline"
                            >
                              <Check className="h-3.5 w-3.5" />

                              Mark as read
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              deleteNotification(
                                notification._id,
                              )
                            }
                            className="flex items-center gap-1 text-[11px] text-[#9AA1B3] opacity-100 transition hover:text-[#C4432E] sm:opacity-0 sm:group-hover:opacity-100"
                          >
                            <Trash2 className="h-3.5 w-3.5" />

                            Delete
                          </button>

                        </div>

                      </div>
                    </div>
                  ),
                )}

              </div>
            )}
        </div>
      </div>
    </AppShell>
  );
}

export default Notifications;