import { useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

import InvoiceTable from "../components/InvoiceTable";
import SearchBar from "../components/SearchBar";
import EmptyState  from "../components/EmptyState";
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

  // "tab" lives in the URL (?tab=drafts) so it's shareable/bookmarkable,
  // e.g. a "Drafts" link elsewhere in the app can deep-link straight here.
  const tab = (searchParams.get("tab") as "all" | "drafts" | "scheduled" | "sent") || "all";

  function setTab(next: "all" | "drafts" | "scheduled" | "sent") {
    setSearchParams(next === "all" ? {} : { tab: next });
  }

  useEffect(() => {
    fetchInvoices();
  }, []);

  
  async function fetchInvoices() {
    try {
      setLoading(true);
      setError("");

      const res = await api.get(`/invoices/all`);

      setInvoices(res.data);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load invoices."));
    } finally {
      setLoading(false);
    }
  }

async function handleView(id: string) {
  try {
    const response = await api.get(`/invoices/${id}`, {
      responseType: "blob",
    });

    const file = new Blob([response.data], {
      type: "application/pdf",
    });

    const url = URL.createObjectURL(file);

    window.open(url, "_blank");

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (err) {
    setError(getErrorMessage(err, "Couldn't open that invoice."));
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
      }
    );

    setInvoices((prev) =>
      prev.map((invoice) =>
        invoice._id === id
          ? {
              ...invoice,
              status: "paid",
            }
          : invoice
      )
    );
  } catch (err) {
    setError(getErrorMessage(err, "Couldn't mark that invoice as paid."));
  }
}
  
  async function handleDelete(id: string) {
  const confirmed = window.confirm(
    "Are you sure you want to delete this invoice?"
  );

  if (!confirmed) return;

  try {
    await api.delete(`/invoices/${id}`);

    setInvoices((prev) =>
      prev.filter((invoice) => invoice._id !== id)
    );
  } catch (err) {
    setError(getErrorMessage(err, "Couldn't delete that invoice."));
  }
}

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const matchesSearch =
        invoice.customerName
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        invoice.invoiceNumber
          ?.toLowerCase()
          .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        invoice.status === statusFilter;

      const matchesTab =
        tab === "all" ||
        (tab === "drafts" && !invoice.isSent && !invoice.isScheduled) ||
        (tab === "scheduled" && !invoice.isSent && invoice.isScheduled === true) ||
        (tab === "sent" && invoice.isSent === true);

      return matchesSearch && matchesStatus && matchesTab;
    });
  }, [search, statusFilter, tab, invoices]);

  const draftCount = useMemo(
    () => invoices.filter((invoice) => !invoice.isSent && !invoice.isScheduled).length,
    [invoices]
  );

  const scheduledCount = useMemo(
    () => invoices.filter((invoice) => !invoice.isSent && invoice.isScheduled === true).length,
    [invoices]
  );

  return (
    <div className="min-h-screen bg-[#FEF9EE] font-candara text-[#1E2118]">
      {/* Navbar */}

      <nav className="border-b border-[#E6DCC7] bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#4B672D] font-bold text-white">
              IF
            </div>

            <span className="text-xl font-semibold text-[#4B672D]">
              Cape
            </span>
          </div>

          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 rounded-xl border border-[#E6DCC7] bg-[#FEF9EE] px-4 py-2 text-sm font-medium text-[#4B672D] transition hover:bg-[#F4E9D6]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
        </div>
      </nav>

      {/* Content */}

      <div className="mx-auto max-w-7xl px-6 py-10">

        <div className="mb-8">
          <h1 className="text-4xl font-bold">
            View Invoices
          </h1>

          <p className="mt-2 text-[#4B672D]">
            View, search and manage all uploaded invoices.
          </p>
        </div>

        {/* Tabs */}

        <div className="mb-6 flex gap-2">
          <TabButton active={tab === "all"} onClick={() => setTab("all")}>
            All
          </TabButton>
          <TabButton active={tab === "drafts"} onClick={() => setTab("drafts")}>
            Drafts
            {draftCount > 0 && (
              <span className="ml-1.5 rounded-full bg-white/60 px-2 py-0.5 text-xs">
                {draftCount}
              </span>
            )}
          </TabButton>
          <TabButton active={tab === "scheduled"} onClick={() => setTab("scheduled")}>
            Scheduled
            {scheduledCount > 0 && (
              <span className="ml-1.5 rounded-full bg-white/60 px-2 py-0.5 text-xs">
                {scheduledCount}
              </span>
            )}
          </TabButton>
          <TabButton active={tab === "sent"} onClick={() => setTab("sent")}>
            Sent
          </TabButton>
        </div>

        {/* Search + Filter */}

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:justify-between">

          <SearchBar
            value={search}
            onChange={setSearch}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-[#E6DCC7] bg-white px-5 py-3 text-sm outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="cancelled">Cancelled</option>
          </select>

        </div>

        {/* Loading */}

        {loading && (
          <div className="rounded-3xl bg-white p-12 text-center shadow-sm">
            Loading invoices...
          </div>
        )}

        {/* Error */}

        {!loading && error && (
          <div className="rounded-3xl bg-red-50 p-8 text-red-600">
            {error}
          </div>
        )}

        {/* Empty */}

        {!loading &&
          !error &&
          filteredInvoices.length === 0 && (
            <EmptyState />
          )}

        {/* Table */}

        {!loading &&
          !error &&
          filteredInvoices.length > 0 && (
            <InvoiceTable
  invoices={filteredInvoices}
  onView={handleView}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onPaid={handlePaid}
/>
          )}
      </div>
    </div>
  );
}
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
      onClick={onClick}
      className={`flex items-center rounded-full px-5 py-2 text-sm font-medium transition ${
        active
          ? "bg-[#4B672D] text-white"
          : "bg-white text-[#4B672D] border border-[#E6DCC7] hover:bg-[#FEF9EE]"
      }`}
    >
      {children}
    </button>
  );
}
