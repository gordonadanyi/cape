import { useEffect, useMemo, useState } from "react";
import {
  LogOut,
  Plus,
  FileText,
  Settings,
  AlertTriangle,
  Clock3,
  FileEdit,
  Wallet,
  Send,
  CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { getErrorMessage } from "../utils/getErrorMessage";
import StatusBadge from "../components/StatusBadge";
import type { Invoice } from "./viewInvoices";

function Dashboard() {
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  async function fetchInvoices() {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get<Invoice[]>("/invoices/all");
      setInvoices(res.data);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load your invoices."));
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // All stats computed client-side from the same fetch — no extra
  // endpoints needed. "Overdue" is computed from isSent + dueDate rather
  // than trusting invoice.status, since nothing in the backend actually
  // transitions status to "overdue" automatically yet.
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let totalOutstanding = 0;
    let overdueCount = 0;
    let draftCount = 0;
    let scheduledCount = 0;
    let sentCount = 0;
    let paidCount = 0;
    let totalReceived = 0;

    for (const invoice of invoices) {
      const isUnpaid = invoice.status !== "paid" && invoice.status !== "cancelled";

      if (isUnpaid) {
        totalOutstanding += invoice.amountDue ?? 0;

        if (invoice.isSent && invoice.dueDate && new Date(invoice.dueDate) < today) {
          overdueCount++;
        }
      }

      if (!invoice.isSent && !invoice.isScheduled) draftCount++;
      if (!invoice.isSent && invoice.isScheduled) scheduledCount++;
      if (invoice.isSent) sentCount++;
      if (invoice.status === "paid") {
        paidCount++;
        // Assumes full payment — there's no partial-payment tracking yet,
        // so a "paid" invoice's full amountDue is treated as received.
        // Revisit this if partial payments ever get added.
        totalReceived += invoice.amountDue ?? 0;
      }
    }

    return {
      totalOutstanding,
      overdueCount,
      draftCount,
      scheduledCount,
      sentCount,
      paidCount,
      totalReceived,
    };
  }, [invoices]);

  const recentInvoices = useMemo(() => {
    return [...invoices]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [invoices]);

  return (
    <div className="min-h-screen bg-[#FEF9EE] font-candara text-[#1E2118]">
      {/* Navigation */}
      <nav className="border-b border-[#E6DCC7] bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#4B672D] text-sm font-bold text-white">
                IF
              </div>
              <span className="text-xl font-semibold text-[#4B672D]">Cape</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 transition"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-semibold text-[#1E2118] mb-2">Dashboard</h1>
          <p className="text-[#4B672D]">Welcome to your invoicing dashboard</p>
        </div>

        {error && (
          <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Stat cards */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
            icon={<CheckCircle2 className="h-5 w-5" />}
            label="Paid"
            value={loading ? "—" : `₦${stats.totalReceived.toLocaleString()}`}
            sublabel={loading ? undefined : `${stats.paidCount} invoice${stats.paidCount === 1 ? "" : "s"}`}
          />
          <StatCard
            icon={<Wallet className="h-5 w-5" />}
            label="Total Outstanding"
            value={loading ? "—" : `₦${stats.totalOutstanding.toLocaleString()}`}
          />
          <StatCard
            icon={<AlertTriangle className="h-5 w-5" />}
            label="Overdue"
            value={loading ? "—" : String(stats.overdueCount)}
            tone={stats.overdueCount > 0 ? "warning" : "default"}
          />
          <StatCard
            icon={<Send className="h-5 w-5" />}
            label="Sent"
            value={loading ? "—" : String(stats.sentCount)}
          />
          <StatCard
            icon={<Clock3 className="h-5 w-5" />}
            label="Scheduled"
            value={loading ? "—" : String(stats.scheduledCount)}
          />
          <StatCard
            icon={<FileEdit className="h-5 w-5" />}
            label="Drafts"
            value={loading ? "—" : String(stats.draftCount)}
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-12 grid gap-6 md:grid-cols-3">
          <button
            onClick={() => navigate("/new-invoice")}
            className="rounded-[24px] border border-[#E6DCC7] bg-white p-6 text-left hover:shadow-lg transition"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#DCE9A8] text-[#4B672D] mb-4">
              <Plus className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold mb-1">Create Invoice</h3>
            <p className="text-sm text-[#4B672D]">Start a new invoice</p>
          </button>

          <button
            onClick={() => navigate("/view-invoices")}
            className="rounded-[24px] border border-[#E6DCC7] bg-white p-6 text-left hover:shadow-lg transition"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#DCE9A8] text-[#4B672D] mb-4">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold mb-1">View Invoices</h3>
            <p className="text-sm text-[#4B672D]">Manage your invoices</p>
          </button>

          <button
            onClick={() => navigate("/settings")}
            className="rounded-[24px] border border-[#E6DCC7] bg-white p-6 text-left hover:shadow-lg transition"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#DCE9A8] text-[#4B672D] mb-4">
              <Settings className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold mb-1">Settings</h3>
            <p className="text-sm text-[#4B672D]">Customize your account</p>
          </button>
        </div>

        {/* Recent Invoices */}
        <div className="rounded-[32px] border border-[#E6DCC7] bg-white p-8 shadow-sm">
          <h2 className="mb-6 text-2xl font-semibold text-[#1E2118]">Recent Invoices</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E6DCC7] text-left text-sm uppercase tracking-[0.12em] text-[#4B672D]">
                  <th className="pb-4">Client</th>
                  <th className="pb-4">Amount</th>
                  <th className="pb-4">Due Date</th>
                  <th className="pb-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-[#4B672D]">
                      Loading…
                    </td>
                  </tr>
                ) : recentInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-[#4B672D]">
                      No invoices yet
                    </td>
                  </tr>
                ) : (
                  recentInvoices.map((invoice) => (
                    <tr
                      key={invoice._id}
                      onClick={() => navigate(`/review/${invoice._id}`)}
                      className="cursor-pointer border-b border-[#EBF6C4] hover:bg-[#FEF9EE] transition"
                    >
                      <td className="py-4 font-medium">
                        {invoice.customerName || "—"}
                      </td>
                      <td className="py-4">
                        {invoice.amountDue
                          ? `₦${invoice.amountDue.toLocaleString()}`
                          : "—"}
                      </td>
                      <td className="py-4">
                        {invoice.dueDate
                          ? new Date(invoice.dueDate).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="py-4">
                        <StatusBadge status={invoice.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {!loading && recentInvoices.length === 0 && (
            <p className="mt-6 text-center text-[#4B672D]">
              Create your first invoice to get started
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sublabel,
  tone = "default",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sublabel?: string;
  tone?: "default" | "warning";
}) {
  return (
    <div className="rounded-[24px] border border-[#E6DCC7] bg-white p-6">
      <div
        className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${
          tone === "warning"
            ? "bg-red-50 text-red-600"
            : "bg-[#DCE9A8] text-[#4B672D]"
        }`}
      >
        {icon}
      </div>
      <p className="text-sm text-[#4B672D]">{label}</p>
      <p className="text-2xl font-semibold text-[#1E2118]">{value}</p>
      {sublabel && (
        <p className="mt-0.5 text-xs text-[#8A8D86]">{sublabel}</p>
      )}
    </div>
  );
}

export default Dashboard;
