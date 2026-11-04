export type CustomerStatus = "active" | "inactive" | "archived";

export interface Customer {
  _id?: string;
  id?: string;
  userId?: string;
  name?: string;
  customerName?: string;
  companyName?: string;
  company?: string;
  email?: string;
  phone?: string;
  billingAddress?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  status?: CustomerStatus | string;
  isActive?: boolean;
  notes?: string;
  internalNotes?: string;
  createdAt?: string;
  updatedAt?: string;
  totalInvoiced?: number;
  totalPaid?: number;
  outstandingBalance?: number;
  overdueBalance?: number;
  invoiceCount?: number;
  currency?: string;
}

export interface CustomersQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: "name" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export interface CustomerSummary {
  totalCustomers?: number;
  activeCustomers?: number;
  inactiveCustomers?: number;
  totalOutstandingBalance?: number;
  totalInvoiced?: number;
  totalPaid?: number;
  overdueBalance?: number;
  invoiceCount?: number;
  currency?: string;
  missingData?: boolean;
}

export interface CustomerInvoice {
  _id?: string;
  id?: string;
  invoiceNumber?: string;
  issueDate?: string;
  dueDate?: string;
  amount?: number;
  totalAmount?: number;
  status?: string;
  paymentStatus?: string;
  createdAt?: string;
  customerName?: string;
}

export interface CustomerListResponse {
  items: Customer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
