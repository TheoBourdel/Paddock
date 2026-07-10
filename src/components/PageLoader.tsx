export function PageLoader({ label }: { label?: string }) {
    return (
        <div className="flex min-h-[55vh] flex-col items-center justify-center gap-[22px]">
            {/* Trois pastilles en pulsation décalée */}
            <div className="flex items-center gap-2.5">
                {[0, 0.15, 0.3].map((delay) => (
                    <span
                        key={delay}
                        className="pw-pulse h-4 w-4 rounded-full bg-[#E10600]"
                        style={{ animationDuration: "1s", animationDelay: `${delay}s` }}
                    />
                ))}
            </div>

            <span className="text-[15px] font-black uppercase italic tracking-[2px] text-white/60">
                Chargement{label ? ` · ${label}` : ""}
            </span>
        </div>
    );
}