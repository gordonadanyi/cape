import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Settings,
  Plus,
  LogOut,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Invoices", path: "/view-invoices", icon: FileText },
  { label: "Settings", path: "/settings", icon: Settings },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/");
  }

  return (
    <div className="flex h-screen w-[196px] shrink-0 flex-col justify-between border-r border-[#EFEAE0] bg-white px-3.5 py-5 font-candara">
      <div>
        <div className="mb-6 px-2 text-lg font-bold text-[#1E56CD]">CAPE</div>

        <button
          onClick={() => navigate("/new-invoice")}
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
                onClick={() => navigate(item.path)}
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
  );
}
