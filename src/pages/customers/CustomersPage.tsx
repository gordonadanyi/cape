import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppShell from "../../components/AppShell";
import CustomerFilters from "../../components/customers/CustomerFilters";
import CustomerForm from "../../components/customers/CustomerForm";
import CustomerSummaryCards from "../../components/customers/CustomerSummaryCards";
import CustomerTable from "../../components/customers/CustomerTable";
import DeleteCustomerDialog from "../../components/customers/DeleteCustomerDialog";
import { customerService } from "../../services/customerService";
import type { Customer, CustomerSummary } from "../../types/customer";
import { getErrorMessage } from "../../utils/getErrorMessage";

const ITEMS_PER_PAGE = 10;

export default function CustomersPage() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [summary, setSummary] = useState<CustomerSummary>({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [customerCount, setCustomerCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "createdAt">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToArchive, setCustomerToArchive] = useState<Customer | null>(null);

  const loadSummary = async () => {
    try {
      setSummaryLoading(true);
      const result = await customerService.getCustomersSummary();
      setSummary(result);
    } catch (errorSummary) {
      setSummary({ missingData: true });
      console.error("Failed to load customer summary:", errorSummary);
    } finally {
      setSummaryLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await customerService.getCustomers({
        page,
        limit: ITEMS_PER_PAGE,
        search: debouncedSearch || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
        sortBy,
        sortOrder,
      });

      setCustomers(response.items);
      setTotalPages(response.totalPages || 1);
      setCustomerCount(response.total);
    } catch (loadError) {
      setError(getErrorMessage(loadError, "Failed to load customers."));
      setCustomers([]);
      setTotalPages(1);
      setCustomerCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchValue.trim());
      setPage(1);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [searchValue]);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await customerService.getCustomers({
          page,
          limit: ITEMS_PER_PAGE,
          search: debouncedSearch || undefined,
          status: statusFilter === "all" ? undefined : statusFilter,
          sortBy,
          sortOrder,
        });

        setCustomers(response.items);
        setTotalPages(response.totalPages || 1);
        setCustomerCount(response.total);
      } catch (loadError) {
        setError(getErrorMessage(loadError, "Failed to load customers."));
        setCustomers([]);
        setTotalPages(1);
        setCustomerCount(0);
      } finally {
        setLoading(false);
      }
    };

    void fetchCustomers();
  }, [page, statusFilter, debouncedSearch, sortBy, sortOrder]);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setSummaryLoading(true);
        const result = await customerService.getCustomersSummary();
        setSummary(result);
      } catch (errorSummary) {
        setSummary({ missingData: true });
        console.error("Failed to load customer summary:", errorSummary);
      } finally {
        setSummaryLoading(false);
      }
    };

    void fetchSummary();
  }, []);

  const emptyState = useMemo(() => {
    if (loading) return false;
    if (customers.length === 0 && !error) return true;
    return false;
  }, [customers.length, error, loading]);

  const handleOpenCreate = () => {
    setSelectedCustomer(null);
    setSubmitError(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setSubmitError(null);
    setIsFormOpen(true);
  };

  const handleSubmitCustomer = async (payload: Partial<Customer>) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      if (selectedCustomer?._id || selectedCustomer?.id) {
        const id = selectedCustomer._id ?? selectedCustomer.id ?? "";
        await customerService.updateCustomer(id, payload);
      } else {
        await customerService.createCustomer(payload);
      }

      setIsFormOpen(false);
      setSelectedCustomer(null);
      await loadCustomers();
      await loadSummary();
    } catch (submitErrorValue) {
      setSubmitError(getErrorMessage(submitErrorValue, "Something went wrong while saving the customer."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArchiveCustomer = async () => {
    if (!customerToArchive) return;

    try {
      const id = customerToArchive._id ?? customerToArchive.id;
      if (!id) return;

      await customerService.updateCustomer(id, {
        status: "archived",
      });

      setDeleteDialogOpen(false);
      setCustomerToArchive(null);
      await loadCustomers();
      await loadSummary();
    } catch (archiveError) {
      setError(getErrorMessage(archiveError, "Failed to archive this customer."));
      setDeleteDialogOpen(false);
      setCustomerToArchive(null);
    }
  };

  return (
    <AppShell>
      <main className="min-h-screen bg-[#FDF8F2]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[#0F1B3D] sm:text-4xl">Customers</h1>
              <p className="mt-2 text-sm text-[#5B6584] sm:text-base">Manage your customers, contact details, and business relationships.</p>
            </div>

            <button
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1E56CD] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#17439E]"
            >
              <Plus className="h-4 w-4" />
              Add Customer
            </button>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <div className="font-semibold">Something went wrong</div>
              <p className="mt-1">{error}</p>
              <button type="button" onClick={() => void loadCustomers()} className="mt-3 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700">
                Retry
              </button>
            </div>
          )}

          {!summaryLoading && <CustomerSummaryCards summary={summary} />}

          <div className="mt-6">
            <CustomerFilters
              search={searchValue}
              statusFilter={statusFilter}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSearchChange={setSearchValue}
              onStatusChange={setStatusFilter}
              onSortChange={setSortBy}
              onSortOrderChange={setSortOrder}
            />
          </div>

          <div className="mt-6 flex items-center justify-between text-sm text-[#5B6584]">
            <div>
              {customerCount > 0 ? `${customerCount} customers` : "No customers"}
            </div>
          </div>

          {loading ? (
            <div className="mt-6 rounded-[28px] border border-[#EFEAE0] bg-white p-10 text-center shadow-sm">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#E8EEFC] border-t-[#1E56CD]" />
              <p className="font-medium text-[#5B6584]">Loading customers…</p>
            </div>
          ) : emptyState ? (
            <div className="mt-6 rounded-[28px] border border-[#EFEAE0] bg-white p-8 text-center shadow-sm">
              <h2 className="text-2xl font-bold text-[#0F1B3D]">No customers yet</h2>
              <p className="mt-3 text-[#5B6584]">Add your first customer to start managing your business relationships.</p>
              <button type="button" onClick={handleOpenCreate} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#1E56CD] px-4 py-3 text-sm font-semibold text-white hover:bg-[#17439E]">
                <Plus className="h-4 w-4" />
                Add your first customer
              </button>
            </div>
          ) : customers.length === 0 ? (
            <div className="mt-6 rounded-[28px] border border-[#EFEAE0] bg-white p-8 text-center shadow-sm">
              <h2 className="text-2xl font-bold text-[#0F1B3D]">No customers found</h2>
              <p className="mt-3 text-[#5B6584]">Adjust your search or filters to find the right customer record.</p>
              <button type="button" onClick={() => { setSearchValue(""); setStatusFilter("all"); }} className="mt-6 rounded-xl border border-[#EFEAE0] bg-white px-4 py-3 text-sm font-semibold text-[#0F1B3D] hover:bg-[#F7F8FA]">
                Clear filters
              </button>
            </div>
          ) : (
            <div className="mt-6">
              <CustomerTable
                customers={customers}
                page={page}
                totalPages={totalPages}
                onView={(id) => navigate(`/customers/${id}`)}
                onEdit={handleOpenEdit}
                onArchive={(customer) => {
                  setCustomerToArchive(customer);
                  setDeleteDialogOpen(true);
                }}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      </main>

      <CustomerForm
        key={selectedCustomer ? `${selectedCustomer._id ?? selectedCustomer.id ?? "customer"}` : "new-customer"}
        open={isFormOpen}
        mode={selectedCustomer ? "edit" : "create"}
        initialValues={selectedCustomer ?? undefined}
        loading={isSubmitting}
        error={submitError}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedCustomer(null);
          setSubmitError(null);
        }}
        onSubmit={handleSubmitCustomer}
      />

      <DeleteCustomerDialog
        open={deleteDialogOpen}
        actionLabel="Archive Customer"
        title="Archive customer?"
        description="This will set the customer to archived status and keep their records available for reference. This is a significant status change."
        confirmText="Archive Customer"
        onCancel={() => {
          setDeleteDialogOpen(false);
          setCustomerToArchive(null);
        }}
        onConfirm={() => void handleArchiveCustomer()}
      />
    </AppShell>
  );
}
