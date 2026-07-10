"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
    {
        href: "/classements",
        label: "Classements 2026",
        match: ["/classements", "/pilotes", "/ecuries"],
    },
    { href: "/calendrier", label: "Calendrier", match: ["/calendrier", "/gp", "/circuits"] },
    { href: "/palmares", label: "Palmarès", match: ["/palmares"] },
    { href: "/news", label: "News", match: ["/news"] },
    { href: "/live", label: "Live", match: ["/live"], dot: true },
];

export function Nav() {
    const pathname = usePathname();

    return (
        <nav className="-mx-4 flex gap-1 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
            {LINKS.map(({ href, label, match, dot }) => {
                const active = match.some((m) => pathname.startsWith(m));
                return (
                    <Link
                        key={href}
                        href={href}
                        className={`flex shrink-0 items-center gap-[7px] border-b-2 px-3.5 py-2 text-sm font-bold uppercase tracking-[0.5px] transition-colors ${active
                                ? "border-[#E10600] text-white"
                                : "border-transparent text-white/55 hover:text-white"
                            }`}
                    >
                        {dot && (
                            <span className="pw-pulse h-2 w-2 rounded-full bg-[#E10600]" />
                        )}
                        {label}
                    </Link>
                );
            })}
        </nav>
    );
}