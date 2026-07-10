import Link from "next/link";
import { getChampionsRange } from "@/lib/jolpica";
import { teamColor } from "@/lib/teams";
import { DecadePills } from "@/components/palmares/DecadePills";
export const metadata = { title: "Palmarès" };

const DECADES = [1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020];
const CURRENT_DECADE = DECADES[DECADES.length - 1];

export default async function PalmaresPage({
    searchParams,
}: {
    searchParams: Promise<{ decennie?: string }>;
}) {
    const { decennie } = await searchParams;
    const parsed = Number(decennie);
    const decade = DECADES.includes(parsed) ? parsed : CURRENT_DECADE;

    const champions = await getChampionsRange(decade, decade + 9);
    const lastSeason = new Date().getFullYear() - 1;

    // ——— Records de la décennie ———
    const titleCount = new Map<string, { name: string; n: number }>();
    for (const c of champions) {
        const cur = titleCount.get(c.driverId);
        titleCount.set(c.driverId, { name: c.name, n: (cur?.n ?? 0) + 1 });
    }
    const distinct = titleCount.size;
    const top = [...titleCount.values()].sort((a, b) => b.n - a.n)[0];
    const topNames = top
        ? [...titleCount.values()]
            .filter((t) => t.n === top.n)
            .map((t) => t.name.split(" ").slice(-1)[0])
            .join(" & ")
        : "—";

    const records: [string, string][] = [
        [String(champions.length), "Saisons"],
        [String(distinct), "Champions différents"],
        [
            top ? `${top.n} titre${top.n > 1 ? "s" : ""}` : "—",
            `Plus titré · ${topNames}`,
        ],
    ];

    const rows = [...champions].reverse();

    return (
        <main>
            <div className="mb-2 flex flex-wrap items-baseline justify-between gap-4">
                <h1 className="text-[34px] font-black italic tracking-[0.5px]">
                    Palmarès{" "}
                    <span className="text-[#E10600]">
                        {decade} – {Math.min(decade + 9, lastSeason)}
                    </span>
                </h1>
                <span className="text-sm font-semibold text-white/55">
                    {distinct} champion{distinct > 1 ? "s" : ""} du monde
                </span>
            </div>
            <p className="mb-6 max-w-[560px] text-[15px] font-semibold text-white/50">
                Les champions du monde des pilotes, décennie par décennie depuis 1950.
            </p>

            {/* ——— Records de la décennie ——— */}
            <div className="mb-7 grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-2.5">
                {records.map(([value, label]) => (
                    <div
                        key={label}
                        className="flex flex-col gap-1 rounded-md bg-[#1B1B26] p-4"
                    >
                        <span className="text-2xl font-black italic">{value}</span>
                        <span className="text-xs font-bold uppercase tracking-[1px] text-white/45">
                            {label}
                        </span>
                    </div>
                ))}
            </div>

            {/* ——— Pastilles de décennies (liens, plus d'état client) ——— */}
            <DecadePills decades={DECADES} active={decade} />


            {/* ——— Liste année par année ——— */}
            <div className="flex flex-col gap-[5px]">
                {rows.map((r) => (
                    <Link
                        key={r.season}
                        href={`/pilotes/${r.driverId}`}
                        className="flex items-center gap-4 rounded-r bg-[#1B1B26] px-[18px] py-3 transition-colors hover:bg-[#242433]"
                        style={{ borderLeft: `4px solid ${teamColor(r.constructorId)}` }}
                    >
                        <span className="w-16 text-xl font-black italic text-white/90">
                            {r.season}
                        </span>
                        <span className="flex min-w-[160px] flex-1 flex-col gap-px">
                            <span className="flex flex-wrap items-baseline gap-2.5">
                                <span className="text-base font-bold">{r.name}</span>
                                <span className="text-xs font-semibold text-white/40">
                                    {r.nationality}
                                </span>
                            </span>
                            <span className="text-[13px] font-semibold text-white/50">
                                {r.team}
                            </span>
                        </span>
                        <span className="hidden w-[76px] text-right text-[17px] font-black italic sm:block">
                            {r.points}
                            <span className="text-[11px] font-normal not-italic text-white/45">
                                {" "}
                                pts
                            </span>
                        </span>
                    </Link>
                ))}
            </div>
        </main>
    );
}