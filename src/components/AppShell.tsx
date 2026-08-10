import { useState, type ReactNode } from "react";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";

export default function AppShell({ children }: { children: ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="flex bg-[#FDF8F2] md:h-screen">
      <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      <div className="min-w-0 flex-1 md:h-screen md:overflow-y-auto">
        {/* Mobile-only top bar — the sidebar is off-canvas below md, so this
            is the only way to open it on a phone. */}
        <div className="flex items-center gap-3 border-b border-[#EFEAE0] bg-white px-4 py-3 md:hidden">
          <button
            onClick={() => setIsMenuOpen(true)}
            aria-label="Open menu"
            className="text-[#5B6584]"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-base font-bold text-[#1E56CD]">CAPE</span>
        </div>

        {children}
      </div>
    </div>
  );
}
