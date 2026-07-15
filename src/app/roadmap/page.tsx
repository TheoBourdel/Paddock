import type { Metadata } from "next";
import { getRoadmap } from "@/lib/roadmap";

export const metadata: Metadata = { title: "Roadmap" };
export const revalidate = 3600;

// ——— Styles des badges ———
const TAGS = {
    fix: { label: "Fix", color: "#FF6B66", bg: "rgba(225,6,0,0.15)" },
    feature: { label: "Feature", color: "#4FD1FF", bg: "rgba(79,209,255,0.12)" },
    perf: { label: "Perf", color: "#B6BABD", bg: "rgba(182,186,189,0.12)" },
    idea: { label: "Idée", color: "rgba(255,255,255,0.6)", bg: "rgba(255,255,255,0.08)" },
} as const;

// ——— Colonnes : identité visuelle et échéance affichée ———
const COLUMN_META = [
    { id: "en-cours", title: "En cours", color: "#E10600", eta: "En cours" },
    { id: "a-venir", title: "À venir", color: "#FFD23F", eta: "Prochainement" },
    {
        id: "explore",
        title: "Exploré",
        color: "rgba(255,255,255,0.4)",
        eta: "Non planifié",
    },
] as const;

export default async function RoadmapPage() {
    const entries = await getRoadmap();
    const columns = COLUMN_META.map((meta) => ({
        ...meta,
        items: entries.filter((e) => e.column === meta.id),
    }));
    const empty = entries.length === 0;

    return (
        <main>
            <div className="mb-8 flex flex-col gap-1.5">
                <span className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-[3px] text-[#E10600]">
                    <span className="h-0.5 w-[26px] bg-[#E10600]" />
                    Feuille de route
                </span>
                <h1 className="text-[34px] font-black italic tracking-[0.5px]">
                    Roadmap <span className="text-[#E10600]">PADDOCK</span>
                </h1>
                <p className="mt-1 max-w-[560px] text-[15px] font-semibold text-white/50">
                    Ce qui est en cours, ce qui arrive, et ce qu&apos;on garde dans le
                    viseur.
                </p>
            </div>

            {empty ? (
                <div className="rounded-md bg-[#1B1B26] px-5 py-10 text-center text-sm font-semibold text-white/50">
                    La roadmap est momentanément indisponible. Réessaie dans quelques
                    minutes.
                </div>
            ) : (
                <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] items-start gap-3.5">
                    {columns.map((col) => (
                        <div key={col.id} className="flex flex-col gap-2.5">
                            <span
                                className="flex items-center gap-2 text-xs font-bold uppercase tracking-[1.5px]"
                                style={{ color: col.color }}
                            >
                                <span
                                    className="h-2 w-2 rounded-full"
                                    style={{ backgroundColor: col.color }}
                                />
                                {col.title}
                                <span className="font-bold text-white/30">
                                    {col.items.length}
                                </span>
                            </span>

                            {col.items.map((it) => {
                                const tag = TAGS[it.tag];
                                return (
                                    <div
                                        key={it.title}
                                        className="flex flex-col gap-2 rounded-lg bg-[#1B1B26] px-[18px] py-4"
                                    >
                                        <div className="flex items-center justify-between gap-2.5">
                                            <span
                                                className="rounded-[20px] px-[9px] py-[3px] text-[10px] font-black uppercase tracking-[1px]"
                                                style={{ color: tag.color, backgroundColor: tag.bg }}
                                            >
                                                {tag.label}
                                            </span>
                                            <span className="text-[11px] font-bold text-white/35">
                                                {col.eta}
                                            </span>
                                        </div>
                                        <span className="text-[15px] font-bold leading-[1.3]">
                                            {it.title}
                                        </span>
                                        {it.desc && (
                                            <span className="text-[13px] font-semibold leading-[1.5] text-white/50">
                                                {it.desc}
                                            </span>
                                        )}
                                    </div>
                                );
                            })}

                            {col.items.length === 0 && (
                                <div className="rounded-lg border border-dashed border-white/10 px-[18px] py-5 text-center text-[13px] font-semibold text-white/30">
                                    Rien ici pour l&apos;instant
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}