import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Settings,
  Plus,
  LogOut,
  X,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Invoices", path: "/view-invoices", icon: FileText },
  { label: "Settings", path: "/settings", icon: Settings },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: Props) {
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/");
  }

  function go(path: string) {
    navigate(path);
    onClose();
  }

  return (
    <>
      {/* Backdrop — mobile only, closes the menu on tap outside it */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-40 flex w-[220px] shrink-0 flex-col justify-between border-r border-[#EFEAE0] bg-white px-3.5 py-5 font-candara transition-transform duration-200 md:static md:z-auto md:w-[196px] md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          <div className="mb-6 flex items-center justify-between px-2">
            <span className="text-lg font-bold text-[#1E56CD]">CAPE</span>
            <button
              onClick={onClose}
              className="text-[#8A93AC] md:hidden"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <button
            onClick={() => go("/new-invoice")}
            className="mb-4 flex w-full items-center gap-2.5 rounded-xl bg-[#1E56CD] px-3 py-2.5 text-[13px] font-medium text-white transition hover:bg-[#17439E]"
          >
            <Plus className="h-4 w-4" />
            New invoice
          </button>

          <div className="flex flex-col gap-0.5">
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => go(item.path)}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] transition ${
                    active
                      ? "bg-[#E7EEFB] font-medium text-[#1E56CD]"
                      : "text-[#5B6584] hover:bg-[#FBF7EF]"
                  }`}
                >
                  <item.icon className="h-[17px] w-[17px]" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2 border-t border-[#EFEAE0] px-2 pt-3.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1E56CD] text-[11px] font-medium text-white">
            C
          </div>
          <span className="flex-1 truncate text-xs font-medium text-[#0F1B3D]">
            My Business
          </span>
          <button
            onClick={handleLogout}
            title="Log out"
            className="text-[#8A93AC] hover:text-[#C4432E]"
          >
            <LogOut className="h-[15px] w-[15px]" />
          </button>
        </div>
      </div>
    </>
  );
}
