import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Eye,
  Pencil,
  CheckCircle2,
  Trash2,
  CalendarDays,
  Mail,
  FileText,
  ChevronRight,
} from "lucide-react";

import SearchBar from "../components/SearchBar";
import EmptyState from "../components/EmptyState";
import AppShell from "../components/AppShell";
import api from "../api/axios";
import { getErrorMessage } from "../utils/getErrorMessage";

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

type InvoiceTab = "all" | "drafts" | "scheduled" | "sent";

const statusStyles: Record<
  Invoice["status"],
  {
    container: string;
    dot: string;
  }
> = {
  paid: {
    container: "bg-[#E8EEFC] text-[#1E56CD]",
    dot: "bg-[#1E56CD]",
  },

  pending: {
    container: "bg-[#FBF3DC] text-[#8A6A1F]",
    dot: "bg-[#C99B2E]",
  },

  overdue: {
    container: "bg-[#FBE3E0] text-[#C4432E]",
    dot: "bg-[#C4432E]",
  },

  cancelled: {
    container: "bg-gray-100 text-gray-600",
    dot: "bg-gray-500",
  },
};

export default function ViewInvoices() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [error, setError] = useState("");

  const tab =
    (searchParams.get("tab") as InvoiceTab) || "all";

  function setTab(next: InvoiceTab) {
    setSearchParams(
      next === "all" ? {} : { tab: next },
    );
  }

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
   * Opens the invoice preview immediately.
   *
   * This is important for mobile browsers because calling
   * window.open() AFTER an awaited API request can be treated
   * as a popup and blocked.
   */
  async function handleView(id: string) {
    const previewWindow = window.open(
      "",
      "_blank",
    );

    if (!previewWindow) {
      setError(
        "Your browser blocked the invoice preview. Please allow pop-ups for Cape and try again.",
      );
      return;
    }

    /*
     * Show a loading screen immediately while the PDF
     * is being fetched.
     */
    previewWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Loading invoice...</title>

          <meta
            name="viewport"
            content="width=device-width, initial-scale=1"
          />

          <style>
            body {
              margin: 0;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              background: #fdf8f2;
              font-family: Arial, sans-serif;
              color: #0f1b3d;
            }

            .loading {
              text-align: center;
              padding: 24px;
            }

            .spinner {
              width: 32px;
              height: 32px;
              margin: 0 auto 16px;
              border: 4px solid #e8eefc;
              border-top-color: #1e56cd;
              border-radius: 50%;
              animation: spin 0.8s linear infinite;
            }

            @keyframes spin {
              to {
                transform: rotate(360deg);
              }
            }
          </style>
        </head>

        <body>
          <div class="loading">
            <div class="spinner"></div>
            <p>Loading invoice...</p>
          </div>
        </body>
      </html>
    `);

    try {
      const response = await api.get(
        `/invoices/${id}`,
        {
          responseType: "blob",
        },
      );

      const file = new Blob(
        [response.data],
        {
          type: "application/pdf",
        },
      );

      const url =
        URL.createObjectURL(file);

      /*
       * The new tab already exists, so mobile browsers
       * should allow us to navigate it to the PDF.
       */
      previewWindow.location.href = url;

      /*
       * Give the browser plenty of time to load
       * the PDF before revoking the object URL.
       */
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 60_000);
    } catch (err) {
      previewWindow.close();

      setError(
        getErrorMessage(
          err,
          "Couldn't open that invoice.",
        ),
      );
    }
  }

  function handleEdit(id: string) {
    navigate(`/review/${id}`);
  }

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
                paidAt:
                  new Date().toISOString(),
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

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this invoice?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/invoices/${id}`);

      setInvoices((prev) =>
        prev.filter(
          (invoice) =>
            invoice._id !== id,
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
   * Filter invoices.
   *
   * IMPORTANT:
   * We use getEffectiveStatus() instead of directly
   * checking invoice.status.
   *
   * This means an invoice whose backend status is still
   * "pending" will appear as "overdue" once its due date
   * has passed.
   */
  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const searchValue =
        search.toLowerCase().trim();

      const matchesSearch =
        !searchValue ||
        invoice.customerName
          ?.toLowerCase()
          .includes(searchValue) ||
        invoice.invoiceNumber
          ?.toLowerCase()
          .includes(searchValue) ||
        invoice.customerEmail
          ?.toLowerCase()
          .includes(searchValue);

      const effectiveStatus =
        getEffectiveStatus(invoice);

      const matchesStatus =
        statusFilter === "all" ||
        effectiveStatus ===
          statusFilter;

      const matchesTab =
        tab === "all" ||
        (tab === "drafts" &&
          !invoice.isSent &&
          !invoice.isScheduled) ||
        (tab === "scheduled" &&
          !invoice.isSent &&
          invoice.isScheduled ===
            true) ||
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

  const sentCount = useMemo(
    () =>
      invoices.filter(
        (invoice) =>
          invoice.isSent === true,
      ).length,
    [invoices],
  );

  return (
    <AppShell>
      <div className="min-h-screen bg-[#FDF8F2]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

          {/* =====================================================
              HEADER
          ===================================================== */}

          <div className="mb-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-[#0F1B3D] sm:text-4xl">
                  View Invoices
                </h1>

                <p className="mt-2 text-sm text-[#5B6584] sm:text-base">
                  View, search and manage all uploaded invoices.
                </p>
              </div>

              <div className="flex w-fit items-center gap-2 rounded-xl bg-white px-4 py-2.5 shadow-sm">
                <FileText className="h-4 w-4 text-[#1E56CD]" />

                <span className="text-sm font-semibold text-[#0F1B3D]">
                  {invoices.length}
                </span>

                <span className="text-sm text-[#8A93AC]">
                  {invoices.length === 1
                    ? "invoice"
                    : "invoices"}
                </span>
              </div>
            </div>
          </div>

          {/* =====================================================
              TABS
          ===================================================== */}

          <div className="mb-6 overflow-x-auto pb-1">
            <div className="flex min-w-max gap-2">
              <TabButton
                active={tab === "all"}
                onClick={() =>
                  setTab("all")
                }
              >
                All
              </TabButton>

              <TabButton
                active={tab === "drafts"}
                onClick={() =>
                  setTab("drafts")
                }
              >
                Drafts

                {draftCount > 0 && (
                  <CountBadge>
                    {draftCount}
                  </CountBadge>
                )}
              </TabButton>

              <TabButton
                active={
                  tab === "scheduled"
                }
                onClick={() =>
                  setTab("scheduled")
                }
              >
                Scheduled

                {scheduledCount > 0 && (
                  <CountBadge>
                    {scheduledCount}
                  </CountBadge>
                )}
              </TabButton>

              <TabButton
                active={tab === "sent"}
                onClick={() =>
                  setTab("sent")
                }
              >
                Sent

                {sentCount > 0 && (
                  <CountBadge>
                    {sentCount}
                  </CountBadge>
                )}
              </TabButton>
            </div>
          </div>

          {/* =====================================================
              SEARCH + FILTER
          ===================================================== */}

          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
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
              className="w-full rounded-xl border border-[#EFEAE0] bg-white px-4 py-3 text-sm font-medium text-[#0F1B3D] outline-none transition focus:border-[#1E56CD] md:w-auto"
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

          {/* =====================================================
              LOADING
          ===================================================== */}

          {loading && (
            <div className="rounded-[28px] border border-[#EFEAE0] bg-white p-12 text-center shadow-sm">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#E8EEFC] border-t-[#1E56CD]" />

              <p className="font-medium text-[#5B6584]">
                Loading invoices...
              </p>
            </div>
          )}

          {/* =====================================================
              ERROR
          ===================================================== */}

          {!loading && error && (
            <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-5 text-sm text-red-600">
              <p className="font-semibold">
                Something went wrong
              </p>

              <p className="mt-1">
                {error}
              </p>

              <button
                type="button"
                onClick={fetchInvoices}
                className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          )}

          {/* =====================================================
              EMPTY STATE
          ===================================================== */}

          {!loading &&
            !error &&
            filteredInvoices.length ===
              0 && (
              <EmptyState />
            )}

          {/* =====================================================
              INVOICE LIST
          ===================================================== */}

          {!loading &&
            !error &&
            filteredInvoices.length >
              0 && (
              <div className="overflow-hidden rounded-[28px] border border-[#EFEAE0] bg-white shadow-[0_15px_45px_rgba(15,27,61,0.05)]">

                {/* Desktop header */}
                <div className="hidden border-b border-[#EFEAE0] bg-[#FDF8F2] px-6 py-4 lg:block">
                  <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr_170px] items-center gap-4 text-[11px] font-bold uppercase tracking-[0.12em] text-[#8A93AC]">
                    <span>
                      Client
                    </span>

                    <span>
                      Invoice
                    </span>

                    <span>
                      Amount
                    </span>

                    <span>
                      Due
                    </span>

                    <span>
                      Status
                    </span>

                    <span className="text-right">
                      Actions
                    </span>
                  </div>
                </div>

                {/* =================================================
                    HORIZONTAL MOBILE/TABLET SCROLL
                ================================================= */}

                <div className="overflow-x-auto">
                  <div className="min-w-[850px] lg:min-w-0">
                    {filteredInvoices.map(
                      (
                        invoice,
                        index,
                      ) => (
                        <InvoiceRow
                          key={
                            invoice._id
                          }
                          invoice={
                            invoice
                          }
                          isLast={
                            index ===
                            filteredInvoices.length -
                              1
                          }
                          onView={
                            handleView
                          }
                          onEdit={
                            handleEdit
                          }
                          onPaid={
                            handlePaid
                          }
                          onDelete={
                            handleDelete
                          }
                        />
                      ),
                    )}
                  </div>
                </div>

                {/* Mobile scroll hint */}
                <div className="flex items-center justify-center gap-1.5 border-t border-[#EFEAE0] bg-[#FDF8F2] px-4 py-3 text-xs font-medium text-[#8A93AC] lg:hidden">
                  <span>
                    Swipe horizontally to see all actions
                  </span>

                  <ChevronRight className="h-3.5 w-3.5" />
                </div>
              </div>
            )}
        </div>
      </div>
    </AppShell>
  );
}

/* =========================================================
   INVOICE ROW
========================================================= */

function InvoiceRow({
  invoice,
  isLast,
  onView,
  onEdit,
  onPaid,
  onDelete,
}: {
  invoice: Invoice;
  isLast: boolean;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onPaid: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div
      className={`group px-5 py-5 transition hover:bg-[#FDFBF7] sm:px-6 ${
        !isLast
          ? "border-b border-[#EFEAE0]"
          : ""
      }`}
    >
      <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr_170px] items-center gap-4">

        {/* =====================================================
            CLIENT
        ===================================================== */}

        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E8EEFC] text-sm font-bold text-[#1E56CD]">
              {getInitials(
                invoice.customerName ||
                  invoice.customerEmail ||
                  "Client",
              )}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-[#0F1B3D]">
                {invoice.customerName ||
                  "Unnamed client"}
              </p>

              {invoice.customerEmail && (
                <div className="mt-1 flex items-center gap-1.5">
                  <Mail className="h-3 w-3 shrink-0 text-[#8A93AC]" />

                  <p className="max-w-[180px] truncate text-xs text-[#8A93AC]">
                    {
                      invoice.customerEmail
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* =====================================================
            INVOICE
        ===================================================== */}

        <div>
          <p className="text-sm font-semibold text-[#0F1B3D]">
            {invoice.invoiceNumber ||
              "No invoice number"}
          </p>

          <p className="mt-1 max-w-[150px] truncate text-xs text-[#8A93AC]">
            {invoice.originalName ||
              invoice.fileName ||
              "invoice.pdf"}
          </p>
        </div>

        {/* =====================================================
            AMOUNT
        ===================================================== */}

        <div>
          <p className="text-sm font-bold text-[#0F1B3D]">
            {formatCurrency(
              invoice.amountDue,
            )}
          </p>

          {invoice.amountPaid !==
            undefined &&
            invoice.amountPaid > 0 && (
              <p className="mt-1 text-xs text-[#1E56CD]">
                Paid{" "}
                {formatCurrency(
                  invoice.amountPaid,
                )}
              </p>
            )}
        </div>

        {/* =====================================================
            DUE
        ===================================================== */}

        <div>
          <div className="flex items-center gap-1.5 text-sm font-medium text-[#5B6584]">
            <CalendarDays className="h-4 w-4 text-[#8A93AC]" />

            <span>
              {formatDate(
                invoice.dueDate,
              )}
            </span>
          </div>

          {invoice.isScheduled &&
            invoice.sendAt && (
              <p className="mt-1 text-xs text-[#8A93AC]">
                Sends{" "}
                {formatDate(
                  invoice.sendAt,
                )}
              </p>
            )}
        </div>

        {/* =====================================================
            STATUS
        ===================================================== */}

        <div>
          <StatusBadge
            status={invoice.status}
            isSent={invoice.isSent}
            isScheduled={
              invoice.isScheduled
            }
            dueDate={invoice.dueDate}
          />
        </div>

        {/* =====================================================
            ACTIONS
        ===================================================== */}

        <div className="flex items-center justify-end gap-1.5">

          {/* Preview */}
          <ActionButton
            label="View invoice"
            onClick={() =>
              onView(invoice._id)
            }
          >
            <Eye className="h-4 w-4" />
          </ActionButton>

          {/* Edit */}
          <ActionButton
            label="Edit invoice"
            onClick={() =>
              onEdit(invoice._id)
            }
          >
            <Pencil className="h-4 w-4" />
          </ActionButton>

          {/* Mark as paid */}
          {invoice.status !==
            "paid" && (
            <ActionButton
              label="Mark as paid"
              onClick={() =>
                onPaid(invoice._id)
              }
              variant="success"
            >
              <CheckCircle2 className="h-4 w-4" />
            </ActionButton>
          )}

          {/* Delete */}
          <ActionButton
            label="Delete invoice"
            onClick={() =>
              onDelete(invoice._id)
            }
            variant="danger"
          >
            <Trash2 className="h-4 w-4" />
          </ActionButton>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   EFFECTIVE STATUS
========================================================= */

function getEffectiveStatus(
  invoice: Invoice,
): Invoice["status"] {
  /*
   * Paid and cancelled are final states.
   */
  if (invoice.status === "paid") {
    return "paid";
  }

  if (
    invoice.status === "cancelled"
  ) {
    return "cancelled";
  }

  /*
   * Without a due date, use the backend status.
   */
  if (!invoice.dueDate) {
    return invoice.status;
  }

  const dueDate = new Date(
    invoice.dueDate,
  );

  if (
    Number.isNaN(
      dueDate.getTime(),
    )
  ) {
    return invoice.status;
  }

  const now = new Date();

  /*
   * Compare dates by calendar day,
   * not exact time.
   */
  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );

  const due = new Date(
    dueDate.getFullYear(),
    dueDate.getMonth(),
    dueDate.getDate(),
  );

  if (
    due < today &&
    invoice.status !== "paid" &&
    invoice.status !== "cancelled"
  ) {
    return "overdue";
  }

  return invoice.status;
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({
  status,
  isSent,
  isScheduled,
  dueDate,
}: {
  status: Invoice["status"];
  isSent?: boolean;
  isScheduled?: boolean;
  dueDate?: string;
}) {
  /*
   * Create the effective status using the same
   * overdue logic used by the filter.
   */
  const effectiveStatus =
    getEffectiveStatus({
      _id: "",
      fileName: "",
      originalName: "",
      createdAt: "",
      status,
      dueDate,
      isSent,
      isScheduled,
    });

  const style =
    statusStyles[effectiveStatus];

  let label =
    effectiveStatus
      .charAt(0)
      .toUpperCase() +
    effectiveStatus.slice(1);

  /*
   * Draft and scheduled are special display
   * states based on sending information.
   */
  if (
    !isSent &&
    isScheduled
  ) {
    label = "Scheduled";
  } else if (
    !isSent &&
    !isScheduled &&
    effectiveStatus !==
      "overdue" &&
    effectiveStatus !==
      "paid" &&
    effectiveStatus !==
      "cancelled"
  ) {
    label = "Draft";
  }

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${style.container}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${style.dot}`}
      />

      {label}
    </span>
  );
}

/* =========================================================
   ACTION BUTTON
========================================================= */

function ActionButton({
  children,
  label,
  onClick,
  variant = "default",
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: "default" | "success" | "danger";
}) {
  const variants = {
    default:
      "bg-[#F7F4ED] text-[#5B6584] hover:bg-[#E8EEFC] hover:text-[#1E56CD]",

    success:
      "bg-[#E8EEFC] text-[#1E56CD] hover:bg-[#D6E0FA]",

    danger:
      "bg-[#FBE3E0] text-[#C4432E] hover:bg-[#F6D2CD]",
  };

  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition active:scale-95 ${variants[variant]}`}
    >
      {children}
    </button>
  );
}

/* =========================================================
   TAB BUTTON
========================================================= */

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
      className={`flex items-center rounded-full px-5 py-2.5 text-sm font-semibold transition ${
        active
          ? "bg-[#1E56CD] text-white shadow-sm"
          : "border border-[#EFEAE0] bg-white text-[#5B6584] hover:bg-[#FDF8F2] hover:text-[#0F1B3D]"
      }`}
    >
      {children}
    </button>
  );
}

/* =========================================================
   COUNT BADGE
========================================================= */

function CountBadge({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-xs">
      {children}
    </span>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function getInitials(name: string) {
  const words =
    name.trim().split(/\s+/);

  if (words.length === 1) {
    return words[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return (
    words[0][0] +
    words[words.length - 1][0]
  ).toUpperCase();
}

function formatDate(date?: string) {
  if (!date) {
    return "—";
  }

  const parsed = new Date(date);

  if (
    Number.isNaN(
      parsed.getTime(),
    )
  ) {
    return "—";
  }

  return parsed.toLocaleDateString(
    "en-NG",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  );
}

function formatCurrency(
  amount?: number,
) {
  if (
    amount === undefined ||
    amount === null ||
    Number.isNaN(amount)
  ) {
    return "₦0";
  }

  return new Intl.NumberFormat(
    "en-NG",
    {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    },
  ).format(amount);
}
