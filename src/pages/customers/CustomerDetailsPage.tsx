import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Pencil, Archive, AlertCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import AppShell from "../../components/AppShell";
import CustomerForm from "../../components/customers/CustomerForm";
import CustomerInvoiceHistory from "../../components/customers/CustomerInvoiceHistory";
import CustomerStatusBadge from "../../components/customers/CustomerStatusBadge";
import DeleteCustomerDialog from "../../components/customers/DeleteCustomerDialog";
import { customerService } from "../../services/customerService";
import type { Customer, CustomerInvoice, CustomerSummary } from "../../types/customer";
import { getErrorMessage } from "../../utils/getErrorMessage";

const currencyFormatter = (currency = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  });

export default function CustomerDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [summary, setSummary] = useState<CustomerSummary>({});
  const [invoices, setInvoices] = useState<CustomerInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [invoicePage, setInvoicePage] = useState(1);
  const [invoiceTotalPages, setInvoiceTotalPages] = useState(1);
  const [invoiceLoading, setInvoiceLoading] = useState(true);
  const [invoiceError, setInvoiceError] = useState<string | null>(null);

  const loadCustomerDetails = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const [customerData, summaryData] = await Promise.all([
        customerService.getCustomerById(id),
        customerService.getCustomersSummary(),
      ]);

      setCustomer(customerData);
      setSummary(summaryData);
    } catch (loadError) {
      setError(getErrorMessage(loadError, "Failed to load this customer."));
    } finally {
      setLoading(false);
    }
  };

  const loadInvoices = async () => {
    if (!id) return;

    try {
      setInvoiceLoading(true);
      setInvoiceError(null);

      const response = await customerService.getCustomerInvoices(id, invoicePage, 6);
      setInvoices(response.items);
      setInvoiceTotalPages(response.totalPages || 1);
    } catch (invoiceErrorValue) {
      setInvoiceError(getErrorMessage(invoiceErrorValue, "Failed to load invoice history."));
    } finally {
      setInvoiceLoading(false);
    }
  };

  useEffect(() => {
    if (!id) {
      navigate("/customers");
      return;
    }

    const fetchCustomerDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const [customerData, summaryData] = await Promise.all([
          customerService.getCustomerById(id),
          customerService.getCustomersSummary(),
        ]);

        setCustomer(customerData);
        setSummary(summaryData);
      } catch (loadError) {
        setError(getErrorMessage(loadError, "Failed to load this customer."));
      } finally {
        setLoading(false);
      }
    };

    void fetchCustomerDetails();
  }, [id, navigate]);

  useEffect(() => {
    if (!id) return;

    const fetchInvoices = async () => {
      try {
        setInvoiceLoading(true);
        setInvoiceError(null);

        const response = await customerService.getCustomerInvoices(id, invoicePage, 6);
        setInvoices(response.items);
        setInvoiceTotalPages(response.totalPages || 1);
      } catch (invoiceErrorValue) {
        setInvoiceError(getErrorMessage(invoiceErrorValue, "Failed to load invoice history."));
      } finally {
        setInvoiceLoading(false);
      }
    };

    void fetchInvoices();
  }, [id, invoicePage]);

  const handleEditSubmit = async (payload: Partial<Customer>) => {
    if (!id) return;

    try {
      setIsSubmitting(true);
      setSubmitError(null);
      await customerService.updateCustomer(id, payload);
      setEditOpen(false);
      await loadCustomerDetails();
      await loadInvoices();
    } catch (updateError) {
      setSubmitError(getErrorMessage(updateError, "Unable to save the customer details."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArchive = async () => {
    if (!id) return;

    try {
      await customerService.updateCustomer(id, { status: "archived" });
      setDeleteOpen(false);
      await loadCustomerDetails();
    } catch (archiveError) {
      setError(getErrorMessage(archiveError, "Unable to archive this customer."));
      setDeleteOpen(false);
    }
  };

  const financialCards = useMemo(
    () => [
      { label: "Total Invoiced", value: customer?.totalInvoiced ?? summary.totalInvoiced ?? 0 },
      { label: "Total Paid", value: customer?.totalPaid ?? summary.totalPaid ?? 0 },
      { label: "Outstanding Balance", value: customer?.outstandingBalance ?? summary.totalOutstandingBalance ?? 0 },
      { label: "Overdue Balance", value: customer?.overdueBalance ?? summary.overdueBalance ?? 0 },
      { label: "Invoices", value: customer?.invoiceCount ?? summary.invoiceCount ?? 0 },
    ],
    [customer, summary],
  );

  if (loading) {
    return (
      <AppShell>
        <main className="min-h-screen bg-[#FDF8F2] p-6">
          <div className="mx-auto max-w-6xl rounded-[28px] border border-[#EFEAE0] bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#E8EEFC] border-t-[#1E56CD]" />
            <p className="text-[#5B6584]">Loading customer details…</p>
          </div>
        </main>
      </AppShell>
    );
  }

  if (error || !customer) {
    return (
      <AppShell>
        <main className="min-h-screen bg-[#FDF8F2] p-6">
          <div className="mx-auto max-w-4xl rounded-[28px] border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5" />
              <div>
                <h2 className="text-lg font-bold">Customer could not be loaded</h2>
                <p className="mt-1">{error ?? "The requested customer record is not available."}</p>
                <button type="button" onClick={() => navigate("/customers")} className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
                  Back to Customers
                </button>
              </div>
            </div>
          </div>
        </main>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <main className="min-h-screen bg-[#FDF8F2]">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <button type="button" onClick={() => navigate("/customers")} className="inline-flex items-center gap-2 rounded-xl border border-[#EFEAE0] bg-white px-3 py-2 text-sm font-medium text-[#0F1B3D] hover:bg-[#F7F8FA]">
              <ArrowLeft className="h-4 w-4" />
              Back to Customers
            </button>

            <div className="flex gap-2">
              <button type="button" onClick={() => setEditOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-[#1E56CD] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#17439E]">
                <Pencil className="h-4 w-4" />
                Edit Customer
              </button>
              <button type="button" onClick={() => setDeleteOpen(true)} className="inline-flex items-center gap-2 rounded-xl border border-[#F7D9D4] bg-[#FDF0EE] px-4 py-2.5 text-sm font-semibold text-[#C4432E] hover:bg-[#F9E3DF]">
                <Archive className="h-4 w-4" />
                Deactivate
              </button>
            </div>
          </div>

          <div className="rounded-[28px] border border-[#EFEAE0] bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E8EEFC] text-lg font-bold text-[#1E56CD]">
                    {customer.name?.split(" ").map((part) => part[0]).slice(0, 2).join("") || "C"}
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-[#0F1B3D]">{customer.name ?? "Customer"}</h1>
                    <p className="text-sm text-[#5B6584]">{customer.companyName ?? "No company name provided"}</p>
                  </div>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-[#5B6584]">
                  <span>{customer.email ?? "No email"}</span>
                  <span>•</span>
                  <span>{customer.phone ?? "No phone"}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <CustomerStatusBadge status={customer.status} />
                <span className="text-sm text-[#5B6584]">Created {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : "—"}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[28px] border border-[#EFEAE0] bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-lg font-bold text-[#0F1B3D]">Customer Profile</h2>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.08em] text-[#8A93AC]">Customer name</p>
                  <p className="mt-1 text-sm font-medium text-[#0F1B3D]">{customer.name ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.08em] text-[#8A93AC]">Company</p>
                  <p className="mt-1 text-sm font-medium text-[#0F1B3D]">{customer.companyName ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.08em] text-[#8A93AC]">Email</p>
                  <p className="mt-1 text-sm font-medium text-[#0F1B3D]">{customer.email ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.08em] text-[#8A93AC]">Phone</p>
                  <p className="mt-1 text-sm font-medium text-[#0F1B3D]">{customer.phone ?? "—"}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs uppercase tracking-[0.08em] text-[#8A93AC]">Billing address</p>
                  <p className="mt-1 text-sm font-medium text-[#0F1B3D]">
                    {[customer.billingAddress, customer.city, customer.state, customer.postalCode, customer.country].filter(Boolean).join(", ") || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.08em] text-[#8A93AC]">Account status</p>
                  <div className="mt-2">
                    <CustomerStatusBadge status={customer.status} />
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.08em] text-[#8A93AC]">Date created</p>
                  <p className="mt-1 text-sm font-medium text-[#0F1B3D]">{customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : "—"}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs uppercase tracking-[0.08em] text-[#8A93AC]">Internal notes</p>
                  <p className="mt-1 text-sm leading-6 text-[#0F1B3D]">{customer.internalNotes ?? customer.notes ?? "No internal notes recorded."}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-[#EFEAE0] bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-lg font-bold text-[#0F1B3D]">Financial Overview</h2>

              <div className="mt-4 space-y-3">
                {financialCards.map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-2xl bg-[#FDF8F2] p-3">
                    <span className="text-sm text-[#5B6584]">{item.label}</span>
                    <span className="text-sm font-semibold text-[#0F1B3D]">
                      {typeof item.value === "number" && item.label !== "Invoices" ? currencyFormatter(customer.currency ?? "USD").format(item.value) : item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-[#0F1B3D]">Invoice History</h2>
            </div>
            <CustomerInvoiceHistory
              invoices={invoices}
              loading={invoiceLoading}
              error={invoiceError}
              page={invoicePage}
              totalPages={invoiceTotalPages}
              onPageChange={setInvoicePage}
              onOpenInvoice={(invoiceId) => {
                if (invoiceId) navigate(`/review/${invoiceId}`);
              }}
            />
          </div>
        </div>
      </main>

      <CustomerForm
        key={customer._id ?? customer.id ?? "customer-details"}
        open={editOpen}
        mode="edit"
        initialValues={customer}
        loading={isSubmitting}
        error={submitError}
        onClose={() => {
          setEditOpen(false);
          setSubmitError(null);
        }}
        onSubmit={handleEditSubmit}
      />

      <DeleteCustomerDialog
        open={deleteOpen}
        actionLabel="Deactivate Customer"
        title="Deactivate customer?"
        description="This will mark the customer as archived and pause active billing activity for this customer record."
        confirmText="Deactivate Customer"
        onCancel={() => setDeleteOpen(false)}
        onConfirm={() => void handleArchive()}
      />
    </AppShell>
  );
}
