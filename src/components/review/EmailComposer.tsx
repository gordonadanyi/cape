import { useState } from "react";
import {
  ChevronDown,
  Clock3,
  Send,
  AlertCircle,
} from "lucide-react";

interface Props {
  branding?: {
    companyName?: string;
    website?: string;
    businessAddress?: string;
  }


  form: {
    customerEmail: string;
    subjectLine: string;
    personalMessage: string;
    sendAt: string;
  };

  setForm: React.Dispatch<
    React.SetStateAction<{
      customerName: string;
      customerEmail: string;
      invoiceNumber: string;
      amountDue: string;
      dueDate: string;
      subjectLine: string;
      personalMessage: string;
      sendAt: string;
    }>
  >;

  onSend: () => void;

  onSchedule: () => void;

  submitting?: boolean;
}

export default function EmailComposer({
  form,
  setForm,
  branding,
  onSend,
  onSchedule,
  submitting,
}: Props) {
  const [showSchedule, setShowSchedule] = useState(false);

  return (
    <div className="rounded-[32px] border border-[#EFEAE0] bg-white shadow-sm overflow-hidden">

      {/* Header */}

      <div className="border-b border-[#EFEAE0] px-8 py-6">

        <h2 className="text-2xl font-semibold text-[#0F1B3D]">
          Compose Email
        </h2>

        <p className="mt-1 text-[#000000]">
          Review before sending to your client.
        </p>

      </div>

      <div className="p-8 space-y-6">

        {/* TO */}

        <div>

          <label className="text-sm font-semibold text-[#000000]">
            To
          </label>

          <input
            value={form.customerEmail}
            onChange={(e)=>
              setForm(prev=>({
                ...prev,
                customerEmail:e.target.value
              }))
            }
            placeholder="customer@email.com"
            className="mt-2 w-full rounded-xl border border-[#EFEAE0] p-4 outline-none focus:border-[#1E56CD]"
          />

          {!form.customerEmail && (

            <div className="mt-3 flex items-center gap-2 rounded-xl bg-orange-50 px-3 py-2 text-sm text-orange-700">

              <AlertCircle size={16}/>

              Please confirm customer's email address.

            </div>

          )}

        </div>

        {/* SUBJECT */}

        <div>

          <label className="text-sm font-semibold text-[#000000]">
            Subject
          </label>

          <input
            value={form.subjectLine}
            onChange={(e)=>
              setForm(prev=>({
                ...prev,
                subjectLine:e.target.value
              }))
            }
            className="mt-2 w-full rounded-xl border border-[#EFEAE0] p-4 outline-none focus:border-[#1E56CD]"
          />

        </div>

        {/* MESSAGE */}

<div>

  <label className="text-sm font-semibold text-[#000000]">
    Message
  </label>

  <div className="mt-2 overflow-hidden rounded-xl border border-[#EFEAE0]">

    {/* Editable Message */}

    <textarea
      rows={12}
      value={form.personalMessage}
      onChange={(e) =>
        setForm((prev) => ({
          ...prev,
          personalMessage: e.target.value,
        }))
      }
      className="w-full resize-none border-0 p-5 outline-none"
    />

    {/* Read-only Company Footer */}

    <div className="border-t border-[#EFE7D6] bg-[#FDF8F2] px-5 py-4">

      {/* <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#7A7A7A]">
        Company Signature (Auto Generated)
      </p> */}

      <p className="font-semibold text-[#0F1B3D]">
        {branding?.companyName || "Company Name"}
      </p>

      {branding?.website && (
        <p className="mt-2 text-sm text-gray-600">
          🌐 {branding.website}
        </p>
      )}

      {branding?.businessAddress && (
        <p className="mt-2 whitespace-pre-line text-[#000000]">
          📍 {branding.businessAddress}
        </p>
      )}

    </div>

  </div>

</div>

      </div>

      {/* FOOTER */}
      {/* COMPANY FOOTER */}

{/* <div>

  <div className="mt-2 rounded-xl border border-[#EFEAE0] bg-[#FDF8F2] p-5">

    <p className="font-semibold text-[#0F1B3D]">
      {branding?.companyName || "Company Name"}
    </p>

    {branding?.website && (
      <p className="mt-2 text-[#1E56CD]">
        🌐 {branding.website}
      </p>
    )}

    {branding?.businessAddress && (
      <p className="mt-2 whitespace-pre-line text-[#1E56CD]">
        📍 {branding.businessAddress}
      </p>
    )}

  </div>

</div> */}

      <div className="flex items-center justify-between border-t border-[#EFEAE0] bg-[#FDF8F2] px-8 py-5">

        <div className="relative flex">

          <button
            onClick={onSend}
            disabled={submitting}
            className="rounded-l-full bg-[#1E56CD] px-8 py-3 font-semibold text-white hover:bg-[#17439E] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <div className="flex items-center gap-2">

              <Send size={17}/>

              {submitting ? "Sending…" : "Send"}

            </div>

          </button>

          <button
            onClick={()=>setShowSchedule(!showSchedule)}
            disabled={submitting}
            className="rounded-r-full border-l border-white bg-[#1E56CD] px-4 text-white hover:bg-[#17439E] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <ChevronDown size={18}/>
          </button>

          {showSchedule && (

            <div className="absolute bottom-16 left-0 w-80 rounded-2xl border border-[#EFEAE0] bg-white p-5 shadow-xl">

              <div className="flex items-center gap-2 mb-4">

                <Clock3
                  size={18}
                  className="text-[#1E56CD]"
                />

                <h3 className="font-semibold">
                  Schedule Send
                </h3>

              </div>

              <input
                type="datetime-local"
                value={form.sendAt}
                onChange={(e)=>
                  setForm(prev=>({
                    ...prev,
                    sendAt:e.target.value
                  }))
                }
                className="w-full rounded-xl border border-[#EFEAE0] p-3"
              />

              <button
                onClick={onSchedule}
                disabled={submitting}
                className="mt-4 w-full rounded-xl bg-[#1E56CD] py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Scheduling…" : "Schedule"}
              </button>

            </div>

          )}

        </div>

        <p className="text-sm text-[#000000]">

          Invoice PDF will be attached automatically.

        </p>

      </div>

    </div>
  );
}