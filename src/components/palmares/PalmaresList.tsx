"use client";

import { useState } from "react";
import Link from "next/link";

export interface ChampionRow {
    year: string;
    driverId: string;
    driver: string;
    country: string;
    team: string;
    pts: string;
    color: string;
    titleLabel: string;
    gold: boolean;
    goldBg: boolean;
}

const DECADES = ["all", 1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020] as const;
type Decade = (typeof DECADES)[number];

export function PalmaresList({ rows }: { rows: ChampionRow[] }) {
    const [decade, setDecade] = useState<Decade>("all");

    const shown = rows.filter(
        (r) =>
            decade === "all" ||
            (Number(r.year) >= decade && Number(r.year) < decade + 10)
    );

    return (
        <>
            <div className="mb-5 flex flex-wrap gap-1.5">
                {DECADES.map((d) => {
                    const active = decade === d;
                    return (
                        <button
                            key={d}
                            onClick={() => setDecade(d)}
                            className={`rounded-[20px] border px-4 py-[7px] text-[13px] font-bold tracking-[0.5px] transition-colors ${active
                                    ? "border-[#E10600] bg-[#E10600] text-white"
                                    : "border-white/20 text-white/60 hover:border-white/50"
                                }`}
                        >
                            {d === "all" ? "Toutes" : `${d}s`}
                        </button>
                    );
                })}
            </div>

            <div className="flex flex-col gap-[5px]">
                {shown.map((r) => (
                    <Link
                        key={r.year}
                        href={`/pilotes/${r.driverId}`}
                        className="flex items-center gap-4 rounded-r bg-[#1B1B26] px-[18px] py-3 transition-colors hover:bg-[#242433]"
                        style={{ borderLeft: `4px solid ${r.color}` }}
                    >
                        <span className="w-16 text-xl font-black italic text-white/90">
                            {r.year}
                        </span>
                        <span className="flex min-w-[160px] flex-1 flex-col gap-px">
                            <span className="flex flex-wrap items-baseline gap-2.5">
                                <span className="text-base font-bold">{r.driver}</span>
                                <span className="text-xs font-semibold text-white/40">
                                    {r.country}
                                </span>
                            </span>
                            <span className="text-[13px] font-semibold text-white/50">
                                {r.team}
                            </span>
                        </span>
                        <span
                            className="rounded-[3px] px-2.5 py-[3px] text-xs font-bold uppercase tracking-[1px]"
                            style={{
                                color: r.gold ? "#FFD23F" : "rgba(255,255,255,0.55)",
                                backgroundColor: r.goldBg
                                    ? "rgba(255,210,63,0.12)"
                                    : "rgba(255,255,255,0.06)",
                            }}
                        >
                            {r.titleLabel}
                        </span>
                        <span className="hidden w-[76px] text-right text-[17px] font-black italic sm:block">
                            {r.pts}
                            <span className="text-[11px] font-normal not-italic text-white/45">
                                {" "}
                                pts
                            </span>
                        </span>
                    </Link>
                ))}
            </div>
        </>
    );
}