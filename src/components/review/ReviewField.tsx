import ConfirmBadge from "./ConfirmBadge";

interface Props {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}

export default function ReviewField({
  label,
  value,
  placeholder,
  onChange,
}: Props) {
  return (
    <div className="mb-6">

      <div className="mb-2 flex items-center justify-between">

        <label className="font-semibold text-[#0F1B3D]">
          {label}
        </label>

        <ConfirmBadge value={value} />

      </div>

      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-[#EFEAE0] p-3 outline-none focus:border-[#1E56CD]"
      />

    </div>
  );
}