import Link from "next/link";

interface DuelStats {
    name: string;
    pts: number;
    wins: number;
    podiums: number;
    avg: string;
}

function widths(a: number, b: number): [string, string] {
    const total = a + b || 1;
    return [
        `${Math.round((a / total) * 100)}%`,
        `${Math.round((b / total) * 100)}%`,
    ];
}

export function TeammateDuel({
    color,
    me,
    mate,
}: {
    color: string;
    me: DuelStats;
    mate: DuelStats & { driverId: string };
}) {
    const rows = [
        { label: "Points", a: me.pts, b: mate.pts },
        { label: "Victoires", a: me.wins, b: mate.wins },
        { label: "Podiums", a: me.podiums, b: mate.podiums },
        { label: "Position moyenne", a: me.avg, b: mate.avg, inverted: true },
    ].map((r) => {
        const av = parseFloat(String(r.a)) || 0;
        const bv = parseFloat(String(r.b)) || 0;
        const [aw, bw] = r.inverted ? widths(bv, av) : widths(av, bv);
        return { ...r, aw, bw };
    });

    return (
        <section className="mb-8">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-[2px] text-white/45">
                Face au coéquipier
            </h2>
            <div className="flex flex-col gap-3.5 rounded-md bg-[#1B1B26] p-5">
                <div className="flex justify-between text-base font-black italic">
                    <span>{me.name}</span>
                    <Link
                        href={`/pilotes/${mate.driverId}`}
                        className="text-white/55 transition-colors hover:text-white"
                    >
                        {mate.name} →
                    </Link>
                </div>

                {rows.map((r) => (
                    <div key={r.label}>
                        <div className="flex items-center gap-3.5">
                            <span className="w-14 text-base font-black">{r.a}</span>
                            <div className="flex h-2 flex-1 overflow-hidden rounded bg-white/[0.07]">
                                <span
                                    className="block h-full"
                                    style={{ backgroundColor: color, width: r.aw }}
                                />
                                <span
                                    className="block h-full bg-white/30"
                                    style={{ width: r.bw }}
                                />
                            </div>
                            <span className="w-14 text-right text-base font-black text-white/65">
                                {r.b}
                            </span>
                        </div>
                        <div className="mt-1 text-center text-xs font-bold uppercase tracking-[1px] text-white/40">
                            {r.label}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}