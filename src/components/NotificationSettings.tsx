import { useEffect, useState } from "react";
import api from "../api/axios";

export default function NotificationSettings() {
  const [form, setForm] = useState({
  invoiceUploaded: true,
  reminderSent: true,
  weeklySummary: false,
});

useEffect(() => {
  async function loadNotifications() {
    try {
      const res = await api.get("/settings");
      setForm(res.data.reminders);
    } catch (err) {
      console.error(err);
    }
  }

  loadNotifications();
}, []);

async function handleSave() {
  try {
    const res = await api.patch("/settings/notifications", {
       invoiceUploaded: form.invoiceUploaded,
      reminderSent: form.reminderSent,
      weeklySummary: form.weeklySummary,
    });

    console.log(res.data);
    alert("Notification settings updated!");
  } catch (err: any) {
    console.error(err.response?.data);
    alert(JSON.stringify(err.response?.data));
  }
}

  return (
    
    <div className="rounded-[32px] border border-[#EFEAE0] bg-white p-8 shadow-sm">

      <h2 className="text-2xl font-semibold mb-8">
        Notifications
      </h2>

      <div className="space-y-5">

        <label className="flex items-center gap-3">
          <input type="checkbox"
          checked={form.invoiceUploaded}
onChange={(e) =>
  setForm({
    ...form,
    invoiceUploaded: e.target.checked,
  })
}
          />
          Invoice Uploaded
        </label>

        <label className="flex items-center gap-3">
          <input type="checkbox"
          checked={form.reminderSent}
onChange={(e) =>
  setForm({
    ...form,
    reminderSent: e.target.checked,
  })
}
          />
          Reminder Sent
        </label>

        <label className="flex items-center gap-3">
          <input type="checkbox"
          checked={form.weeklySummary}
onChange={(e) =>
  setForm({
    ...form,
    weeklySummary: e.target.checked,
  })
}
          />
          Weekly Summary
        </label>

      </div>

      <button 
      onClick={handleSave}
      className="mt-8 rounded-xl bg-[#1E56CD] px-6 py-3 text-white hover:bg-[#17439E]">
        Save Notifications
      </button>

    </div>
  );
}