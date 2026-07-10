import Link from "next/link";
import { notFound } from "next/navigation";
import {
    getCircuit,
    getCircuitEditions,
    getCircuitLapRecord,
    getSeasonRaces,
} from "@/lib/jolpica";
import { getCircuitTrack } from "@/lib/circuitGeo";
import { teamColor } from "@/lib/teams";
import { CircuitMap } from "@/components/circuit/CircuitMap";
import { SEASON } from "@/lib/config";
import { Metadata } from "next";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ circuitId: string }>;
}): Promise<Metadata> {
    const { circuitId } = await params;
    const c = await getCircuit(circuitId);
    return { title: c?.circuitName ?? "Circuit" };
}

export default async function CircuitPage({
    params,
}: {
    params: Promise<{ circuitId: string }>;
}) {
    const { circuitId } = await params;
    const circuit = await getCircuit(circuitId);
    if (!circuit) notFound();

    const [editions, record, races, track] = await Promise.all([
        getCircuitEditions(circuitId),
        getCircuitLapRecord(circuitId),
        getSeasonRaces(SEASON),
        getCircuitTrack(
            Number(circuit.Location.lat),
            Number(circuit.Location.long)
        ),
    ]);

    // Le GP de la saison en cours sur ce circuit (absent si circuit historique)
    const race = races.find((r) => r.Circuit.circuitId === circuitId);
    const raceDate = race
        ? new Date(`${race.date}T12:00:00Z`).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
        })
        : null;

    // ——— Record de victoires ———
    const winCount = new Map<string, { name: string; n: number }>();
    for (const e of editions) {
        if (!e.winner) continue;
        const key = `${e.winner.givenName} ${e.winner.familyName}`;
        winCount.set(key, { name: key, n: (winCount.get(key)?.n ?? 0) + 1 });
    }
    const top = [...winCount.values()].sort((a, b) => b.n - a.n)[0];

    // ——— Chiffres clés ———
    const facts: [string, string][] = [
        ...(track?.lengthM
            ? ([["Longueur", `${(track.lengthM / 1000).toFixed(3)} km`]] as [string, string][])
            : []),
        ...(track?.altitude != null
            ? ([["Altitude", `${track.altitude} m`]] as [string, string][])
            : []),
        ["Éditions", String(editions.length)],
        [
            top ? `${top.n} victoire${top.n > 1 ? "s" : ""}` : "—",
            top ? `Record · ${top.name.split(" ").slice(-1)[0]}` : "Record",
        ],
    ];

    const winners = [...editions].reverse().slice(0, 10);

    return (
        <main>
            <Link
                href={race ? `/gp/${race.round}` : "/calendrier"}
                className="mb-5 inline-block text-sm font-bold text-white/55 transition-colors hover:text-white"
            >
                ← {race ? race.raceName : "Calendrier"}
            </Link>

            {/* ——— Hero : tracé + infos ——— */}
            <div className="mb-6 flex flex-wrap overflow-hidden rounded-[10px] bg-[#15151E]">
                <div
                    className="relative flex min-w-[300px] flex-[1.2] items-center justify-center p-7"
                    style={{
                        background:
                            "radial-gradient(ellipse at 60% 40%, #1C1C28 0%, #15151E 70%)",
                    }}
                >
                    {track ? (
                        <>
                            <CircuitMap track={track} />
                            <span className="absolute bottom-3.5 left-5 text-[11px] font-bold uppercase tracking-[1.5px] text-white/30">
                                Tracé illustratif
                            </span>
                        </>
                    ) : (
                        <span className="py-16 text-sm font-semibold text-white/30">
                            Tracé indisponible pour ce circuit
                        </span>
                    )}
                </div>

                <div className="flex min-w-[280px] flex-1 flex-col gap-3.5 border-l-4 border-[#E10600] px-5 py-7 sm:px-8 sm:py-9">
                    <span className="text-xs font-bold uppercase tracking-[3px] text-[#E10600]">
                        Circuit
                    </span>
                    <h1 className="text-[28px] font-black italic leading-[1.05] tracking-[0.5px] sm:text-[38px]">
                        {circuit.circuitName}
                    </h1>
                    <span className="text-[15px] font-semibold text-white/55">
                        {race
                            ? `${race.raceName} · Manche ${race.round} · ${raceDate}`
                            : `${circuit.Location.locality} · ${circuit.Location.country}`}
                    </span>

                    {record && (
                        <div className="mt-2 flex flex-col gap-2.5">
                            <div className="flex justify-between gap-3 border-b border-white/[0.08] pb-2">
                                <span className="text-[13px] font-bold uppercase tracking-[1px] text-white/45">
                                    Record du tour
                                </span>
                                <span className="text-base font-black italic tabular-nums">
                                    {record.time}
                                </span>
                            </div>
                            <div className="flex justify-between gap-3">
                                <span className="text-[13px] font-bold uppercase tracking-[1px] text-white/45">
                                    Détenu par
                                </span>
                                <Link
                                    href={`/pilotes/${record.driverId}`}
                                    className="text-[15px] font-bold text-[#FF3B33] transition-colors hover:text-white"
                                >
                                    {record.holder} · {record.year}
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ——— Chiffres clés ——— */}
            <div className="mb-8 grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-2.5">
                {facts.map(([value, label]) => (
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

            {/* ——— Derniers vainqueurs ——— */}
            <h2 className="mb-3 text-sm font-bold uppercase tracking-[2px] text-white/45">
                Derniers vainqueurs ici
            </h2>
            <div className="mb-8 flex flex-col gap-[5px]">
                {winners.map((e) => {
                    const color = teamColor(e.winner?.constructorId);

                    const content = (
                        <>
                            {/* Pastille couleur */}
                            <span
                                className="h-7 w-2 shrink-0 rounded-[3px]"
                                style={{ backgroundColor: color }}
                            />

                            <span className="w-14 text-lg font-black italic text-white/90">
                                {e.season}
                            </span>

                            <span className="flex-1 text-[15px] font-bold">
                                {e.winner
                                    ? `${e.winner.givenName} ${e.winner.familyName}`
                                    : "—"}
                            </span>
                        </>
                    );

                    const cls =
                        "flex items-center gap-3.5 rounded-md bg-[#1B1B26] pl-3 pr-4 py-3 transition-colors hover:bg-[#242433]";

                    return e.winner?.driverId ? (
                        <Link
                            key={e.season}
                            href={`/pilotes/${e.winner.driverId}`}
                            className={cls}
                        >
                            {content}
                        </Link>
                    ) : (
                        <div key={e.season} className={cls}>
                            {content}
                        </div>
                    );
                })}
            </div>

            {/* ——— CTA week-end de course ——— */}
            {race && (
                <Link
                    href={`/gp/${race.round}`}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-lg border-l-4 border-[#E10600] bg-[#15151E] px-6 py-5 transition-colors hover:bg-[#1C1C28]"
                >
                    <span className="flex flex-col gap-0.5">
                        <span className="text-xs font-bold uppercase tracking-[2px] text-[#E10600]">
                            Week-end de course
                        </span>
                        <span className="text-xl font-black italic">
                            {race.raceName} {SEASON}
                        </span>
                    </span>
                    <span className="text-[13px] font-bold uppercase italic tracking-[1px] text-white/65">
                        Qualifs &amp; course →
                    </span>
                </Link>
            )}
        </main>
    );
}