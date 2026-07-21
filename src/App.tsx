import { useEffect, useState } from "react";
import { ArrowRight, FileText, Bell, Settings } from "lucide-react";
import { Link, Route, Routes } from "react-router-dom";
import Signup from "./pages/signup";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import NewInvoicePage from "./pages/newInvoice";
import ViewInvoicePage from "./pages/viewInvoices";
import SettingsPage from "./pages/Settings";
import ReviewInvoice from "./pages/ReviewInvoice";

function LandingPage() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen relative font-candara text-[#1E2118]">
      {/* Background image layer - place your image at /public/bg.jpg */}
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: "url('/bg.jpg')" }}
        aria-hidden
      >
        <div className="absolute inset-0 bg-black/10" />
      </div>

      <div className="relative z-10">
      <div className="mx-auto max-w-7xl px-6 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#4B672D] text-sm font-bold text-white">
              IF
            </div>
            <span className="text-xl font-semibold text-[#FEFFEF]">Cape</span>
          </div>
          <div className="hidden items-center gap-10 text-sm font-medium text-[#FEFFEF] md:flex">
            <a href="#features" className="hover:text-[#4B672D]">
              Features
            </a>
            <a href="#pricing" className="hover:text-[#4B672D]">
              Pricing
            </a>
            <a href="#contact" className="hover:text-[#4B672D]">
              Contact
            </a>
          </div>
        </nav>
      </div>

      <section className="px-6 pb-24">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[40px] border border-[#E6DCC7] bg-[#FEF9EE] px-6 py-10 shadow-[0_28px_70px_rgba(30,33,24,0.08)] md:px-12">
            <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
              <div className="space-y-8">
                <div className="inline-flex items-center rounded-full bg-[#DCE9A8] px-5 py-3 text-base font-semibold text-[#4B672D]">
                  Launch invoicing in minutes
                </div>
                <h1 className="text-6xl font-semibold leading-tight tracking-tight text-[#1E2118] md:text-7xl">
                  Easy Automated <br />
                  Invoicing & Reminders
                </h1>
                <p className="max-w-xl text-xl text-[#4B672D]">
                  Streamline billing, send payment reminders automatically, and recover overdue invoices without the busywork.
                </p>
                <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                  <Link to="/signup" className="inline-flex items-center gap-2 rounded-full bg-[#4B672D] px-8 py-4 text-base font-semibold text-white shadow-sm transition hover:bg-[#3F5824]">
                    Get Started
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                  <a href="#features" className="text-base font-medium text-[#4B672D] hover:text-[#1E2118]">
                    See Features
                  </a>
                </div>
              </div>

              <div
                className="rounded-[32px] border border-[#E6DCC7] bg-[#FEF9EE] p-6 shadow-[0_20px_40px_rgba(30,33,24,0.08)] transition-transform duration-200"
                style={{ transform: `translateY(${scrollY * 0.045}px)` }}
              >
                <div className="flex items-center justify-between rounded-3xl bg-[#FFF7E9] px-5 py-4">
                  <div className="flex items-center gap-3 text-sm font-medium text-[#4B672D]">
                    <div className="flex gap-1.5">
                      <div className="h-3 w-3 rounded-full bg-[#4B672D]" />
                      <div className="h-3 w-3 rounded-full bg-[#A1A6A6]" />
                      <div className="h-3 w-3 rounded-full bg-[#4B672D]" />
                    </div>
                    <span>Cape • Dashboard</span>
                  </div>
                  <button className="rounded-full bg-[#4B672D] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3F5824]">
                    Start Billing
                  </button>
                </div>

                <div className="mt-6 overflow-hidden rounded-3xl border border-[#A1A6A6] bg-[#EBF6C4]">
                  <div className="flex items-center justify-between px-5 py-4 text-sm text-[#4B672D]">
                    <span>Invoice</span>
                    <span>Status</span>
                  </div>
                  <table className="w-full border-t border-[#A1A6A6]">
                    <thead>
                      <tr className="text-left text-sm uppercase tracking-[0.12em] text-[#4B672D]">
                        <th className="px-5 py-3">Client</th>
                        <th className="px-5 py-3">Amount</th>
                        <th className="px-5 py-3">Due</th>
                        <th className="px-5 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm text-[#1E2118]">
                      <tr className="border-t border-[#DCE9A8] bg-white">
                        <td className="px-5 py-4 font-medium">Acme Corp</td>
                        <td className="px-5 py-4">$1,200</td>
                        <td className="px-5 py-4">Jul 15</td>
                        <td className="px-5 py-4">
                          <span className="rounded-full bg-[#DCE9A8] px-3 py-1 text-xs font-semibold text-[#4B672D]">
                            Paid
                          </span>
                        </td>
                      </tr>
                      <tr className="border-t border-[#EBF6C4]">
                        <td className="px-5 py-4 font-medium">Tech Solutions</td>
                        <td className="px-5 py-4">$850</td>
                        <td className="px-5 py-4">Jul 22</td>
                        <td className="px-5 py-4">
                          <span className="rounded-full bg-[#EBF6C4] px-3 py-1 text-xs font-semibold text-[#4B672D]">
                            Pending
                          </span>
                        </td>
                      </tr>
                      <tr className="border-t border-[#EBF6C4] bg-white">
                        <td className="px-5 py-4 font-medium">Horizon Labs</td>
                        <td className="px-5 py-4">$2,300</td>
                        <td className="px-5 py-4">Jul 30</td>
                        <td className="px-5 py-4">
                          <span className="rounded-full bg-[#DCE9A8] px-3 py-1 text-xs font-semibold text-[#4B672D]">
                            Overdue
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="px-6 pb-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-3">
            <div
              className="rounded-[30px] border border-[#F4E9D6] bg-[#FEF9EE] p-8 text-center shadow-[0_16px_40px_rgba(30,33,24,0.08)]"
            >
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#DCE9A8]/80 text-[#4B672D] shadow-inner">
                <FileText className="h-8 w-8" />
              </div>
              <h3 className="mb-3 text-2xl font-semibold text-[#1E2118]">Invoicing</h3>
              <p className="text-[#4B672D]">Create and send polished invoices instantly so you get paid faster.</p>
            </div>
            <div
              className="rounded-[30px] border border-[#F4E9D6] bg-[#FEF9EE] p-8 text-center shadow-[0_16px_40px_rgba(30,33,24,0.08)]"
            >
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#DCE9A8]/80 text-[#4B672D] shadow-inner">
                <Bell className="h-8 w-8" />
              </div>
              <h3 className="mb-3 text-2xl font-semibold text-[#1E2118]">Reminders</h3>
              <p className="text-[#4B672D]">Automated follow-ups keep customers on track without manual effort.</p>
            </div>
            <div
              className="rounded-[30px] border border-[#F4E9D6] bg-[#FEF9EE] p-8 text-center shadow-[0_16px_40px_rgba(30,33,24,0.08)]"
            >
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#DCE9A8]/80 text-[#4B672D] shadow-inner">
                <Settings className="h-8 w-8" />
              </div>
              <h3 className="mb-3 text-2xl font-semibold text-[#1E2118]">Automation</h3>
              <p className="text-[#4B672D]">Workflow rules manage invoicing, reminders, and payments automatically.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="px-6 pb-24">
        <div className="mx-auto max-w-7xl rounded-[32px] border border-[#E6DCC7] bg-[#FEF9EE] p-10 shadow-sm">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold text-[#1E2118]">Simple pricing for growing teams</h2>
            <p className="mt-3 text-lg text-[#4B672D]">
              Start free, upgrade when you need automation and deeper billing insights.
            </p>
          </div>
        </div>
      </section>
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/new-invoice" element={<NewInvoicePage />} />
      <Route path="/view-invoices" element={<ViewInvoicePage />} />
      <Route path="/settings/*" element={<SettingsPage />} />
      <Route path="/review/:id" element={<ReviewInvoice />} />
    </Routes>
  );
}

export default App;