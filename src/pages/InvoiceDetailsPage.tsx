import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Download, Mail, CreditCard, PencilLine } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import AppShell from "../components/AppShell";
import api from "../api/axios";
import { getErrorMessage } from "../utils/getErrorMessage";
import { invoiceService } from "../services/invoiceService";

interface InvoiceDetail {
  _id?: string;
  id?: string;
  invoiceNumber?: string;
  customerName?: string;
  customerEmail?: string;
  companyName?: string;
  billingAddress?: string;
  issueDate?: string;
  dueDate?: string;
  status?: string;
  paymentStatus?: string;
  amountDue?: number;
  amountPaid?: number;
  subtotal?: number;
  discount?: number;
  tax?: number;
  total?: number;
  notes?: string;
  terms?: string;
  lineItems?: Array<{
    description?: string;
    quantity?: number;
    unitPrice?: number;
    lineTotal?: number;
  }>;
  createdAt?: string;
}

function formatCurrency(value?: number) {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return "₦0.00";
  }

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(value);
}

function formatDate(date?: string) {
  if (!date) return "—";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function InvoiceDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        const [invoiceData, settingsData] = await Promise.all([
          invoiceService.getInvoiceById(id),
          api.get("/settings").catch(() => ({ data: {} })),
        ]);

        setInvoice(invoiceData as InvoiceDetail);
        setSettings(settingsData.data ?? {});
      } catch (err) {
        setError(getErrorMessage(err, "Couldn't load the invoice details."));
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [id]);

  const totalOutstanding = useMemo(() => {
    if (!invoice) return 0;
    return Math.max((invoice.amountDue ?? invoice.total ?? 0) - (invoice.amountPaid ?? 0), 0);
  }, [invoice]);

  async function handleDownload() {
    if (!id) return;

    try {
      const blob = await invoiceService.downloadInvoicePdf(id);
      const url = URL.createObjectURL(blob);
      const newTab = window.open(url, "_blank", "noopener,noreferrer");

      if (!newTab) {
        window.location.href = url;
      }
    } catch (err) {
      setError(getErrorMessage(err, "PDF download is not available for this invoice yet."));
    }
  }

  if (loading) {
    return (
      <AppShell>
        <main className="min-h-screen bg-[#FDF8F2] px-4 py-10">
          <div className="mx-auto max-w-6xl rounded-[30px] border border-[#EFEAE0] bg-white p-8 text-center shadow-sm">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#E8EEFC] border-t-[#1E56CD]" />
            <p className="mt-4 text-[#5B6584]">Loading invoice…</p>
          </div>
        </main>
      </AppShell>
    );
  }

  if (error || !invoice) {
    return (
      <AppShell>
        <main className="min-h-screen bg-[#FDF8F2] px-4 py-10">
          <div className="mx-auto max-w-4xl rounded-[30px] border border-[#EFEAE0] bg-white p-8 text-center shadow-sm">
            <p className="text-lg font-semibold text-[#0F1B3D]">Unable to open this invoice</p>
            <p className="mt-2 text-[#5B6584]">{error ?? "This invoice could not be loaded."}</p>
            <button
              type="button"
              onClick={() => navigate("/view-invoices")}
              className="mt-6 rounded-xl bg-[#1E56CD] px-4 py-3 text-sm font-semibold text-white"
            >
              Back to invoices
            </button>
          </div>
        </main>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <main className="min-h-screen bg-[#FDF8F2] px-4 py-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/view-invoices")}
                className="rounded-xl border border-[#EFEAE0] bg-white p-2 text-[#5B6584]"
                aria-label="Back to invoices"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-[#8A93AC]">Invoice</p>
                <h1 className="text-3xl font-bold text-[#0F1B3D]">{invoice.invoiceNumber ?? "Invoice"}</h1>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={handleDownload} className="inline-flex items-center gap-2 rounded-xl border border-[#EFEAE0] bg-white px-4 py-2.5 text-sm font-semibold text-[#0F1B3D]">
                <Download className="h-4 w-4" />
                Download PDF
              </button>
              <button type="button" onClick={() => navigate(`/review/${id}`)} className="inline-flex items-center gap-2 rounded-xl bg-[#1E56CD] px-4 py-2.5 text-sm font-semibold text-white">
                <Mail className="h-4 w-4" />
                Send Invoice
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
          )}

          <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
            <section className="rounded-[28px] border border-[#EFEAE0] bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-start justify-between gap-4 border-b border-[#EFEAE0] pb-6">
                <div>
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8EEFC] text-lg font-bold text-[#1E56CD]">
                    {settings?.branding?.companyName ? settings.branding.companyName.slice(0, 2).toUpperCase() : "C"}
                  </div>
                  <h2 className="text-xl font-bold text-[#0F1B3D]">{settings?.branding?.companyName ?? settings?.profile?.companyName ?? "Cape Business"}</h2>
                  <p className="mt-1 text-sm text-[#5B6584]">{settings?.profile?.businessAddress ?? settings?.branding?.businessAddress ?? ""}</p>
                </div>

                <div className="text-right text-sm text-[#5B6584]">
                  <p className="font-semibold text-[#0F1B3D]">Status</p>
                  <p className="mt-1 inline-flex rounded-full bg-[#E8EEFC] px-3 py-1 text-xs font-bold text-[#1E56CD]">{invoice.status ?? "pending"}</p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-[#8A93AC]">Bill to</p>
                  <div className="mt-3 space-y-1 text-sm text-[#5B6584]">
                    <p className="font-semibold text-[#0F1B3D]">{invoice.customerName ?? "Customer"}</p>
                    <p>{invoice.companyName ?? ""}</p>
                    <p>{invoice.customerEmail ?? ""}</p>
                    <p>{invoice.billingAddress ?? ""}</p>
                  </div>
                </div>

                <div className="space-y-3 text-sm text-[#5B6584]">
                  <div className="flex items-center justify-between gap-3"><span>Issue date</span><span className="font-medium text-[#0F1B3D]">{formatDate(invoice.issueDate)}</span></div>
                  <div className="flex items-center justify-between gap-3"><span>Due date</span><span className="font-medium text-[#0F1B3D]">{formatDate(invoice.dueDate)}</span></div>
                  <div className="flex items-center justify-between gap-3"><span>Payment status</span><span className="font-medium text-[#0F1B3D]">{invoice.paymentStatus ?? "pending"}</span></div>
                </div>
              </div>

              <div className="mt-8 overflow-hidden rounded-2xl border border-[#EFEAE0]">
                <table className="min-w-full divide-y divide-[#EFEAE0] text-left text-sm">
                  <thead className="bg-[#FDF8F2] text-[#8A93AC]">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Description</th>
                      <th className="px-4 py-3 font-semibold">Qty</th>
                      <th className="px-4 py-3 font-semibold">Unit</th>
                      <th className="px-4 py-3 font-semibold">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFEAE0]">
                    {(invoice.lineItems ?? []).map((item, index) => (
                      <tr key={`${item.description ?? "item"}-${index}`}>
                        <td className="px-4 py-3 text-[#0F1B3D]">{item.description ?? "—"}</td>
                        <td className="px-4 py-3 text-[#5B6584]">{item.quantity ?? 0}</td>
                        <td className="px-4 py-3 text-[#5B6584]">{formatCurrency(item.unitPrice)}</td>
                        <td className="px-4 py-3 font-semibold text-[#0F1B3D]">{formatCurrency(item.lineTotal ?? Number(item.quantity ?? 0) * Number(item.unitPrice ?? 0))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-[1fr_280px]">
                <div className="rounded-2xl border border-[#EFEAE0] bg-[#FDF8F2] p-4">
                  <p className="text-sm font-semibold text-[#0F1B3D]">Notes</p>
                  <p className="mt-2 text-sm text-[#5B6584]">{invoice.notes || "No notes provided."}</p>
                  <p className="mt-4 text-sm font-semibold text-[#0F1B3D]">Terms</p>
                  <p className="mt-2 text-sm text-[#5B6584]">{invoice.terms || "Standard payment terms apply."}</p>
                </div>

                <div className="rounded-2xl border border-[#EFEAE0] p-4">
                  <div className="flex items-center justify-between text-sm text-[#5B6584]"><span>Subtotal</span><span>{formatCurrency(invoice.subtotal ?? invoice.amountDue)}</span></div>
                  <div className="mt-3 flex items-center justify-between text-sm text-[#5B6584]"><span>Discount</span><span>-{formatCurrency(invoice.discount)}</span></div>
                  <div className="mt-3 flex items-center justify-between text-sm text-[#5B6584]"><span>Tax</span><span>{formatCurrency(invoice.tax)}</span></div>
                  <div className="mt-4 border-t border-[#EFEAE0] pt-4 flex items-center justify-between text-base font-bold text-[#0F1B3D]"><span>Total</span><span>{formatCurrency(invoice.total ?? invoice.amountDue)}</span></div>
                  <div className="mt-4 border-t border-[#EFEAE0] pt-4 flex items-center justify-between text-sm text-[#5B6584]"><span>Outstanding</span><span className="font-semibold text-[#C4432E]">{formatCurrency(totalOutstanding)}</span></div>
                </div>
              </div>
            </section>

            <aside className="space-y-6">
              <div className="rounded-[28px] border border-[#EFEAE0] bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-xl bg-[#E8EEFC] p-2 text-[#1E56CD]">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-[#0F1B3D]">Payments</h3>
                </div>
                <div className="space-y-3 text-sm text-[#5B6584]">
                  <div className="flex items-center justify-between"><span>Amount paid</span><span className="font-semibold text-[#0F1B3D]">{formatCurrency(invoice.amountPaid)}</span></div>
                  <div className="flex items-center justify-between"><span>Outstanding</span><span className="font-semibold text-[#C4432E]">{formatCurrency(totalOutstanding)}</span></div>
                </div>
                <button type="button" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1E56CD] px-4 py-3 text-sm font-semibold text-white">
                  <CreditCard className="h-4 w-4" />
                  Initialize payment
                </button>
              </div>

              <div className="rounded-[28px] border border-[#EFEAE0] bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-xl bg-[#FDF8F2] p-2 text-[#1E56CD]">
                    <PencilLine className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-[#0F1B3D]">Actions</h3>
                </div>
                <div className="space-y-2">
                  <button type="button" onClick={handleDownload} className="w-full rounded-xl border border-[#EFEAE0] bg-white px-4 py-2.5 text-sm font-semibold text-[#0F1B3D]">Download PDF</button>
                  <button type="button" onClick={() => navigate(`/review/${id}`)} className="w-full rounded-xl border border-[#EFEAE0] bg-white px-4 py-2.5 text-sm font-semibold text-[#0F1B3D]">Send invoice</button>
                  <button type="button" onClick={() => navigate(`/invoice-studio?draft=${id}`)} className="w-full rounded-xl border border-[#EFEAE0] bg-white px-4 py-2.5 text-sm font-semibold text-[#0F1B3D]">Edit draft</button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </AppShell>
  );
}
