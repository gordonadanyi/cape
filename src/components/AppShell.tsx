import type { ReactNode } from "react";
import Sidebar from "./Sidebar";

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex bg-[#FDF8F2]">
      <Sidebar />
      <div className="h-screen flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
