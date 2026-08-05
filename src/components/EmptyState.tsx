export default function EmptyState() {
  return (
    <div className="rounded-[32px] border border-[#EFEAE0] bg-white p-12 text-center shadow-sm">
      <h2 className="text-2xl font-semibold text-[#0F1B3D]">
        No invoices found
      </h2>

      <p className="mt-3 text-[#1E56CD]">
        Upload your first invoice to get started.
      </p>
    </div>
  );
}