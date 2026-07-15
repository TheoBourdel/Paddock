import type { Metadata } from "next";

export const metadata: Metadata = { title: "Roadmap" };

// ——— Styles des badges ———
const TAGS = {
    fix: { label: "Fix", color: "#FF6B66", bg: "rgba(225,6,0,0.15)" },
    feature: { label: "Feature", color: "#4FD1FF", bg: "rgba(79,209,255,0.12)" },
    perf: { label: "Perf", color: "#B6BABD", bg: "rgba(182,186,189,0.12)" },
    idea: { label: "Idée", color: "rgba(255,255,255,0.6)", bg: "rgba(255,255,255,0.08)" },
} as const;

type TagKey = keyof typeof TAGS;

interface RoadmapItem {
    tag: TagKey;
    eta: string;
    title: string;
    desc: string;
}

// ——— La roadmap : à éditer ici, et uniquement ici ———
const COLUMNS: { title: string; color: string; items: RoadmapItem[] }[] = [
    {
        title: "En cours",
        color: "#E10600",
        items: [
            {
                tag: "feature",
                eta: "En cours",
                title: "Section Palmares",
                desc: "Historique des écruries et des pilotes, recherches, filtres.",
            },
            {
                tag: "idea",
                eta: "En cours",
                title: "Ajout d'un lien 'buy me a coffe'",
                desc: "Mettre un lien dans le footer pour me faire un don.",
            },
        ],
    },
    {
        title: "À venir",
        color: "#FFD23F",
        items: [
            {
                tag: "feature",
                eta: "Prochainement",
                title: "Essais libres et Qualifications Sprint sur les pages GP",
                desc: "Les deux sessions absentes de jolpica, débloquées par l'intégration OpenF1.",
            },
            {
                tag: "fix",
                eta: "Prochainement",
                title: "Amélioration de la responsive",
                desc: "Certaines pages sont encore trop brouillon sur mobile. Certaines infos seront supprimés, pour alléger la version mobile.",
            },
            {
                tag: "perf",
                eta: "Prochainement",
                title: "Onglet des classements dans l'URL",
                desc: "Conserver le segment Pilotes / Constructeurs au rechargement et au partage.",
            },
            {
                tag: "feature",
                eta: "Prochainement",
                title: "Section Live",
                desc: "Développement de la section live, débloquées par l'intégration OpenF1. Grosse feature",
            },
        ],
    },
    {
        title: "Exploré",
        color: "rgba(255,255,255,0.4)",
        items: [
            {
                tag: "idea",
                eta: "Non planifié",
                title: "Sélecteur de saison sur les classements",
                desc: "Revoir n'importe quel championnat depuis 1950 — 2021 en tête.",
            },
            {
                tag: "idea",
                eta: "Non planifié",
                title: "Stats de carrière enrichies",
                desc: "Podiums et pole positions, via l'historique complet des résultats.",
            },
        ],
    },
];

export default function RoadmapPage() {
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

            <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] items-start gap-3.5">
                {COLUMNS.map((col) => (
                    <div key={col.title} className="flex flex-col gap-2.5">
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
                                            {it.eta}
                                        </span>
                                    </div>
                                    <span className="text-[15px] font-bold leading-[1.3]">
                                        {it.title}
                                    </span>
                                    <span className="text-[13px] font-semibold leading-[1.5] text-white/50">
                                        {it.desc}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </main>
    );
}