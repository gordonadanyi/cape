import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SettingsSidebar from "../components/SettingsSidebar";
import ProfileSettings from "../components/ProfileSettings";
import BrandingSettings from "../components/BrandingSettings";
import EmailSettings from "../components/EmailSettings";
import ReminderSettings from "../components/ReminderSettings";
import NotificationSettings from "../components/NotificationSettings";
import SecuritySettings from "../components/SecuritySettings";
import StorageSettings from "../components/StorageSettings";

import type { SettingTab } from "../types/settings";

export default function SettingsPage() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<SettingTab>("profile");

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return <ProfileSettings />;

      case "branding":
        return <BrandingSettings />;

      case "email":
        return <EmailSettings />;

      case "reminders":
        return <ReminderSettings />;

      case "notifications":
        return <NotificationSettings />;

      case "security":
        return <SecuritySettings />;

      case "storage":
        return <StorageSettings />;

      default:
        return <ProfileSettings />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FEF9EE] font-candara">
      {/* Navbar */}
      <nav className="border-b border-[#E6DCC7] bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#4B672D] font-bold text-white">
              IF
            </div>

            <span className="text-xl font-semibold text-[#4B672D]">
              Cape
            </span>
          </div>

          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 rounded-xl border border-[#E6DCC7] bg-[#FEF9EE] px-4 py-2 text-sm font-medium text-[#4B672D] hover:bg-[#F4E9D6]"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto flex max-w-7xl gap-8 px-6 py-10 h-[570px]">
        <SettingsSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        <section className="flex-1 overflow-y-auto">
  {renderContent()}
</section>
      </main>
    </div>
  );
}