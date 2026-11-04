import type { CustomerStatus } from "../../types/customer";

const statusStyles: Record<string, string> = {
  active: "bg-[#E7EEFB] text-[#1E56CD]",
  inactive: "bg-[#FBF3DC] text-[#8A6A1F]",
  archived: "bg-[#F1F2F4] text-[#4B5563]",
};

export default function CustomerStatusBadge({ status }: { status?: CustomerStatus | string }) {
  const normalized = (status ?? "active").toString().toLowerCase();
  const label = normalized === "inactive" ? "Inactive" : normalized === "archived" ? "Archived" : "Active";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[normalized] ?? statusStyles.active}`}
    >
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {label}
    </span>
  );
}
