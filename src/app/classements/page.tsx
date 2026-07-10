import {
    getDriverStandings,
    getConstructorStandings,
    getSeasonRaces,
} from "@/lib/jolpica";
import { StandingsToggle } from "@/components/standings/StandingsToggle";
import { SEASON } from "@/lib/config";
export const metadata = { title: `Classements ${SEASON}` };

export default async function StandingsPage({
    searchParams,
}: {
    searchParams: Promise<{ vue?: string }>;
}) {
    const { vue } = await searchParams;
    const [drivers, constructors, races] = await Promise.all([
        getDriverStandings(SEASON),
        getConstructorStandings(SEASON),
        getSeasonRaces(SEASON),
    ]);

    const now = new Date();
    const doneCount = races.filter(
        (r) => new Date(`${r.date}T${r.time ?? "12:00:00Z"}`) < now
    ).length;
    const progressLabel =
        doneCount > 0
            ? `Après ${doneCount} manche${doneCount > 1 ? "s" : ""} sur ${races.length}`
            : `${races.length} manches au programme`;

    return (
        <main>
            <div className="mb-6 flex flex-wrap items-baseline justify-between gap-4">
                <h1 className="text-[34px] font-black italic tracking-[0.5px]">
                    Classements <span className="text-[#E10600]">{SEASON}</span>
                </h1>
                <span className="text-sm font-semibold text-white/55">
                    {progressLabel}
                </span>
            </div>

            <StandingsToggle
                drivers={drivers}
                constructors={constructors}
                defaultTab={vue === "constructeurs" ? "constructeurs" : "pilotes"}
            />
        </main>
    );
}