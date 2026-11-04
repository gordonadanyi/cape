import { useMemo, useState } from "react";
import { X } from "lucide-react";
import type { Customer } from "../../types/customer";

export type CustomerFormValues = {
  name: string;
  companyName: string;
  email: string;
  phone: string;
  billingAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  internalNotes: string;
  status: "active" | "inactive" | "archived";
};

function normalizeFormValue(initial?: Partial<Customer>): CustomerFormValues {
  const candidate = initial ?? {};
  const nextStatus =
    typeof candidate.status === "string"
      ? candidate.status.toLowerCase()
      : candidate.isActive === false
        ? "inactive"
        : "active";

  return {
    name: candidate.name ?? candidate.customerName ?? "",
    companyName: candidate.companyName ?? candidate.company ?? "",
    email: candidate.email ?? "",
    phone: candidate.phone ?? "",
    billingAddress: candidate.billingAddress ?? "",
    city: candidate.city ?? "",
    state: candidate.state ?? "",
    postalCode: candidate.postalCode ?? "",
    country: candidate.country ?? "",
    internalNotes: candidate.internalNotes ?? candidate.notes ?? "",
    status: nextStatus === "archived" || nextStatus === "inactive" || nextStatus === "active" ? nextStatus : "active",
  };
}

type CustomerFormProps = {
  open: boolean;
  mode: "create" | "edit";
  initialValues?: Partial<Customer>;
  loading?: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (payload: Partial<Customer>) => Promise<void> | void;
};

