import api from "../api/axios";

export interface VerifyPaymentResult {
  status: "paid" | "failed" | "pending";
  invoiceId: string;
  invoiceNumber?: string;
  customerName?: string;
  amountPaid?: number;
  amountDue?: number;
  paidAt?: string;
}

export async function initializePayment(invoiceId: string) {
  const { data } = await api.post(`/payments/initialize/${invoiceId}`);
  return data;
}

export async function verifyPayment(reference: string) {
  const { data } = await api.get<VerifyPaymentResult>(
    `/payments/verify/${reference}`
  );
  return data;
}