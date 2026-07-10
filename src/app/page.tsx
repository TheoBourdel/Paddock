import Link from "next/link";
import { getDriverStandings, getSeasonRaces } from "@/lib/jolpica";
import { teamColor } from "@/lib/teams";
import { SEASON } from "@/lib/config";

const MEDALS = ["#FFD700", "#C0C0C0", "#CD7F32"];

// Variante sombre d'une couleur d'écurie (pour le dégradé du panneau)
function darken(hex: string, f = 0.45) {
    const n = parseInt(hex.slice(1), 16);
    const r = Math.round(((n >> 16) & 255) * f);
    const g = Math.round(((n >> 8) & 255) * f);
    const b = Math.round((n & 255) * f);
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

export default async function Home() {
    const [drivers, races] = await Promise.all([
        getDriverStandings(SEASON),
        getSeasonRaces(SEASON),
    ]);

    const now = new Date();
    const isDone = (r: (typeof races)[number]) =>
        new Date(`${r.date}T${r.time ?? "12:00:00Z"}`) < now;
    const doneCount = races.filter(isDone).length;
    const next = races.find((r) => !isDone(r));
    const progressLabel =
        doneCount > 0
            ? `Après ${doneCount} manche${doneCount > 1 ? "s" : ""} sur ${races.length}`
            : `${races.length} manches au programme`;

    const leader = drivers[0];
    const second = drivers[1];
    const leaderColor = teamColor(leader?.Constructors[0]?.constructorId);
    const secondColor = teamColor(second?.Constructors[0]?.constructorId);
    const gap =
        leader && second ? Number(leader.points) - Number(second.points) : 0;
    const barW =
        leader && second
            ? Math.round(
                (Number(leader.points) /
                    (Number(leader.points) + Number(second.points) || 1)) *
                100
            )
            : 50;

    const nextDate = next
        ? new Date(`${next.date}T12:00:00Z`).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
        })
        : null;

    return (
        <main>
            {/* ==== HERO ==== */}
            <div
                className="relative mb-3.5 flex min-h-[480px] overflow-hidden rounded-[10px]"
                style={{
                    background: "linear-gradient(160deg, #15151E 55%, #101018 100%)",
                }}
            >
                {/* Panneau incliné aux couleurs du leader */}
                {leader && (
                    <div className="hidden lg:block">
                        <div
                            className="absolute -bottom-16 -right-[120px] -top-16 w-[52%]"
                            style={{
                                background: `linear-gradient(200deg, ${leaderColor} 0%, ${darken(leaderColor)} 100%)`,
                                transform: "skewX(-12deg)",
                                boxShadow: "-20px 0 60px rgba(0,0,0,0.45)",
                            }}
                        />
                        <div
                            className="absolute -bottom-16 -top-16 w-3.5 bg-[#0F0F17]"
                            style={{ right: "calc(-120px + 52%)", transform: "skewX(-12deg)" }}
                        />
                        <div
                            className="absolute -bottom-16 -top-16 w-[5px] opacity-50"
                            style={{
                                right: "calc(-134px + 52%)",
                                backgroundColor: leaderColor,
                                transform: "skewX(-12deg)",
                            }}
                        />
                        {/* Numéro géant en filigrane */}
                        {leader.Driver.permanentNumber && (
                            <span
                                className="pointer-events-none absolute -bottom-[70px] -right-2.5 select-none text-[340px] font-black italic leading-none tracking-[-10px] text-[#0F0F17]/[0.28]"
                                aria-hidden="true"
                            >
                                {leader.Driver.permanentNumber}
                            </span>
                        )}
                        {/* Infos leader */}
                        <Link
                            href={`/pilotes/${leader.Driver.driverId}`}
                            className="absolute right-9 top-11 flex flex-col items-end gap-0.5 text-right"
                        >
                            <span className="text-xs font-bold uppercase tracking-[3px] text-white/75">
                                Leader du championnat
                            </span>
                            <span
                                className="text-[38px] font-black italic leading-[1.1]"
                                style={{ textShadow: "0 2px 18px rgba(0,0,0,0.35)" }}
                            >
                                {leader.Driver.givenName} {leader.Driver.familyName}
                            </span>
                            <span className="text-sm font-bold text-white/85">
                                {leader.Constructors[0]?.name} · {leader.points} pts
                            </span>
                        </Link>
                    </div>
                )}

                {/* Texte principal */}
                <div className="relative flex max-w-full flex-col justify-center gap-5 px-5 pb-20 pt-12 sm:px-10 sm:pb-24 sm:pt-16 lg:max-w-[56%]">
                    <span className="flex items-center gap-2.5 text-[13px] font-bold uppercase tracking-[3px] text-[#E10600]">
                        <span className="h-0.5 w-[26px] bg-[#E10600]" />
                        Saison {SEASON} · {progressLabel}
                    </span>
                    <h1 className="text-5xl font-black uppercase italic leading-[0.98] tracking-[-1px] sm:text-[64px]">
                        Chaque point
                        <br />
                        compte.
                    </h1>
                    <p className="max-w-[420px] text-[17px] leading-[1.6] text-white/60">
                        Classements, stats pilotes, week-ends de Grand Prix complets — et
                        bientôt le live timing.
                    </p>
                    <div className="mt-2 flex flex-wrap gap-3">
                        <Link
                            href="/classements"
                            className="bg-[#E10600] px-[30px] py-3.5 text-[15px] font-bold uppercase italic tracking-[1px] transition-colors hover:bg-[#FF3B33]"
                            style={{
                                clipPath:
                                    "polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)",
                            }}
                        >
                            Le classement →
                        </Link>
                        <Link
                            href="/calendrier"
                            className="border border-white/20 bg-white/[0.06] px-[30px] py-3.5 text-[15px] font-bold uppercase italic tracking-[1px] transition-colors hover:border-white"
                            style={{
                                clipPath:
                                    "polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)",
                            }}
                        >
                            Calendrier
                        </Link>
                    </div>
                </div>

                {/* Bande damier */}
                <div
                    className="absolute inset-x-0 bottom-0 h-[22px]"
                    style={{
                        backgroundImage:
                            "linear-gradient(45deg, rgba(255,255,255,0.13) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.13) 75%), linear-gradient(45deg, rgba(255,255,255,0.13) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.13) 75%)",
                        backgroundSize: "22px 22px",
                        backgroundPosition: "0 0, 11px 11px",
                    }}
                />
            </div>

            {/* ==== DUEL POUR LE TITRE (desktop) ==== */}
            {leader && second && (
                <div className="relative mb-3.5 hidden overflow-hidden rounded-[10px] bg-[#15151E] px-9 py-8 sm:block">
                    <span
                        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap text-[120px] font-black italic tracking-[4px] text-white/[0.03]"
                        aria-hidden="true"
                    >
                        VS
                    </span>
                    <div className="relative flex flex-col gap-5">
                        <span className="text-center text-xs font-bold uppercase tracking-[3px] text-white/45">
                            La lutte pour le titre
                        </span>
                        <div className="flex flex-wrap items-center justify-between gap-6">
                            <Link
                                href={`/pilotes/${leader.Driver.driverId}`}
                                className="flex min-w-[180px] flex-1 items-center gap-4"
                            >
                                <span
                                    className="text-[56px] font-black italic leading-none"
                                    style={{ color: leaderColor }}
                                >
                                    {leader.Driver.code}
                                </span>
                                <span className="flex flex-col gap-px">
                                    <span className="text-[17px] font-bold">
                                        {leader.Driver.givenName} {leader.Driver.familyName}
                                    </span>
                                    <span className="text-[13px] font-semibold text-white/50">
                                        {leader.Constructors[0]?.name}
                                    </span>
                                    <span className="mt-0.5 text-[22px] font-black italic">
                                        {leader.points}{" "}
                                        <span className="text-xs font-bold not-italic text-white/45">
                                            PTS
                                        </span>
                                    </span>
                                </span>
                            </Link>

                            <div className="flex flex-col items-center gap-1">
                                <span className="text-[11px] font-bold uppercase tracking-[2px] text-white/40">
                                    Écart
                                </span>
                                <span className="text-[30px] font-black italic text-[#E10600]">
                                    {gap}
                                </span>
                                <span className="text-[11px] font-bold text-white/40">
                                    points
                                </span>
                            </div>

                            <Link
                                href={`/pilotes/${second.Driver.driverId}`}
                                className="flex min-w-[180px] flex-1 flex-row-reverse items-center gap-4 text-right"
                            >
                                <span
                                    className="text-[56px] font-black italic leading-none"
                                    style={{ color: secondColor }}
                                >
                                    {second.Driver.code}
                                </span>
                                <span className="flex flex-col items-end gap-px">
                                    <span className="text-[17px] font-bold">
                                        {second.Driver.givenName} {second.Driver.familyName}
                                    </span>
                                    <span className="text-[13px] font-semibold text-white/50">
                                        {second.Constructors[0]?.name}
                                    </span>
                                    <span className="mt-0.5 text-[22px] font-black italic">
                                        {second.points}{" "}
                                        <span className="text-xs font-bold not-italic text-white/45">
                                            PTS
                                        </span>
                                    </span>
                                </span>
                            </Link>
                        </div>

                        <div className="flex h-2.5 overflow-hidden rounded-[5px] bg-white/[0.06]">
                            <span
                                className="block h-full"
                                style={{ backgroundColor: leaderColor, width: `${barW}%` }}
                            />
                            <span className="block h-full w-1 bg-[#0F0F17]" />
                            <span
                                className="block h-full flex-1"
                                style={{ backgroundColor: secondColor }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* ==== DUEL POUR LE TITRE (mobile compact) ==== */}
            {leader && second && (
                <div className="mb-3.5 flex flex-col gap-3.5 rounded-[10px] bg-[#15151E] p-5 sm:hidden">
                    <span className="text-center text-[11px] font-bold uppercase tracking-[2px] text-white/45">
                        La lutte pour le titre
                    </span>

                    <div className="flex items-center justify-center gap-3.5">
                        <Link
                            href={`/pilotes/${leader.Driver.driverId}`}
                            className="text-[34px] font-black italic leading-none"
                            style={{ color: leaderColor }}
                        >
                            {leader.Driver.code}
                        </Link>
                        <div className="flex flex-col items-center">
                            <span className="text-[17px] font-black italic text-[#E10600]">
                                {gap}
                            </span>
                            <span className="text-[10px] font-bold text-white/40">pts</span>
                        </div>
                        <Link
                            href={`/pilotes/${second.Driver.driverId}`}
                            className="text-[34px] font-black italic leading-none"
                            style={{ color: secondColor }}
                        >
                            {second.Driver.code}
                        </Link>
                    </div>

                    <div className="flex h-2 overflow-hidden rounded bg-white/[0.06]">
                        <span
                            className="block h-full"
                            style={{ backgroundColor: leaderColor, width: `${barW}%` }}
                        />
                        <span className="block h-full w-[3px] bg-[#0F0F17]" />
                        <span
                            className="block h-full flex-1"
                            style={{ backgroundColor: secondColor }}
                        />
                    </div>

                    <div className="flex justify-between text-[13px] font-black">
                        <span>{leader.points} pts</span>
                        <span>{second.points} pts</span>
                    </div>
                </div>
            )}

            {/* ==== PROCHAIN GP + PODIUM + LIVE ==== */}
            <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-3.5">
                {next && (
                    <Link
                        href={`/gp/${next.round}`}
                        className="relative flex flex-col gap-2.5 overflow-hidden rounded-[10px] bg-[#15151E] p-[26px] transition-colors hover:bg-[#1C1C28]"
                    >
                        <span
                            className="pointer-events-none absolute -bottom-7 right-2.5 select-none text-[110px] font-black italic leading-none text-white/[0.04]"
                            aria-hidden="true"
                        >
                            R{next.round}
                        </span>
                        <span className="text-xs font-bold uppercase tracking-[2px] text-[#E10600]">
                            Prochain Grand Prix
                        </span>
                        <span className="text-[26px] font-black italic leading-[1.15]">
                            {next.raceName}
                        </span>
                        <span className="text-sm font-semibold text-white/55">
                            {next.Circuit.circuitName} · {nextDate}
                        </span>
                        <span className="mt-auto text-[13px] font-bold uppercase italic tracking-[1px] text-white/65">
                            Voir le week-end →
                        </span>
                    </Link>
                )}

                <div className="flex flex-col gap-3 rounded-[10px] bg-[#15151E] p-[26px]">
                    <span className="text-xs font-bold uppercase tracking-[2px] text-white/45">
                        Podium du championnat
                    </span>
                    <div className="flex flex-col gap-2.5">
                        {drivers.slice(0, 3).map((d, i) => (
                            <Link
                                key={d.Driver.driverId}
                                href={`/pilotes/${d.Driver.driverId}`}
                                className="flex items-center gap-3"
                            >
                                <span
                                    className="w-[34px] text-xl font-black italic"
                                    style={{ color: MEDALS[i] }}
                                >
                                    {i + 1}
                                </span>
                                <span
                                    className="h-6 w-1 rounded-sm"
                                    style={{
                                        backgroundColor: teamColor(
                                            d.Constructors[0]?.constructorId
                                        ),
                                    }}
                                />
                                <span className="flex-1 text-[15px] font-bold">
                                    {d.Driver.givenName} {d.Driver.familyName}
                                </span>
                                <span className="text-base font-black italic">{d.points}</span>
                            </Link>
                        ))}
                    </div>
                    <Link
                        href="/classements"
                        className="mt-auto text-[13px] font-bold uppercase italic tracking-[1px] text-white/65 transition-colors hover:text-white"
                    >
                        Classement complet →
                    </Link>
                </div>

                <Link
                    href="/live"
                    className="flex flex-col gap-2.5 rounded-[10px] border border-[#E10600]/25 p-[26px] transition-colors hover:border-[#E10600]/60"
                    style={{
                        background: "linear-gradient(150deg, #1E0B0B 0%, #15151E 60%)",
                    }}
                >
                    <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[2px] text-[#FF3B33]">
                        <span className="pw-pulse h-2 w-2 rounded-full bg-[#E10600]" />
                        Live Timing
                    </span>
                    <span className="text-[26px] font-black italic leading-[1.15]">
                        Bientôt
                        <br />
                        disponible
                    </span>
                    <span className="text-sm font-semibold text-white/55">
                        Chronos, positions et écarts en temps réel, GP après GP.
                    </span>
                </Link>
            </div>
        </main>
    );
}