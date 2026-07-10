"use client";

export function ErrorState({
    message,
    reset,
}: {
    message: string;
    reset: () => void;
}) {
    return (
        <main className="flex flex-col items-center gap-4 px-5 py-24 text-center">
            <span className="text-xs font-bold uppercase tracking-[3px] text-[#E10600]">
                Drapeau rouge
            </span>
            <h1 className="text-2xl font-black italic tracking-[0.5px]">
                {message}
            </h1>
            <p className="max-w-[400px] text-sm font-semibold leading-[1.6] text-white/50">
                L&apos;API de données est peut-être temporairement saturée ou
                indisponible — c&apos;est généralement passager.
            </p>
            <button
                onClick={reset}
                className="mt-1 rounded-md border border-white/20 px-5 py-2.5 text-sm font-bold transition-colors hover:border-[#E10600]"
            >
                Réessayer
            </button>
        </main>
    );
}