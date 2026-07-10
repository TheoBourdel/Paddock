"use client";

import { useState } from "react";
import type { ConstructorStanding, DriverStanding } from "@/lib/jolpica";
import { DriverRow } from "./DriverRow";
import { ConstructorRow } from "./ConstructorRow";

type Tab = "pilotes" | "constructeurs";

const SEGMENTS: { id: Tab; label: string }[] = [
    { id: "pilotes", label: "Pilotes" },
    { id: "constructeurs", label: "Constructeurs" },
];

export function StandingsToggle({
    drivers,
    constructors,
    defaultTab,
}: {
    drivers: DriverStanding[];
    constructors: ConstructorStanding[];
    defaultTab: Tab;
}) {
    const [tab, setTab] = useState<Tab>(defaultTab);
    const driverLeaderPts = Number(drivers[0]?.points ?? 0);
    const constructorLeaderPts = Number(constructors[0]?.points ?? 1);

    return (
        <>
            {/* ——— Sélecteur segmenté ——— */}
            <div className="mb-6 inline-flex overflow-hidden rounded-md border border-white/15">
                {SEGMENTS.map(({ id, label }) => (
                    <button
                        key={id}
                        onClick={() => setTab(id)}
                        className={`px-6 py-2.5 text-sm font-bold uppercase italic tracking-[1px] transition-colors ${tab === id
                            ? "bg-[#E10600] text-white"
                            : "bg-transparent text-white/60 hover:text-white"
                            }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {tab === "pilotes" ? (
                <>
                    {/* En-têtes de colonnes — vue Pilotes UNIQUEMENT */}
                    <div className="flex gap-3.5 pb-2.5 pl-3 pr-4 text-xs font-bold uppercase tracking-[1px] text-white/45">
                        <span className="w-2" aria-hidden="true" />
                        <span className="w-7">Pos</span>
                        <span className="flex-1">Pilote</span>
                        <span className="hidden w-40 md:block">Écurie</span>
                        <span className="hidden w-[50px] text-center sm:block">Vict.</span>
                        <span className="hidden w-[60px] text-right sm:block">Écart</span>
                        <span className="w-[70px] text-right">Points</span>
                    </div>
                    <ol className="flex flex-col gap-1.5">
                        {drivers.map((s) => (
                            <DriverRow
                                key={s.Driver.driverId}
                                standing={s}
                                leaderPts={driverLeaderPts}
                            />
                        ))}
                    </ol>
                </>
            ) : (
                <>
                    {/* En-têtes de colonnes — vue Constructeurs */}
                    <div className="flex gap-3.5 pb-2.5 pl-3 pr-4 text-xs font-bold uppercase tracking-[1px] text-white/45">
                        <span className="w-2" aria-hidden="true" />
                        <span className="w-7">Pos</span>
                        <span className="min-w-[150px] flex-1">Écurie</span>
                        <span className="hidden flex-1 sm:block sm:max-w-[260px]" aria-hidden="true" />
                        <span className="hidden w-[50px] text-center sm:block">Vict.</span>
                        <span className="w-[70px] text-right">Points</span>
                    </div>
                    <ol className="flex flex-col gap-1.5">
                        {constructors.map((s) => (
                            <ConstructorRow
                                key={s.Constructor.constructorId}
                                standing={s}
                                leaderPts={constructorLeaderPts}
                            />
                        ))}
                    </ol>
                </>
            )}
        </>
    );
}