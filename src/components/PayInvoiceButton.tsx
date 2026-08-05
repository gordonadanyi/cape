import { useState } from "react";
import { initializePayment } from "../services/paymentServices";

type Props = {
  invoiceId: string;
};

export default function PayInvoiceButton({
  invoiceId,
}: Props) {
  const [loading, setLoading] = useState(false);

  async function handlePay() {
    setLoading(true);
    try {
      const data = await initializePayment(invoiceId);

      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      }
    } catch (err) {
      console.error(err);
      alert("Unable to initialize payment.");
      setLoading(false);
    }
  }

  // return (
  //   <button
  //     onClick={handlePay}
  //     disabled={loading}
  //     className="rounded-xl bg-[#1E56CD] px-6 py-3 font-semibold text-white transition hover:bg-[#17439E] disabled:cursor-not-allowed disabled:opacity-60"
  //   >
  //     {loading ? "Redirecting…" : "Pay Now"}
  //   </button>
  // );
}