import { LogOut, Plus, FileText, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear any stored auth tokens
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#FEF9EE] font-candara text-[#1E2118]">
      {/* Navigation */}
      <nav className="border-b border-[#E6DCC7] bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#4B672D] text-sm font-bold text-white">
                IF
              </div>
              <span className="text-xl font-semibold text-[#4B672D]">Cape</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 transition"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-semibold text-[#1E2118] mb-2">Dashboard</h1>
          <p className="text-[#4B672D]">Welcome to your invoicing dashboard</p>
        </div>

        {/* Quick Actions */}
        <div className="mb-12 grid gap-6 md:grid-cols-3">
          <button
            onClick={() => navigate("/new-invoice")}
            className="rounded-[24px] border border-[#E6DCC7] bg-white p-6 text-left hover:shadow-lg transition"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#DCE9A8] text-[#4B672D] mb-4">
              <Plus className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold mb-1">Create Invoice</h3>
            <p className="text-sm text-[#4B672D]">Start a new invoice</p>
          </button>

          <button 
          onClick={() => navigate("/view-invoices")}
          className="rounded-[24px] border border-[#E6DCC7] bg-white p-6 text-left hover:shadow-lg transition"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#DCE9A8] text-[#4B672D] mb-4">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold mb-1">View Invoices</h3>
            <p className="text-sm text-[#4B672D]">Manage your invoices</p>
          </button>

          <button 
          onClick={() => navigate("/settings")}
          className="rounded-[24px] border border-[#E6DCC7] bg-white p-6 text-left hover:shadow-lg transition"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#DCE9A8] text-[#4B672D] mb-4">
              <Settings className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold mb-1">Settings</h3>
            <p className="text-sm text-[#4B672D]">Customize your account</p>
          </button>
        </div>

        {/* Recent Invoices */}
        <div className="rounded-[32px] border border-[#E6DCC7] bg-white p-8 shadow-sm">
          <h2 className="mb-6 text-2xl font-semibold text-[#1E2118]">Recent Invoices</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E6DCC7] text-left text-sm uppercase tracking-[0.12em] text-[#4B672D]">
                  <th className="pb-4">Client</th>
                  <th className="pb-4">Amount</th>
                  <th className="pb-4">Due Date</th>
                  <th className="pb-4">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[#EBF6C4] hover:bg-[#FEF9EE] transition">
                  <td className="py-4 font-medium">No invoices yet</td>
                  <td className="py-4">—</td>
                  <td className="py-4">—</td>
                  <td className="py-4">—</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-6 text-center text-[#4B672D]">
            Create your first invoice to get started
          </p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
