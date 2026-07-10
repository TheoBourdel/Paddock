/* eslint-disable @typescript-eslint/no-explicit-any */
const BASE = "https://api.jolpi.ca/ergast/f1";

// ——— Types (sous-ensemble utile de la réponse Ergast) ———
export interface Driver {
    driverId: string;
    givenName: string;
    familyName: string;
    nationality: string;
    permanentNumber?: string;
    code?: string;        // trigramme (LEC, HAM…)
    dateOfBirth?: string; // pour l'âge
    url?: string;         // page Wikipédia — photo
}

export interface Constructor {
    constructorId: string;
    name: string;
    nationality?: string;
}

export interface DriverStanding {
    position: string;
    points: string;
    wins: string;
    Driver: Driver;
    Constructors: Constructor[];
}

export interface ConstructorStanding {
    position: string;
    points: string;
    wins: string;
    Constructor: Constructor;
}

export interface SeasonStanding {
    season: string;
    DriverStandings: DriverStanding[];
}

export interface Race {
    round: string;
    raceName: string;
    date: string; // "2026-03-08"
    time?: string; // "05:00:00Z"
    Circuit: {
        circuitId: string;
        circuitName: string;
        Location: { locality: string; country: string };
    };
}

export interface RaceWinner {
    givenName: string;
    familyName: string;
    constructorId: string;
    driverId?: string;
}

export interface RaceResult {
    position: string;
    positionText: string; // "1".."20", "R" (abandon), "D" (disqualifié)…
    points: string;
    grid: string;
    laps: string;
    status: string;
    Driver: Driver;
    Constructor: Constructor;
    Time?: { time: string };
    FastestLap?: { rank: string; Time: { time: string } };
}

export interface QualifyingResult {
    position: string;
    Driver: Driver;
    Constructor: Constructor;
    Q1?: string;
    Q2?: string;
    Q3?: string;
}

export interface DriverRaceEntry {
    round: string;
    raceName: string;
    position: string;
    positionText: string; // "R" = abandon
    points: string;
}

export interface PitStop {
    driverId: string;
    lap: string;
    stop: string;
    duration: string; // temps dans la voie des stands, ex "21.871"
}

export interface ConstructorSeasonStanding {
    season: string;
    standing: ConstructorStanding;
}

export interface ChampionEntry {
    season: string;
    driverId: string;
    name: string;
    nationality: string;
    team: string;
    constructorId: string;
    points: string;
}

export interface CircuitInfo {
    circuitId: string;
    circuitName: string;
    Location: {
        locality: string;
        country: string;
        lat: string;
        long: string;
    };
}

export interface CircuitEdition {
    season: string;
    raceName: string;
    winner: RaceWinner | null;
}

export interface LapRecord {
    time: string;
    holder: string;
    driverId: string;
    year: string;
}

const lapToSec = (t: string) => {
    const parts = t.split(":");
    return parts.length === 2
        ? parseInt(parts[0]) * 60 + parseFloat(parts[1])
        : parseFloat(t);
};

// Record du tour en course : meilleur tour de chaque édition en 1 appel,
// on garde le minimum (données FastestLap disponibles depuis 2004)
export async function getCircuitLapRecord(
    circuitId: string
): Promise<LapRecord | null> {
    const data = await jolpica<any>(
        `/circuits/${circuitId}/fastest/1/results.json?limit=100`,
        86400
    );
    let best: LapRecord | null = null;
    let bestSec = Infinity;
    for (const race of data.MRData.RaceTable.Races ?? []) {
        const r = race.Results?.[0];
        const t = r?.FastestLap?.Time?.time;
        if (!t) continue;
        const sec = lapToSec(t);
        if (sec < bestSec) {
            bestSec = sec;
            best = {
                time: t,
                holder: `${r.Driver.givenName} ${r.Driver.familyName}`,
                driverId: r.Driver.driverId,
                year: race.season,
            };
        }
    }
    return best;
}

export async function getCircuit(
    circuitId: string
): Promise<CircuitInfo | null> {
    const data = await jolpica<any>(`/circuits/${circuitId}.json`, 86400);
    return data.MRData.CircuitTable.Circuits[0] ?? null;
}

