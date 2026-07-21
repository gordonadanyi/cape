export default function EmptyState() {
  return (
    <div className="rounded-[32px] border border-[#E6DCC7] bg-white p-12 text-center shadow-sm">
      <h2 className="text-2xl font-semibold text-[#1E2118]">
        No invoices found
      </h2>

      <p className="mt-3 text-[#4B672D]">
        Upload your first invoice to get started.
      </p>
    </div>
  );
}