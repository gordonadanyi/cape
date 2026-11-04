type CustomerFiltersProps = {
  search: string;
  statusFilter: string;
  sortBy: "name" | "createdAt";
  sortOrder: "asc" | "desc";
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onSortChange: (value: "name" | "createdAt") => void;
  onSortOrderChange: (value: "asc" | "desc") => void;
};

export default function CustomerFilters({
  search,
  statusFilter,
  sortBy,
  sortOrder,
  onSearchChange,
  onStatusChange,
  onSortChange,
  onSortOrderChange,
}: CustomerFiltersProps) {
  return (
    <div className="rounded-[26px] border border-[#EFEAE0] bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex-1">
          <label className="sr-only" htmlFor="customer-search">
            Search customers
          </label>
          <input
            id="customer-search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by name, company, email, or phone"
            className="w-full rounded-xl border border-[#EFEAE0] bg-[#FDF8F2] px-4 py-3 text-sm text-[#0F1B3D] outline-none transition focus:border-[#1E56CD]"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <select
            value={statusFilter}
            onChange={(event) => onStatusChange(event.target.value)}
            className="rounded-xl border border-[#EFEAE0] bg-white px-3 py-3 text-sm text-[#0F1B3D] outline-none transition focus:border-[#1E56CD]"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="archived">Archived</option>
          </select>

          <select
            value={sortBy}
            onChange={(event) => onSortChange(event.target.value as "name" | "createdAt")}
            className="rounded-xl border border-[#EFEAE0] bg-white px-3 py-3 text-sm text-[#0F1B3D] outline-none transition focus:border-[#1E56CD]"
          >
            <option value="name">Sort by name</option>
            <option value="createdAt">Sort by date</option>
          </select>

          <select
            value={sortOrder}
            onChange={(event) => onSortOrderChange(event.target.value as "asc" | "desc")}
            className="rounded-xl border border-[#EFEAE0] bg-white px-3 py-3 text-sm text-[#0F1B3D] outline-none transition focus:border-[#1E56CD]"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      </div>

      {search && (
        <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-[#F8F9FC] px-3 py-2 text-sm text-[#5B6584]">
          <span>Showing results for “{search}”</span>
          <button type="button" onClick={() => onSearchChange("")} className="font-semibold text-[#1E56CD] hover:underline">
            Clear search
          </button>
        </div>
      )}
    </div>
  );
}
