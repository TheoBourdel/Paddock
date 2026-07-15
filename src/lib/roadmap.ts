/* eslint-disable @typescript-eslint/no-explicit-any */
// Roadmap pilotée par les issues GitHub du repo.
// Une issue apparaît si elle porte le label "roadmap",
// sa colonne et son badge sont déterminés par ses autres labels.

const REPO = "TheoBourdel/Paddock"; // ← à renseigner

export interface RoadmapEntry {
    title: string;
    desc: string;
    tag: "fix" | "feature" | "perf" | "idea";
    column: "en-cours" | "a-venir" | "explore";
}

const TAG_LABELS: Record<string, RoadmapEntry["tag"]> = {
    fix: "fix",
    feature: "feature",
    perf: "perf",
    idee: "idea",
};

const COLUMN_LABELS: RoadmapEntry["column"][] = [
    "en-cours",
    "a-venir",
    "explore",
];

export async function getRoadmap(): Promise<RoadmapEntry[]> {
    try {
        const res = await fetch(
            `https://api.github.com/repos/${REPO}/issues?labels=roadmap&state=open&per_page=50`,
            {
                next: { revalidate: 3600 },
                headers: {
                    Accept: "application/vnd.github+json",
                    // Repo privé ? Ajoute : Authorization: `Bearer ${process.env.GITHUB_TOKEN}`
                },
            }
        );
        if (!res.ok) return [];
        const issues = await res.json();

        return (issues as any[])
            .map((issue): RoadmapEntry | null => {
                const labels: string[] = issue.labels.map((l: any) => l.name);
                const column = COLUMN_LABELS.find((c) => labels.includes(c));
                if (!column) return null; // label de colonne manquant → ignorée
                const tagLabel = labels.find((l) => l in TAG_LABELS);
                return {
                    title: issue.title,
                    // 1re ligne du body, débarrassée du markdown basique
                    desc: (issue.body ?? "")
                        .split("\n")[0]
                        .replace(/[*_`#>]/g, "")
                        .trim(),
                    tag: tagLabel ? TAG_LABELS[tagLabel] : "idea",
                    column,
                };
            })
            .filter((e): e is RoadmapEntry => e !== null);
    } catch {
        return [];
    }
}