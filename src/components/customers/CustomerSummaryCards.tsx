import type { CustomerSummary } from "../../types/customer";

const currencyFormatter = (currency = "NGN") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  });

export default function CustomerSummaryCards({ summary }: { summary: CustomerSummary }) {
  const formatCurrency = (value?: number) => {
    if (typeof value !== "number" || Number.isNaN(value)) {
      return "N/A";
    }

    return currencyFormatter(summary.currency ?? "NGN").format(value);
  };

  const cards = [
    {
      label: "Total Customers",
      value: summary.totalCustomers ?? 0,
      helper: summary.missingData ? "Summary endpoint unavailable" : "Across all customer records",
    },
    {
      label: "Active Customers",
      value: summary.activeCustomers ?? 0,
      helper: summary.missingData ? "Requires /customers/summary" : "Currently active",
    },
    {
      label: "Inactive Customers",
      value: summary.inactiveCustomers ?? 0,
      helper: summary.missingData ? "Requires /customers/summary" : "Paused or archived",
    },
    {
      label: "Total Outstanding Balance",
      value: formatCurrency(summary.totalOutstandingBalance),
      helper: summary.missingData ? "Requires /customers/summary" : "Open customer balance",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-[24px] border border-[#EFEAE0] bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-[#5B6584]">{card.label}</p>
          <div className="mt-3 flex items-end justify-between gap-3">
            <div className="text-2xl font-bold text-[#0F1B3D]">{card.value}</div>
          </div>
          <p className="mt-2 text-xs text-[#8A93AC]">{card.helper}</p>
        </div>
      ))}
    </div>
  );
}
