import { Download } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../../api/axios";

interface Props {
  invoiceId: string;
}

export default function PdfPreview({ invoiceId }: Props) {
  const [pdfUrl, setPdfUrl] = useState("");

  useEffect(() => {
    let url = "";

    async function loadPdf() {
      try {
        const response = await api.get(
          `/invoices/${invoiceId}`,
          {
            responseType: "blob",
          }
        );

        url = URL.createObjectURL(response.data);

        setPdfUrl(url);
      } catch (err: any) {
  console.log(err.response);
  console.log(err.response?.status);
  console.log(err.response?.data);
}
    }

    loadPdf();

    return () => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [invoiceId]);

  return (
    <div className="overflow-hidden rounded-[32px] border border-[#E6DCC7] bg-white shadow-sm">

      <div className="flex items-center justify-between border-b border-[#E6DCC7] px-8 py-5">

        <div>
          <h2 className="text-2xl font-semibold">
            Invoice Preview
          </h2>

          <p className="mt-1 text-[#4B672D]">
            Review the uploaded invoice.
          </p>
        </div>

        {pdfUrl && (
          <a
            href={pdfUrl}
            download="invoice.pdf"
            className="flex items-center gap-2 rounded-xl border border-[#E6DCC7] px-5 py-3 hover:bg-[#FEF9EE]"
          >
            <Download size={18} />
            Download
          </a>
        )}

      </div>

      <div className="h-[900px] bg-[#F7F7F7]">

        {pdfUrl ? (
          <iframe
            title="Invoice PDF"
            src={pdfUrl}
            className="h-full w-full"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[#4B672D]">
            Loading PDF...
          </div>
        )}

      </div>

    </div>
  );
}