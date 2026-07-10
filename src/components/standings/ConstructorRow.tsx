import Link from "next/link";
import type { ConstructorStanding } from "@/lib/jolpica";
import { teamColor } from "@/lib/teams";
import { tierFor } from "./tiers";

export function ConstructorRow({
    standing,
    leaderPts,
}: {
    standing: ConstructorStanding;
    leaderPts: number;
}) {
    const { Constructor: c, position, points, wins } = standing;
    const color = teamColor(c.constructorId);
    const barW = Math.round((Number(points) / (leaderPts || 1)) * 100);
    const t = tierFor(position);

    return (
        <li>
            <Link
                href={`/ecuries/${c.constructorId}`}
                className={`flex items-center gap-3.5 rounded-md bg-[#1B1B26] pl-3 pr-4 transition-colors hover:bg-[#242433] ${t.row}`}
            >
                <span
                    className={`w-2 shrink-0 rounded-[3px] ${t.chip}`}
                    style={{ backgroundColor: color }}
                />
                <span className={`w-7 font-black italic text-white/85 ${t.pos}`}>
                    {position}
                </span>
                <span className={`min-w-0 flex-1 truncate font-bold ${t.name}`}>
                    {c.name}
                </span>
                <span className="hidden h-1.5 flex-1 overflow-hidden rounded-[3px] bg-white/[0.07] sm:block sm:max-w-[260px]">
                    <span
                        className="block h-full"
                        style={{ backgroundColor: color, width: `${barW}%` }}
                    />
                </span>
                <span className="hidden w-[50px] text-center font-bold text-white/75 sm:block">
                    {wins}
                </span>
                <span className={`w-[70px] text-right font-black ${t.pts}`}>
                    {points}
                </span>
            </Link>
        </li>
    );
}