"use client";

import { useState } from "react";

export interface PositionSeries {
    code: string;
    color: string;
    dashed: boolean;
    driverId: string;
    points: [number, number][]; // [tour, position]
}

export interface StopMarker {
    lap: number;
    pos: number;
    color: string;
    tip: string;
}

export function PositionsChart({
    series,
    stops,
    totalLaps,
}: {
    series: PositionSeries[];
    stops: StopMarker[];
    totalLaps: number;
}) {
    const [hovered, setHovered] = useState<number | null>(null);

    const maxPos = Math.max(
        20,
        ...series.map((s) => Math.max(...s.points.map((p) => p[1])))
    );

    const X = (lap: number) =>
        34 + ((lap - 1) / Math.max(totalLaps - 1, 1)) * (836 - 34);
    const Y = (pos: number) => 18 + ((pos - 1) / (maxPos - 1)) * 420;
    const poly = (pts: [number, number][]) =>
        pts.map(([l, p]) => `${X(l).toFixed(1)},${Y(p).toFixed(1)}`).join(" ");

    const gridPositions = [1, 5, 10, 15, 20].filter((p) => p <= maxPos);
    const step = totalLaps > 60 ? 10 : 5;
    const lapTicks: { lap: number; label: string }[] = [
        { lap: 1, label: "Départ" },
    ];
    for (let l = step; l < totalLaps; l += step)
        lapTicks.push({ lap: l, label: `T${l}` });
    lapTicks.push({ lap: totalLaps, label: `T${totalLaps}` });

    const tip = hovered !== null ? stops[hovered] : null;

    return (
        <div className="rounded-md bg-[#1B1B26] px-5 pb-3.5 pt-5">
            <div className="mb-2.5 flex flex-wrap justify-between gap-3">
                <span className="text-[13px] font-bold text-white/50">
                    Tour par tour · les points blancs sont les arrêts aux stands
                    (survolez-les pour le temps d&apos;arrêt)
                </span>
                <span className="text-[13px] font-bold text-white/35">
                    — 2ᵉ pilote de l&apos;écurie en pointillés
                </span>
            </div>

            {/* Conteneur relatif : le tooltip se positionne par-dessus le SVG */}
            <div className="overflow-x-auto">
                <div className="relative min-w-[680px]">
                    <svg viewBox="0 0 900 470" className="block h-auto w-full">
                        {/* Grille des positions */}
                        {gridPositions.map((p) => (
                            <g key={p}>
                                <line
                                    x1="34"
                                    x2="836"
                                    y1={Y(p)}
                                    y2={Y(p)}
                                    stroke="rgba(255,255,255,0.07)"
                                    strokeWidth="1"
                                />
                                <text
                                    x="4"
                                    y={Y(p) + 4}
                                    fill="rgba(255,255,255,0.4)"
                                    fontSize="12"
                                    fontWeight="700"
                                >
                                    P{p}
                                </text>
                            </g>
                        ))}

                        {/* Tours */}
                        {lapTicks.map(({ lap, label }) => (
                            <text
                                key={lap}
                                x={X(lap)}
                                y="465"
                                fill="rgba(255,255,255,0.35)"
                                fontSize="11"
                                fontWeight="600"
                                textAnchor="middle"
                            >
                                {label}
                            </text>
                        ))}

                        {/* Lignes des pilotes (cliquables) */}
                        {series.map((s) => {
                            const last = s.points[s.points.length - 1];
                            return (
                                <a key={s.driverId} href={`/pilotes/${s.driverId}`}>
                                    <polyline
                                        points={poly(s.points)}
                                        fill="none"
                                        stroke={s.color}
                                        strokeWidth="2"
                                        strokeDasharray={s.dashed ? "7 5" : undefined}
                                        opacity="0.85"
                                        className="cursor-pointer transition-all hover:opacity-100 hover:[stroke-width:4]"
                                    />
                                    <text
                                        x={X(last[0]) + 8}
                                        y={Y(last[1]) + 4}
                                        fill={s.color}
                                        fontSize="11"
                                        fontWeight="900"
                                        className="cursor-pointer"
                                    >
                                        {s.code}
                                    </text>
                                </a>
                            );
                        })}

                        {/* Arrêts aux stands */}
                        {stops.map((p, i) => (
                            <circle
                                key={i}
                                cx={X(p.lap)}
                                cy={Y(p.pos)}
                                r={hovered === i ? 7 : 4.5}
                                fill="#FFFFFF"
                                stroke={p.color}
                                strokeWidth="2.5"
                                className="cursor-pointer"
                                onMouseEnter={() => setHovered(i)}
                                onMouseLeave={() => setHovered(null)}
                            />
                        ))}
                    </svg>

                    {/* Tooltip */}
                    {tip && (
                        <div
                            className="pointer-events-none absolute z-10 whitespace-nowrap rounded border border-white/15 bg-[#0F0F17] px-3 py-1.5 text-xs font-bold shadow-[0_4px_14px_rgba(0,0,0,0.5)]"
                            style={{
                                left: `${(X(tip.lap) / 900) * 100}%`,
                                top: `${(Y(tip.pos) / 470) * 100}%`,
                                transform:
                                    Y(tip.pos) < 70
                                        ? "translate(-50%, 14px)"
                                        : "translate(-50%, calc(-100% - 12px))",
                            }}
                        >
                            {tip.tip}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}