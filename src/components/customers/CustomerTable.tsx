import { Eye, Pencil, Archive, ChevronLeft, ChevronRight } from "lucide-react";
import type { Customer } from "../../types/customer";
import CustomerStatusBadge from "./CustomerStatusBadge";

const formatCurrency = (value?: number, currency = "USD") => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "N/A";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatDate = (value?: string) => {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

const getInitials = (name?: string) => {
  const normalized = (name ?? "Customer").trim();
  if (!normalized) return "C";

  const parts = normalized.split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "C";
};

type CustomerTableProps = {
  customers: Customer[];
  page: number;
  totalPages: number;
  onView: (id: string) => void;
  onEdit: (customer: Customer) => void;
  onArchive: (customer: Customer) => void;
  onPageChange: (nextPage: number) => void;
};

export default function CustomerTable({
  customers,
  page,
  totalPages,
  onView,
  onEdit,
  onArchive,
  onPageChange,
}: CustomerTableProps) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-[#EFEAE0] bg-white shadow-[0_15px_45px_rgba(15,27,61,0.05)]">
      <div className="hidden border-b border-[#EFEAE0] bg-[#FDF8F2] px-6 py-4 lg:block">
        <div className="grid grid-cols-[1.3fr_1.1fr_1.1fr_1fr_1fr_1fr_0.9fr_0.8fr_120px] items-center gap-4 text-[11px] font-bold uppercase tracking-[0.12em] text-[#8A93AC]">
          <span>Customer</span>
          <span>Company</span>
          <span>Email</span>
          <span>Phone</span>
          <span>Total Invoiced</span>
          <span>Outstanding</span>
          <span>Status</span>
          <span>Date Added</span>
          <span className="text-right">Actions</span>
        </div>
      </div>

      <div className="lg:hidden space-y-3 p-4">
        {customers.map((customer) => (
          <div key={customer._id ?? customer.id ?? customer.email ?? customer.name ?? "customer-card"} className="rounded-[22px] border border-[#EFEAE0] bg-[#FFFDFC] p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8EEFC] text-sm font-bold text-[#1E56CD]">
                  {getInitials(customer.name ?? customer.customerName)}
                </div>
                <div>
                  <p className="font-bold text-[#0F1B3D]">{customer.name ?? customer.customerName ?? "Unnamed customer"}</p>
                  <p className="text-xs text-[#5B6584]">{customer.companyName ?? "No company"}</p>
                </div>
              </div>
              <CustomerStatusBadge status={customer.status} />
            </div>

            <div className="mt-4 grid gap-2 text-sm text-[#5B6584]">
              <div className="flex justify-between gap-3"><span>Email</span><span className="text-right font-medium text-[#0F1B3D]">{customer.email ?? "—"}</span></div>
              <div className="flex justify-between gap-3"><span>Phone</span><span className="text-right font-medium text-[#0F1B3D]">{customer.phone ?? "—"}</span></div>
              <div className="flex justify-between gap-3"><span>Total Invoiced</span><span className="text-right font-medium text-[#0F1B3D]">{formatCurrency(customer.totalInvoiced, customer.currency ?? "USD")}</span></div>
              <div className="flex justify-between gap-3"><span>Outstanding</span><span className="text-right font-medium text-[#0F1B3D]">{formatCurrency(customer.outstandingBalance, customer.currency ?? "USD")}</span></div>
              <div className="flex justify-between gap-3"><span>Date Added</span><span className="text-right font-medium text-[#0F1B3D]">{formatDate(customer.createdAt)}</span></div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={() => onView(customer._id ?? customer.id ?? "")} className="inline-flex items-center gap-1.5 rounded-lg border border-[#EFEAE0] bg-white px-3 py-2 text-xs font-semibold text-[#0F1B3D] hover:bg-[#F7F8FA]">
                <Eye className="h-3.5 w-3.5" />
                View
              </button>
              <button type="button" onClick={() => onEdit(customer)} className="inline-flex items-center gap-1.5 rounded-lg border border-[#EFEAE0] bg-white px-3 py-2 text-xs font-semibold text-[#0F1B3D] hover:bg-[#F7F8FA]">
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </button>
              <button type="button" onClick={() => onArchive(customer)} className="inline-flex items-center gap-1.5 rounded-lg border border-[#F7D9D4] bg-[#FDF0EE] px-3 py-2 text-xs font-semibold text-[#C4432E] hover:bg-[#F9E3DF]">
                <Archive className="h-3.5 w-3.5" />
                Archive
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden lg:block">
        {customers.map((customer, index) => (
          <div key={customer._id ?? customer.id ?? customer.email ?? customer.name ?? `customer-${index}`} className={`grid grid-cols-[1.3fr_1.1fr_1.1fr_1fr_1fr_1fr_0.9fr_0.8fr_120px] items-center gap-4 px-6 py-4 text-sm ${index !== customers.length - 1 ? "border-b border-[#EFEAE0]" : ""}`}>
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E8EEFC] text-sm font-bold text-[#1E56CD]">
                {getInitials(customer.name ?? customer.customerName)}
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-[#0F1B3D]">{customer.name ?? customer.customerName ?? "Unnamed customer"}</p>
              </div>
            </div>

            <div className="truncate text-[#5B6584]">{customer.companyName ?? "—"}</div>
            <div className="truncate text-[#5B6584]">{customer.email ?? "—"}</div>
            <div className="truncate text-[#5B6584]">{customer.phone ?? "—"}</div>
            <div className="font-medium text-[#0F1B3D]">{formatCurrency(customer.totalInvoiced, customer.currency ?? "USD")}</div>
            <div className="font-medium text-[#0F1B3D]">{formatCurrency(customer.outstandingBalance, customer.currency ?? "USD")}</div>
            <div><CustomerStatusBadge status={customer.status} /></div>
            <div className="text-[#5B6584]">{formatDate(customer.createdAt)}</div>
            <div className="flex items-center justify-end gap-1.5">
              <button type="button" onClick={() => onView(customer._id ?? customer.id ?? "")} aria-label="View customer" className="rounded-lg border border-[#EFEAE0] bg-white p-2 text-[#1E56CD] transition hover:bg-[#F7F8FA]">
                <Eye className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => onEdit(customer)} aria-label="Edit customer" className="rounded-lg border border-[#EFEAE0] bg-white p-2 text-[#0F1B3D] transition hover:bg-[#F7F8FA]">
                <Pencil className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => onArchive(customer)} aria-label="Archive customer" className="rounded-lg border border-[#F7D9D4] bg-[#FDF0EE] p-2 text-[#C4432E] transition hover:bg-[#F9E3DF]">
                <Archive className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {customers.length > 0 && (
        <div className="flex items-center justify-between border-t border-[#EFEAE0] bg-[#FDF8F2] px-4 py-3 text-sm text-[#5B6584]">
          <span>Page {page} of {Math.max(totalPages, 1)}</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="inline-flex items-center gap-1 rounded-lg border border-[#EFEAE0] bg-white px-3 py-2 font-medium text-[#0F1B3D] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="inline-flex items-center gap-1 rounded-lg border border-[#EFEAE0] bg-white px-3 py-2 font-medium text-[#0F1B3D] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
