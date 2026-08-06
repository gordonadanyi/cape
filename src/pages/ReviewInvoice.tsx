import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import PdfPreview from "../components/review/PdfPreview";
import EmailComposer from "../components/review/EmailComposer";
import api from "../api/axios";
import { getErrorMessage } from "../utils/getErrorMessage";

interface Invoice {
  _id: string;
  originalName: string;
  customerName?: string;
  customerEmail?: string;
  invoiceNumber?: string;
  amountDue?: number;
  dueDate?: string;
  subjectLine?: string;
  personalMessage?: string;
  status: string;
}



export default function ReviewInvoice() {
  const [settings, setSettings] = useState<any>(null);
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    invoiceNumber: "",
    amountDue: "",
    dueDate: "",
    subjectLine: "",
    personalMessage: "",
    sendAt: "",
  });

  useEffect(() => {
    loadInvoice();
  }, []);

async function loadInvoice() {
  try {
    // Get invoice details
    const invoiceRes = await api.get(`/invoices/${id}/details`);

    // Get user's settings
    const settingsRes = await api.get("/settings");
    console.log("SETTINGS:", settingsRes.data);
    console.log("EMAIL SETTINGS:", settingsRes.data.email);

    const invoice = invoiceRes.data;
    const emailSettings = settingsRes.data.email || {};

    setInvoice(invoice);
    setSettings(settingsRes.data);

    // Default email template from settings
    const defaultSubject =
      emailSettings.defaultSubject || "Invoice";

    const defaultMessage =
      emailSettings.defaultMessage ||
      "Hello {{customerName}},\n\nPlease find your invoice attached.";

    const signature =
      emailSettings.signature || "";

      const companyName =
  settingsRes.data.branding?.companyName || "";

    // Replace placeholders
    const message = defaultMessage
      .replaceAll(
        "{{customerName}}",
        invoice.customerName || ""
      )
      .replaceAll(
        "{{invoiceNumber}}",
        invoice.invoiceNumber || ""
      )
      .replaceAll(
        "{{amountDue}}",
        invoice.amountDue
          ? String(invoice.amountDue)
          : ""
      )
      .replaceAll(
        "{{dueDate}}",
        invoice.dueDate
          ? new Date(invoice.dueDate).toLocaleDateString()
          : ""
      );

    const finalSignature = signature
  .replaceAll("{{companyName}}", companyName);

const fullMessage = `${message}

${finalSignature}`;

 setForm({
  customerName: invoice.customerName || "",
  customerEmail: invoice.customerEmail || "",
  invoiceNumber: invoice.invoiceNumber || "",
  amountDue: invoice.amountDue
    ? String(invoice.amountDue)
    : "",
  dueDate: invoice.dueDate
    ? invoice.dueDate.substring(0, 10)
    : "",

  // Always use the user's default email settings
  subjectLine: defaultSubject,

  personalMessage: fullMessage,

  sendAt: "",
});
  } catch (err) {
    setError(getErrorMessage(err, "Couldn't load this invoice."));
  } finally {
    setLoading(false);
  }
}

  async function handleSendNow() {
  if (!form.customerEmail.trim()) {
    setError("Add a recipient email before sending.");
    return;
  }

  setSubmitting(true);
  setError(null);

  try {
    // Save latest edits
    await api.patch(`/invoices/${id}/draft`, {
      customerName: form.customerName,
      customerEmail: form.customerEmail,
      invoiceNumber: form.invoiceNumber,
      amountDue: form.amountDue ? Number(form.amountDue) : undefined,
      dueDate: form.dueDate || undefined,
      subjectLine: form.subjectLine,
      personalMessage: form.personalMessage,
    });

    // Actually send the email
    await api.post(`/invoices/${id}/send`);

    setStatusMessage("Invoice sent successfully!");

    setTimeout(() => {
      navigate("/view-invoices");
    }, 1000);

  } catch (err) {
    setError(
      getErrorMessage(
        err,
        "Couldn't send this invoice. Please try again."
      )
    );
  } finally {
    setSubmitting(false);
  }
}

  async function handleSchedule() {
    if (!form.customerEmail.trim()) {
      setError("Add a recipient email before scheduling.");
      return;
    }
    if (!form.sendAt) {
      setError("Pick a date and time to schedule this for.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await api.patch(`/invoices/${id}/draft`, {
        customerName: form.customerName,
        customerEmail: form.customerEmail,
        invoiceNumber: form.invoiceNumber,
        amountDue: form.amountDue ? Number(form.amountDue) : undefined,
        dueDate: form.dueDate || undefined,
        subjectLine: form.subjectLine,
        personalMessage: form.personalMessage,
        sendAt: new Date(form.sendAt).toISOString(),
      });

      setStatusMessage("Invoice scheduled!");
      setTimeout(() => navigate("/view-invoices"), 1000);
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't schedule this invoice. Please try again."));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading Invoice...
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-[#FDF8F2]">

    {/* Navbar */}

    <nav className="bg-white border-b border-[#EFEAE0]">

      <div className="max-w-[1700px] mx-auto flex items-center gap-4 px-8 py-5">

        <button
          onClick={() => navigate("/view-invoices")}
          className="rounded-xl p-2 hover:bg-[#FDF8F2]"
        >
          <ArrowLeft />
        </button>

        <div>

          <h1 className="text-3xl font-bold text-[#0F1B3D]">
            Review & Send
          </h1>

          <p className="text-[#000000]">
            Review extracted information before sending.
          </p>

        </div>

      </div>

    </nav>

    {(error || statusMessage) && (
      <div className="max-w-[1700px] mx-auto px-8 pt-6">
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {statusMessage && (
          <div className="rounded-2xl border border-[#EFEAE0] bg-white px-5 py-3 text-sm font-medium text-[#1E56CD]">
            {statusMessage}
          </div>
        )}
      </div>
    )}

    <div className="max-w-[1700px] mx-auto py-10 px-8">

      <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8">

        {invoice && (

          <PdfPreview
            invoiceId={invoice._id}
          />

        )}

        <EmailComposer
          form={form}
          setForm={setForm} 
          branding={settings?.branding}
          onSend={handleSendNow}
          onSchedule={handleSchedule}
          submitting={submitting}
        />

       

      </div>

    </div>

  </div>
);
}