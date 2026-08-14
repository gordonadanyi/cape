import {
  Bell,
  Check,
  Trash2,
  FileText,
  CreditCard,
  Settings,
  Send,
  Eye,
  Clock,
} from "lucide-react";

import AppShell from "../components/AppShell";
import { useNotifications } from "../context/NotificationContext";
import { useState } from "react";

function getActivityIcon(type: string) {
  switch (type) {
    case "invoice_created":
    case "invoice_uploaded":
      return <FileText className="h-4 w-4" />;

    case "invoice_deleted":
      return <Trash2 className="h-4 w-4" />;

    case "invoice_sent":
      return <Send className="h-4 w-4" />;

    case "invoice_viewed":
      return <Eye className="h-4 w-4" />;

    case "payment_initialized":
    case "payment_verified":
      return <CreditCard className="h-4 w-4" />;

    case "settings_updated":
      return <Settings className="h-4 w-4" />;

    case "invoice_scheduled":
      return <Clock className="h-4 w-4" />;

    default:
      return <Bell className="h-4 w-4" />;
  }
}

function formatTime(dateString: string) {
  const date = new Date(dateString);

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function Notifications() {
  const {
    activities,
    notifications,
    loading,
    markNotificationAsRead,
    markAllAsRead,
    deleteActivity,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState<
    "activity" | "notifications"
  >("activity");

  return (
    <AppShell>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-xl font-medium text-[#0F1B3D]">
              Notifications
            </h1>

            <p className="mt-1 text-[13px] text-[#6B7280]">
              Stay up to date with your invoices, payments and account activity.
            </p>
          </div>

          {activeTab === "notifications" &&
            notifications.some((notification) => !notification.isRead) && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="flex items-center gap-2 rounded-lg border border-[#EFEAE0] bg-white px-3 py-2 text-[12px] font-medium text-[#5B6584] transition hover:border-[#1E56CD] hover:text-[#1E56CD]"
              >
                <Check className="h-4 w-4" />
                Mark all as read
              </button>
            )}
        </div>

        {/* Tabs */}
        <div className="mb-5 flex gap-1 rounded-xl border border-[#EFEAE0] bg-white p-1 w-fit">
          <button
            type="button"
            onClick={() => setActiveTab("activity")}
            className={`rounded-lg px-4 py-2 text-[13px] font-medium transition ${
              activeTab === "activity"
                ? "bg-[#E7EEFB] text-[#1E56CD]"
                : "text-[#6B7280] hover:text-[#1E56CD]"
            }`}
          >
            Activity
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("notifications")}
            className={`rounded-lg px-4 py-2 text-[13px] font-medium transition ${
              activeTab === "notifications"
                ? "bg-[#E7EEFB] text-[#1E56CD]"
                : "text-[#6B7280] hover:text-[#1E56CD]"
            }`}
          >
            Notifications
          </button>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="rounded-xl border border-[#EFEAE0] bg-white p-8 text-center">
            <p className="text-[13px] text-[#8A93AC]">
              Loading...
            </p>
          </div>
        ) : activeTab === "activity" ? (
          <>
            {activities.length === 0 ? (
              <div className="rounded-xl border border-[#EFEAE0] bg-white px-6 py-14 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#E7EEFB] text-[#1E56CD]">
                  <Clock className="h-5 w-5" />
                </div>

                <h2 className="text-sm font-medium text-[#0F1B3D]">
                  No activity yet
                </h2>

                <p className="mx-auto mt-1 max-w-sm text-[12px] text-[#8A93AC]">
                  Your invoice and payment activity will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-[#EFEAE0] bg-white">
                {activities.map((activity, index) => (
                  <div
                    key={activity._id}
                    className={`flex items-start gap-4 px-5 py-4 ${
                      index !== activities.length - 1
                        ? "border-b border-[#EFEAE0]"
                        : ""
                    }`}
                  >
                    {/* Icon */}
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E7EEFB] text-[#1E56CD]">
                      {getActivityIcon(activity.type)}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-[13px] font-medium text-[#0F1B3D]">
                            {activity.title}
                          </p>

                          <p className="mt-1 text-[12px] leading-5 text-[#6B7280]">
                            {activity.description}
                          </p>
                        </div>

                        <button
                          type="button"
                          title="Delete activity"
                          onClick={() =>
                            deleteActivity(activity._id)
                          }
                          className="shrink-0 text-[#B4B9C7] transition hover:text-[#C4432E]"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <p className="mt-2 text-[11px] text-[#A0A6B5]">
                        {formatTime(activity.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {notifications.length === 0 ? (
              <div className="rounded-xl border border-[#EFEAE0] bg-white px-6 py-14 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#E7EEFB] text-[#1E56CD]">
                  <Bell className="h-5 w-5" />
                </div>

                <h2 className="text-sm font-medium text-[#0F1B3D]">
                  No notifications
                </h2>

                <p className="mx-auto mt-1 max-w-sm text-[12px] text-[#8A93AC]">
                  You're all caught up.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-[#EFEAE0] bg-white">
                {notifications.map((notification, index) => (
                  <button
                    key={notification._id}
                    type="button"
                    onClick={() => {
                      if (!notification.isRead) {
                        markNotificationAsRead(notification._id);
                      }
                    }}
                    className={`flex w-full items-start gap-4 px-5 py-4 text-left transition hover:bg-[#FBF7EF] ${
                      index !== notifications.length - 1
                        ? "border-b border-[#EFEAE0]"
                        : ""
                    }`}
                  >
                    <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E7EEFB] text-[#1E56CD]">
                      <Bell className="h-4 w-4" />

                      {!notification.isRead && (
                        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-[#1E56CD]" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-[13px] ${
                          notification.isRead
                            ? "font-medium text-[#5B6584]"
                            : "font-semibold text-[#0F1B3D]"
                        }`}
                      >
                        {notification.title}
                      </p>

                      <p className="mt-1 text-[12px] leading-5 text-[#6B7280]">
                        {notification.message || ""}
                      </p>

                      <p className="mt-2 text-[11px] text-[#A0A6B5]">
                        {formatTime(notification.createdAt)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}

export default Notifications;
