/* eslint-disable @typescript-eslint/no-explicit-any */
import { XMLParser } from "fast-xml-parser";

export interface NewsItem {
    title: string;
    url: string;
    source: string;
    color: string;
    tag: string;
    date: string; // ISO
    excerpt: string;
}

const FEEDS = [
    { url: "https://fr.motorsport.com/rss/f1/news/", source: "Motorsport" },
];

// ——— Catégories éditoriales : premier match (titre + extrait) gagnant.
// L'ordre compte : du plus spécifique au plus générique.
const CATEGORIES = [
    {
        tag: "Transferts",
        color: "#FF8000",
        keywords: [
            "contrat",
            "prolonge",
            "prolongation",
            "renouvelle",
            "renouvellement",
            "signe",
            "signature",
            "officialise",
            "officialisation",
            "recrute",
            "recrutement",
            "rejoint",
            "quitte",
            "depart",
            "arrivee",
            "transfert",
            "mercato",
            "baquet",
            "titulaire",
            "titularise",
            "reserve",
            "pilote de reserve",
            "remplace",
            "remplacant",
            "successeur",
            "avenir",
            "avenir de",
            "annonce",
            "echange",
            "line-up",
            "duo",
        ],
    },

    {
        tag: "Réglementation",
        color: "#FFD23F",
        keywords: [
            "fia",
            "reglement",
            "reglementation",
            "regle",
            "directive",
            "directive technique",
            "commissaires",
            "stewards",
            "penalite",
            "penalise",
            "sanction",
            "amende",
            "enquete",
            "investigation",
            "appel",
            "protestation",
            "disqualif",
            "disqualification",
            "illegal",
            "conforme",
            "non conforme",
            "infraction",
            "limite de piste",
            "track limits",
            "parc ferme",
            "licence",
            "super licence",
            "budget cap",
        ],
    },

    {
        tag: "Technique",
        color: "#0090FF",
        keywords: [
            "technique",
            "upgrade",
            "evolution",
            "mise a jour",
            "package",
            "specification",
            "nouvelle specification",
            "aero",
            "aerodynamique",
            "aileron",
            "aileron avant",
            "aileron arriere",
            "fond plat",
            "diffuseur",
            "plancher",
            "suspension",
            "chassis",
            "monocoque",
            "pontons",
            "sidepods",
            "moteur",
            "unite de puissance",
            "power unit",
            "boite de vitesses",
            "ers",
            "mgu-k",
            "mgu-h",
            "turbo",
            "refroidissement",
            "soufflerie",
            "cfd",
            "correlation",
            "developpement",
            "concept",
            "configuration",
            "setup",
            "reglages",
            "pneus",
            "gommes",
            "degradation",
        ],
    },

    {
        tag: "Business",
        color: "#27F4D2",
        keywords: [
            "sponsor",
            "partenaire",
            "partenariat",
            "partnership",
            "rachat",
            "acquisition",
            "invest",
            "budget",
            "budget cap",
            "plafond budgetaire",
            "financement",
            "revenus",
            "valorisation",
            "droits tv",
            "droits commerciaux",
            "accord concorde",
            "concorde",
            "liberty media",
            "fom",
            "f1 group",
            "audience",
            "billetterie",
            "hospitalite",
            "marketing",
            "branding",
            "actionnaire",
        ],
    },

    {
        tag: "Week-end de course",
        color: "#2ECC71",
        keywords: [
            "grand prix",
            "gp",
            "essais libres",
            "el1",
            "el2",
            "el3",
            "qualifications",
            "qualifs",
            "q1",
            "q2",
            "q3",
            "pole",
            "pole position",
            "sprint",
            "sprint shootout",
            "course",
            "depart",
            "grille",
            "victoire",
            "podium",
            "abandon",
            "incident",
            "accrochage",
            "collision",
            "depassement",
            "strategie",
            "arrets",
            "pit stop",
            "stand",
            "safety car",
            "virtual safety car",
            "vsc",
            "voiture de securite",
            "drapeau rouge",
            "drapeau jaune",
            "chrono",
            "meilleur tour",
            "tour rapide",
            "meteo",
            "pluie",
            "sec",
            "intermediaires",
            "slick",
        ],
    },
];
const DEFAULT_CATEGORY = { tag: "Paddock", color: "#9494A8" };

// Comparaison insensible aux accents et à la casse
const normalize = (s: string) =>
    s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

function categorize(title: string, excerpt: string) {
    const text = normalize(`${title} ${excerpt}`);
    for (const cat of CATEGORIES) {
        if (cat.keywords.some((k) => text.includes(k))) return cat;
    }
    return DEFAULT_CATEGORY;
}

// Nettoie le HTML et les entités présents dans les flux RSS
function strip(html: string): string {
    return html
        .replace(/<[^>]*>/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#0?39;/g, "'")
        .replace(/&nbsp;/g, " ")
        .replace(/&[a-z]+;/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

async function fetchFeed(feed: (typeof FEEDS)[number]): Promise<NewsItem[]> {
    try {
        const res = await fetch(feed.url, {
            next: { revalidate: 900 }, // 15 min
            headers: { "User-Agent": "PADDOCK (projet perso non commercial)" },
        });
        if (!res.ok) return [];
        const xml = await res.text();
        const doc = new XMLParser({ ignoreAttributes: false }).parse(xml);
        const raw = doc?.rss?.channel?.item ?? [];
        const items = Array.isArray(raw) ? raw : [raw];

        return items
            .map((it: any): NewsItem => {
                const title = strip(String(it.title ?? ""));
                const excerpt = strip(String(it.description ?? "")).slice(0, 220);
                const { tag, color } = categorize(title, excerpt);
                return {
                    title,
                    url: String(it.link ?? "").trim(),
                    source: feed.source,
                    color,
                    tag,
                    date: new Date(it.pubDate ?? 0).toISOString(),
                    excerpt,
                };
            })
            .filter((i) => i.title && i.url.startsWith("http"));
    } catch {
        return [];
    }
}

export async function getNews(limit = 22): Promise<NewsItem[]> {
    const all = (await Promise.all(FEEDS.map(fetchFeed))).flat();

    const seen = new Set<string>();
    const unique = all.filter((i) => {
        const key = normalize(i.title).replace(/[^a-z0-9]/g, "").slice(0, 60);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });

    return unique
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, limit);
}