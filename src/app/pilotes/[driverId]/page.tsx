import { notFound } from "next/navigation";
import {
    getDriverCareer,
    getDriverStandings,
    getDriverSeasonResults,
    getDriverSprintPoints,
    getSeasonRaces,
    type DriverRaceEntry,
    getDriverInfo,
} from "@/lib/jolpica";
import { teamColor } from "@/lib/teams";
import { DriverHero } from "@/components/driver/DriverHero";
import { CareerStats } from "@/components/driver/CareerStats";
import { PointsChart } from "@/components/driver/PointsChart";
import { TeammateDuel } from "@/components/driver/TeammateDuel";
import { SeasonGrid } from "@/components/driver/SeasonGrid";
import { SEASON } from "@/lib/config";
import type { Metadata } from "next";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ driverId: string }>;
}): Promise<Metadata> {
    const { driverId } = await params;
    const d = await getDriverInfo(driverId);
    return { title: d ? `${d.givenName} ${d.familyName}` : "Pilote" };
}

function seasonStats(races: DriverRaceEntry[], sprints: Map<string, number>) {
    let pts = 0, wins = 0, podiums = 0, posSum = 0, classified = 0;
    const byRound = new Map<string, number>();

    for (const r of races) {
        const roundPts = Number(r.points) + (sprints.get(r.round) ?? 0);
        pts += roundPts;
        byRound.set(r.round, roundPts);
        if (/^\d+$/.test(r.positionText)) {
            const p = Number(r.position);
            if (p === 1) wins++;
            if (p <= 3) podiums++;
            posSum += p;
            classified++;
        }
    }
    return {
        pts,
        wins,
        podiums,
        avg: classified ? (posSum / classified).toFixed(1) : "—",
        byRound,
    };
}

export default async function DriverPage({
    params,
}: {
    params: Promise<{ driverId: string }>;
}) {
    const { driverId } = await params;
    const [career, standings] = await Promise.all([
        getDriverCareer(driverId),
        getDriverStandings(SEASON),
    ]);
    if (career.length === 0) notFound();

    const me = standings.find((s) => s.Driver.driverId === driverId);
    const mate = me
        ? standings.find(
            (s) =>
                s.Constructors[0]?.constructorId ===
                me.Constructors[0]?.constructorId &&
                s.Driver.driverId !== driverId
        )
        : undefined;

    let seasonSection: React.ReactNode = null;

    if (me && mate) {
        const [myRaces, mySprints, mateRaces, mateSprints, races] =
            await Promise.all([
                getDriverSeasonResults(SEASON, driverId),
                getDriverSprintPoints(SEASON, driverId),
                getDriverSeasonResults(SEASON, mate.Driver.driverId),
                getDriverSprintPoints(SEASON, mate.Driver.driverId),
                getSeasonRaces(SEASON),
            ]);

        const my = seasonStats(myRaces, mySprints);
        const his = seasonStats(mateRaces, mateSprints);
        const color = teamColor(me.Constructors[0]?.constructorId);

        const rounds = [
            ...new Set([...my.byRound.keys(), ...his.byRound.keys()]),
        ].sort((a, b) => Number(a) - Number(b));
        const cumulate = (byRound: Map<string, number>) => {
            let s = 0;
            return rounds.map((r) => (s += byRound.get(r) ?? 0));
        };

        const myName = `${me.Driver.givenName} ${me.Driver.familyName}`;
        const mateName = `${mate.Driver.givenName} ${mate.Driver.familyName}`;

        seasonSection = (
            <>
                <SeasonGrid
                    season={SEASON}
                    races={races}
                    results={myRaces}
                    sprints={mySprints}
                    color={color}
                />
                {rounds.length >= 2 && (
                    <PointsChart
                        season={SEASON}
                        meName={myName}
                        mateName={mateName}
                        color={color}
                        meCum={cumulate(my.byRound)}
                        mateCum={cumulate(his.byRound)}
                    />
                )}
                <TeammateDuel
                    color={color}
                    me={{ name: myName, ...my }}
                    mate={{ name: mateName, driverId: mate.Driver.driverId, ...his }}
                />
            </>
        );
    }

    return (
        <main>
            <DriverHero career={career} />
            <CareerStats career={career} />
            {seasonSection}
        </main>
    );
}