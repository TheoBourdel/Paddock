import Image from "next/image";
import type { Race, RaceWinner } from "@/lib/jolpica";
import { teamColor } from "@/lib/teams";
import { flagUrl } from "@/lib/flags";
import Link from "next/link";

function formatDate(date: string) {
    return new Date(`${date}T12:00:00Z`).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

export function RaceCard({
    race,
    winner,
    done,
    isNext,
}: {
    race: Race;
    winner: RaceWinner | null;
    done: boolean;
    isNext: boolean;
}) {
    const status = done ? "Terminé" : isNext ? "Prochain GP" : "À venir";
    const statusColor = done
        ? "rgba(255,255,255,0.35)"
        : isNext
            ? "#E10600"
            : "rgba(255,255,255,0.5)";
    const flag = flagUrl(race.Circuit.Location.country);

    return (
        <Link
            href={`/gp/${race.round}`}
            className="flex flex-col gap-2 rounded-md bg-[#1B1B26] p-4 transition-colors hover:bg-[#242433]"
            style={{
                border: `1px solid ${isNext ? "#E10600" : "rgba(255,255,255,0.06)"}`,
                opacity: done ? 0.75 : 1,
            }}
        >
            <div className="flex items-center justify-between gap-2.5">
                <span className="text-[13px] font-black italic tracking-[1px] text-white/40">
                    R{race.round}
                </span>
                <span
                    className="text-xs font-bold uppercase tracking-[1px]"
                    style={{ color: statusColor }}
                >
                    {status}
                </span>
            </div>

            <div className="flex flex-col gap-0.5">
                <span className="flex items-center gap-2.5 text-[17px] font-bold">
                    {flag && (
                        <Image
                            src={flag}
                            alt={race.Circuit.Location.country}
                            width={24}
                            height={18}
                            className="h-[14px] w-5 shrink-0 rounded-[2px] object-cover"
                        />
                    )}
                    {race.raceName}
                </span>
                <span className="text-[13px] font-semibold text-white/45">
                    {race.Circuit.circuitName} · {formatDate(race.date)}
                </span>
            </div>

            {winner && (
                <div className="mt-0.5 flex items-center gap-2">
                    <span
                        className="h-2.5 w-2.5 rounded-sm"
                        style={{ backgroundColor: teamColor(winner.constructorId) }}
                    />
                    <span className="text-[13px] font-bold text-white/75">
                        🏆 {winner.givenName} {winner.familyName}
                    </span>
                </div>
            )}
        </Link>
    );
}