import api from "../api/axios";
import type {
  Customer,
  CustomerInvoice,
  CustomerListResponse,
  CustomerSummary,
  CustomersQuery,
} from "../types/customer";


const sanitizeCustomerPayload = (
  payload: Record<string, unknown>,
): Record<string, unknown> => {
  const sanitized = { ...payload };

  // Convert frontend field names to backend DTO field names
  if ("phone" in sanitized) {
    sanitized.phoneNumber = sanitized.phone;
    delete sanitized.phone;
  }

  if ("internalNotes" in sanitized) {
    sanitized.notes = sanitized.internalNotes;
    delete sanitized.internalNotes;
  }

  // Remove protected or frontend-only fields
  delete sanitized.userId;
  delete sanitized._id;
  delete sanitized.id;
  delete sanitized.createdAt;
  delete sanitized.updatedAt;
  delete sanitized.__v;

  return sanitized;
};


const toNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeCustomer = (raw: Record<string, unknown> = {}): Customer => {
  const statusValue =
    (raw.status as string | undefined) ??
    ((raw.isActive as boolean | undefined) === false ? "inactive" : "active");

  const customerName =
    (raw.name as string | undefined) ??
    (raw.customerName as string | undefined) ??
    "Customer";

  return {
    _id: (raw._id as string | undefined) ?? (raw.id as string | undefined),
    id: (raw.id as string | undefined) ?? (raw._id as string | undefined),
    userId: raw.userId as string | undefined,
    name: customerName,
    customerName,
    companyName:
      (raw.companyName as string | undefined) ??
      (raw.company as string | undefined),
    email: raw.email as string | undefined,
    phone:
  (raw.phone as string | undefined) ??
  (raw.phoneNumber as string | undefined),
    billingAddress:
      (raw.billingAddress as string | undefined) ??
      (raw.address as string | undefined),
    city: raw.city as string | undefined,
    state: raw.state as string | undefined,
    postalCode: raw.postalCode as string | undefined,
    country: raw.country as string | undefined,
    status: statusValue,
    isActive: raw.isActive as boolean | undefined,
    notes: (raw.notes as string | undefined) ?? (raw.internalNotes as string | undefined),
    internalNotes: (raw.internalNotes as string | undefined) ?? (raw.notes as string | undefined),
    createdAt: (raw.createdAt as string | undefined) ?? (raw.dateAdded as string | undefined),
    updatedAt: raw.updatedAt as string | undefined,
    totalInvoiced: toNumber(raw.totalInvoiced ?? raw.totalInvoiceAmount, 0),
    totalPaid: toNumber(raw.totalPaid ?? raw.amountPaid, 0),
    outstandingBalance: toNumber(raw.outstandingBalance ?? raw.balanceDue ?? raw.amountDue, 0),
    overdueBalance: toNumber(raw.overdueBalance, 0),
    invoiceCount: toNumber(raw.invoiceCount ?? raw.totalInvoices, 0),
    currency: (raw.currency as string | undefined) ?? "USD",
  };
};

const normalizeSummary = (raw: Record<string, unknown> = {}): CustomerSummary => {
  return {
    totalCustomers: toNumber(raw.totalCustomers ?? raw.total, 0),
    activeCustomers: toNumber(raw.activeCustomers, 0),
    inactiveCustomers: toNumber(raw.inactiveCustomers, 0),
    totalOutstandingBalance: toNumber(raw.totalOutstandingBalance ?? raw.outstandingBalance, 0),
    totalInvoiced: toNumber(raw.totalInvoiced, 0),
    totalPaid: toNumber(raw.totalPaid, 0),
    overdueBalance: toNumber(raw.overdueBalance, 0),
    invoiceCount: toNumber(raw.invoiceCount ?? raw.totalInvoices, 0),
    currency: (raw.currency as string | undefined) ?? "USD",
    missingData: false,
  };
};

const normalizeInvoice = (raw: Record<string, unknown> = {}): CustomerInvoice => ({
  _id: (raw._id as string | undefined) ?? (raw.id as string | undefined),
  id: (raw.id as string | undefined) ?? (raw._id as string | undefined),
  invoiceNumber: (raw.invoiceNumber as string | undefined) ?? (raw.number as string | undefined),
  issueDate: (raw.issueDate as string | undefined) ?? (raw.createdAt as string | undefined),
  dueDate: (raw.dueDate as string | undefined),
  amount: toNumber(raw.amount ?? raw.totalAmount ?? raw.amountDue, 0),
  totalAmount: toNumber(raw.totalAmount ?? raw.amount ?? raw.amountDue, 0),
  status: (raw.status as string | undefined) ?? "pending",
  paymentStatus: (raw.paymentStatus as string | undefined) ?? "unpaid",
  createdAt: (raw.createdAt as string | undefined),
  customerName: (raw.customerName as string | undefined),
});

