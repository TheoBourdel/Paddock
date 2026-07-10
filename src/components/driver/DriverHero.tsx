import Link from "next/link";
import type { SeasonStanding } from "@/lib/jolpica";
import { teamColor } from "@/lib/teams";
import { ordinalFr } from "@/lib/format";
import { ColorTab } from "../ColorTab";

function age(dateOfBirth?: string) {
    if (!dateOfBirth) return null;
    const dob = new Date(dateOfBirth);
    const now = new Date();
    let a = now.getFullYear() - dob.getFullYear();
    const m = now.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) a--;
    return a;
}

export function DriverHero({ career }: { career: SeasonStanding[] }) {
    const latest = career[career.length - 1];
    const standing = latest.DriverStandings[0];
    const driver = standing.Driver;
    const team = standing.Constructors[standing.Constructors.length - 1];
    const color = teamColor(team?.constructorId);
    const driverAge = age(driver.dateOfBirth);

    return (
        <>
            <Link
                href="/classements"
                className="mb-5 inline-block text-sm font-bold text-white/55 transition-colors hover:text-white"
            >
                ← Classements
            </Link>

            <div className="relative mb-6 flex flex-wrap items-center gap-4 overflow-hidden rounded-lg bg-[#1B1B26] p-5 sm:gap-7 sm:px-7 sm:pb-6 sm:pt-7">
                <ColorTab color={color} />
                {driver.permanentNumber && (
                    <span
                        className="text-[40px] font-black italic leading-none sm:text-[88px]"
                        style={{ color }}
                    >
                        #{driver.permanentNumber}
                    </span>
                )}

                <div className="flex min-w-0 flex-1 flex-col gap-1 sm:min-w-[220px] sm:gap-1.5">
                    <h1 className="text-[26px] font-black italic leading-[1.1] tracking-[0.5px] sm:text-[40px]">
                        {driver.givenName} {driver.familyName}
                    </h1>
                    <div className="flex flex-wrap items-center gap-x-3.5 gap-y-0.5 text-[13px] font-semibold text-white/60 sm:text-[15px]">
                        {driver.code && (
                            <span className="font-black tracking-[1px] text-white/40">
                                {driver.code}
                            </span>
                        )}
                        <span>{driver.nationality}</span>
                        <span>{team?.name}</span>
                        {driverAge !== null && <span>{driverAge} ans</span>}
                    </div>
                </div>

                {/* Championnat : ligne de pied sur mobile, colonne à droite sur desktop */}
                <div className="flex w-full items-center justify-between gap-3 border-t border-white/[0.08] pt-3 sm:w-auto sm:flex-col sm:items-end sm:gap-0.5 sm:border-0 sm:pt-0">
                    <span className="text-[11px] font-bold uppercase tracking-[1px] text-white/45 sm:text-[13px]">
                        Championnat {latest.season}
                    </span>
                    <span className="text-xl font-black italic sm:text-[34px]">
                        {ordinalFr(Number(standing.position))}
                        <span className="text-sm text-white/50 sm:text-lg">
                            {" "}
                            · {standing.points} pts
                        </span>
                    </span>
                </div>
            </div>
        </>
    );
}