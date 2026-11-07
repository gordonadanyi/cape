import api from "../api/axios";

export interface InvoiceLineItem {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal?: number;
}

export interface NativeInvoiceDraft {
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  billingAddress?: string;
  companyName?: string;
  invoiceNumber?: string;
  issueDate?: string;
  dueDate?: string;
  currency?: string;
  notes?: string;
  terms?: string;
  status?: "draft" | "pending" | "paid";
  lineItems?: InvoiceLineItem[];
  discount?: { type?: "percent" | "fixed"; value?: number };
  tax?: { rate?: number };
  subtotal?: number;
  total?: number;
}

async function tryRequest<T>(
  endpoints: string[],
  method: "get" | "post" | "patch" | "put",
  payload?: object,
): Promise<T> {
  let lastError: unknown = null;

  for (const endpoint of endpoints) {
    try {
      const response =
        method === "get"
          ? await api.get<T>(endpoint)
          : method === "post"
            ? await api.post<T>(endpoint, payload)
            : method === "patch"
              ? await api.patch<T>(endpoint, payload)
              : await api.put<T>(endpoint, payload);

      return response.data;
    } catch (error) {
      lastError = error;
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status !== 404 && status !== 405) {
        throw error;
      }
    }
  }

  throw lastError ?? new Error("No invoice endpoint was available.");
}

export const invoiceService = {
  async listInvoices() {
    const response = await api.get("/invoices/all");
    return Array.isArray(response.data)
      ? response.data
      : response.data?.items ?? response.data?.data ?? [];
  },

  async getInvoiceById(id: string) {
    const candidates = [
      `/invoices/${id}/details`,
      `/invoice/${id}/details`,
      `/invoices/${id}`,
      `/invoice/${id}`,
    ];

    for (const endpoint of candidates) {
      try {
        const response = await api.get(endpoint);
        return response.data;
      } catch {
        // try the next compatible backend route
      }
    }

    throw new Error("Invoice not found.");
  },

  async saveDraft(payload: NativeInvoiceDraft) {
    return tryRequest<any>(
      [
        "/invoices/draft",
        "/invoice/draft",
        "/invoices/native/draft",
        "/invoice/create",
        "/invoices",
        "/invoice",
      ],
      "post",
      payload,
    );
  },

  async createInvoice(payload: NativeInvoiceDraft) {
    return tryRequest<any>(
      [
        "/invoices/native",
        "/invoice/create",
        "/invoices/create",
        "/invoice",
        "/invoices",
      ],
      "post",
      payload,
    );
  },

  async updateDraft(id: string, payload: NativeInvoiceDraft) {
    return tryRequest<any>(
      [
        `/invoices/${id}/draft`,
        `/invoice/${id}/draft`,
        `/invoices/${id}`,
        `/invoice/${id}`,
      ],
      "patch",
      payload,
    );
  },

  async sendInvoice(id: string) {
    return tryRequest<any>([
      `/invoices/${id}/send`,
      `/invoice/${id}/send`,
      `/invoices/${id}`,
      `/invoice/${id}`,
    ], "post");
  },

  async downloadInvoicePdf(id: string) {
    const candidates = [`/invoices/${id}`, `/invoice/${id}`];

    for (const endpoint of candidates) {
      try {
        const response = await api.get(endpoint, {
          responseType: "blob",
        });
        return response.data;
      } catch {
        // continue to the next supported route
      }
    }

    throw new Error("Invoice PDF is unavailable.");
  },

  async initializeInvoicePayment(invoiceId: string) {
    const response = await api.post(`/payments/initialize/${invoiceId}`);
    return response.data;
  },
};