export const customerService = {
  async getCustomers(query: CustomersQuery = {}): Promise<CustomerListResponse> {
    const params = {
      page: query.page ?? 1,
      limit: query.limit ?? 10,
      search: query.search || undefined,
      status: query.status || undefined,
      sortBy: query.sortBy || undefined,
      sortOrder: query.sortOrder || undefined,
    };

    const response = await api.get("/customers", { params });
    const payload = response.data ?? {};
    const rawItems =
      (Array.isArray(payload?.items) && payload.items) ||
      (Array.isArray(payload?.data) && payload.data) ||
      (Array.isArray(payload?.customers) && payload.customers) ||
      (Array.isArray(payload) && payload) ||
      [];

    const pagination = payload?.pagination ?? payload?.meta ?? {};
    const total = toNumber(
      pagination.total ?? pagination.totalItems ?? pagination.count ?? rawItems.length,
      rawItems.length,
    );
    const page = toNumber(query.page ?? pagination.page ?? 1, 1);
    const limit = toNumber(query.limit ?? pagination.limit ?? (rawItems.length || 10), 10);
    const totalPages = toNumber(
      pagination.totalPages ?? (Math.ceil(total / Math.max(limit, 1)) || 1),
      1,
    );

    return {
      items: rawItems.map((item: Record<string, unknown>) => normalizeCustomer(item)),
      total,
      page,
      limit,
      totalPages,
    };
  },

  async getCustomerById(id: string): Promise<Customer> {
    const response = await api.get(`/customers/${id}`);
    const payload = response.data?.data ?? response.data ?? {};
    return normalizeCustomer(payload as Record<string, unknown>);
  },

  async getCustomersSummary(): Promise<CustomerSummary> {
    try {
      const response = await api.get("/customers/summary");
      const payload = response.data?.data ?? response.data?.summary ?? response.data ?? {};
      return normalizeSummary(payload as Record<string, unknown>);
    } catch (error) {
      if (error && typeof error === "object" && "response" in error) {
        const err = error as { response?: { status?: number } };
        if (err.response?.status === 404) {
          return {
            totalCustomers: 0,
            activeCustomers: 0,
            inactiveCustomers: 0,
            totalOutstandingBalance: 0,
            totalInvoiced: 0,
            totalPaid: 0,
            overdueBalance: 0,
            invoiceCount: 0,
            missingData: true,
          };
        }
      }

      return {
        totalCustomers: 0,
        activeCustomers: 0,
        inactiveCustomers: 0,
        totalOutstandingBalance: 0,
        totalInvoiced: 0,
        totalPaid: 0,
        overdueBalance: 0,
        invoiceCount: 0,
        missingData: true,
      };
    }
  },

  async createCustomer(payload: Partial<Customer>): Promise<Customer> {
    const sanitized = sanitizeCustomerPayload(payload as Record<string, unknown>);
    const response = await api.post("/customers", sanitized);
    const customerPayload = response.data?.data ?? response.data ?? {};
    return normalizeCustomer(customerPayload as Record<string, unknown>);
  },

  async updateCustomer(id: string, payload: Partial<Customer>): Promise<Customer> {
    const sanitized = sanitizeCustomerPayload(payload as Record<string, unknown>);
    const response = await api.patch(`/customers/${id}`, sanitized);
    const customerPayload = response.data?.data ?? response.data ?? {};
    return normalizeCustomer(customerPayload as Record<string, unknown>);
  },

  async deleteCustomer(id: string): Promise<void> {
    await api.delete(`/customers/${id}`);
  },

  async getCustomerInvoices(id: string, page = 1, limit = 10): Promise<{ items: CustomerInvoice[]; total: number; page: number; totalPages: number }> {
    const response = await api.get(`/customers/${id}/invoices`, {
      params: { page, limit },
    });

    const payload = response.data ?? {};
    const rawItems =
      (Array.isArray(payload?.items) && payload.items) ||
      (Array.isArray(payload?.data) && payload.data) ||
      (Array.isArray(payload?.invoices) && payload.invoices) ||
      (Array.isArray(payload) && payload) ||
      [];

    const pagination = payload?.pagination ?? payload?.meta ?? {};
    const total = toNumber(
      pagination.total ?? pagination.totalItems ?? rawItems.length,
      rawItems.length,
    );
    const pageNumber = toNumber(page, 1);
    const totalPages = toNumber(
      pagination.totalPages ?? (Math.ceil(total / Math.max(limit, 1)) || 1),
      1,
    );

    return {
      items: rawItems.map((item: Record<string, unknown>) => normalizeInvoice(item)),
      total,
      page: pageNumber,
      totalPages,
    };
  },
};
