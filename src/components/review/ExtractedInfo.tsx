import WarningBadge from "./WarningBadge";

interface Props {
    label: string;
    value?: string | number;
    children?: React.ReactNode;
}

export default function ExtractedInfo({
    label,
    value,
    children,
}: Props) {

    return (

        <div className="mb-6">

            <label className="text-sm font-semibold text-[#1E56CD]">

                {label}

            </label>

            {children}

            <WarningBadge
                show={!value}
            />

        </div>

    );
}