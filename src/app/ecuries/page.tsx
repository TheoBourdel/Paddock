import { getConstructorStandings } from "@/lib/jolpica";
import { ConstructorRow } from "@/components/standings/ConstructorRow";

const SEASON = 2026;

export default async function ConstructorsPage() {
    const constructors = await getConstructorStandings(SEASON);
    const leaderPts = Number(constructors[0]?.points ?? 1);

    return (
        <main>
            <div className="mb-6 flex flex-wrap items-baseline justify-between gap-4">
                <h1 className="text-[34px] font-black italic tracking-[0.5px]">
                    Classement Constructeurs{" "}
                    <span className="text-[#E10600]">{SEASON}</span>
                </h1>
            </div>

            <ol className="flex flex-col gap-1.5">
                {constructors.map((s) => (
                    <ConstructorRow
                        key={s.Constructor.constructorId}
                        standing={s}
                        leaderPts={leaderPts}
                    />
                ))}
            </ol>
        </main>
    );
}