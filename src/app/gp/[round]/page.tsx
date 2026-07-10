import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
    getSeasonRaces,
    getRaceResults,
    getQualifyingResults,
    getSprintResults,
    getPitStops,
    getLapPositions,
} from "@/lib/jolpica";
import { teamColor } from "@/lib/teams";
import { flagUrl } from "@/lib/flags";
import { SessionTabs } from "@/components/gp/SessionTabs";
import type { SessionRow, RaceRow } from "@/components/gp/SessionTabs";
import { PositionsChart, type PositionSeries, type StopMarker } from "@/components/gp/PositionsChart";
import type { PitRow } from "@/components/gp/SessionTabs";
import { SEASON } from "@/lib/config";
import type { Metadata } from "next";
import { ColorTab } from "@/components/ColorTab";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ round: string }>;
}): Promise<Metadata> {
    const { round } = await params;
    const races = await getSeasonRaces(SEASON);
    const race = races.find((r) => r.round === round);
    return { title: race ? `${race.raceName} ${SEASON}` : "Grand Prix" };
}

const STATUS_FR: Record<string, string> = {
    Engine: "Moteur",
    "Power Unit": "Moteur",
    Gearbox: "Boîte",
    Transmission: "Transmission",
    Collision: "Accrochage",
    "Collision damage": "Accrochage",
    Accident: "Accident",
    "Spun off": "Sortie de piste",
    Hydraulics: "Hydraulique",
    Electrical: "Électrique",
    Electronics: "Électronique",
    Brakes: "Freins",
    Suspension: "Suspension",
    Steering: "Direction",
    Clutch: "Embrayage",
    Exhaust: "Échappement",
    Overheating: "Surchauffe",
    "Water leak": "Fuite d'eau",
    "Oil leak": "Fuite d'huile",
    "Fuel pressure": "Carburant",
    "Fuel system": "Carburant",
    Puncture: "Crevaison",
    Tyre: "Pneu",
    Wheel: "Roue",
    Damage: "Dégâts",
    Debris: "Débris",
    Retired: "Abandon",
    Withdrew: "Forfait",
    Disqualified: "Disqualifié",
};

const toSec = (t?: string) => {
    if (!t) return null;
    const [m, s] = t.split(":");
    return parseInt(m) * 60 + parseFloat(s);
};

