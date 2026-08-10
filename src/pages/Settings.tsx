import { useState } from "react";
import SettingsSidebar from "../components/SettingsSidebar";
import ProfileSettings from "../components/ProfileSettings";
import BrandingSettings from "../components/BrandingSettings";
import EmailSettings from "../components/EmailSettings";
import ReminderSettings from "../components/ReminderSettings";
import NotificationSettings from "../components/NotificationSettings";
import SecuritySettings from "../components/SecuritySettings";
import StorageSettings from "../components/StorageSettings";
import AppShell from "../components/AppShell";

import type { SettingTab } from "../types/settings";

export default function SettingsPage() {
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
    <AppShell>
      <main className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-10 md:h-[570px] md:flex-row md:gap-8">
        <SettingsSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        <section className="flex-1 overflow-y-auto">
  {renderContent()}
</section>
      </main>
    </AppShell>
  );
}