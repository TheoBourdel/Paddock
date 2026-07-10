import { getSeasonRaces, getSeasonWinners } from "@/lib/jolpica";
import { RaceCard } from "@/components/calendar/RaceCard";
import { SEASON } from "@/lib/config";
export const metadata = { title: `Calendrier ${SEASON}` };

export default async function CalendarPage() {
    const [races, winners] = await Promise.all([
        getSeasonRaces(SEASON),
        getSeasonWinners(SEASON),
    ]);

    // Une course est "terminée" si son départ est passé (le vainqueur
    // n'apparaît que lorsque jolpica a intégré les résultats)
    const now = new Date();
    const isDone = (r: (typeof races)[number]) =>
        new Date(`${r.date}T${r.time ?? "12:00:00Z"}`) < now;
    const nextRound = races.find((r) => !isDone(r))?.round;

    return (
        <main>
            <h1 className="mb-6 text-[34px] font-black italic tracking-[0.5px]">
                Calendrier <span className="text-[#E10600]">{SEASON}</span>
            </h1>

            <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-3">
                {races.map((race) => (
                    <RaceCard
                        key={race.round}
                        race={race}
                        winner={winners.get(race.round) ?? null}
                        done={isDone(race)}
                        isNext={race.round === nextRound}
                    />
                ))}
            </div>
        </main>
    );
}