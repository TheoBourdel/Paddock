import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
    getConstructorCareer,
    getConstructorStandings,
    getDriverStandings,
    getConstructorInfo,
} from "@/lib/jolpica";
import { teamColor } from "@/lib/teams";
import { ordinalFr } from "@/lib/format";
import { SEASON } from "@/lib/config";
import { TeamSeasonTable } from "@/components/team/TeamSeasonTable";
import { ColorTab } from "@/components/ColorTab";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ constructorId: string }>;
}): Promise<Metadata> {
    const { constructorId } = await params;
    const c = await getConstructorInfo(constructorId);
    return { title: c?.name ?? "Écurie" };
}

export default async function TeamPage({
    params,
}: {
    params: Promise<{ constructorId: string }>;
}) {
    const { constructorId } = await params;
    const [career, constructorStandings, driverStandings] = await Promise.all([
        getConstructorCareer(constructorId),
        getConstructorStandings(SEASON),
        getDriverStandings(SEASON),
    ]);
    if (career.length === 0) notFound();

    const latest = career[career.length - 1];
    const team = latest.standing.Constructor;
    const color = teamColor(constructorId);

    // Situation dans le championnat en cours (absent si écurie historique)
    const current = constructorStandings.find(
        (s) => s.Constructor.constructorId === constructorId
    );
    const drivers = driverStandings.filter(
        (s) => s.Constructors[0]?.constructorId === constructorId
    );

    // ——— Agrégats de l'historique ———
    let wins = 0;
    let titles = 0;
    let best = Infinity;
    for (const { standing } of career) {
        wins += Number(standing.wins);
        const pos = Number(standing.position);
        if (pos === 1) titles += 1;
        if (pos < best) best = pos;
    }
    const stats: [string, string | number][] = [
        ["Saisons", career.length],
        ["Titres constructeurs", titles],
        ["Victoires", wins],
        ["Meilleur classement", ordinalFr(best)],
    ];

    return (
        <main>
            <Link
                href="/classements?vue=constructeurs"
                className="mb-5 inline-block text-sm font-bold text-white/55 transition-colors hover:text-white"
            >
                ← Classement constructeurs
            </Link>

            {/* ——— Hero ——— */}
            <div className="relative mb-6 flex flex-wrap items-center gap-4 rounded-lg bg-[#1B1B26] p-5 sm:gap-7 sm:px-7 sm:pb-6 sm:pt-7">
                <ColorTab color={color} />
                <span
                    className="h-8 w-[46px] -skew-x-[15deg] sm:h-12 sm:w-[68px]"
                    style={{ backgroundColor: color }}
                />
                <div className="flex min-w-0 flex-1 flex-col gap-1 sm:min-w-[220px] sm:gap-1.5">
                    <h1 className="text-[26px] font-black italic leading-[1.1] tracking-[0.5px] sm:text-[40px]">
                        {team.name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-x-3.5 gap-y-0.5 text-[13px] font-semibold text-white/60 sm:text-[15px]">
                        {team.nationality && <span>{team.nationality}</span>}
                        {drivers.map((d) => (
                            <Link
                                key={d.Driver.driverId}
                                href={`/pilotes/${d.Driver.driverId}`}
                                className="font-bold text-white/80 transition-colors hover:text-white"
                            >
                                {d.Driver.givenName} {d.Driver.familyName}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Championnat : ligne de pied sur mobile, colonne à droite sur desktop */}
                {current && (
                    <div className="flex w-full items-center justify-between gap-3 border-t border-white/[0.08] pt-3 sm:w-auto sm:flex-col sm:items-end sm:gap-0.5 sm:border-0 sm:pt-0">
                        <span className="text-[11px] font-bold uppercase tracking-[1px] text-white/45 sm:text-[13px]">
                            Championnat {SEASON}
                        </span>
                        <span className="text-xl font-black italic sm:text-[34px]">
                            {ordinalFr(Number(current.position))}
                            <span className="text-sm text-white/50 sm:text-lg">
                                {" "}
                                · {current.points} pts
                            </span>
                        </span>
                    </div>
                )}
            </div>

            {/* ——— Historique ——— */}
            <section className="mb-8">
                <h2 className="mb-3 text-sm font-bold uppercase tracking-[2px] text-white/45">
                    Historique
                </h2>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                    {stats.map(([label, value]) => (
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

            <TeamSeasonTable career={career} color={color} />
        </main>
    );
}