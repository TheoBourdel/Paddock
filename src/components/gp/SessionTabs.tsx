"use client";

import { useState } from "react";
import Link from "next/link";
import {
    PositionsChart,
    type PositionSeries,
    type StopMarker,
} from "./PositionsChart";
import { tierFor } from "../standings/tiers";

export interface SessionRow {
    pos: string;
    top3: boolean;
    driverId: string;
    name: string;
    code: string;
    team: string;
    color: string;
    badge: string;
    right1: string;
    right2: string;
}

export interface RaceRow {
    pos: string;
    top3: boolean;
    driverId: string;
    name: string;
    code: string;
    team: string;
    color: string;
    pts: string;
    diff: number | null;
    reason: string | null;
}

function RowShell({
    color,
    driverId,
    position,
    children,
}: {
    color: string;
    driverId: string;
    position: string;
    children: React.ReactNode;
}) {
    const t = tierFor(position);

    return (
        <Link
            href={`/pilotes/${driverId}`}
            className={`flex items-center gap-3.5 rounded-md bg-[#1B1B26] pl-3 pr-4 transition-colors hover:bg-[#242433] ${t.row}`}
        >
            <span
                className={`w-2 shrink-0 rounded-[3px] ${t.chip}`}
                style={{ backgroundColor: color }}
            />

            {children}
        </Link>
    );
}

function NameCell({ name, code }: { name: string; code: string }) {
    return (
        <span className="flex min-w-[140px] flex-1 items-baseline gap-2.5">
            <span className="text-[15px] font-bold">{name}</span>
            {code && (
                <span className="text-[11px] font-black tracking-[1px] text-white/40">
                    {code}
                </span>
            )}
        </span>
    );
}

function RaceTableRow({ r }: { r: RaceRow }) {
    return (
        <RowShell color={r.color}
            driverId={r.driverId}
            position={r.pos}>
            <span
                className={`w-11 text-[15px] font-black italic ${r.top3 ? "text-white" : "text-white/55"
                    }`}
            >
                {r.pos}
            </span>
            <NameCell name={r.name} code={r.code} />
            <span className="hidden w-40 text-[13px] font-semibold text-white/55 md:block">
                {r.team}
            </span>
            <span className="w-20 text-right text-[13px] font-bold tabular-nums">
                {r.reason !== null ? (
                    <span className="text-[11px] font-semibold uppercase tracking-[0.5px] text-white/40">
                        {r.reason}
                    </span>
                ) : r.diff === null ? (
                    <span className="text-white/30">—</span>
                ) : r.diff > 0 ? (
                    <span className="text-[#2ECC71]">▲ {r.diff}</span>
                ) : r.diff < 0 ? (
                    <span className="text-[#FF3B33]">▼ {-r.diff}</span>
                ) : (
                    <span className="text-white/30">=</span>
                )}
            </span>
            <span className="w-[60px] text-right font-bold text-white/75">
                {r.pts}
            </span>
        </RowShell>
    );
}

export function SessionTabs({
    qualiRows,
    sprintRows,
    raceRows,
    series,
    stops,
    totalLaps,
}: {
    qualiRows: SessionRow[];
    sprintRows: RaceRow[];
    raceRows: RaceRow[];
    series: PositionSeries[];
    stops: StopMarker[];
    totalLaps: number;
}) {
    const tabs = [
        ...(sprintRows.length > 0 ? ["Sprint"] : []),
        ...(qualiRows.length > 0 ? ["Qualifications"] : []),
        "Course",
    ];
    const [tab, setTab] = useState("Course");

    return (
        <>
            <div className="mb-6 flex flex-wrap gap-1 border-b border-white/10">
                {tabs.map((label) => (
                    <button
                        key={label}
                        onClick={() => setTab(label)}
                        className={`-mb-px border-b-2 px-3.5 py-2.5 text-sm font-bold uppercase tracking-[0.5px] transition-colors ${tab === label
                            ? "border-[#E10600] text-white"
                            : "border-transparent text-white/50 hover:text-white"
                            }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* ——— Qualifications ——— */}
            {tab === "Qualifications" && (
                <section>
                    <h2 className="mb-3 text-sm font-bold uppercase tracking-[2px] text-white/45">
                        {sprintRows.length > 0
                            ? "Qualifications du Grand Prix · Meilleurs tours"
                            : "Qualifications · Meilleurs tours"}
                    </h2>
                    <div className="flex flex-col gap-1">
                        {qualiRows.map((r) => (
                            <RowShell key={r.driverId}
                                color={r.color}
                                driverId={r.driverId}
                                position={r.pos}>
                                <span
                                    className={`w-11 text-[15px] font-black italic ${r.top3 ? "text-white" : "text-white/55"
                                        }`}
                                >
                                    {r.pos}
                                </span>
                                <NameCell name={r.name} code={r.code} />
                                <span className="hidden w-40 text-[13px] font-semibold text-white/55 md:block">
                                    {r.team}
                                </span>
                                <span className="w-14 text-center text-xs font-bold tracking-[0.5px] text-white/40">
                                    {r.badge}
                                </span>
                                <span className="w-[86px] text-right font-bold tabular-nums">
                                    {r.right1}
                                </span>
                                <span className="hidden w-[70px] text-right text-[13px] font-semibold tabular-nums text-white/45 sm:block">
                                    {r.right2}
                                </span>
                            </RowShell>
                        ))}
                    </div>
                </section>
            )}

            {/* ——— Sprint ——— */}
            {tab === "Sprint" && (
                <section>
                    <h2 className="mb-3 text-sm font-bold uppercase tracking-[2px] text-white/45">
                        Course Sprint
                    </h2>
                    <div className="flex flex-col gap-1">
                        {sprintRows.map((r) => (
                            <RaceTableRow key={r.driverId} r={r} />
                        ))}
                    </div>
                </section>
            )}

            {/* ——— Course : classement puis graphe ——— */}
            {tab === "Course" && (
                <>
                    <section className="mb-8">
                        <h2 className="mb-3 text-sm font-bold uppercase tracking-[2px] text-white/45">
                            Classement de la course
                        </h2>
                        <div className="flex flex-col gap-1">
                            {raceRows.map((r) => (
                                <RaceTableRow key={r.driverId} r={r} />
                            ))}
                        </div>
                    </section>

                    {series.length > 0 && (
                        <section>
                            <h2 className="mb-3 text-sm font-bold uppercase tracking-[2px] text-white/45">
                                Évolution des positions
                            </h2>
                            <PositionsChart
                                series={series}
                                stops={stops}
                                totalLaps={totalLaps}
                            />
                        </section>
                    )}
                </>
            )}
        </>
    );
}