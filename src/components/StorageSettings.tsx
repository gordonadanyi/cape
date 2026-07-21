export default function StorageSettings() {
  return (
    <div className="rounded-[32px] border border-[#E6DCC7] bg-white p-8 shadow-sm">

      <h2 className="text-2xl font-semibold mb-8">
        Storage Usage
      </h2>

      <div className="space-y-5">

        <div className="flex justify-between">
          <span>Invoices Stored</span>
          <span>42</span>
        </div>

        <div className="flex justify-between">
          <span>Storage Used</span>
          <span>18 MB</span>
        </div>

        <div className="flex justify-between">
          <span>Plan Limit</span>
          <span>100 MB</span>
        </div>

      </div>

    </div>
  );
}