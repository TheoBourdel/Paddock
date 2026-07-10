import type { SeasonStanding } from "@/lib/jolpica";
import { ordinalFr } from "@/lib/format";

function aggregate(career: SeasonStanding[]) {
    let wins = 0;
    let titles = 0;
    let best = Infinity;

    for (const season of career) {
        const s = season.DriverStandings[0];
        wins += Number(s.wins);
        const pos = Number(s.position);
        if (pos === 1) titles += 1;
        if (pos < best) best = pos;
    }

    return { seasons: career.length, wins, titles, best };
}

export function CareerStats({ career }: { career: SeasonStanding[] }) {
    const stats = aggregate(career);

    const items: [string, string | number][] = [
        ["Saisons", stats.seasons],
        ["Titres mondiaux", stats.titles],
        ["Victoires", stats.wins],
        ["Meilleur classement", ordinalFr(stats.best)],
    ];

    return (
        <section className="mb-8">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-[2px] text-white/45">
                Carrière
            </h2>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {items.map(([label, value]) => (
                    <div
                        key={label}
                        className="flex flex-col gap-1 rounded-md bg-[#1B1B26] p-4"
                    >
                        <span className="text-[28px] font-black italic">{value}</span>
                        <span className="text-xs font-bold uppercase tracking-[1px] text-white/45">
                            {label}
                        </span>
                    </div>
                ))}
            </div>
        </section>
    );
}