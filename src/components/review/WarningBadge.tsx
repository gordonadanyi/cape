interface Props {
    show: boolean;
}

export default function WarningBadge({ show }: Props) {

    if (!show) return null;

    return (

        <div className="inline-flex items-center rounded-full bg-orange-100 text-orange-700 px-3 py-1 text-xs font-semibold mt-2">

            AI couldn't detect this

        </div>

    );
}