import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { AlertCircle, ArrowLeft, CheckCircle2, FileText, Plus, UploadCloud } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AppShell from "../components/AppShell";
import { customerService } from "../services/customerService";
import type { Customer } from "../types/customer";
import { getErrorMessage } from "../utils/getErrorMessage";
import api from "../api/axios";

interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

interface StudioErrors {
  customer?: string;
  issueDate?: string;
  dueDate?: string;
  currency?: string;
  lineItems?: string;
}

const today = new Date();
const defaultDue = new Date(today);
defaultDue.setDate(defaultDue.getDate() + 14);

const formatMoney = (value: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);

function createItem(): InvoiceLineItem {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    description: "",
    quantity: 1,
    unitPrice: 0,
  };
}

export default function NativeInvoiceStudio() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const draftId = searchParams.get("draft");

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [customerQuery, setCustomerQuery] = useState("");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);
  const [validationErrors, setValidationErrors] = useState<StudioErrors>({});

  const [businessName, setBusinessName] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");

  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [issueDate, setIssueDate] = useState(today.toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState(defaultDue.toISOString().slice(0, 10));
  const [currency, setCurrency] = useState("NGN");
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState("Payment is due within 14 days. Thank you for your business.");

  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([createItem()]);
  const [discountType, setDiscountType] = useState<"percent" | "fixed">("percent");
  const [discountValue, setDiscountValue] = useState(0);
  const [taxRate, setTaxRate] = useState(0);
  const [draftResultId, setDraftResultId] = useState<string | null>(null);

  const customerSearchTimeout = useRef<number | undefined>(undefined);

  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await api.get("/settings");
        const settingsData = response.data ?? {};

        const profile = settingsData.profile ?? {};
        const branding = settingsData.branding ?? {};
        setBusinessName(branding.companyName ?? profile.companyName ?? "");
        setBusinessEmail(profile.email ?? "");
        setBusinessPhone(profile.phone ?? "");
        setBusinessAddress(branding.businessAddress ?? profile.businessAddress ?? "");
      } catch {
        // Leave defaults intact when the business profile is unavailable.
      }
    }

    void loadSettings();
  }, []);

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setLoadingCustomers(true);
        const response = await customerService.getCustomers({
          page: 1,
          limit: 50,
          search: customerQuery.trim() || undefined,
        });
        setCustomers(response.items);
      } catch {
        setCustomers([]);
      } finally {
        setLoadingCustomers(false);
      }
    };

    if (customerSearchTimeout.current) {
      window.clearTimeout(customerSearchTimeout.current);
    }

    customerSearchTimeout.current = window.setTimeout(() => {
      void loadCustomers();
    }, 300);

    return () => {
      if (customerSearchTimeout.current) {
        window.clearTimeout(customerSearchTimeout.current);
      }
    };
  }, [customerQuery]);

  useEffect(() => {
    if (draftId) {
      const loadExistingDraft = async () => {
        try {
          const invoice = await api.get(`/invoices/${draftId}/details`);
          const draft = invoice.data ?? {};
          setInvoiceNumber(draft.invoiceNumber ?? "");
          setIssueDate((draft.issueDate ?? today).toString().slice(0, 10));
          setDueDate((draft.dueDate ?? defaultDue).toString().slice(0, 10));
          setCurrency(draft.currency ?? "NGN");
          setNotes(draft.notes ?? "");
          setTerms(draft.terms ?? "Payment is due within 14 days. Thank you for your business.");
          setSelectedCustomerId(draft.customerId ?? "");
          if (Array.isArray(draft.lineItems) && draft.lineItems.length > 0) {
            setLineItems(
              draft.lineItems.map((item: any, index: number) => ({
                id: `${index}-${Date.now()}`,
                description: item.description ?? "",
                quantity: Number(item.quantity ?? 1),
                unitPrice: Number(item.unitPrice ?? 0),
              })),
            );
          }
        } catch {
          setStatus({
            type: "error",
            message: "We couldn’t load that draft yet. You can still create a new invoice.",
          });
        }
      };

      void loadExistingDraft();
    }
  }, [draftId]);

  const subtotal = useMemo(
    () =>
      lineItems.reduce((sum, item) => {
        const qty = Number(item.quantity ?? 0);
        const price = Number(item.unitPrice ?? 0);
        return sum + qty * price;
      }, 0),
    [lineItems],
  );

  const discountAmount = useMemo(() => {
    if (discountType === "percent") {
      return subtotal * (Number(discountValue ?? 0) / 100);
    }
    return Number(discountValue ?? 0);
  }, [discountType, discountValue, subtotal]);

  const taxAmount = useMemo(() => (subtotal - discountAmount) * (Number(taxRate ?? 0) / 100), [discountAmount, subtotal, taxRate]);
  const total = useMemo(() => subtotal - discountAmount + taxAmount, [discountAmount, subtotal, taxAmount]);

  const selectedCustomer = useMemo(
    () => customers.find((customer) => (customer._id ?? customer.id) === selectedCustomerId) ?? null,
    [customers, selectedCustomerId],
  );

  const handleLogoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const permitted = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!permitted.includes(file.type)) {
      setStatus({
        type: "error",
        message: "Only PNG, JPG, or WebP files are supported for invoice branding.",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setLogoPreview(String(reader.result ?? ""));
    };
    reader.readAsDataURL(file);
  };

  const updateItem = (id: string, field: "description" | "quantity" | "unitPrice", value: string | number) => {
    setLineItems((current) =>
      current.map((item) => {
        if (item.id !== id) return item;
        const next = { ...item };
        if (field === "description") next.description = String(value);
        if (field === "quantity") next.quantity = Number(value) || 0;
        if (field === "unitPrice") next.unitPrice = Number(value) || 0;
        return next;
      }),
    );
  };

  const addItem = () => setLineItems((current) => [...current, createItem()]);
  const removeItem = (id: string) => {
    if (lineItems.length === 1) {
      setLineItems([createItem()]);
      return;
    }
    setLineItems((current) => current.filter((item) => item.id !== id));
  };

  const validate = () => {
    const nextErrors: StudioErrors = {};

    if (!selectedCustomerId) nextErrors.customer = "Select a customer before creating the invoice.";
    if (!issueDate) nextErrors.issueDate = "Issue date is required.";
    if (!dueDate) nextErrors.dueDate = "Due date is required.";
    if (!currency) nextErrors.currency = "Currency is required.";

    const validItems = lineItems.filter(
      (item) => item.description.trim() || Number(item.quantity) > 0 || Number(item.unitPrice) > 0,
    );

    if (validItems.length === 0) {
      nextErrors.lineItems = "Add at least one item to the invoice.";
    }

    validItems.forEach((item) => {
      if (!item.description.trim()) {
        nextErrors.lineItems = "Each line item needs a description.";
      }
      if (Number(item.quantity) <= 0) {
        nextErrors.lineItems = "Each item needs a quantity greater than zero.";
      }
      if (Number(item.unitPrice) < 0) {
        nextErrors.lineItems = "Each unit price must be zero or greater.";
      }
    });

    setValidationErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submitInvoice = async (mode: "draft" | "final") => {
    const isValid = validate();
    if (!isValid) {
      setStatus({
        type: "error",
        message: "Please complete the required invoice fields before continuing.",
      });
      return;
    }

    setSaving(true);
    setStatus(null);

    try {
      const payload = {
        customerId: selectedCustomer?._id ?? selectedCustomer?.id,
        customerName: selectedCustomer?.name ?? selectedCustomer?.customerName ?? "",
        customerEmail: selectedCustomer?.email ?? "",
        customerPhone: selectedCustomer?.phone ?? "",
        billingAddress: selectedCustomer?.billingAddress ?? "",
        companyName: selectedCustomer?.companyName ?? "",
        invoiceNumber,
        issueDate,
        dueDate,
        currency,
        notes,
        terms,
        status: mode === "draft" ? "draft" : "pending",
        subtotal,
        total,
        discount: { type: discountType, value: Number(discountValue || 0) },
        tax: { rate: Number(taxRate || 0) },
        lineItems: lineItems.map((item) => ({
          description: item.description,
          quantity: Number(item.quantity || 0),
          unitPrice: Number(item.unitPrice || 0),
          lineTotal: Number(item.quantity || 0) * Number(item.unitPrice || 0),
        })),
      };

  let response;

if (mode === "draft" && draftId) {
  response = await api.patch(
    `/invoices/${draftId}/draft`,
    payload
  );
} else {
  response = await api.post(
    "/invoices/native",
    payload
  );
}

      const newId = response?.data?._id ?? response?.data?.id ?? response?.data?.invoice?._id ?? response?.data?.invoiceId ?? draftId;

      if (!newId) {
        throw new Error("The backend did not return an invoice ID.");
      }

      setDraftResultId(newId);
      setStatus({
        type: "success",
        message: mode === "draft"
          ? "Draft saved successfully."
          : "Invoice created successfully. You can review it now.",
      });

      if (mode === "final") {
        navigate(`/invoice/${newId}`);
      }
    } catch (error) {
      const message = getErrorMessage(error, "Native invoice creation is not yet available on the backend.");
      setStatus({
        type: "error",
        message,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <main className="min-h-screen bg-[#FDF8F2] px-4 py-8 lg:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-7 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => navigate("/view-invoices")} className="rounded-xl border border-[#EFEAE0] bg-white p-2 text-[#5B6584]">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-[#8A93AC]">Invoice Studio</p>
                <h1 className="text-3xl font-bold text-[#0F1B3D]">Native Invoice Creation</h1>
              </div>
            </div>
            <button type="button" onClick={() => navigate("/view-invoices")} className="rounded-xl border border-[#EFEAE0] bg-white px-4 py-2.5 text-sm font-semibold text-[#0F1B3D]">
              Cancel
            </button>
          </div>

          {status && (
            <div className={`mb-6 flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${status.type === "success" ? "border-[#DCE9A8] bg-[#F6FBEA] text-[#1E56CD]" : status.type === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-[#EFEAE0] bg-white text-[#0F1B3D]"}`}>
              {status.type === "success" ? <CheckCircle2 className="mt-0.5 h-5 w-5" /> : status.type === "error" ? <AlertCircle className="mt-0.5 h-5 w-5" /> : <FileText className="mt-0.5 h-5 w-5" />}
              <p>{status.message}</p>
            </div>
          )}

          <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6">
              <section className="rounded-[28px] border border-[#EFEAE0] bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-[#0F1B3D]">Business branding</h2>
                  <span className="text-xs uppercase tracking-[0.15em] text-[#8A93AC]">Optional</span>
                </div>

                <div className="grid gap-5 md:grid-cols-[180px_1fr]">
                  <div className="flex flex-col gap-3">
                    <div className="flex h-40 items-center justify-center rounded-[24px] border border-dashed border-[#A1A6A6] bg-[#FDF8F2] text-[#5B6584]">
                      {logoPreview ? (
                        <img src={logoPreview} alt="Business logo preview" className="h-full w-full rounded-[24px] object-cover" />
                      ) : (
                        <div className="text-center">
                          <UploadCloud className="mx-auto mb-2 h-8 w-8 text-[#1E56CD]" />
                          <p className="text-xs font-medium">Logo preview</p>
                        </div>
                      )}
                    </div>
                    <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#EFEAE0] bg-white px-3 py-2.5 text-sm font-semibold text-[#0F1B3D]">
                      <UploadCloud className="h-4 w-4" />
                      Upload logo
                      <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp" className="hidden" onChange={handleLogoChange} />
                    </label>
                    {logoPreview && (
                      <button type="button" onClick={() => setLogoPreview(null)} className="text-sm font-medium text-[#C4432E]">Remove logo</button>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-semibold text-[#0F1B3D]">Business name</label>
                      <input value={businessName} onChange={(event) => setBusinessName(event.target.value)} className="w-full rounded-xl border border-[#EFEAE0] bg-white px-4 py-3 text-[#0F1B3D] outline-none focus:border-[#1E56CD]" />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-[#0F1B3D]">Email</label>
                      <input value={businessEmail} onChange={(event) => setBusinessEmail(event.target.value)} className="w-full rounded-xl border border-[#EFEAE0] bg-white px-4 py-3 text-[#0F1B3D] outline-none focus:border-[#1E56CD]" />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-[#0F1B3D]">Phone</label>
                      <input value={businessPhone} onChange={(event) => setBusinessPhone(event.target.value)} className="w-full rounded-xl border border-[#EFEAE0] bg-white px-4 py-3 text-[#0F1B3D] outline-none focus:border-[#1E56CD]" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-semibold text-[#0F1B3D]">Address</label>
                      <textarea value={businessAddress} rows={3} onChange={(event) => setBusinessAddress(event.target.value)} className="w-full rounded-xl border border-[#EFEAE0] bg-white px-4 py-3 text-[#0F1B3D] outline-none focus:border-[#1E56CD]" />
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-[28px] border border-[#EFEAE0] bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-[#0F1B3D]">Customer</h2>
                  <button type="button" onClick={() => navigate("/customers")} className="text-sm font-semibold text-[#1E56CD]">Add customer</button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#0F1B3D]">Search existing customer</label>
                    <input value={customerQuery} onChange={(event) => setCustomerQuery(event.target.value)} placeholder="Search by name or email" className="w-full rounded-xl border border-[#EFEAE0] bg-white px-4 py-3 text-[#0F1B3D] outline-none focus:border-[#1E56CD]" />
                  </div>

                  <div className="rounded-2xl border border-[#EFEAE0] bg-[#FDF8F2] p-3">
                    {loadingCustomers ? (
                      <p className="text-sm text-[#5B6584]">Loading customers…</p>
                    ) : customers.length === 0 ? (
                      <p className="text-sm text-[#5B6584]">No customers match your search yet.</p>
                    ) : (
                      <div className="max-h-52 space-y-2 overflow-y-auto">
                        {customers.map((customer) => {
                          const id = customer._id ?? customer.id ?? "";
                          const isSelected = selectedCustomerId === id;
                          return (
                            <button
                              key={id}
                              type="button"
                              onClick={() => setSelectedCustomerId(id)}
                              className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left transition ${isSelected ? "border-[#1E56CD] bg-[#E8EEFC]" : "border-transparent bg-white hover:border-[#EFEAE0]"}`}
                            >
                              <div>
                                <p className="font-semibold text-[#0F1B3D]">{customer.name ?? customer.customerName ?? "Customer"}</p>
                                <p className="text-xs text-[#5B6584]">{customer.email ?? "No email"}</p>
                              </div>
                              <span className="text-xs font-medium text-[#1E56CD]">{isSelected ? "Selected" : "Select"}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {selectedCustomer && (
                    <div className="rounded-2xl border border-[#EFEAE0] bg-[#FDF8F2] p-4 text-sm text-[#5B6584]">
                      <p className="font-semibold text-[#0F1B3D]">{selectedCustomer.name ?? selectedCustomer.customerName}</p>
                      <p className="mt-1">{selectedCustomer.companyName ?? ""}</p>
                      <p className="mt-1">{selectedCustomer.email ?? ""}</p>
                      <p className="mt-1">{selectedCustomer.phone ?? ""}</p>
                      <p className="mt-1">{selectedCustomer.billingAddress ?? ""}</p>
                    </div>
                  )}

                  {validationErrors.customer && <p className="text-xs text-red-600">{validationErrors.customer}</p>}
                </div>
              </section>

              <section className="rounded-[28px] border border-[#EFEAE0] bg-white p-6 shadow-sm">
                <h2 className="mb-5 text-xl font-bold text-[#0F1B3D]">Invoice details</h2>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#0F1B3D]">Invoice number</label>
                    <input value={invoiceNumber} onChange={(event) => setInvoiceNumber(event.target.value)} placeholder="INV-1001" className="w-full rounded-xl border border-[#EFEAE0] bg-white px-4 py-3 text-[#0F1B3D] outline-none focus:border-[#1E56CD]" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#0F1B3D]">Currency</label>
                    <select value={currency} onChange={(event) => setCurrency(event.target.value)} className="w-full rounded-xl border border-[#EFEAE0] bg-white px-4 py-3 text-[#0F1B3D] outline-none focus:border-[#1E56CD]">
                      <option value="NGN">NGN</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#0F1B3D]">Issue date</label>
                    <input type="date" value={issueDate} onChange={(event) => setIssueDate(event.target.value)} className="w-full rounded-xl border border-[#EFEAE0] bg-white px-4 py-3 text-[#0F1B3D] outline-none focus:border-[#1E56CD]" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#0F1B3D]">Due date</label>
                    <input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} className="w-full rounded-xl border border-[#EFEAE0] bg-white px-4 py-3 text-[#0F1B3D] outline-none focus:border-[#1E56CD]" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-[#0F1B3D]">Notes</label>
                    <textarea rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} className="w-full rounded-xl border border-[#EFEAE0] bg-white px-4 py-3 text-[#0F1B3D] outline-none focus:border-[#1E56CD]" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-[#0F1B3D]">Terms & conditions</label>
                    <textarea rows={3} value={terms} onChange={(event) => setTerms(event.target.value)} className="w-full rounded-xl border border-[#EFEAE0] bg-white px-4 py-3 text-[#0F1B3D] outline-none focus:border-[#1E56CD]" />
                  </div>
                </div>
              </section>

              <section className="rounded-[28px] border border-[#EFEAE0] bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-[#0F1B3D]">Line items</h2>
                  <button type="button" onClick={addItem} className="inline-flex items-center gap-2 rounded-xl bg-[#1E56CD] px-3 py-2 text-sm font-semibold text-white">
                    <Plus className="h-4 w-4" />
                    Add item
                  </button>
                </div>

                <div className="space-y-4">
                  {lineItems.map((item, index) => (
                    <div key={item.id} className="rounded-2xl border border-[#EFEAE0] bg-[#FDF8F2] p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-sm font-semibold text-[#0F1B3D]">Item {index + 1}</p>
                        <button type="button" onClick={() => removeItem(item.id)} className="text-sm font-medium text-[#C4432E]">Remove</button>
                      </div>

                      <div className="grid gap-4 md:grid-cols-[1.4fr_0.8fr_0.8fr]">
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-[#0F1B3D]">Description</label>
                          <input value={item.description} onChange={(event) => updateItem(item.id, "description", event.target.value)} placeholder="Website design" className="w-full rounded-xl border border-[#EFEAE0] bg-white px-4 py-3 text-[#0F1B3D] outline-none focus:border-[#1E56CD]" />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-[#0F1B3D]">Qty</label>
                          <input type="number" min="1" value={item.quantity} onChange={(event) => updateItem(item.id, "quantity", event.target.value)} className="w-full rounded-xl border border-[#EFEAE0] bg-white px-4 py-3 text-[#0F1B3D] outline-none focus:border-[#1E56CD]" />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-[#0F1B3D]">Unit price</label>
                          <input type="number" min="0" step="0.01" value={item.unitPrice} onChange={(event) => updateItem(item.id, "unitPrice", event.target.value)} className="w-full rounded-xl border border-[#EFEAE0] bg-white px-4 py-3 text-[#0F1B3D] outline-none focus:border-[#1E56CD]" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {validationErrors.lineItems && <p className="mt-3 text-xs text-red-600">{validationErrors.lineItems}</p>}
              </section>

              <section className="rounded-[28px] border border-[#EFEAE0] bg-white p-6 shadow-sm">
                <h2 className="mb-5 text-xl font-bold text-[#0F1B3D]">Discount & tax</h2>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#0F1B3D]">Discount type</label>
                    <select value={discountType} onChange={(event) => setDiscountType(event.target.value as "percent" | "fixed")} className="w-full rounded-xl border border-[#EFEAE0] bg-white px-4 py-3 text-[#0F1B3D] outline-none focus:border-[#1E56CD]">
                      <option value="percent">Percentage</option>
                      <option value="fixed">Fixed amount</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#0F1B3D]">Discount value</label>
                    <input type="number" min="0" step="0.01" value={discountValue} onChange={(event) => setDiscountValue(Number(event.target.value) || 0)} className="w-full rounded-xl border border-[#EFEAE0] bg-white px-4 py-3 text-[#0F1B3D] outline-none focus:border-[#1E56CD]" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#0F1B3D]">Tax rate %</label>
                    <input type="number" min="0" step="0.01" value={taxRate} onChange={(event) => setTaxRate(Number(event.target.value) || 0)} className="w-full rounded-xl border border-[#EFEAE0] bg-white px-4 py-3 text-[#0F1B3D] outline-none focus:border-[#1E56CD]" />
                  </div>
                </div>
              </section>
            </div>

            <aside className="space-y-6">
              <div className="rounded-[28px] border border-[#EFEAE0] bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-[#0F1B3D]">Invoice summary</h2>
                  <span className="rounded-full bg-[#E8EEFC] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#1E56CD]">Preview</span>
                </div>

                <div className="space-y-3 text-sm text-[#5B6584]">
                  <div className="flex items-center justify-between"><span>Subtotal</span><span className="font-semibold text-[#0F1B3D]">{formatMoney(subtotal)}</span></div>
                  <div className="flex items-center justify-between"><span>Discount</span><span className="font-semibold text-[#0F1B3D]">-{formatMoney(discountAmount)}</span></div>
                  <div className="flex items-center justify-between"><span>Tax</span><span className="font-semibold text-[#0F1B3D]">{formatMoney(taxAmount)}</span></div>
                  <div className="mt-4 border-t border-[#EFEAE0] pt-4 flex items-center justify-between text-base font-bold text-[#0F1B3D]"><span>Total</span><span>{formatMoney(total)}</span></div>
                </div>
              </div>

              <div className="rounded-[28px] border border-[#EFEAE0] bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-bold text-[#0F1B3D]">Live preview</h3>
                <div className="rounded-[24px] border border-[#EFEAE0] bg-[#FDF8F2] p-5 text-[#0F1B3D]">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8EEFC] text-lg font-bold text-[#1E56CD]">
                        {businessName ? businessName.slice(0, 2).toUpperCase() : "C"}
                      </div>
                      <p className="font-bold">{businessName || "Business name"}</p>
                    </div>
                    <div className="text-right text-xs text-[#5B6584]">
                      <p className="font-bold text-[#0F1B3D]">Invoice</p>
                      <p>{invoiceNumber || "INV-0000"}</p>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-[#5B6584]">
                    <p>{businessEmail || "hello@company.com"}</p>
                    <p>{businessPhone || "+234 800 000 0000"}</p>
                    <p>{businessAddress || "Business address"}</p>
                  </div>

                  <div className="mt-4 border-t border-[#EFEAE0] pt-4 text-xs text-[#5B6584]">
                    <div className="flex items-center justify-between"><span>Issue date</span><span>{issueDate}</span></div>
                    <div className="mt-2 flex items-center justify-between"><span>Due date</span><span>{dueDate}</span></div>
                    <div className="mt-2 flex items-center justify-between"><span>Customer</span><span>{selectedCustomer?.name ?? "Customer"}</span></div>
                  </div>

                  <div className="mt-4 space-y-2 text-xs">
                    {lineItems.map((item, index) => (
                      <div key={item.id} className="flex items-center justify-between gap-3">
                        <div className="flex-1">
                          <p className="font-medium text-[#0F1B3D]">{item.description || `Item ${index + 1}`}</p>
                          <p className="text-[#5B6584]">{item.quantity} × {formatMoney(Number(item.unitPrice || 0))}</p>
                        </div>
                        <p className="font-semibold text-[#0F1B3D]">{formatMoney(Number(item.quantity || 0) * Number(item.unitPrice || 0))}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 border-t border-[#EFEAE0] pt-4 text-xs text-[#5B6584]">
                    <div className="flex items-center justify-between"><span>Subtotal</span><span>{formatMoney(subtotal)}</span></div>
                    <div className="mt-2 flex items-center justify-between"><span>Tax</span><span>{formatMoney(taxAmount)}</span></div>
                    <div className="mt-2 flex items-center justify-between"><span>Total</span><span className="font-bold text-[#0F1B3D]">{formatMoney(total)}</span></div>
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-[#EFEAE0] bg-white p-6 shadow-sm">
                <div className="flex gap-3">
                  <button type="button" onClick={() => void submitInvoice("draft")} disabled={saving} className="flex-1 rounded-xl border border-[#EFEAE0] bg-white px-4 py-3 text-sm font-semibold text-[#0F1B3D] disabled:cursor-not-allowed disabled:opacity-60">
                    {saving ? "Saving…" : "Save as draft"}
                  </button>
                  <button type="button" onClick={() => void submitInvoice("final")} disabled={saving} className="flex-1 rounded-xl bg-[#1E56CD] px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">
                    {saving ? "Generating…" : "Generate invoice"}
                  </button>
                </div>
                {draftResultId && (
                  <button type="button" onClick={() => navigate(`/invoice/${draftResultId}`)} className="mt-3 w-full rounded-xl border border-[#EFEAE0] bg-[#FDF8F2] px-4 py-3 text-sm font-semibold text-[#0F1B3D]">
                    View created invoice
                  </button>
                )}
              </div>
            </aside>
          </div>
        </div>
      </main>
    </AppShell>
  );
}