export default async function GpPage({
    params,
}: {
    params: Promise<{ round: string }>;
}) {
    const { round } = await params;

    const [races, results, quali, sprint] = await Promise.all([
        getSeasonRaces(SEASON),
        getRaceResults(SEASON, round),
        getQualifyingResults(SEASON, round),
        getSprintResults(SEASON, round),
    ]);

    const race = races.find((r) => r.round === round);
    if (!race) notFound();

    const done = results.length > 0;
    const flag = flagUrl(race.Circuit.Location.country);
    const dateLabel = new Date(`${race.date}T12:00:00Z`).toLocaleDateString(
        "fr-FR",
        { day: "numeric", month: "long", year: "numeric" }
    );

    // ——— Infos course (calculées depuis les résultats) ———
    const poleman =
        quali[0]?.Driver.code ??
        results.find((r) => r.grid === "1")?.Driver.code ??
        "—";
    const fastest = results.find((r) => r.FastestLap?.rank === "1");
    const dnf = results.filter((r) => !/^\d+$/.test(r.positionText)).length;
    const facts: [string, string][] = [
        ["Tours", done ? results[0].laps : "—"],
        ["Pole position", done ? poleman : "—"],
        [
            "Meilleur tour",
            fastest ? `${fastest.Driver.code} · ${fastest.FastestLap!.Time.time}` : "—",
        ],
        ["Abandons", done ? String(dnf) : "—"],
    ];

    // ——— Mise en forme des sessions pour le composant client ———
    const poleSec = toSec(quali[0]?.Q3 ?? quali[0]?.Q2 ?? quali[0]?.Q1);
    const qualiRows: SessionRow[] = quali.map((q) => {
        const best = q.Q3 ?? q.Q2 ?? q.Q1;
        const sec = toSec(best);
        return {
            pos: `P${q.position}`,
            top3: Number(q.position) <= 3,
            driverId: q.Driver.driverId,
            name: `${q.Driver.givenName} ${q.Driver.familyName}`,
            code: q.Driver.code ?? "",
            team: q.Constructor.name,
            color: teamColor(q.Constructor.constructorId),
            badge: q.Q3 ? "Q3" : q.Q2 ? "Q2" : "Q1",
            right1: best ?? "—",
            right2:
                sec !== null && poleSec !== null && sec !== poleSec
                    ? `+${(sec - poleSec).toFixed(3)}`
                    : "—",
        };
    });

    const toRaceRow = (r: (typeof results)[number]): RaceRow => {
        const classified = /^\d+$/.test(r.positionText);
        const grid = Number(r.grid);
        return {
            pos: classified ? `P${r.positionText}` : "ABD",
            top3: classified && Number(r.position) <= 3,
            driverId: r.Driver.driverId,
            name: `${r.Driver.givenName} ${r.Driver.familyName}`,
            code: r.Driver.code ?? "",
            team: r.Constructor.name,
            color: teamColor(r.Constructor.constructorId),
            pts: Number(r.points) > 0 ? `+${r.points}` : "0",
            // grid "0" = départ depuis la voie des stands → pas d'écart calculable
            diff: classified && grid > 0 ? grid - Number(r.position) : null,
            reason: classified ? null : (STATUS_FR[r.status] ?? r.status),
        };
    };

    const raceRows = results.map(toRaceRow);
    const sprintRows = sprint.map(toRaceRow);

    // ——— Positions tour par tour + arrêts (courses terminées uniquement) ———
    let stops: StopMarker[] = [];
    let series: PositionSeries[] = [];
    let totalLaps = 0;

    if (done) {
        const [pits, laps] = await Promise.all([
            getPitStops(SEASON, round),
            getLapPositions(SEASON, round),
        ]);

        totalLaps = laps.totalLaps;
        const byId = new Map(results.map((r) => [r.Driver.driverId, r]));

        const seenTeams = new Set<string>();
        series = results
            .map((r) => {
                const cid = r.Constructor.constructorId;
                const dashed = seenTeams.has(cid);
                seenTeams.add(cid);
                return {
                    code: r.Driver.code ?? r.Driver.familyName.slice(0, 3).toUpperCase(),
                    color: teamColor(cid),
                    dashed,
                    driverId: r.Driver.driverId,
                    points: laps.byDriver.get(r.Driver.driverId) ?? [],
                };
            })
            .filter((s) => s.points.length > 0);

        // Marqueurs d'arrêts : position du pilote au tour de l'arrêt
        stops = pits.flatMap((p) => {
            const d = byId.get(p.driverId);
            const trace = laps.byDriver.get(p.driverId) ?? [];
            const lapN = Number(p.lap);
            const pt =
                trace.find(([l]) => l === lapN) ??
                trace.find(([l]) => l === lapN + 1);
            if (!pt) return [];
            const name = d ? `${d.Driver.givenName} ${d.Driver.familyName}` : p.driverId;
            return [
                {
                    lap: pt[0],
                    pos: pt[1],
                    color: teamColor(d?.Constructor.constructorId),
                    tip: `${name} · Arrêt ${p.stop} · Tour ${p.lap} · ${p.duration} s`,
                },
            ];
        });
    }

    return (
        <main>
            <Link
                href="/calendrier"
                className="mb-5 inline-block text-sm font-bold text-white/55 transition-colors hover:text-white"
            >
                ← Calendrier
            </Link>

            {/* ——— Hero GP ——— */}
            <div className="relative mb-6 flex flex-wrap items-center gap-5 rounded-lg bg-[#1B1B26] p-5 sm:gap-7 sm:p-7">
                <ColorTab color="#E10600" />
                <span className="text-[44px] font-black italic leading-none text-white/[0.18] sm:text-[64px]">
                    R{race.round}
                </span>
                <div className="flex min-w-[220px] flex-1 flex-col gap-1.5">
                    <h1 className="flex items-center gap-3 text-[26px] font-black italic leading-[1.1] tracking-[0.5px] sm:text-4xl">
                        {flag && (
                            <Image
                                src={flag}
                                alt={race.Circuit.Location.country}
                                width={32}
                                height={24}
                                className="h-6 w-8 shrink-0 rounded-[2px] object-cover"
                            />
                        )}
                        {race.raceName}
                    </h1>
                    <span className="text-[15px] font-semibold text-white/55">
                        <Link
                            href={`/circuits/${race.Circuit.circuitId}`}
                            className="font-bold text-[#FF3B33] transition-colors hover:text-white"
                        >
                            {race.Circuit.circuitName}
                        </Link>{" "}
                        · {dateLabel}
                    </span>
                </div>
                <span
                    className="rounded bg-[#E10600]/15 px-3.5 py-1.5 text-[13px] font-bold uppercase tracking-[1.5px]"
                    style={{ color: done ? "rgba(255,255,255,0.65)" : "#FF3B33" }}
                >
                    {done ? "Terminé" : "À venir"}
                </span>
            </div>

            {/* ——— Infos course ——— */}
            <div className="mb-8 grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-2.5">
                {facts.map(([label, value]) => (
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

            {done ? (
                <SessionTabs
                    qualiRows={qualiRows}
                    sprintRows={sprintRows}
                    raceRows={raceRows}
                    series={series}
                    stops={stops}
                    totalLaps={totalLaps}
                />
            ) : (
                <div className="flex flex-col items-center gap-2.5 rounded-md bg-[#1B1B26] px-5 py-10 text-center">
                    <span className="pw-pulse h-3 w-3 rounded-full bg-[#E10600]" />
                    <span className="text-xl font-black italic">Course à venir</span>
                    <span className="text-sm font-semibold text-white/50">
                        Les résultats seront disponibles après le {dateLabel}.
                    </span>
                </div>
            )}
        </main>
    );
}