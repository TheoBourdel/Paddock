import { getNews } from "@/lib/news";
import { timeAgo } from "@/lib/format";
export const metadata = { title: "News F1" };

export const revalidate = 900;

export default async function NewsPage() {
    const news = await getNews();
    const featured = news[0];
    const items = news.slice(1);

    return (
        <main>
            <div className="mb-2 flex flex-wrap items-baseline justify-between gap-4">
                <h1 className="text-[34px] font-black italic tracking-[0.5px]">
                    News <span className="text-[#E10600]">F1</span>
                </h1>
                <span className="text-sm font-semibold text-white/55">
                    Chaque article s&apos;ouvre chez sa source
                </span>
            </div>
            <p className="mb-6 max-w-[560px] text-[15px] font-semibold text-white/50">
                L&apos;actualité du paddock, sélectionnée depuis la presse spécialisée.
            </p>

            {!featured && (
                <div className="rounded-md bg-[#1B1B26] px-5 py-10 text-center text-sm font-semibold text-white/50">
                    Les flux d&apos;actualité sont momentanément inaccessibles. Réessaie
                    dans quelques minutes.
                </div>
            )}

            {/* ——— À la une ——— */}
            {featured && (

                <a href={featured.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative mb-3.5 block overflow-hidden rounded-[10px] border border-[#E10600]/30 px-8 py-8 transition-colors hover:border-[#E10600]/70"
                    style={{
                        background: "linear-gradient(155deg, #1E0B0B 0%, #15151E 55%)",
                    }}
                >
                    <span
                        className="pointer-events-none absolute -bottom-11 -right-5 select-none text-[170px] font-black italic leading-none text-white/[0.03]"
                        aria-hidden="true"
                    >
                        À LA UNE
                    </span>
                    <div className="relative flex max-w-[720px] flex-col gap-3">
                        <div className="flex flex-wrap items-center gap-2.5">
                            <span
                                className="bg-[#E10600] px-3 py-1 text-[11px] font-black uppercase italic tracking-[1.5px]"
                                style={{
                                    clipPath:
                                        "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)",
                                }}
                            >
                                À la une
                            </span>
                            <span className="text-xs font-bold uppercase tracking-[1px] text-white/45">
                                {featured.tag} · {featured.source} · {timeAgo(featured.date)}
                            </span>
                        </div>
                        <span className="text-[30px] font-black italic leading-[1.15]">
                            {featured.title}
                        </span>
                        {featured.excerpt && (
                            <span className="text-[15px] font-semibold leading-[1.55] text-white/60">
                                {featured.excerpt}…
                            </span>
                        )}
                        <span className="text-[13px] font-bold uppercase italic tracking-[1px] text-[#FF3B33]">
                            Lire sur {featured.source} →
                        </span>
                    </div>
                </a>
            )
            }

            {/* ——— Grille d'articles ——— */}
            <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-3">
                {items.map((n) => (

                    <a key={n.url}
                        href={n.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col gap-2.5 rounded-lg bg-[#1B1B26] px-[22px] py-5 transition-colors hover:bg-[#242433]"
                    >
                        <span
                            className="flex items-center gap-[7px] text-xs font-bold uppercase tracking-[1px]"
                            style={{ color: n.color }}
                        >
                            <span
                                className="h-[7px] w-[7px] rounded-full"
                                style={{ backgroundColor: n.color }}
                            />
                            {n.tag}
                        </span>
                        <span className="text-lg font-bold leading-[1.3]">{n.title}</span>
                        {n.excerpt && (
                            <span className="flex-1 text-sm font-semibold leading-[1.5] text-white/55">
                                {n.excerpt}…
                            </span>
                        )}
                        <span className="flex justify-between gap-2.5 border-t border-white/[0.08] pt-2.5">
                            <span className="text-xs font-bold text-white/45">
                                {n.source} · {timeAgo(n.date)}
                            </span>
                            <span className="text-xs font-bold uppercase italic text-white/60">
                                Lire →
                            </span>
                        </span>
                    </a>
                ))}
            </div >
        </main >
    );
}