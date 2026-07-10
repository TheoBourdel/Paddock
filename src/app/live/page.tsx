const FEATURES = [
    "Chronos en direct",
    "Positions tour par tour",
    "Écarts & pit stops",
];
export const metadata = { title: "Live Timing" };

export default function LivePage() {
    return (
        <main className="flex flex-col items-center gap-[18px] px-5 py-20 text-center">
            <span className="pw-pulse h-4 w-4 rounded-full bg-[#E10600]" />

            <h1 className="text-[38px] font-black italic tracking-[1px]">
                LIVE TIMING
            </h1>

            <p className="max-w-[420px] text-base leading-[1.6] text-white/55">
                Le suivi en direct arrive bientôt : chronos tour par tour, positions en
                temps réel et écarts entre pilotes.
            </p>

            <div className="mt-2 flex flex-wrap justify-center gap-2.5">
                {FEATURES.map((label) => (
                    <span
                        key={label}
                        className="rounded-[20px] border border-white/10 bg-[#1B1B26] px-4 py-2 text-[13px] font-bold text-white/60"
                    >
                        {label}
                    </span>
                ))}
            </div>
        </main>
    );
}