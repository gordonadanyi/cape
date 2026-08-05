interface Props {
  label?: string;
}

export default function LoadingSpinner({ label }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#DCE9A8] border-t-[#1E56CD]" />
      {label && <p className="text-sm font-medium text-[#1E56CD]">{label}</p>}
    </div>
  );
}