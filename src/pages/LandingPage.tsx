import { useEffect, useState } from "react";
import { ArrowRight, FileText, Bell, Zap, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

const sampleInvoices = [
  { client: "Adeyemi & Co", amount: "₦120,000", due: "Jul 15", status: "Paid" },
  { client: "Nexora Studio", amount: "₦85,000", due: "Jul 22", status: "Pending" },
  { client: "Horizon Labs", amount: "₦230,000", due: "Jul 30", status: "Overdue" },
];

const statusStyles: Record<string, string> = {
  Paid: "bg-[#E8EEFC] text-[#1E56CD]",
  Pending: "bg-[#FBF3DC] text-[#8A6A1F]",
  Overdue: "bg-[#FBE3E0] text-[#C4432E]",
};

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#FDF8F2] font-candara text-[#0F1B3D]">
      {/* ===== Hero (blue full-bleed band) ===== */}
      <div className="relative overflow-hidden bg-[#1E56CD]">
        {/* Ambient floating circles — each on its own path/duration/delay so
            they drift independently rather than in visible lockstep. */}
        <div className="pointer-events-none absolute inset-0">
          <span className="drift-a absolute left-[-4rem] top-16 h-56 w-56 rounded-full bg-white/5" />
          <span className="drift-b absolute right-[-5rem] top-28 h-72 w-72 rounded-full bg-white/5" />
          <span className="drift-c absolute left-[18%] top-[60%] h-32 w-32 rounded-full bg-white/[0.06]" />
          <span className="drift-d absolute right-[12%] top-[15%] h-24 w-24 rounded-full bg-white/[0.07]" />
          <span className="drift-e absolute left-[42%] top-[8%] h-16 w-16 rounded-full bg-white/[0.08]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 pt-8">
          <nav className="flex items-center justify-between">
            <span className="text-2xl font-bold tracking-tight text-white">
              CAPE
            </span>
            <div className="hidden items-center gap-10 text-[15px] font-medium text-white/90 md:flex">
              <a href="#pricing" className="transition hover:text-white">
                Pricing
              </a>
              <Link
                to="/signup"
                className="transition hover:text-white"
              >
                Start Free Trial
              </Link>
              <a href="#contact" className="transition hover:text-white">
                Contact
              </a>
            </div>
          </nav>

          <div className="mx-auto max-w-3xl pb-40 pt-16 text-center">
            <h1 className="text-5xl font-bold leading-[1.08] tracking-tight text-white md:text-6xl">
              Automate Invoices &amp; Payment Reminders
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-white/85">
              Cape sends your invoices, chases late payments, and gets you
              paid without another awkward follow-up email.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-[15px] font-semibold text-[#1E56CD] transition hover:bg-[#F3F6FE]"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 rounded-xl border border-white/40 px-7 py-3.5 text-[15px] font-semibold text-white transition hover:bg-white/10"
              >
                See Features
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Signature: real dashboard preview, lifted across the boundary ===== */}
      <div className="relative z-10 mx-auto -mt-28 max-w-4xl px-6">
        <div
          className="overflow-hidden rounded-[28px] border border-[#E7DFD0] bg-white shadow-[0_30px_80px_rgba(15,27,61,0.18)] transition-transform duration-200"
          style={{ transform: `translateY(${Math.min(scrollY * 0.04, 16)}px)` }}
        >
          <div className="flex items-center justify-between border-b border-[#EFEAE0] bg-[#FDF8F2] px-6 py-4">
            <div className="flex items-center gap-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#1E56CD]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#E7DFD0]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#E7DFD0]" />
              <span className="ml-2 text-sm font-medium text-[#5B6584]">
                Cape — Dashboard
              </span>
            </div>
            <span className="rounded-lg bg-[#1E56CD] px-3.5 py-1.5 text-xs font-semibold text-white">
              Start Billing
            </span>
          </div>

          <div className="grid grid-cols-3 gap-px bg-[#EFEAE0]">
            {[
              { label: "Outstanding", value: "₦315,000" },
              { label: "Paid this month", value: "₦120,000" },
              { label: "Overdue", value: "1" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white px-6 py-5">
                <p className="text-xs font-medium uppercase tracking-wide text-[#8A93AC]">
                  {stat.label}
                </p>
                <p className="mt-1.5 text-xl font-bold text-[#0F1B3D]">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-[#8A93AC]">
                <th className="px-6 pt-5 pb-2">Client</th>
                <th className="px-6 pt-5 pb-2">Amount</th>
                <th className="px-6 pt-5 pb-2">Due</th>
                <th className="px-6 pt-5 pb-2">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm text-[#0F1B3D]">
              {sampleInvoices.map((row) => (
                <tr key={row.client} className="border-t border-[#F2EEE4]">
                  <td className="px-6 py-3.5 font-medium">{row.client}</td>
                  <td className="px-6 py-3.5">{row.amount}</td>
                  <td className="px-6 py-3.5 text-[#5B6584]">{row.due}</td>
                  <td className="px-6 py-3.5">
                    <span
                      className={`rounded-md px-2.5 py-1 text-xs font-semibold ${statusStyles[row.status]}`}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="h-6" />
        </div>
      </div>

      {/* ===== Features ===== */}
      <section id="features" className="px-6 pb-28 pt-28">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto mb-16 max-w-xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#1E56CD]">
              How it works
            </p>
            <h2 className="mt-3 text-3xl font-bold text-[#0F1B3D] md:text-4xl">
              Everything after "send invoice," handled
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: FileText,
                title: "Upload & send",
                copy: "Drop in a PDF invoice, review what Cape extracted, and schedule it or send right away.",
              },
              {
                icon: Bell,
                title: "Automatic reminders",
                copy: "Before due, on due, and overdue reminders go out on their own, in your own words.",
              },
              {
                icon: Zap,
                title: "Get paid faster",
                copy: "Customers pay straight from the email with a secure checkout link. No more chasing.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-[#EFEAE0] bg-white p-8 transition hover:border-[#D6E0FA] hover:shadow-[0_16px_40px_rgba(15,27,61,0.06)]"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8EEFC] text-[#1E56CD]">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-[#0F1B3D]">
                  {f.title}
                </h3>
                <p className="text-[15px] leading-relaxed text-[#5B6584]">
                  {f.copy}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Pricing ===== */}
      <section id="pricing" className="px-6 pb-28">
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto mb-12 max-w-xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#1E56CD]">
              Pricing
            </p>
            <h2 className="mt-3 text-3xl font-bold text-[#0F1B3D] md:text-4xl">
              Start free. Upgrade when it pays for itself.
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-[#EFEAE0] bg-white p-8">
              <h3 className="text-lg font-bold text-[#0F1B3D]">Starter</h3>
              <p className="mt-1 text-sm text-[#5B6584]">
                For freelancers just getting off the ground.
              </p>
              <p className="mt-6 text-4xl font-bold text-[#0F1B3D]">
                ₦0
                <span className="text-base font-medium text-[#8A93AC]">
                  {" "}
                  /month
                </span>
              </p>
              <ul className="mt-6 space-y-3 text-sm text-[#5B6584]">
                {["Up to 10 invoices / month", "Automatic reminders", "Email support"].map(
                  (item) => (
                    <li key={item} className="flex items-center gap-2.5">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-[#1E56CD]" />
                      {item}
                    </li>
                  ),
                )}
              </ul>
              <Link
                to="/signup"
                className="mt-8 block rounded-xl border border-[#D6E0FA] py-3 text-center text-sm font-semibold text-[#1E56CD] transition hover:bg-[#E8EEFC]"
              >
                Get Started
              </Link>
            </div>

            <div className="rounded-2xl border border-[#1E56CD] bg-[#1E56CD] p-8">
              <h3 className="text-lg font-bold text-white">Growth</h3>
              <p className="mt-1 text-sm text-white/75">
                For businesses billing clients every week.
              </p>
              <p className="mt-6 text-4xl font-bold text-white">
                ₦8,500
                <span className="text-base font-medium text-white/70">
                  {" "}
                  /month
                </span>
              </p>
              <ul className="mt-6 space-y-3 text-sm text-white/90">
                {[
                  "Unlimited invoices",
                  "Scheduled sending",
                  "Custom reminder cadence",
                  "Priority support",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-white" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                to="/signup"
                className="mt-8 block rounded-xl bg-white py-3 text-center text-sm font-semibold text-[#1E56CD] transition hover:bg-[#F3F6FE]"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer id="contact" className="bg-[#16266B] px-6 pt-16 pb-10 text-white/80">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div>
              <span className="text-xl font-bold text-white">CAPE</span>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
                Automated invoicing and payment reminders for freelancers and
                small businesses.
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold text-white">Product</p>
              <ul className="mt-4 space-y-3 text-sm text-white/60">
                <li>
                  <a href="#features" className="transition hover:text-white">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="transition hover:text-white">
                    Pricing
                  </a>
                </li>
                <li>
                  <Link to="/login" className="transition hover:text-white">
                    Log in
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-sm font-semibold text-white">Company</p>
              <ul className="mt-4 space-y-3 text-sm text-white/60">
                <li>
                  <a href="#contact" className="transition hover:text-white">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="transition hover:text-white">
                    About
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-sm font-semibold text-white">Legal</p>
              <ul className="mt-4 space-y-3 text-sm text-white/60">
                <li>
                  <a href="#" className="transition hover:text-white">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="transition hover:text-white">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-sm text-white/50 sm:flex-row">
            <p>© {new Date().getFullYear()} Cape. All rights reserved.</p>
            <p>Made for businesses who'd rather not chase invoices.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}