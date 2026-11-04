type DeleteCustomerDialogProps = {
  open: boolean;
  actionLabel: string;
  title: string;
  description: string;
  confirmText: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function DeleteCustomerDialog({
  open,
  actionLabel,
  title,
  description,
  confirmText,
  onCancel,
  onConfirm,
}: DeleteCustomerDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F1B3D]/35 p-4">
      <div className="w-full max-w-md rounded-[30px] border border-[#EFEAE0] bg-white p-6 shadow-[0_20px_50px_rgba(15,27,61,0.15)]">
        <div className="mb-4 inline-flex rounded-full bg-[#FBE3E0] px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-[#C4432E]">
          {actionLabel}
        </div>

        <h3 className="text-xl font-bold text-[#0F1B3D]">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-[#5B6584]">{description}</p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onCancel} className="rounded-xl border border-[#EFEAE0] bg-white px-4 py-2.5 text-sm font-medium text-[#0F1B3D] transition hover:bg-[#F7F8FA]">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} className="rounded-xl bg-[#C4432E] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#A83426]">
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
