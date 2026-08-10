import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import InvoiceTable from "../components/InvoiceTable";
import SearchBar from "../components/SearchBar";
import EmptyState from "../components/EmptyState";
import api from "../api/axios";
import AppShell from "../components/AppShell";

export interface Invoice {
  _id: string;
  fileName: string;
  originalName: string;
  invoiceNumber?: string;
  customerName?: string;
  customerEmail?: string;
  amountDue?: number;
  dueDate?: string;
  status: "pending" | "paid" | "overdue" | "cancelled";
  isSent?: boolean;
  isScheduled?: boolean;
  sendAt?: string;
  sentAt?: string;
  paidAt?: string;
  amountPaid?: number;
  createdAt: string;
}

export default function ViewInvoices() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [error, setError] = useState("");
  const [scrollY, setScrollY] = useState(0);

  /*
   * ---------------------------------------------------------
   * Scroll/parallax effect
   * ---------------------------------------------------------
   */

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  /*
   * ---------------------------------------------------------
   * URL tab state
   * ---------------------------------------------------------
   */

  const tab =
    (searchParams.get("tab") as
      | "all"
      | "drafts"
      | "scheduled"
      | "sent") || "all";

  function setTab(
    next: "all" | "drafts" | "scheduled" | "sent",
  ) {
    setSearchParams(next === "all" ? {} : { tab: next });
  }

  /*
   * ---------------------------------------------------------
   * Fetch invoices
   * ---------------------------------------------------------
   */

  useEffect(() => {
    fetchInvoices();
  }, []);

  async function fetchInvoices() {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/invoices/all");

      setInvoices(res.data);
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Failed to load invoices.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * ---------------------------------------------------------
   * View invoice
   * ---------------------------------------------------------
   */

  async function handleView(id: string) {
    try {
      const response = await api.get(
        `/invoices/${id}`,
        {
          responseType: "blob",
        },
      );

      const file = new Blob([response.data], {
        type: "application/pdf",
      });

      const url = URL.createObjectURL(file);

      window.open(url, "_blank");

      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Couldn't open that invoice.",
        ),
      );
    }
  }

  /*
   * ---------------------------------------------------------
   * Edit invoice
   * ---------------------------------------------------------
   */

  function handleEdit(id: string) {
    navigate(`/review/${id}`);
  }

  /*
   * ---------------------------------------------------------
   * Mark invoice as paid
   * ---------------------------------------------------------
   */

  async function handlePaid(id: string) {
    try {
      await api.patch(
        `/invoices/${id}/status`,
        {
          status: "paid",
        },
      );

      setInvoices((prev) =>
        prev.map((invoice) =>
          invoice._id === id
            ? {
                ...invoice,
                status: "paid",
              }
            : invoice,
        ),
      );
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Couldn't mark that invoice as paid.",
        ),
      );
    }
  }

  /*
   * ---------------------------------------------------------
   * Delete invoice
   * ---------------------------------------------------------
   */

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this invoice?",
    );

    if (!confirmed) return;

    try {
      await api.delete(`/invoices/${id}`);

      setInvoices((prev) =>
        prev.filter(
          (invoice) => invoice._id !== id,
        ),
      );
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Couldn't delete that invoice.",
        ),
      );
    }
  }

  /*
   * ---------------------------------------------------------
   * Filtering
   * ---------------------------------------------------------
   */

  const filteredInvoices = useMemo(() => {
    const normalizedSearch =
      search.toLowerCase().trim();

    return invoices.filter((invoice) => {
      const matchesSearch =
        !normalizedSearch ||
        invoice.customerName
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        invoice.invoiceNumber
          ?.toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "all" ||
        invoice.status === statusFilter;

      const matchesTab =
        tab === "all" ||
        (tab === "drafts" &&
          !invoice.isSent &&
          !invoice.isScheduled) ||
        (tab === "scheduled" &&
          !invoice.isSent &&
          invoice.isScheduled === true) ||
        (tab === "sent" &&
          invoice.isSent === true);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesTab
      );
    });
  }, [
    search,
    statusFilter,
    tab,
    invoices,
  ]);

  /*
   * ---------------------------------------------------------
   * Tab counts
   * ---------------------------------------------------------
   */

  const draftCount = useMemo(
    () =>
      invoices.filter(
        (invoice) =>
          !invoice.isSent &&
          !invoice.isScheduled,
      ).length,
    [invoices],
  );

  const scheduledCount = useMemo(
    () =>
      invoices.filter(
        (invoice) =>
          !invoice.isSent &&
          invoice.isScheduled === true,
      ).length,
    [invoices],
  );

  /*
   * ---------------------------------------------------------
   * Render
   * ---------------------------------------------------------
   */

  return (
    <AppShell>
      <div className="min-h-screen bg-[#FDF8F2] font-candara text-[#0F1B3D]">
        {/* =====================================================
            HEADER / HERO
        ====================================================== */}

        <div className="relative overflow-hidden bg-[#1E56CD]">
          {/* Decorative floating circles */}

          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <span className="absolute -left-16 top-10 h-48 w-48 rounded-full bg-white/5" />

            <span className="absolute -right-20 top-20 h-64 w-64 rounded-full bg-white/5" />

            <span className="absolute left-[25%] top-[55%] h-28 w-28 rounded-full bg-white/[0.06]" />

            <span className="absolute right-[18%] top-[20%] h-20 w-20 rounded-full bg-white/[0.07]" />
          </div>

          <div className="relative mx-auto max-w-7xl px-6 pb-32 pt-10">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-white/70">
                Invoice management
              </p>

              <h1 className="mt-3 text-4xl font-bold tracking-tight text-white md:text-5xl">
                View Invoices
              </h1>

              <p className="mt-4 max-w-xl text-base leading-relaxed text-white/80 md:text-lg">
                View, search and manage all your
                uploaded invoices in one place.
              </p>
            </div>
          </div>
        </div>

        {/* =====================================================
            FLOATING CONTENT PANEL
        ====================================================== */}

        <div className="relative z-10 mx-auto -mt-20 max-w-7xl px-4 pb-16 sm:px-6">
          <div
            className="overflow-hidden rounded-[28px] border border-[#E7DFD0] bg-white shadow-[0_30px_80px_rgba(15,27,61,0.14)] transition-transform duration-200"
            style={{
              transform: `translateY(${Math.min(
                scrollY * 0.025,
                12,
              )}px)`,
            }}
          >
            {/* =================================================
                PANEL HEADER
            ================================================== */}

            <div className="border-b border-[#EFEAE0] bg-[#FDF8F2] px-5 py-5 sm:px-7">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#0F1B3D]">
                    Your invoices
                  </h2>

                  <p className="mt-1 text-sm text-[#5B6584]">
                    Manage your drafts, scheduled
                    and sent invoices.
                  </p>
                </div>

                <div className="rounded-xl bg-[#1E56CD] px-4 py-2 text-center text-sm font-semibold text-white">
                  {invoices.length}{" "}
                  {invoices.length === 1
                    ? "Invoice"
                    : "Invoices"}
                </div>
              </div>
            </div>

            {/* =================================================
                TABS
            ================================================== */}

            <div className="border-b border-[#EFEAE0] px-5 py-4 sm:px-7">
              <div className="flex gap-2 overflow-x-auto pb-1">
                <TabButton
                  active={tab === "all"}
                  onClick={() => setTab("all")}
                >
                  All
                </TabButton>

                <TabButton
                  active={tab === "drafts"}
                  onClick={() => setTab("drafts")}
                >
                  Drafts

                  {draftCount > 0 && (
                    <span
                      className={`ml-1.5 rounded-full px-2 py-0.5 text-xs ${
                        tab === "drafts"
                          ? "bg-white/20"
                          : "bg-[#FDF8F2]"
                      }`}
                    >
                      {draftCount}
                    </span>
                  )}
                </TabButton>

                <TabButton
                  active={tab === "scheduled"}
                  onClick={() =>
                    setTab("scheduled")
                  }
                >
                  Scheduled

                  {scheduledCount > 0 && (
                    <span
                      className={`ml-1.5 rounded-full px-2 py-0.5 text-xs ${
                        tab === "scheduled"
                          ? "bg-white/20"
                          : "bg-[#FDF8F2]"
                      }`}
                    >
                      {scheduledCount}
                    </span>
                  )}
                </TabButton>

                <TabButton
                  active={tab === "sent"}
                  onClick={() => setTab("sent")}
                >
                  Sent
                </TabButton>
              </div>
            </div>

            {/* =================================================
                SEARCH + FILTER
            ================================================== */}

            <div className="border-b border-[#EFEAE0] px-5 py-5 sm:px-7">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="w-full md:max-w-md">
                  <SearchBar
                    value={search}
                    onChange={setSearch}
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(
                      e.target.value,
                    )
                  }
                  className="w-full rounded-xl border border-[#E7DFD0] bg-white px-4 py-3 text-sm text-[#0F1B3D] outline-none transition focus:border-[#1E56CD] md:w-auto"
                >
                  <option value="all">
                    All Statuses
                  </option>

                  <option value="pending">
                    Pending
                  </option>

                  <option value="paid">
                    Paid
                  </option>

                  <option value="overdue">
                    Overdue
                  </option>

                  <option value="cancelled">
                    Cancelled
                  </option>
                </select>
              </div>
            </div>

            {/* =================================================
                CONTENT
            ================================================== */}

            <div className="p-4 sm:p-7">
              {/* Loading */}

              {loading && (
                <div className="rounded-2xl border border-[#EFEAE0] bg-[#FDF8F2] p-12 text-center">
                  <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[#D6E0FA] border-t-[#1E56CD]" />

                  <p className="text-sm font-medium text-[#5B6584]">
                    Loading invoices...
                  </p>
                </div>
              )}

              {/* Error */}

              {!loading && error && (
                <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* Empty */}

              {!loading &&
                !error &&
                filteredInvoices.length ===
                  0 && <EmptyState />}

              {/* Table */}

              {!loading &&
                !error &&
                filteredInvoices.length >
                  0 && (
                  <div className="overflow-hidden rounded-2xl border border-[#EFEAE0] bg-white">
                    <div className="overflow-x-auto">
                      <InvoiceTable
                        invoices={
                          filteredInvoices
                        }
                        onView={handleView}
                        onEdit={handleEdit}
                        onDelete={
                          handleDelete
                        }
                        onPaid={handlePaid}
                      />
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

/*
 * =============================================================
 * TAB BUTTON
 * =============================================================
 */

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex shrink-0 items-center rounded-full px-5 py-2.5 text-sm font-medium transition ${
        active
          ? "bg-[#1E56CD] text-white shadow-sm"
          : "border border-[#EFEAE0] bg-white text-[#5B6584] hover:bg-[#FDF8F2] hover:text-[#0F1B3D]"
      }`}
    >
      {children}
    </button>
  );
}