// Vainqueur de chaque édition courue sur ce circuit, en un seul appel
export async function getCircuitEditions(
    circuitId: string
): Promise<CircuitEdition[]> {
    const data = await jolpica<any>(
        `/circuits/${circuitId}/results/1.json?limit=100`,
        86400
    );
    return (data.MRData.RaceTable.Races ?? []).map((race: any) => {
        const r = race.Results?.[0];
        return {
            season: race.season,
            raceName: race.raceName,
            winner: r
                ? {
                    givenName: r.Driver.givenName,
                    familyName: r.Driver.familyName,
                    constructorId: r.Constructor.constructorId,
                    driverId: r.Driver.driverId,
                }
                : null,
        };
    });
}

/**
 * Champions du monde d'une plage de saisons (bornée à la dernière
 * saison achevée). Un appel par saison, par lots de 3, cache 24 h.
 */
export async function getChampionsRange(
    from: number,
    to: number
): Promise<ChampionEntry[]> {
    const lastSeason = new Date().getFullYear() - 1;
    const seasons: number[] = [];
    for (let y = Math.max(from, 1950); y <= Math.min(to, lastSeason); y++) {
        seasons.push(y);
    }
    if (seasons.length === 0) return [];

    const champions: ChampionEntry[] = [];
    const CHUNK = 3;

    for (let i = 0; i < seasons.length; i += CHUNK) {
        const chunk = seasons.slice(i, i + CHUNK);
        const results = await Promise.all(
            chunk.map(async (season) => {
                try {
                    const data = await jolpica<any>(
                        `/${season}/driverstandings/1.json`,
                        86400
                    );
                    const st =
                        data.MRData.StandingsTable.StandingsLists[0]?.DriverStandings?.[0];
                    if (!st) return null;
                    const team = st.Constructors[st.Constructors.length - 1];
                    return {
                        season: String(season),
                        driverId: st.Driver.driverId,
                        name: `${st.Driver.givenName} ${st.Driver.familyName}`,
                        nationality: st.Driver.nationality,
                        team: st.Constructors.map((c: Constructor) => c.name).join(" / "),
                        constructorId: team?.constructorId ?? "",
                        points: st.points,
                    } as ChampionEntry;
                } catch {
                    return null;
                }
            })
        );
        for (const r of results) if (r) champions.push(r);

        if (i + CHUNK < seasons.length) {
            await new Promise((resolve) => setTimeout(resolve, 800));
        }
    }

    return champions;
}

async function getConstructorSeasons(
    constructorId: string
): Promise<string[]> {
    const data = await jolpica<any>(
        `/constructors/${constructorId}/seasons.json?limit=100`,
        86400
    );
    return (data.MRData.SeasonTable.Seasons ?? []).map(
        (s: { season: string }) => s.season
    );
}

async function getSeasonConstructorStandingsFull(season: string) {
    const data = await jolpica<any>(
        `/${season}/constructorstandings.json?limit=100`,
        86400
    );
    return (data.MRData.StandingsTable.StandingsLists[0]
        ?.ConstructorStandings ?? []) as ConstructorStanding[];
}

/**
 * Historique du championnat constructeurs d'une écurie.
 * Même mécanique que la carrière pilote : une saison par appel,
 * par lots de 3, cache 24 h partagé entre écuries. Le championnat
 * constructeurs n'existant que depuis 1958, on ignore l'avant.
 */
export async function getConstructorCareer(
    constructorId: string
): Promise<ConstructorSeasonStanding[]> {
    const seasons = (await getConstructorSeasons(constructorId)).filter(
        (s) => Number(s) >= 1958
    );
    if (seasons.length === 0) return [];

    const career: ConstructorSeasonStanding[] = [];
    const CHUNK = 3;

    for (let i = 0; i < seasons.length; i += CHUNK) {
        const chunk = seasons.slice(i, i + CHUNK);
        const results = await Promise.all(
            chunk.map(async (season) => {
                try {
                    const standings = await getSeasonConstructorStandingsFull(season);
                    const mine = standings.find(
                        (s) => s.Constructor.constructorId === constructorId
                    );
                    return mine ? { season, standing: mine } : null;
                } catch {
                    return null;
                }
            })
        );
        for (const r of results) if (r) career.push(r);

        if (i + CHUNK < seasons.length) {
            await new Promise((resolve) => setTimeout(resolve, 800));
        }
    }

    return career;
}

