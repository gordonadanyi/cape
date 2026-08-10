import {
  User,
  Palette,
  Mail,
  Bell,
  Clock3,
  Shield,
  HardDrive,
} from "lucide-react";
import type { SettingTab } from "../types/settings";
// import { SettingTab } from "../pages/Settings";

interface Props {
  activeTab: SettingTab;
  setActiveTab: (tab: SettingTab) => void;
}

const items = [
  {
    id: "profile",
    label: "Profile",
    icon: User,
  },
  {
    id: "branding",
    label: "Branding",
    icon: Palette,
  },
  {
    id: "email",
    label: "Email",
    icon: Mail,
  },
  {
    id: "reminders",
    label: "Reminders",
    icon: Clock3,
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
  },
  {
    id: "security",
    label: "Security",
    icon: Shield,
  },
  {
    id: "storage",
    label: "Storage",
    icon: HardDrive,
  },
];

export default function SettingsSidebar({
  activeTab,
  setActiveTab,
}: Props) {
  return (
    <div className="w-full rounded-[32px] border border-[#EFEAE0] bg-white p-6 shadow-sm md:w-72">

      <h2 className="mb-6 text-xl font-bold">
        Settings
      </h2>

      <div className="space-y-2">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() =>
                setActiveTab(item.id as SettingTab)
              }
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition ${
                activeTab === item.id
                  ? "bg-[#1E56CD] text-white"
                  : "hover:bg-[#FDF8F2]"
              }`}
            >
              <Icon size={18} />

              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}