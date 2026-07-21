import { useState, useEffect } from "react";
import api from "../api/axios";


export default function EmailSettings() {
  
  const [form, setForm] = useState({
    defaultSubject: "",
    defaultMessage: "",
    signature: "",
  });

  useEffect(() => {
  async function loadProfile() {
    try {
      const res = await api.get("/settings");
      setForm(res.data.profile);
    } catch (err) {
      console.error(err);
    }
  }

  loadProfile();
}, []);

  async function handleSave() {
    try {
      const res = await api.patch("/settings/email", {
        defaultSubject: form.defaultSubject,
        defaultMessage: form.defaultMessage,
        signature: form.signature,
      });

      console.log(res.data);
      alert("Email updated successfully")
    } catch (err: any) {
      console.log(err.response?.data);
      alert(JSON.stringify(err.response?.data));
    }
  }


  return (
    <div className="rounded-[32px] border border-[#E6DCC7] bg-white p-8 shadow-sm">

      <h2 className="text-2xl font-semibold mb-6">
        Email Defaults
      </h2>

      <div className="grid gap-6">

        <input
         value={form.defaultSubject}
  onChange={(e) =>
    setForm({
      ...form,
      defaultSubject: e.target.value,
    })
  }
          placeholder="Default Subject"
          className="rounded-xl border border-[#E6DCC7] p-3"
        />

        <textarea
         value={form.defaultMessage}
  onChange={(e) =>
    setForm({
      ...form,
      defaultMessage: e.target.value,
    })
  }
          rows={7}
          placeholder="Default Email Message"
          className="rounded-xl border border-[#E6DCC7] p-3"
        />

        <input
         value={form.signature}
  onChange={(e) =>
    setForm({
      ...form,
      signature: e.target.value,
    })
  }
          placeholder="Signature"
          className="rounded-xl border border-[#E6DCC7] p-3"
        />

      </div>

      <button 
      onClick={handleSave}
      className="mt-8 rounded-full bg-[#4B672D] px-6 py-3 text-white">
        Save Email Settings
      </button>

    </div>
  );
}