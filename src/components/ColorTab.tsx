export function ColorTab({
    color,
    className = "left-5 sm:left-7",
}: {
    color: string;
    className?: string;
}) {
    return (
        <span
            aria-hidden="true"
            className={`absolute top-0 h-1.5 w-[52px] rounded-b ${className}`}
            style={{ backgroundColor: color }}
        />
    );
}