export default function CustomerForm({
  open,
  mode,
  initialValues,
  loading = false,
  error,
  onClose,
  onSubmit,
}: CustomerFormProps) {
  const [form, setForm] = useState<CustomerFormValues>(() => normalizeFormValue(initialValues));
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  const title = useMemo(() => (mode === "create" ? "Add Customer" : "Edit Customer"), [mode]);

  if (!open) {
    return null;
  }

  const handleChange = (field: keyof CustomerFormValues, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = form.name.trim();
    const trimmedEmail = form.email.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmedName) {
      setValidationMessage("Customer name is required.");
      return;
    }

    if (trimmedEmail && !emailPattern.test(trimmedEmail)) {
      setValidationMessage("Please enter a valid email address.");
      return;
    }

    setValidationMessage(null);

    const payload: Partial<Customer> = {
      name: trimmedName,
      companyName: form.companyName.trim(),
      email: trimmedEmail,
      phone: form.phone.trim(),
      billingAddress: form.billingAddress.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      postalCode: form.postalCode.trim(),
      country: form.country.trim(),
      internalNotes: form.internalNotes.trim(),
      status: form.status,
    };

    await onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F1B3D]/35 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[30px] border border-[#EFEAE0] bg-white shadow-[0_20px_50px_rgba(15,27,61,0.15)]">
        <div className="flex items-center justify-between border-b border-[#EFEAE0] px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-xl font-bold text-[#0F1B3D]">{title}</h2>
            <p className="text-sm text-[#5B6584]">Keep the customer profile current and accurate.</p>
          </div>

          <button type="button" onClick={onClose} className="rounded-full p-2 text-[#5B6584] transition hover:bg-[#F7F8FA]" aria-label="Close form">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-5 sm:p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-[#0F1B3D]" htmlFor="customer-name">
                Customer Name <span className="text-[#C4432E]">*</span>
              </label>
              <input
                id="customer-name"
                value={form.name}
                onChange={(event) => handleChange("name", event.target.value)}
                placeholder="Jane Smith"
                className="w-full rounded-xl border border-[#EFEAE0] bg-[#FDF8F2] px-4 py-3 text-sm text-[#0F1B3D] outline-none transition focus:border-[#1E56CD]"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#0F1B3D]" htmlFor="company-name">
                Company Name
              </label>
              <input
                id="company-name"
                value={form.companyName}
                onChange={(event) => handleChange("companyName", event.target.value)}
                placeholder="Cape & Co"
                className="w-full rounded-xl border border-[#EFEAE0] bg-[#FDF8F2] px-4 py-3 text-sm text-[#0F1B3D] outline-none transition focus:border-[#1E56CD]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#0F1B3D]" htmlFor="status">
                Status
              </label>
              <select
                id="status"
                value={form.status}
                onChange={(event) => handleChange("status", event.target.value)}
                className="w-full rounded-xl border border-[#EFEAE0] bg-[#FDF8F2] px-4 py-3 text-sm text-[#0F1B3D] outline-none transition focus:border-[#1E56CD]"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#0F1B3D]" htmlFor="customer-email">
                Email Address
              </label>
              <input
                id="customer-email"
                type="email"
                value={form.email}
                onChange={(event) => handleChange("email", event.target.value)}
                placeholder="jane@company.com"
                className="w-full rounded-xl border border-[#EFEAE0] bg-[#FDF8F2] px-4 py-3 text-sm text-[#0F1B3D] outline-none transition focus:border-[#1E56CD]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#0F1B3D]" htmlFor="customer-phone">
                Phone Number
              </label>
              <input
                id="customer-phone"
                value={form.phone}
                onChange={(event) => handleChange("phone", event.target.value)}
                placeholder="(555) 123-4567"
                className="w-full rounded-xl border border-[#EFEAE0] bg-[#FDF8F2] px-4 py-3 text-sm text-[#0F1B3D] outline-none transition focus:border-[#1E56CD]"
              />
            </div>
          </div>

          <div className="rounded-[22px] border border-[#EFEAE0] bg-[#FDF8F2] p-4">
            <h3 className="mb-4 text-base font-bold text-[#0F1B3D]">Billing Information</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-[#0F1B3D]" htmlFor="billing-address">
                  Billing Address
                </label>
                <input
                  id="billing-address"
                  value={form.billingAddress}
                  onChange={(event) => handleChange("billingAddress", event.target.value)}
                  placeholder="123 Business Ave"
                  className="w-full rounded-xl border border-[#EFEAE0] bg-white px-4 py-3 text-sm text-[#0F1B3D] outline-none transition focus:border-[#1E56CD]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#0F1B3D]" htmlFor="city">
                  City
                </label>
                <input
                  id="city"
                  value={form.city}
                  onChange={(event) => handleChange("city", event.target.value)}
                  className="w-full rounded-xl border border-[#EFEAE0] bg-white px-4 py-3 text-sm text-[#0F1B3D] outline-none transition focus:border-[#1E56CD]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#0F1B3D]" htmlFor="state">
                  State
                </label>
                <input
                  id="state"
                  value={form.state}
                  onChange={(event) => handleChange("state", event.target.value)}
                  className="w-full rounded-xl border border-[#EFEAE0] bg-white px-4 py-3 text-sm text-[#0F1B3D] outline-none transition focus:border-[#1E56CD]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#0F1B3D]" htmlFor="postal-code">
                  Postal Code
                </label>
                <input
                  id="postal-code"
                  value={form.postalCode}
                  onChange={(event) => handleChange("postalCode", event.target.value)}
                  className="w-full rounded-xl border border-[#EFEAE0] bg-white px-4 py-3 text-sm text-[#0F1B3D] outline-none transition focus:border-[#1E56CD]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#0F1B3D]" htmlFor="country">
                  Country
                </label>
                <input
                  id="country"
                  value={form.country}
                  onChange={(event) => handleChange("country", event.target.value)}
                  className="w-full rounded-xl border border-[#EFEAE0] bg-white px-4 py-3 text-sm text-[#0F1B3D] outline-none transition focus:border-[#1E56CD]"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#0F1B3D]" htmlFor="internal-notes">
              Internal Notes
            </label>
            <textarea
              id="internal-notes"
              value={form.internalNotes}
              onChange={(event) => handleChange("internalNotes", event.target.value)}
              rows={4}
              placeholder="Notes for collections, billing follow-ups, or relationship context."
              className="w-full rounded-xl border border-[#EFEAE0] bg-[#FDF8F2] px-4 py-3 text-sm text-[#0F1B3D] outline-none transition focus:border-[#1E56CD]"
            />
          </div>

          {(validationMessage || error) && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {validationMessage ?? error}
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 border-t border-[#EFEAE0] pt-4 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="rounded-xl border border-[#EFEAE0] bg-white px-4 py-2.5 text-sm font-medium text-[#0F1B3D] transition hover:bg-[#F7F8FA]">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="rounded-xl bg-[#1E56CD] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#17439E] disabled:cursor-not-allowed disabled:bg-[#A1A6A6]">
              {loading ? (mode === "create" ? "Creating..." : "Saving...") : mode === "create" ? "Create Customer" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
