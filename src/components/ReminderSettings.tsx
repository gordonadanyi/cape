import { useEffect, useState } from "react";
import api from "../api/axios";

type ReminderTab = "before" | "dueToday" | "overdue";

type ReminderForm = {
  beforeDueDate: boolean;
  beforeDays: number;
  beforeSubject: string;
  beforeMessage: string;

  onDueDate: boolean;
  dueTodaySubject: string;
  dueTodayMessage: string;

  afterDueDate: boolean;
  afterDays: number;
  overdueSubject: string;
  overdueMessage: string;

  signature: string;
};

const defaultForm: ReminderForm = {
  beforeDueDate: true,
  beforeDays: 3,
  beforeSubject: "Upcoming Invoice Reminder",
  beforeMessage:
     'Dear Sir/Ma,\n\nI hope this message finds you well Please attached the invoice for our services provided. This is a reminder that your invoice is due in {{days}} day(s).',

  onDueDate: true,
  dueTodaySubject: "Invoice Due Today",
  dueTodayMessage:
   'Dear Sir/Ma,\n\n I hope this message finds you well Please find attached the invoice for our services provided due today .',

  afterDueDate: true,
  afterDays: 3,
  overdueSubject: "Invoice Overdue Reminder",
  overdueMessage:
    'Hello Sir/Ma,\n\nI hope this message finds you well Please find attached the invoice for our services provided.Your invoice is now overdue. Kindly make payment as soon as possible.',

  signature:
    "Best regards,\n{{companyName}}",
};