export async function getPitStops(
    season: number,
    round: string
): Promise<PitStop[]> {
    const data = await jolpica<any>(
        `/${season}/${round}/pitstops.json?limit=100`,
        86400
    );
    return data.MRData.RaceTable.Races[0]?.PitStops ?? [];
}

export interface LapPositionsResult {
    totalLaps: number;
    byDriver: Map<string, [number, number][]>; // driverId → [tour, position][]
}

/**
 * Positions tour par tour. L'endpoint /laps est paginé (~1200 entrées
 * par course) : on enchaîne les pages par lots de 3 (limite 4 req/s),
 * le tout caché 24 h — une course terminée ne change plus.
 */
export async function getLapPositions(
    season: number,
    round: string
): Promise<LapPositionsResult> {
    const byDriver = new Map<string, [number, number][]>();
    let totalLaps = 0;
    const PAGE = 100;

    const collect = (data: any): number => {
        for (const lap of data.MRData.RaceTable.Races[0]?.Laps ?? []) {
            const n = Number(lap.number);
            if (n > totalLaps) totalLaps = n;
            for (const t of lap.Timings ?? []) {
                if (!byDriver.has(t.driverId)) byDriver.set(t.driverId, []);
                byDriver.get(t.driverId)!.push([n, Number(t.position)]);
            }
        }
        return Number(data.MRData.total);
    };

    const first = await jolpica<any>(
        `/${season}/${round}/laps.json?limit=${PAGE}`,
        86400
    );
    const total = collect(first);

    const offsets: number[] = [];
    for (let o = PAGE; o < total; o += PAGE) offsets.push(o);

    const CHUNK = 3;
    for (let i = 0; i < offsets.length; i += CHUNK) {
        const chunk = offsets.slice(i, i + CHUNK);
        const pages = await Promise.all(
            chunk.map((o) =>
                jolpica<any>(
                    `/${season}/${round}/laps.json?limit=${PAGE}&offset=${o}`,
                    86400
                ).catch(() => null)
            )
        );
        for (const p of pages) if (p) collect(p);
        if (i + CHUNK < offsets.length) {
            await new Promise((resolve) => setTimeout(resolve, 800));
        }
    }

    // Les pages peuvent arriver dans le désordre : on retrie chaque série
    for (const arr of byDriver.values()) arr.sort((a, b) => a[0] - b[0]);

    return { totalLaps, byDriver };
}

export async function getDriverSeasonResults(
    season: number,
    driverId: string
): Promise<DriverRaceEntry[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await jolpica<any>(
        `/${season}/drivers/${driverId}/results.json?limit=30`,
        3600
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data.MRData.RaceTable.Races ?? []).map((race: any) => ({
        round: race.round,
        raceName: race.raceName,
        position: race.Results[0].position,
        positionText: race.Results[0].positionText,
        points: race.Results[0].points,
    }));
}

// Points sprint par manche (à ajouter aux points course pour le vrai total)
export async function getDriverSprintPoints(
    season: number,
    driverId: string
): Promise<Map<string, number>> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await jolpica<any>(
        `/${season}/drivers/${driverId}/sprint.json?limit=30`,
        3600
    );
    const pts = new Map<string, number>();
    for (const race of data.MRData.RaceTable.Races ?? []) {
        pts.set(race.round, Number(race.SprintResults?.[0]?.points ?? 0));
    }
    return pts;
}

export async function getRaceResults(
    season: number,
    round: string
): Promise<RaceResult[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await jolpica<any>(
        `/${season}/${round}/results.json?limit=40`,
        3600
    );
    return data.MRData.RaceTable.Races[0]?.Results ?? [];
}

export async function getQualifyingResults(
    season: number,
    round: string
): Promise<QualifyingResult[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await jolpica<any>(
        `/${season}/${round}/qualifying.json?limit=40`,
        3600
    );
    return data.MRData.RaceTable.Races[0]?.QualifyingResults ?? [];
}

export async function getSprintResults(
    season: number,
    round: string
): Promise<RaceResult[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await jolpica<any>(
        `/${season}/${round}/sprint.json?limit=40`,
        3600
    );
    return data.MRData.RaceTable.Races[0]?.SprintResults ?? [];
}

export async function getSeasonRaces(season: number): Promise<Race[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await jolpica<any>(`/${season}/races.json?limit=30`, 86400);
    return data.MRData.RaceTable.Races ?? [];
}

