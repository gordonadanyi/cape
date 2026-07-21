interface Props {
  value?: string | number;
}

export default function ConfirmBadge({ value }: Props) {
  const confirmed =
    value !== undefined &&
    value !== null &&
    value !== "";

  return confirmed ? (
    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
      ✓ Confirmed
    </span>
  ) : (
    <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
      ⚠ Please Confirm
    </span>
  );
}