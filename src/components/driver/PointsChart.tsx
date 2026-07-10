export function PointsChart({
    season,
    meName,
    mateName,
    color,
    meCum,
    mateCum,
}: {
    season: number;
    meName: string;
    mateName: string;
    color: string;
    meCum: number[];
    mateCum: number[];
}) {
    const n = meCum.length;
    const max = Math.max(meCum[n - 1] ?? 0, mateCum[n - 1] ?? 0, 10);

    const X = (i: number) => 30 + (i / (n - 1)) * 765;
    const Y = (v: number) => 225 - (v / max) * 210;
    const poly = (arr: number[]) =>
        arr.map((v, i) => `${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(" ");

    const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(max * f));

    return (
        <section className="mb-8">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-[2px] text-white/45">
                Évolution des points — saison {season}
            </h2>
            <div className="rounded-md bg-[#1B1B26] p-5">
                <div className="mb-3 flex flex-wrap gap-5">
                    <span className="flex items-center gap-2 text-[13px] font-bold">
                        <span className="h-[3px] w-[18px]" style={{ backgroundColor: color }} />
                        {meName}
                    </span>
                    <span className="flex items-center gap-2 text-[13px] font-bold text-white/55">
                        <span className="h-[3px] w-[18px] bg-white/35" />
                        {mateName}
                    </span>
                </div>

                <svg viewBox="0 0 800 240" className="block h-auto w-full">
                    {ticks.map((v) => (
                        <g key={v}>
                            <line
                                x1="30"
                                x2="800"
                                y1={Y(v)}
                                y2={Y(v)}
                                stroke="rgba(255,255,255,0.08)"
                                strokeWidth="1"
                            />
                            <text
                                x="0"
                                y={Y(v) + 4}
                                fill="rgba(255,255,255,0.4)"
                                fontSize="11"
                            >
                                {v}
                            </text>
                        </g>
                    ))}
                    <polyline
                        points={poly(mateCum)}
                        fill="none"
                        stroke="rgba(255,255,255,0.35)"
                        strokeWidth="2"
                    />
                    <polyline
                        points={poly(meCum)}
                        fill="none"
                        stroke={color}
                        strokeWidth="3"
                    />
                </svg>
            </div>
        </section>
    );
}