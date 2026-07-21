import { useEffect, useState } from "react";
import api from "../api/axios";

export default function BrandingSettings() {
  const [form, setForm] = useState({
    companyName: "",
    website: "",
    businessAddress:"",
  });

  useEffect(()=> {
    async function lodadBranding() {
      try {
        const res = await api.get("/settings")
        setForm(res.data.profile);
      } catch (err) {
        console.error(err);
      }
    }

    lodadBranding();
  }, []);

  async function handleSave() {
    try {
      const res = await api.patch("/settings/branding", {
        companyName: form.companyName,
        website: form.website,
        businessAddress: form.businessAddress,
      });

      console.log(res.data);
      alert("Branding updated successfully")
    } catch (err: any) {
      console.log(err.response?.data);
      alert(JSON.stringify(err.response?.data));
    }
  }

  return (
    <div className="rounded-[32px] border border-[#E6DCC7] bg-white p-8 shadow-sm">

      <h2 className="text-2xl font-semibold mb-6">
        Company Branding
      </h2>

      <div className="grid gap-6">

       <input
  value={form.companyName}
  onChange={(e) =>
    setForm({
      ...form,
      companyName: e.target.value,
    })
  }
   placeholder="Company Name"
  className="rounded-xl border border-[#E6DCC7] p-3 outline-none"
/>

       <input
  value={form.website}
  onChange={(e) =>
    setForm({
      ...form,
      website: e.target.value,
    })
  }
   placeholder="Website"
  className="rounded-xl border border-[#E6DCC7] p-3 outline-none"
/>

        <textarea
         value={form.businessAddress}
  onChange={(e) =>
    setForm({
      ...form,
      businessAddress: e.target.value,
    })
  }
          placeholder="Business Address"
          rows={4}
          className="rounded-xl border border-[#E6DCC7] p-3"
        />

      </div>

       <button
  onClick={handleSave}
  className="mt-8 rounded-full bg-[#4B672D] px-6 py-3 text-white hover:bg-[#3F5824]"
>
  Save Changes
</button>

    </div>
  );
}
