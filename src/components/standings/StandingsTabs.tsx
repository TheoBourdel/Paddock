"use client";

import { useState } from "react";
import type { ConstructorStanding, DriverStanding } from "@/lib/jolpica";
import { DriverRow } from "./DriverRow";
import { ConstructorRow } from "./ConstructorRow";

type Tab = "drivers" | "constructors";

const TABS: { id: Tab; label: string }[] = [
    { id: "drivers", label: "Pilotes" },
    { id: "constructors", label: "Écuries" },
];

export function StandingsTabs({
    drivers,
    constructors,
}: {
    drivers: DriverStanding[];
    constructors: ConstructorStanding[];
}) {
    const [tab, setTab] = useState<Tab>("drivers");

    return (
        <div>
            <div role="tablist" className="mb-4 flex gap-1 border-b border-[#2A2A38]">
                {TABS.map(({ id, label }) => (
                    <button
                        key={id}
                        role="tab"
                        aria-selected={tab === id}
                        onClick={() => setTab(id)}
                        className={`border-b-[3px] px-4 py-2.5 text-sm font-bold tracking-wide transition-colors ${tab === id
                            ? "border-[#E10600] text-white"
                            : "border-transparent text-[#9494A8] hover:text-white"
                            }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {tab === "drivers" ? (
                <ol>
                    {drivers.map((s) => (
                        <DriverRow key={s.Driver.driverId} standing={s} leaderPts={0} />
                    ))}
                </ol>
            ) : (
                <ol>
                    {constructors.map((s) => (
                        <ConstructorRow key={s.Constructor.constructorId} standing={s} leaderPts={0} />
                    ))}
                </ol>
            )}
        </div>
    );
}