export default function ReminderSettings() {
  const [activeTab, setActiveTab] =
    useState<ReminderTab>("before");

  const [form, setForm] =
    useState<ReminderForm>(defaultForm);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const res = await api.get("/settings");

      if (res.data.reminders) {
        setForm({
          ...defaultForm,
          ...res.data.reminders,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function saveSettings() {
    try {
      setSaving(true);

      await api.patch(
        "/settings/reminders",
        form
      );

      alert("Reminder settings updated.");
    } catch (err: any) {
      console.error(err);

      alert(
        err.response?.data?.message ??
          "Failed to save settings."
      );
    } finally {
      setSaving(false);
    }
  }

  function updateField<K extends keyof ReminderForm>(
    field: K,
    value: ReminderForm[K]
  ) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function copyVariable(variable: string) {
    navigator.clipboard.writeText(variable);

    alert(`${variable} copied.`);
  }

  if (loading) {
    return (
      <div className="rounded-[32px] border border-[#E6DCC7] bg-white p-10">
        Loading reminder settings...
      </div>
    );
  }

  return (
    <div className="rounded-[32px] border border-[#E6DCC7] bg-white p-10 shadow-sm">

      <h2 className="text-2xl font-semibold text-[#1E2118]">
        Reminder Settings
      </h2>

      <p className="mt-2 text-sm text-gray-500">
        Customize reminder emails sent before and after invoice due dates.
      </p>

      <div className="mt-8 flex gap-3">

        <button
          type="button"
          onClick={() => setActiveTab("before")}
          className={`rounded-full px-5 py-2 text-sm font-medium transition ${
            activeTab === "before"
              ? "bg-[#4B672D] text-white"
              : "border border-[#E6DCC7] bg-white"
          }`}
        >
          Before Due Date
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("dueToday")}
          className={`rounded-full px-5 py-2 text-sm font-medium transition ${
            activeTab === "dueToday"
              ? "bg-[#4B672D] text-white"
              : "border border-[#E6DCC7] bg-white"
          }`}
        >
          Due Today
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("overdue")}
          className={`rounded-full px-5 py-2 text-sm font-medium transition ${
            activeTab === "overdue"
              ? "bg-[#4B672D] text-white"
              : "border border-[#E6DCC7] bg-white"
          }`}
        >
          Overdue
        </button>

      </div>

            {/* BEFORE DUE DATE */}

      {activeTab === "before" && (
        <div className="mt-8 space-y-6">

          <div className="flex items-center justify-between rounded-2xl border border-[#E6DCC7] p-5">

            <div>
              <h3 className="font-semibold text-[#1E2118]">
                Enable Before Due Reminder
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Automatically remind customers before the invoice is due.
              </p>
            </div>

            <input
              type="checkbox"
              checked={form.beforeDueDate}
              onChange={(e) =>
                updateField(
                  "beforeDueDate",
                  e.target.checked
                )
              }
              className="h-5 w-5 accent-[#4B672D]"
            />

          </div>

          <div>

            <label className="mb-2 block text-sm font-medium">
              Days Before Due Date
            </label>

            <input
              type="number"
              min={0}
              disabled={!form.beforeDueDate}
              value={form.beforeDays}
              onChange={(e) =>
                updateField(
                  "beforeDays",
                  Number(e.target.value)
                )
              }
              className="w-32 rounded-xl border border-[#E6DCC7] p-3 disabled:bg-gray-100"
            />

          </div>

          <div>

            <label className="mb-2 block text-sm font-medium">
              Email Subject
            </label>

            <input
              type="text"
              value={form.beforeSubject}
              onChange={(e) =>
                updateField(
                  "beforeSubject",
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-[#E6DCC7] p-3"
            />

          </div>

          <div>

            <label className="mb-2 block text-sm font-medium">
              Email Message
            </label>

            <textarea
              rows={10}
              value={form.beforeMessage}
              onChange={(e) =>
                updateField(
                  "beforeMessage",
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-[#E6DCC7] p-4 resize-none"
            />

          </div>

        </div>
      )}
            {/* DUE TODAY */}

      {activeTab === "dueToday" && (
        <div className="mt-8 space-y-6">

          <div className="flex items-center justify-between rounded-2xl border border-[#E6DCC7] p-5">

            <div>
              <h3 className="font-semibold text-[#1E2118]">
                Enable Due Today Reminder
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Send an email on the exact invoice due date.
              </p>
            </div>

            <input
              type="checkbox"
              checked={form.onDueDate}
              onChange={(e) =>
                updateField(
                  "onDueDate",
                  e.target.checked
                )
              }
              className="h-5 w-5 accent-[#4B672D]"
            />

          </div>

          <div>

            <label className="mb-2 block text-sm font-medium">
              Email Subject
            </label>

            <input
              type="text"
              value={form.dueTodaySubject}
              onChange={(e) =>
                updateField(
                  "dueTodaySubject",
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-[#E6DCC7] p-3"
            />

          </div>

          <div>

            <label className="mb-2 block text-sm font-medium">
              Email Message
            </label>

            <textarea
              rows={10}
              value={form.dueTodayMessage}
              onChange={(e) =>
                updateField(
                  "dueTodayMessage",
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-[#E6DCC7] p-4 resize-none"
            />

          </div>

        </div>
      )}

      {/* OVERDUE */}

      {activeTab === "overdue" && (
        <div className="mt-8 space-y-6">

          <div className="flex items-center justify-between rounded-2xl border border-[#E6DCC7] p-5">

            <div>
              <h3 className="font-semibold text-[#1E2118]">
                Enable Overdue Reminder
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Continue reminding customers after the due date.
              </p>
            </div>

            <input
              type="checkbox"
              checked={form.afterDueDate}
              onChange={(e) =>
                updateField(
                  "afterDueDate",
                  e.target.checked
                )
              }
              className="h-5 w-5 accent-[#4B672D]"
            />

          </div>

          <div>

            <label className="mb-2 block text-sm font-medium">
              Days After Due Date
            </label>

            <input
              type="number"
              min={0}
              disabled={!form.afterDueDate}
              value={form.afterDays}
              onChange={(e) =>
                updateField(
                  "afterDays",
                  Number(e.target.value)
                )
              }
              className="w-32 rounded-xl border border-[#E6DCC7] p-3 disabled:bg-gray-100"
            />

          </div>

          <div>

            <label className="mb-2 block text-sm font-medium">
              Email Subject
            </label>

            <input
              type="text"
              value={form.overdueSubject}
              onChange={(e) =>
                updateField(
                  "overdueSubject",
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-[#E6DCC7] p-3"
            />

          </div>

          <div>

            <label className="mb-2 block text-sm font-medium">
              Email Message
            </label>

            <textarea
              rows={10}
              value={form.overdueMessage}
              onChange={(e) =>
                updateField(
                  "overdueMessage",
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-[#E6DCC7] p-4 resize-none"
            />

          </div>

        </div>
      )}
            {/* EMAIL SIGNATURE */}

      <div className="mt-10 border-t border-[#E6DCC7] pt-8">

        <h3 className="text-lg font-semibold text-[#1E2118]">
          Email Signature
        </h3>

        <p className="mt-1 mb-4 text-sm text-gray-500">
          This signature is appended to every reminder email.
        </p>
        <input
          value={form.signature}
          onChange={(e) =>
            updateField("signature", e.target.value)
          }
          className="w-full rounded-xl border border-[#E6DCC7] p-4 resize-none"
        />

      </div>
      {/* SAVE BUTTON */}

      <div className="mt-10 flex justify-end">

        <button
          type="button"
          disabled={saving}
          onClick={saveSettings}
          className="rounded-full bg-[#4B672D] px-8 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving
            ? "Saving..."
            : "Save Reminder Settings"}
        </button>

      </div>

    </div>
  );
}
