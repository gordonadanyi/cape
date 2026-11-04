import { ExternalLink } from "lucide-react";
import type { CustomerInvoice } from "../../types/customer";

const formatCurrency = (value?: number) => {
  if (typeof value !== "number" || Number.isNaN(value)) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
};

const formatDate = (value?: string) => {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

const invoiceStatusStyles: Record<string, string> = {
  paid: "bg-[#E7EEFB] text-[#1E56CD]",
  pending: "bg-[#FBF3DC] text-[#8A6A1F]",
  overdue: "bg-[#FBE3E0] text-[#C4432E]",
  cancelled: "bg-[#F1F2F4] text-[#4B5563]",
};

export default function CustomerInvoiceHistory({
  invoices,
  loading,
  error,
  page,
  totalPages,
  onPageChange,
  onOpenInvoice,
}: {
  invoices: CustomerInvoice[];
  loading: boolean;
  error?: string | null;
  page: number;
  totalPages: number;
  onPageChange: (nextPage: number) => void;
  onOpenInvoice: (invoiceId: string) => void;
}) {
  if (loading) {
    return (
      <div className="rounded-[26px] border border-[#EFEAE0] bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-4 border-[#E8EEFC] border-t-[#1E56CD]" />
        <p className="text-sm text-[#5B6584]">Loading invoice history…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[26px] border border-red-200 bg-red-50 p-5 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="rounded-[26px] border border-[#EFEAE0] bg-white p-6 text-center text-sm text-[#5B6584] shadow-sm">
        No invoices have been recorded for this customer yet.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[26px] border border-[#EFEAE0] bg-white shadow-sm">
      <div className="hidden border-b border-[#EFEAE0] bg-[#FDF8F2] px-5 py-3 md:grid md:grid-cols-[1.1fr_1fr_1fr_0.8fr_0.9fr_0.9fr_110px] md:gap-4 md:text-[11px] md:font-bold md:uppercase md:tracking-[0.12em] md:text-[#8A93AC]">
        <span>Invoice</span>
        <span>Issue Date</span>
        <span>Due Date</span>
        <span>Amount</span>
        <span>Status</span>
        <span>Payment</span>
        <span className="text-right">Open</span>
      </div>

      <div className="space-y-3 p-4 md:space-y-0 md:p-0">
        {invoices.map((invoice) => (
          <div key={invoice._id ?? invoice.id ?? invoice.invoiceNumber ?? "invoice-row"} className="rounded-[20px] border border-[#EFEAE0] bg-[#FFFDFC] p-4 md:grid md:grid-cols-[1.1fr_1fr_1fr_0.8fr_0.9fr_0.9fr_110px] md:items-center md:gap-4 md:rounded-none md:border-0 md:border-b md:bg-white md:p-4">
            <div className="mb-2 md:mb-0">
              <p className="font-semibold text-[#0F1B3D]">{invoice.invoiceNumber ?? "Invoice"}</p>
            </div>
            <div className="mb-2 text-sm text-[#5B6584] md:mb-0">{formatDate(invoice.issueDate ?? invoice.createdAt)}</div>
            <div className="mb-2 text-sm text-[#5B6584] md:mb-0">{formatDate(invoice.dueDate)}</div>
            <div className="mb-2 text-sm font-medium text-[#0F1B3D] md:mb-0">{formatCurrency(invoice.amount ?? invoice.totalAmount)}</div>
            <div className="mb-2 md:mb-0">
              <span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${invoiceStatusStyles[(invoice.status ?? "pending").toLowerCase()] ?? invoiceStatusStyles.pending}`}>
                {(invoice.status ?? "Pending").toString().charAt(0).toUpperCase() + (invoice.status ?? "Pending").toString().slice(1)}
              </span>
            </div>
            <div className="mb-2 text-sm text-[#5B6584] md:mb-0">{invoice.paymentStatus ?? "Unpaid"}</div>
            <div className="md:text-right">
              <button type="button" onClick={() => onOpenInvoice((invoice._id ?? invoice.id) ?? "")} className="inline-flex items-center gap-1.5 rounded-lg border border-[#EFEAE0] bg-white px-3 py-2 text-xs font-semibold text-[#1E56CD] hover:bg-[#F7F8FA]">
                Open
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-[#EFEAE0] bg-[#FDF8F2] px-4 py-3 text-sm text-[#5B6584]">
        <span>Page {page} of {Math.max(totalPages, 1)}</span>
        <div className="flex items-center gap-2">
          <button type="button" disabled={page <= 1} onClick={() => onPageChange(page - 1)} className="rounded-lg border border-[#EFEAE0] bg-white px-3 py-2 font-medium text-[#0F1B3D] disabled:cursor-not-allowed disabled:opacity-50">Prev</button>
          <button type="button" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} className="rounded-lg border border-[#EFEAE0] bg-white px-3 py-2 font-medium text-[#0F1B3D] disabled:cursor-not-allowed disabled:opacity-50">Next</button>
        </div>
      </div>
    </div>
  );
}
