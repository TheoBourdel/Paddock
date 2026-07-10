"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const LINKS = [
    {
        href: "/classements",
        label: "Classements 2026",
        match: ["/classements", "/pilotes", "/ecuries"],
    },
    { href: "/calendrier", label: "Calendrier", match: ["/calendrier", "/gp", "/circuits"] },
    // { href: "/palmares", label: "Palmarès", match: ["/palmares"] },
    { href: "/news", label: "News", match: ["/news"] },
    { href: "/live", label: "Live", match: ["/live"], dot: true },
];

export function Header() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    // Ferme le menu à chaque navigation
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setOpen(false);
    }, [pathname]);

    const isActive = (match: string[]) =>
        match.some((m) => pathname.startsWith(m));

    return (
        <header className="sticky top-0 z-20 border-b border-white/[0.08] bg-[#15151E]">
            <div className="h-1 bg-[#E10600]" />
            <div className="mx-auto flex max-w-[1100px] items-center gap-7 px-4 py-3 sm:px-6 sm:py-3.5">
                <Link href="/" className="flex items-center gap-2.5">
                    <span className="flex h-6 w-[34px] -skew-x-[15deg] items-center justify-center bg-[#E10600]">
                        <span className="skew-x-[15deg] text-sm font-black italic tracking-[0.5px]">
                            P
                        </span>
                    </span>
                    <span className="text-xl font-black italic tracking-[1px]">
                        PADDOCK
                    </span>
                </Link>

                {/* ——— Nav desktop ——— */}
                <nav className="hidden flex-1 flex-wrap gap-1 sm:flex">
                    {LINKS.map(({ href, label, match, dot }) => (
                        <Link
                            key={href}
                            href={href}
                            className={`flex items-center gap-[7px] border-b-2 px-3.5 py-2 text-sm font-bold uppercase tracking-[0.5px] transition-colors ${isActive(match)
                                ? "border-[#E10600] text-white"
                                : "border-transparent text-white/55 hover:text-white"
                                }`}
                        >
                            {dot && (
                                <span className="pw-pulse h-2 w-2 rounded-full bg-[#E10600]" />
                            )}
                            {label}
                        </Link>
                    ))}
                </nav>

                {/* ——— Bouton burger (mobile) ——— */}
                <button
                    onClick={() => setOpen(!open)}
                    aria-expanded={open}
                    aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
                    className="ml-auto flex h-10 w-10 items-center justify-center sm:hidden"
                >
                    <span className="relative block h-[14px] w-5">
                        <span
                            className={`absolute left-0 top-0 h-0.5 w-5 bg-white transition-transform ${open ? "translate-y-[6px] rotate-45" : ""
                                }`}
                        />
                        <span
                            className={`absolute left-0 top-[6px] h-0.5 w-5 bg-white transition-opacity ${open ? "opacity-0" : ""
                                }`}
                        />
                        <span
                            className={`absolute left-0 top-3 h-0.5 w-5 bg-white transition-transform ${open ? "-translate-y-[6px] -rotate-45" : ""
                                }`}
                        />
                    </span>
                </button>
            </div>

            {/* ——— Panneau mobile ——— */}
            {open && (
                <nav className="border-t border-white/[0.08] sm:hidden">
                    {LINKS.map(({ href, label, match, dot }) => (
                        <Link
                            key={href}
                            href={href}
                            className={`flex items-center gap-2.5 border-l-[3px] px-5 py-3.5 text-sm font-bold uppercase tracking-[1px] transition-colors ${isActive(match)
                                ? "border-[#E10600] bg-white/[0.03] text-white"
                                : "border-transparent text-white/55"
                                }`}
                        >
                            {dot && (
                                <span className="pw-pulse h-2 w-2 rounded-full bg-[#E10600]" />
                            )}
                            {label}
                        </Link>
                    ))}
                </nav>
            )}
        </header>
    );
}