"use client";

import { useState } from "react";
import Link from "next/link";
import type { DriverRaceEntry, Race } from "@/lib/jolpica";

export function SeasonGrid({
    season,
    races,
    results,
    sprints,
    color,
}: {
    season: number;
    races: Race[];
    results: DriverRaceEntry[];
    sprints: Map<string, number>;
    color: string;
}) {
    const [hovered, setHovered] = useState<string | null>(null);

    const byRound = new Map(results.map((r) => [r.round, r]));
    const now = new Date();
    const mix = (pct: number) => `color-mix(in oklab, ${color} ${pct}%, #1B1B26)`;

    const cells = races.map((race) => {
        const raceDone =
            new Date(`${race.date}T${race.time ?? "12:00:00Z"}`) < now;
        const entry = byRound.get(race.round);
        const isSprint = sprints.has(race.round);

        let bg = "transparent";
        let bd = "rgba(255,255,255,0.18)";
        let fg = "rgba(255,255,255,0.25)";
        let label = "·";
        let tip: string;

        if (!raceDone) {
            tip = `${race.raceName} — ${new Date(`${race.date}T12:00:00Z`).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })} ${season}`;
        } else if (!entry) {
            bg = "rgba(255,255,255,0.04)";
            bd = "transparent";
            fg = "rgba(255,255,255,0.3)";
            label = "—";
            tip = `${race.raceName} — Non partant`;
        } else {
            const classified = /^\d+$/.test(entry.positionText);
            const p = Number(entry.position);
            const pts = Number(entry.points) + (sprints.get(race.round) ?? 0);
            const sprintNote = isSprint ? " · Sprint" : "";

            if (!classified) {
                bg = "rgba(225,6,0,0.22)";
                bd = "rgba(225,6,0,0.5)";
                fg = "#FF6B66";
                label = "✕";
                tip = `${race.raceName}${sprintNote} — Abandon · ${pts} pt${pts > 1 ? "s" : ""}`;
            } else {
                if (p === 1) {
                    bg = color;
                    bd = color;
                    fg = "#0F0F17";
                } else if (p <= 3) {
                    bg = mix(55);
                    bd = "transparent";
                    fg = "#fff";
                } else if (p <= 10) {
                    bg = mix(28);
                    bd = "transparent";
                    fg = "rgba(255,255,255,0.85)";
                } else {
                    bg = "rgba(255,255,255,0.07)";
                    bd = "transparent";
                    fg = "rgba(255,255,255,0.45)";
                }
                label = String(p);
                tip = `${race.raceName}${sprintNote} — P${p} · ${pts} pt${pts > 1 ? "s" : ""}`;
            }
        }

        return { round: race.round, raceDone, bg, bd, fg, label, tip };
    });

    const legend: { swatch: React.CSSProperties; label: string }[] = [
        { swatch: { backgroundColor: color }, label: "Victoire" },
        { swatch: { backgroundColor: mix(55) }, label: "Podium" },
        { swatch: { backgroundColor: mix(28) }, label: "Dans les points" },
        { swatch: { backgroundColor: "rgba(255,255,255,0.07)" }, label: "Hors des points" },
        {
            swatch: {
                backgroundColor: "rgba(225,6,0,0.22)",
                border: "1px solid rgba(225,6,0,0.5)",
            },
            label: "Abandon",
        },
        {
            swatch: { border: "1px dashed rgba(255,255,255,0.25)" },
            label: "À venir",
        },
    ];

    return (
        <section className="mb-8">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-[2px] text-white/45">
                Résultats {season} · saison complète
            </h2>
            <div className="rounded-md bg-[#1B1B26] p-5">
                <div className="grid grid-cols-[repeat(auto-fill,minmax(44px,1fr))] gap-1.5">
                    {cells.map((c) => (
                        <div key={c.round} className="relative">
                            <Link
                                href={`/gp/${c.round}`}
                                onMouseEnter={() => setHovered(c.round)}
                                onMouseLeave={() => setHovered(null)}
                                className="flex aspect-square flex-col items-center justify-center gap-px rounded-[5px] transition-transform hover:scale-[1.12] hover:!border-white/60"
                                style={{ backgroundColor: c.bg, border: `1px solid ${c.bd}` }}
                            >
                                <span
                                    className="text-[9px] font-bold tracking-[0.5px]"
                                    style={{
                                        color: c.raceDone
                                            ? "rgba(255,255,255,0.55)"
                                            : "rgba(255,255,255,0.25)",
                                    }}
                                >
                                    R{c.round}
                                </span>
                                <span
                                    className="text-[13px] font-black italic"
                                    style={{ color: c.fg }}
                                >
                                    {c.label}
                                </span>
                            </Link>

                            {hovered === c.round && (
                                <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2.5 -translate-x-1/2 whitespace-nowrap rounded border border-white/15 bg-[#0F0F17] px-3 py-1.5 text-xs font-bold shadow-[0_4px_14px_rgba(0,0,0,0.5)]">
                                    {c.tip}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3.5 text-xs font-bold text-white/50">
                    {legend.map(({ swatch, label }) => (
                        <span key={label} className="flex items-center gap-1.5">
                            <span
                                className="box-border h-3 w-3 rounded-[3px]"
                                style={swatch}
                            />
                            {label}
                        </span>
                    ))}
                    <span className="ml-auto text-white/35">
                        Survolez une case pour le détail · cliquez pour ouvrir le GP
                    </span>
                </div>
            </div>
        </section>
    );
}