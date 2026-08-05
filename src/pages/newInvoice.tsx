import { useState, type ChangeEvent, type FormEvent } from "react";
import { ArrowLeft, CheckCircle2, UploadCloud, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function NewInvoicePage() {
  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<"success" | "error" | null>(
    null
  );

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;

    setSelectedFile(file);
    setStatusMessage(null);
    setStatusType(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedFile) {
      setStatusType("error");
      setStatusMessage("Please select a PDF file.");
      return;
    }

    if (selectedFile.type !== "application/pdf") {
      setStatusType("error");
      setStatusMessage("Only PDF files are allowed.");
      return;
    }

    setIsUploading(true);
    setStatusMessage(null);
    setStatusType(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await api.post(
        "/invoices/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log(response.data);

   setStatusType("success");

setStatusMessage("Invoice uploaded successfully!");

const invoiceId =
  response.data.invoice?._id ??
  response.data.invoiceId ??
  response.data._id ??
  response.data.id;

setTimeout(() => {
  navigate(`/review/${invoiceId}`);
}, 700);

// wait one second so the user sees the success
setTimeout(() => {
    navigate(`/review/${response.data._id}`);
}, 1000);


      setSelectedFile(null);
    } catch (err: any) {
      console.error(err);

      setStatusType("error");
      setStatusMessage(
        err.response?.data?.message ||
          "Failed to upload invoice."
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF8F2] font-candara text-[#0F1B3D]">
      {/* Navbar */}
      <nav className="border-b border-[#EFEAE0] bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="text-xl font-semibold text-[#1E56CD]">
              Cape
            </span>
          </div>

          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 rounded-xl border border-[#EFEAE0] bg-[#1E56CD] px-4 py-2 text-sm font-medium text-[#FDF8F2] transition hover:bg-[#17439E]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
        </div>
      </nav>

      {/* Main */}
      <div className="mx-auto flex max-w-4xl flex-col gap-8 px-6 py-12">
        <div className="space-y-2">
          <h1 className="text-4xl font-semibold">
            Start a New Invoice
          </h1>

          <p className="text-lg text-[#000000]">
            Upload your invoice PDF to Cape for processing.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-[32px] border border-[#EFEAE0] bg-white p-8 shadow-sm"
        >
          <div className="rounded-[24px] border border-dashed border-[#A1A6A6] bg-[#FDF8F2] p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFFFFF] text-[#1E56CD]">
              <UploadCloud className="h-7 w-7" />
            </div>

            <h2 className="text-xl font-semibold">
              Choose a PDF Invoice
            </h2>

            <p className="mt-2 text-sm text-[#000000]">
              Only PDF files are supported.
            </p>

            <label className="mt-6 inline-flex cursor-pointer items-center rounded-xl bg-[#1E56CD] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#17439E]">
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleFileChange}
              />
              Select PDF
            </label>

            {selectedFile && (
              <p className="mt-4 text-sm font-medium text-[#1E56CD]">
                Selected file: {selectedFile.name}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isUploading}
            className="mt-8 inline-flex items-center rounded-xl bg-[#1E56CD] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#17439E] disabled:cursor-not-allowed disabled:bg-[#A1A6A6]"
          >
            {isUploading ? "Uploading..." : "Upload Invoice"}
          </button>

          {statusMessage && (
            <div
              className={`mt-6 flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${
                statusType === "success"
                  ? "border-[#DCE9A8] bg-[#F6FBEA] text-[#1E56CD]"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {statusType === "success" ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
              ) : (
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              )}

              <p>{statusMessage}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default NewInvoicePage;