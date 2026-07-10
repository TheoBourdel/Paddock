// Échelle podium partagée par les lignes pilotes et constructeurs.
export interface Tier {
    row: string;
    pos: string;
    name: string;
    pts: string;
    chip: string;
}

export const TIERS: Record<string, Tier> = {
    "1": { row: "py-[22px]", pos: "text-[26px]", name: "text-xl", pts: "text-[26px]", chip: "h-10" },
    "2": { row: "py-[17px]", pos: "text-[22px]", name: "text-lg", pts: "text-[22px]", chip: "h-9" },
    "3": { row: "py-3.5", pos: "text-xl", name: "text-[17px]", pts: "text-xl", chip: "h-8" },
};

export const BASE_TIER: Tier = {
    row: "py-3",
    pos: "text-lg",
    name: "text-base",
    pts: "text-lg",
    chip: "h-7",
};

export const tierFor = (position: string): Tier => TIERS[position] ?? BASE_TIER;