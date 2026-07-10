import type { ConstructorSeasonStanding } from "@/lib/jolpica";

export function TeamSeasonTable({
    career,
    color,
}: {
    career: ConstructorSeasonStanding[];
    color: string;
}) {
    const seasons = [...career].reverse();

    return (
        <section>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-[2px] text-white/45">
                Saison par saison
            </h2>

            <ol className="flex flex-col gap-1">
                {seasons.map(({ season, standing }) => {
                    const pos = Number(standing.position);
                    const isChampion = pos === 1;
                    const isTop3 = pos <= 3;

                    return (
                        <li
                            key={season}
                            className="flex items-center gap-3.5 rounded bg-[#1B1B26] px-4 py-2.5"
                        >
                            <span className="w-11 text-[13px] font-black italic text-white/40">
                                {season}
                            </span>
                            <span
                                className="h-2.5 w-2.5 shrink-0 rounded-sm"
                                style={{ backgroundColor: color }}
                            />
                            <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                                {standing.Constructor.name}
                            </span>
                            <span
                                className="w-14 rounded py-[3px] text-center text-sm font-black"
                                style={{
                                    backgroundColor: isChampion
                                        ? "#E10600"
                                        : isTop3
                                            ? "rgba(255,255,255,0.15)"
                                            : "rgba(255,255,255,0.06)",
                                }}
                            >
                                P{pos}
                            </span>
                            <span className="hidden w-12 text-right font-bold text-white/75 sm:block">
                                {standing.wins}
                            </span>
                            <span className="w-[60px] text-right font-bold text-white/75">
                                {standing.points}
                            </span>
                        </li>
                    );
                })}
            </ol>
        </section>
    );
}