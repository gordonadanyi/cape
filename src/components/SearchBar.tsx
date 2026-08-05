import { Search } from "lucide-react";
interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({
  value,
  onChange,
}: SearchBarProps) {
  return (
    <div className="relative w-full max-w-md">
      <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#A1A6A6]" />

      <input
        type="text"
        placeholder="Search customer or invoice..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-[#EFEAE0] bg-white py-3 pl-12 pr-4 text-sm outline-none focus:border-[#1E56CD]"
      />
    </div>
  );
}