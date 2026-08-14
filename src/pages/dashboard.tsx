import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import api from "../api/axios";
import { getErrorMessage } from "../utils/getErrorMessage";
import AppShell from "../components/AppShell";

import type { Invoice } from "./viewInvoices";

import {
  connectNotificationSocket,
  disconnectNotificationSocket,
} from "../services/notificationSocket";

const MONTH_LABELS = [
  "J",
  "F",
  "M",
  "A",
  "M",
  "J",
  "J",
  "A",
  "S",
  "O",
  "N",
  "D",
];

type NotificationPayload = {
  _id?: string;
  id?: string;
  type?: string;
  title?: string;
  message?: string;
  invoiceId?: string;
  isRead?: boolean;
  createdAt?: string;
};

function Dashboard() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // =========================================================
  // NOTIFICATIONS
  // =========================================================

  const [unreadCount, setUnreadCount] = useState(0);

  const navigate = useNavigate();

  /**
   * Fetch the current unread notification count.
   */
  async function fetchUnreadCount() {
    try {
      const response = await api.get("/notifications/unread/count");

      const count =
        response.data?.count ??
        response.data?.unreadCount ??
        0;

      setUnreadCount(Number(count));
    } catch (err) {
      console.error(
        "Failed to load unread notification count:",
        err,
      );
    }
  }

  /**
   * Connect to the notification WebSocket once.
   *
   * The socket service handles the actual connection.
   * We only listen for "notification" events here.
   */
  useEffect(() => {
    fetchUnreadCount();

    const socket = connectNotificationSocket();

    if (!socket) {
      console.warn(
        "Notification WebSocket was not connected.",
      );

      return;
    }

    const handleNotification = (
      notification: NotificationPayload,
    ) => {
      console.log(
        "New real-time notification:",
        notification,
      );

      // Increase the notification badge immediately.
      setUnreadCount((previous) => previous + 1);
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

      disconnectNotificationSocket();
    };
  }, []);

  // =========================================================
  // INVOICES
  // =========================================================

  useEffect(() => {
    fetchInvoices();
  }, []);

  async function fetchInvoices() {
    try {
      setLoading(true);
      setError(null);

      const res = await api.get<Invoice[]>(
        "/invoices/all",
      );

      setInvoices(res.data);
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Failed to load your invoices.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  // =========================================================
  // DASHBOARD STATISTICS
  // =========================================================

  const stats = useMemo(() => {
    const now = new Date();

    const today = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );

    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const lastMonthDate = new Date(
      thisYear,
      thisMonth - 1,
      1,
    );

    let totalOutstanding = 0;
    let totalInvoiced = 0;
    let totalReceived = 0;
    let receivedThisMonth = 0;
    let receivedLastMonth = 0;
    let overdueCount = 0;
    let oldestOverdueDays = 0;
    let fastestPaymentDays: number | null = null;

    const monthlyCounts = new Array(12).fill(0);

    for (const invoice of invoices) {
      const isUnpaid =
        invoice.status !== "paid" &&
        invoice.status !== "cancelled";

      const isCancelled =
        invoice.status === "cancelled";

      // -------------------------------------------------------
      // TOTAL INVOICED
      // -------------------------------------------------------

      if (invoice.isSent && !isCancelled) {
        totalInvoiced += invoice.amountDue ?? 0;

        if (invoice.sentAt) {
          const sentDate = new Date(
            invoice.sentAt,
          );

          if (
            sentDate.getFullYear() ===
            thisYear
          ) {
            monthlyCounts[
              sentDate.getMonth()
            ]++;
          }
        }
      }

      // -------------------------------------------------------
      // OUTSTANDING / OVERDUE
      // -------------------------------------------------------

      if (isUnpaid && !isCancelled) {
        totalOutstanding +=
          invoice.amountDue ?? 0;

        if (
          invoice.isSent &&
          invoice.dueDate &&
          new Date(invoice.dueDate) < today
        ) {
          overdueCount++;

          const daysLate = Math.floor(
            (today.getTime() -
              new Date(
                invoice.dueDate,
              ).getTime()) /
              86_400_000,
          );

          oldestOverdueDays = Math.max(
            oldestOverdueDays,
            daysLate,
          );
        }
      }

      // -------------------------------------------------------
      // PAID
      // -------------------------------------------------------

      if (invoice.status === "paid") {
        const amount =
          invoice.amountPaid ??
          invoice.amountDue ??
          0;

        totalReceived += amount;

        if (invoice.paidAt) {
          const paidDate = new Date(
            invoice.paidAt,
          );

          // Received this month
          if (
            paidDate.getFullYear() ===
              thisYear &&
            paidDate.getMonth() ===
              thisMonth
          ) {
            receivedThisMonth += amount;
          }

          // Received last month
          if (
            paidDate.getFullYear() ===
              lastMonthDate.getFullYear() &&
            paidDate.getMonth() ===
              lastMonthDate.getMonth()
          ) {
            receivedLastMonth += amount;
          }

          // Fastest payment
          if (invoice.sentAt) {
            const days = Math.floor(
              (paidDate.getTime() -
                new Date(
                  invoice.sentAt,
                ).getTime()) /
                86_400_000,
            );

            if (
              days >= 0 &&
              (fastestPaymentDays === null ||
                days < fastestPaymentDays)
            ) {
              fastestPaymentDays = days;
            }
          }
        }
      }
    }

    // -------------------------------------------------------
    // COLLECTION RATE
    // -------------------------------------------------------

    const collectionRate =
      totalInvoiced > 0
        ? Math.round(
            (totalReceived /
              totalInvoiced) *
              100,
          )
        : 0;

    // -------------------------------------------------------
    // MONTH TREND
    // -------------------------------------------------------

    const monthTrend =
      receivedLastMonth > 0
        ? Math.round(
            ((receivedThisMonth -
              receivedLastMonth) /
              receivedLastMonth) *
              100,
          )
        : null;

    return {
      totalOutstanding,
      totalReceived,
      receivedThisMonth,
      monthTrend,
      overdueCount,
      oldestOverdueDays,
      collectionRate,
      monthlyCounts,
      fastestPaymentDays,
      currentMonthIndex: thisMonth,
    };
  }, [invoices]);

  const maxMonthlyCount = Math.max(
    ...stats.monthlyCounts,
    1,
  );

  const totalSentThisYear =
    stats.monthlyCounts.reduce(
      (a, b) => a + b,
      0,
    );

  // =========================================================
  // UI
  // =========================================================

  return (
    <AppShell>
      <div className="p-6">

        {/* ===================================================
            HEADER
        =================================================== */}

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-medium text-[#0F1B3D]">
              Dashboard
            </h1>

            <p className="text-[13px] text-[#6B7280]">
              {new Date().toLocaleDateString(
                "en-US",
                {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                },
              )}
            </p>
          </div>

          {/* =================================================
              NOTIFICATION BUTTON
          ================================================= */}

          <button
            type="button"
            title="Notifications"
            aria-label="Notifications"
            onClick={() =>
              navigate("/notifications")
            }
            className="relative flex h-[38px] w-[38px] items-center justify-center rounded-full border border-[#EFEAE0] bg-white text-[#5B6584] transition hover:text-[#1E56CD]"
          >
            <Bell className="h-[18px] w-[18px]" />

            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
                {unreadCount > 99
                  ? "99+"
                  : unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* ===================================================
            ERROR
        =================================================== */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* ===================================================
            STAT CARDS
        =================================================== */}

        <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-3">

          {/* Outstanding */}

          <div className="rounded-xl border border-[#EFEAE0] bg-white p-4">
            <p className="text-xs text-[#8A93AC]">
              Outstanding
            </p>

            <p className="mt-1 text-xl font-medium text-[#0F1B3D]">
              {loading
                ? "—"
                : `₦${stats.totalOutstanding.toLocaleString()}`}
            </p>
          </div>

          {/* Received */}

          <div className="rounded-xl border border-[#EFEAE0] bg-white p-4">
            <p className="text-xs text-[#8A93AC]">
              Received this month
            </p>

            <p className="mt-1 text-xl font-medium text-[#0F1B3D]">
              {loading
                ? "—"
                : `₦${stats.receivedThisMonth.toLocaleString()}`}
            </p>

            {!loading &&
              stats.monthTrend !== null && (
                <div className="mt-1 flex items-center gap-1">

                  {stats.monthTrend >= 0 ? (
                    <ArrowUpRight className="h-3.5 w-3.5 text-[#3B6D11]" />
                  ) : (
                    <ArrowDownRight className="h-3.5 w-3.5 text-[#C4432E]" />
                  )}

                  <span
                    className={`text-[11px] font-medium ${
                      stats.monthTrend >= 0
                        ? "text-[#3B6D11]"
                        : "text-[#C4432E]"
                    }`}
                  >
                    {Math.abs(
                      stats.monthTrend,
                    )}
                    % vs last month
                  </span>
                </div>
              )}
          </div>

          {/* Overdue */}

          <div className="rounded-xl border border-[#EFEAE0] bg-white p-4">
            <p className="text-xs text-[#8A93AC]">
              Overdue
            </p>

            <p
              className={`mt-1 text-xl font-medium ${
                stats.overdueCount > 0
                  ? "text-[#C4432E]"
                  : "text-[#0F1B3D]"
              }`}
            >
              {loading
                ? "—"
                : stats.overdueCount}
            </p>

            {!loading &&
              stats.overdueCount > 0 && (
                <p className="mt-1 text-[11px] text-[#8A93AC]">
                  Oldest:{" "}
                  {stats.oldestOverdueDays}{" "}
                  day
                  {stats.oldestOverdueDays ===
                  1
                    ? ""
                    : "s"}
                </p>
              )}
          </div>
        </div>

        {/* ===================================================
            COLLECTION RATE + YEARLY CHART
        =================================================== */}

        <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-[180px_1fr]">

          {/* Collection rate */}

          <div className="flex flex-col items-center justify-center rounded-xl border border-[#EFEAE0] bg-white p-4">

            <p className="mb-3 self-start text-[13px] font-medium text-[#0F1B3D]">
              Collection rate
            </p>

            <div
              className="flex h-[88px] w-[88px] items-center justify-center rounded-full"
              style={{
                background: `conic-gradient(#1E56CD 0% ${stats.collectionRate}%, #F1EEE4 ${stats.collectionRate}% 100%)`,
              }}
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-base font-medium text-[#0F1B3D]">
                {loading
                  ? "—"
                  : `${stats.collectionRate}%`}
              </div>
            </div>

            <p className="mt-2.5 text-[11px] text-[#8A93AC]">
              of invoiced amount
            </p>
          </div>

          {/* Year chart */}

          <div className="rounded-xl border border-[#EFEAE0] bg-white p-4">

            <div className="mb-3.5 flex items-baseline justify-between">

              <p className="text-[13px] font-medium text-[#0F1B3D]">
                Invoices sent this year
              </p>

              <p className="text-[11px] text-[#8A93AC]">
                {totalSentThisYear} total
              </p>

            </div>

            <div className="flex h-[90px] items-end gap-1.5">

              {stats.monthlyCounts.map(
                (count, i) => {

                  const isFuture =
                    i >
                    stats.currentMonthIndex;

                  const isCurrent =
                    i ===
                    stats.currentMonthIndex;

                  const height = isFuture
                    ? 6
                    : count === 0
                      ? 6
                      : Math.max(
                          8,
                          (count /
                            maxMonthlyCount) *
                            74,
                        );

                  return (
                    <div
                      key={i}
                      className="flex flex-1 flex-col items-center gap-1.5"
                    >

                      <div
                        className="w-full rounded"
                        style={{
                          height,
                          backgroundColor:
                            isFuture
                              ? "#F3F0E8"
                              : isCurrent
                                ? "#1E56CD"
                                : "#E7EEFB",
                        }}
                        title={`${count} invoice${
                          count === 1
                            ? ""
                            : "s"
                        }`}
                      />

                      <span
                        className={`text-[10px] ${
                          isCurrent
                            ? "font-medium text-[#1E56CD]"
                            : isFuture
                              ? "text-[#C7C2B5]"
                              : "text-[#8A93AC]"
                        }`}
                      >
                        {MONTH_LABELS[i]}
                      </span>

                    </div>
                  );
                },
              )}

            </div>
          </div>
        </div>

        {/* ===================================================
            THIS MONTH
        =================================================== */}

        <div className="rounded-xl border border-[#EFEAE0] bg-white p-4">

          <p className="mb-3 text-[13px] font-medium text-[#0F1B3D]">
            This month
          </p>

          <div className="flex flex-col gap-2.5 text-[13px] text-[#5B6584]">

            <div className="flex items-center gap-2.5">

              <Bell className="h-4 w-4 text-[#1E56CD]" />

              {
                stats.monthlyCounts[
                  stats.currentMonthIndex
                ]
              }{" "}
              invoices sent

            </div>

            {stats.overdueCount > 0 && (
              <div className="flex items-center gap-2.5">

                <AlertTriangle className="h-4 w-4 text-[#C4432E]" />

                {stats.overdueCount} overdue
                right now

              </div>
            )}

            {stats.fastestPaymentDays !==
              null && (
              <div className="flex items-center gap-2.5">

                <ArrowUpRight className="h-4 w-4 text-[#1E56CD]" />

                Fastest payment:{" "}
                {stats.fastestPaymentDays} day
                {stats.fastestPaymentDays ===
                1
                  ? ""
                  : "s"}

              </div>
            )}

          </div>
        </div>

      </div>
    </AppShell>
  );
}

export default Dashboard;
