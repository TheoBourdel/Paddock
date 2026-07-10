import Link from "next/link";
import type { DriverStanding } from "@/lib/jolpica";
import { teamColor } from "@/lib/teams";
import { tierFor } from "./tiers";

export function DriverRow({
    standing,
    leaderPts,
}: {
    standing: DriverStanding;
    leaderPts: number;
}) {
    const { Driver: d, Constructors, position, points, wins } = standing;
    const team = Constructors[0];
    const gap = leaderPts - Number(points);
    const t = tierFor(position);

    return (
        <li>
            <Link
                href={`/pilotes/${d.driverId}`}
                className={`flex items-center gap-3.5 rounded-md bg-[#1B1B26] pl-3 pr-4 transition-colors hover:bg-[#242433] ${t.row}`}
            >
                {/* Pastille couleur écurie */}
                <span
                    className={`w-2 shrink-0 rounded-[3px] ${t.chip}`}
                    style={{ backgroundColor: teamColor(team?.constructorId) }}
                />
                <span className={`w-7 font-black italic text-white/85 ${t.pos}`}>
                    {position}
                </span>
                <span className="flex min-w-0 flex-1 items-baseline gap-2.5">
                    <span className={`truncate font-bold ${t.name}`}>
                        {d.givenName} {d.familyName}
                    </span>
                    {d.code && (
                        <span className="hidden shrink-0 text-xs font-black tracking-[1px] text-white/40 sm:inline">
                            {d.code}
                        </span>
                    )}
                </span>
                <span className="hidden w-40 text-sm font-semibold text-white/55 md:block">
                    {team?.name}
                </span>
                <span className="hidden w-[50px] text-center font-bold text-white/75 sm:block">
                    {wins}
                </span>
                <span className="hidden w-[60px] text-right text-sm font-semibold text-white/45 sm:block">
                    {gap === 0 ? "—" : `-${gap}`}
                </span>
                <span className={`w-[70px] text-right font-black ${t.pts}`}>
                    {points}
                </span>
            </Link>
        </li>
    );
}