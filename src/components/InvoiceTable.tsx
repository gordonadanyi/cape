import StatusBadge from "./StatusBadge";
import InvoiceActions from "./InvoiceActions";

interface Invoice {
  _id: string;
  customerName?: string;
  invoiceNumber?: string;
  amountDue?: number;
  dueDate?: string;
  status: "pending" | "paid" | "overdue" | "cancelled";
  isSent?: boolean;
}

interface Props {
  invoices: Invoice[];
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onPaid: (id: string) => void;
}

export default function InvoiceTable({
  invoices,
  onView,
  onDelete,
  onEdit,
  onPaid
}: Props) {
  return (
    <div className="overflow-hidden rounded-[32px] border border-[#E6DCC7] bg-white shadow-sm">
      <table className="w-full">
        <thead className="bg-[#FEF9EE]">
          <tr className="text-left text-sm text-[#4B672D]">
            <th className="px-6 py-4">Customer</th>
            <th className="px-6 py-4">Invoice</th>
            <th className="px-6 py-4">Amount</th>
            <th className="px-6 py-4">Due Date</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">Actions</th>
          </tr>
        </thead>

        <tbody>
          {invoices.map((invoice) => (
            <tr
              key={invoice._id}
              className="border-t border-[#F2E8D8] hover:bg-[#FEF9EE]"
            >
              <td className="px-6 py-5">
                {invoice.customerName || "-"}
              </td>

              <td className="px-6 py-5">
                {invoice.invoiceNumber || "-"}
              </td>

              <td className="px-6 py-5">
                {invoice.amountDue
                  ? `₦${invoice.amountDue.toLocaleString()}`
                  : "-"}
              </td>

              <td className="px-6 py-5">
                {invoice.dueDate
                  ? new Date(invoice.dueDate).toLocaleDateString()
                  : "-"}
              </td>

              <td className="px-6 py-5">
                <StatusBadge status={invoice.status} />
                {!invoice.isSent && (
                  <span className="ml-2 rounded-full bg-[#F0EEE9] px-2 py-0.5 text-xs font-medium text-[#8A8D86]">
                    Draft
                  </span>
                )}
              </td>

              <td className="px-6 py-5">
                <InvoiceActions
                  invoiceId={invoice._id}
                  status={invoice.status}
                  isSent={invoice.isSent}
                  onView={onView}
                  onDelete={onDelete}
                  onEdit={onEdit}
                  onPaid={onPaid}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
