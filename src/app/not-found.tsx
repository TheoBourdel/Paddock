import Link from "next/link";

export default function NotFound() {
    return (
        <main className="relative flex flex-col items-center gap-4 overflow-hidden px-5 py-24 text-center">
            <span
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none text-[240px] font-black italic leading-none text-white/[0.04]"
            >
                404
            </span>

            <span className="relative text-xs font-bold uppercase tracking-[3px] text-[#E10600]">
                Drapeau noir
            </span>
            <h1 className="relative text-[38px] font-black italic tracking-[1px]">
                Page introuvable
            </h1>
            <p className="relative max-w-[420px] text-[15px] font-semibold leading-[1.6] text-white/55">
                Cette page n&apos;existe pas — pilote inconnu, Grand Prix hors
                calendrier ou lien périmé.
            </p>
            <div className="relative mt-2 flex flex-wrap justify-center gap-3">
                <Link
                    href="/"
                    className="bg-[#E10600] px-[26px] py-3 text-sm font-bold uppercase italic tracking-[1px] transition-colors hover:bg-[#FF3B33]"
                    style={{
                        clipPath: "polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)",
                    }}
                >
                    Accueil
                </Link>
                <Link
                    href="/classements"
                    className="border border-white/20 bg-white/[0.06] px-[26px] py-3 text-sm font-bold uppercase italic tracking-[1px] transition-colors hover:border-white"
                    style={{
                        clipPath: "polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)",
                    }}
                >
                    Classements
                </Link>
            </div>
        </main>
    );
}