import { getDriverStandings } from "@/lib/jolpica";
import { DriverRow } from "@/components/standings/DriverRow";

const SEASON = 2026;

export default async function Home() {
    const drivers = await getDriverStandings(SEASON);
    const leaderPts = Number(drivers[0]?.points ?? 0);

    return (
        <main>
            <div className="mb-6 flex flex-wrap items-baseline justify-between gap-4">
                <h1 className="text-[34px] font-black italic tracking-[0.5px]">
                    Classement Pilotes <span className="text-[#E10600]">{SEASON}</span>
                </h1>
            </div>

            <div className="flex gap-3.5 px-4 pb-2.5 text-xs font-bold uppercase tracking-[1px] text-white/45">
                <span className="w-9">Pos</span>
                <span className="flex-1">Pilote</span>
                <span className="hidden w-40 md:block">Écurie</span>
                <span className="w-[50px] text-center">Vict.</span>
                <span className="hidden w-[60px] text-right sm:block">Écart</span>
                <span className="w-[70px] text-right">Points</span>
            </div>

            <ol className="flex flex-col gap-1.5">
                {drivers.map((s) => (
                    <DriverRow key={s.Driver.driverId} standing={s} leaderPts={leaderPts} />
                ))}
            </ol>
        </main>
    );
}