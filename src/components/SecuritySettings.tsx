import { useState, useEffect } from "react";
import api from "../api/axios";

export default function SecuritySettings() {
  const [form, setForm] = useState({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

  useEffect(() => {
  async function loadSecurity() {
    try {
      const res = await api.get("/auth");
      setForm(res.data.profile);
    } catch (err) {
      console.error(err);
    }
  }

  loadSecurity();
}, []);

  async function handleSave() {
    try {
      if (form.newPassword !== form.confirmPassword) {
  alert("Passwords do not match");
  return;
}

if (form.currentPassword == form.newPassword){
  alert("old password can not be the same as the new password");
  return;
}

      const res = await api.patch("/auth/change-password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });

      console.log(res.data);
      alert("Password updated successfully")
    } catch (err: any) {
      console.log(err.response?.data);
      alert(JSON.stringify(err.response?.data));
    }
  }

  return (
    <div className="rounded-[32px] border border-[#EFEAE0] bg-white p-8 shadow-sm">

      <h2 className="text-2xl font-semibold mb-6">
        Security
      </h2>

      <div className="grid gap-6">

        <input
         value={form.currentPassword}
  onChange={(e) =>
    setForm({
      ...form,
      currentPassword: e.target.value,
    })
  }
          type="password"
          placeholder="Current Password"
          className="rounded-xl border border-[#EFEAE0] p-3"
        />

        <input
         value={form.newPassword}
  onChange={(e) =>
    setForm({
      ...form,
      newPassword: e.target.value,
    })
  }
          type="password"
          placeholder="New Password"
          className="rounded-xl border border-[#EFEAE0] p-3"
        />

        <input
        value={form.confirmPassword}
  onChange={(e) =>
    setForm({
      ...form,
      confirmPassword: e.target.value,
    })
  }
          type="password"
          placeholder="Confirm Password"
          className="rounded-xl border border-[#EFEAE0] p-3"
        />

      </div>

      <button 
      onClick={handleSave}
     className="mt-8 rounded-xl bg-[#1E56CD] px-6 py-3 text-white hover:bg-[#17439E]">
        Change Password
      </button>

    </div>
  );
}