// Vainqueur de chaque manche : /results/1 = tous les P1 de la saison en 1 appel
export async function getSeasonWinners(
    season: number
): Promise<Map<string, RaceWinner>> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await jolpica<any>(`/${season}/results/1.json?limit=30`, 3600);
    const winners = new Map<string, RaceWinner>();
    for (const race of data.MRData.RaceTable.Races ?? []) {
        const r = race.Results?.[0];
        if (!r) continue;
        winners.set(race.round, {
            givenName: r.Driver.givenName,
            familyName: r.Driver.familyName,
            constructorId: r.Constructor.constructorId,
        });
    }
    return winners;
}

// ——— Fetch générique avec cache Next ———
async function jolpica<T>(path: string, revalidate: number): Promise<T> {
    const res = await fetch(`${BASE}${path}`, { next: { revalidate } });
    if (!res.ok) {
        throw new Error(`jolpica ${res.status} sur ${path}`);
    }
    return res.json();
}

// ——— Classements de la saison ———
export async function getDriverStandings(
    season: number
): Promise<DriverStanding[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await jolpica<any>(
        `/${season}/driverstandings.json?limit=100`,
        3600
    );
    return data.MRData.StandingsTable.StandingsLists[0]?.DriverStandings ?? [];
}

export async function getConstructorStandings(
    season: number
): Promise<ConstructorStanding[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await jolpica<any>(`/${season}/constructorstandings.json`, 3600);
    return (
        data.MRData.StandingsTable.StandingsLists[0]?.ConstructorStandings ?? []
    );
}

// ——— Carrière d'un pilote ———

// Saisons disputées par le pilote (ex: ["2018", "2019", ...])
async function getDriverSeasons(driverId: string): Promise<string[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await jolpica<any>(
        `/drivers/${driverId}/seasons.json?limit=100`,
        86400
    );
    return (data.MRData.SeasonTable.Seasons ?? []).map(
        (s: { season: string }) => s.season
    );
}

// Classement complet d'une saison (limit=100 : certaines saisons
// anciennes comptaient plus de 30 pilotes classés)
async function getSeasonStandings(season: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await jolpica<any>(
        `/${season}/driverstandings.json?limit=100`,
        86400
    );
    return (data.MRData.StandingsTable.StandingsLists[0]?.DriverStandings ??
        []) as DriverStanding[];
}

/**
 * Reconstruit la carrière saison par saison.
 * jolpica exige une saison dans l'URL des standings (contrairement à
 * l'Ergast d'origine), donc : 1 appel pour lister les saisons du pilote,
 * puis 1 appel par saison — par lots de 3 pour respecter la limite
 * de 4 req/s. Chaque réponse est cachée 24 h, donc seul le tout
 * premier affichage d'une carrière est lent (quelques secondes pour
 * un vétéran type Alonso).
 */
export async function getDriverCareer(
    driverId: string
): Promise<SeasonStanding[]> {
    const seasons = await getDriverSeasons(driverId);
    if (seasons.length === 0) return [];

    const career: SeasonStanding[] = [];
    const CHUNK = 3;

    for (let i = 0; i < seasons.length; i += CHUNK) {
        const chunk = seasons.slice(i, i + CHUNK);
        const results = await Promise.all(
            chunk.map(async (season) => {
                try {
                    const standings = await getSeasonStandings(season);
                    const mine = standings.find((s) => s.Driver.driverId === driverId);
                    return mine ? { season, DriverStandings: [mine] } : null;
                } catch {
                    return null; // une saison qui échoue ne casse pas toute la page
                }
            })
        );
        for (const r of results) if (r) career.push(r);

        // Pause entre les lots pour rester sous 4 req/s
        if (i + CHUNK < seasons.length) {
            await new Promise((resolve) => setTimeout(resolve, 800));
        }
    }

    return career; // déjà en ordre chronologique (les saisons le sont)
}

export async function getDriverInfo(driverId: string): Promise<Driver | null> {
    const data = await jolpica<any>(`/drivers/${driverId}.json`, 86400);
    return data.MRData.DriverTable.Drivers[0] ?? null;
}

export async function getConstructorInfo(
    constructorId: string
): Promise<Constructor | null> {
    const data = await jolpica<any>(`/constructors/${constructorId}.json`, 86400);
    return data.MRData.ConstructorTable.Constructors[0] ?? null;
}