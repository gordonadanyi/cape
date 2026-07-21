import { FileText, Eye, Download } from "lucide-react";

interface Props {
  invoiceId: string;
  fileName: string;
}

export default function AttachmentCard({
  invoiceId,
  fileName,
}: Props) {
  function previewInvoice() {
    window.open(
      `http://localhost:3000/invoices/${invoiceId}`,
      "_blank"
    );
  }

  function downloadInvoice() {
    const a = document.createElement("a");

    a.href = `http://localhost:3000/invoices/${invoiceId}`;

    a.download = fileName;

    a.click();
  }

  return (
    <div className="rounded-[28px] border border-[#E6DCC7] bg-white p-6">

      <div className="flex items-center gap-4">

        <div className="rounded-2xl bg-[#DCE9A8] p-4">

          <FileText
            className="text-[#4B672D]"
            size={32}
          />

        </div>

        <div>

          <h3 className="font-semibold text-lg">

            {fileName}

          </h3>

          <p className="text-sm text-[#4B672D]">

            PDF Document

          </p>

        </div>

      </div>

      <div className="mt-6 flex gap-4">

        <button
          onClick={previewInvoice}
          className="flex items-center gap-2 rounded-full border border-[#E6DCC7] px-5 py-2 hover:bg-[#FEF9EE]"
        >
          <Eye size={18} />

          Preview
        </button>

        <button
          onClick={downloadInvoice}
          className="flex items-center gap-2 rounded-full bg-[#4B672D] px-5 py-2 text-white"
        >
          <Download size={18} />

          Download
        </button>

      </div>

    </div>
  );
}