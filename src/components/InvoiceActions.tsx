import { Eye, Trash2, Pencil, CheckCircle } from "lucide-react";

interface Props {
  invoiceId: string;
  status: "pending" | "paid" | "overdue" | "cancelled";
  isSent?: boolean;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onPaid: (id: string) => void;
}

export default function InvoiceActions({
  invoiceId,
  status,
  isSent,
  onView,
  onDelete,
  onEdit,
  onPaid,
}: Props) {
  // Marking an invoice "paid" only makes sense once it's actually been
  // sent to the customer — and only while it isn't already paid.
  const canMarkPaid = isSent && status !== "paid";

  return (
    <div className="flex gap-2">
      <button
        title="Edit"
        onClick={() => onEdit(invoiceId)}
        className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
      >
        <Pencil size={18} />
      </button>

      {canMarkPaid && (
        <button
          title="Mark Paid"
          onClick={() => onPaid(invoiceId)}
          className="rounded-lg p-2 text-green-600 hover:bg-green-50"
        >
          <CheckCircle size={18} />
        </button>
      )}

      <button
        className="rounded-lg p-2 text-[#1E56CD] hover:bg-[#FDF8F2]"
        title="View"
        onClick={() => onView(invoiceId)}
      >
        <Eye size={18} />
      </button>
      <button
        className="rounded-lg p-2 text-red-600 hover:bg-red-50"
        title="Delete"
        onClick={() => onDelete(invoiceId)}
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
}
