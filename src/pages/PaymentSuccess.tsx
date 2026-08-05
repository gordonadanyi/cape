import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import { verifyPayment, type VerifyPaymentResult } from "../services/paymentServices";
import { getErrorMessage } from "../utils/getErrorMessage";
import { formatCurrency } from "../utils/formatCurrency";

export default function PaymentSuccess() {
  // Paystack appends both of these to the callback_url — reference is the
  // one we generated and stored on the invoice, trxref is an older alias
  // some Paystack flows still use instead.
  const [searchParams] = useSearchParams();
  const reference =
    searchParams.get("reference") || searchParams.get("trxref");

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<VerifyPaymentResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!reference) {
      setLoading(false);
      setError("We couldn't find a payment reference in this link.");
      return;
    }

    (async () => {
      try {
        const data = await verifyPayment(reference);
        setResult(data);
      } catch (err) {
        setError(getErrorMessage(err, "We couldn't verify this payment."));
      } finally {
        setLoading(false);
      }
    })();
  }, [reference]);

  return (
    <div className="min-h-screen bg-[#FDF8F2] px-6 py-16">
      <div className="mx-auto max-w-lg rounded-[32px] border border-[#EFEAE0] bg-white p-10 text-center shadow-[0_20px_40px_rgba(30,33,24,0.08)]">
        {loading && <LoadingSpinner label="Confirming your payment..." />}

        {!loading && error && (
          <>
            <XCircle className="mx-auto h-16 w-16 text-red-500" />
            <h1 className="mt-6 text-2xl font-semibold text-[#0F1B3D]">
              Couldn't confirm payment
            </h1>
            <p className="mt-3 text-[#1E56CD]">{error}</p>
          </>
        )}

        {!loading && !error && result?.status === "paid" && (
          <>
            <CheckCircle2 className="mx-auto h-16 w-16 text-[#1E56CD]" />
            <h1 className="mt-6 text-2xl font-semibold text-[#0F1B3D]">
              Payment successful
            </h1>
            <p className="mt-3 text-[#000000]">
              {result.invoiceNumber
                ? `Invoice ${result.invoiceNumber} `
                : "Your invoice "}
              has been marked as paid. A receipt has been emailed to you.
            </p>
            {typeof result.amountPaid === "number" && (
              <div className="mt-6 rounded-2xl bg-[#FDF8F2] px-6 py-4">
                <p className="text-sm font-medium text-[#000000]">
                  Amount paid
                </p>
                <p className="text-3xl font-semibold text-[#0F1B3D]">
  {formatCurrency(result.amountPaid)}
</p>
              </div>
            )}
          </>
        )}

        {!loading && !error && result?.status === "pending" && (
          <>
            <Clock className="mx-auto h-16 w-16 text-yellow-500" />
            <h1 className="mt-6 text-2xl font-semibold text-[#0F1B3D]">
              Payment pending
            </h1>
            <p className="mt-3 text-[#000000]">
              We haven't received confirmation from Paystack yet. This
              usually clears up within a minute — refresh this page shortly.
            </p>
          </>
        )}

        {!loading && !error && result?.status === "failed" && (
          <>
            <XCircle className="mx-auto h-16 w-16 text-red-500" />
            <h1 className="mt-6 text-2xl font-semibold text-[#0F1B3D]">
              Payment failed
            </h1>
            <p className="mt-3 text-[#000000]">
              Your payment wasn't completed. Please try again from your
              invoice link.
            </p>
          </>
        )}
      </div>
    </div>
  );
}