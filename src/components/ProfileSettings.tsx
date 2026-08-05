import { useState, useEffect } from "react";
import api from "../api/axios";

export default function ProfileSettings() {

  const [form, setForm] = useState({
    fullName: "",
    emailAddress: "",
    companyName: "",
    phoneNumber: "",
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
  console.log({
  fullName: form.fullName,
  emailAddress: form.emailAddress,
  companyName: form.companyName,
  phoneNumber: form.phoneNumber,
});
    const res = await api.patch("/settings/profile", {
  fullName: form.fullName,
  emailAddress: form.emailAddress,
  companyName: form.companyName,
  phoneNumber: form.phoneNumber,
});
    console.log(res.data);
    alert("Profile updated successfully!");
  } catch (err: any) {
    console.log("Status:", err.response?.status);
    console.log("Data:", err.response?.data);
    console.log("Full error:", err);

    alert(JSON.stringify(err.response?.data));
  }
}

  return (
    <div className="rounded-[32px] border border-[#EFEAE0] bg-white p-8 shadow-sm">

      <h2 className="text-2xl font-semibold mb-6">
        Profile
      </h2>

      <div className="grid gap-6">

        <input
  value={form.fullName}
  onChange={(e) =>
    setForm({
      ...form,
      fullName: e.target.value,
    })
  }
  placeholder="Full Name"
  className="rounded-xl border border-[#EFEAE0] p-3 outline-none"
/>

       <input
  value={form.emailAddress}
  onChange={(e) =>
    setForm({
      ...form,
      emailAddress: e.target.value,
    })
  }
  placeholder="Email Address"
  className="rounded-xl border border-[#EFEAE0] p-3 outline-none"
/>

        <input
  value={form.companyName}
  onChange={(e) =>
    setForm({
      ...form,
      companyName: e.target.value,
    })
  }
  placeholder="Company Name"
  className="rounded-xl border border-[#EFEAE0] p-3 outline-none"
/>

        <input
  value={form.phoneNumber}
  onChange={(e) =>
    setForm({
      ...form,
      phoneNumber: e.target.value,
    })
  }
  placeholder="Phone Number"
  className="rounded-xl border border-[#EFEAE0] p-3 outline-none"
/>

      </div>

     <button
  onClick={handleSave}
  className="mt-8 rounded-xl bg-[#1E56CD] px-6 py-3 text-white hover:bg-[#17439E]"
>
  Save Changes
</button>
    </div>
  );
}