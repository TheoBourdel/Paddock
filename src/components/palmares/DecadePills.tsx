"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function DecadePills({
    decades,
    active,
}: {
    decades: number[];
    active: number;
}) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [target, setTarget] = useState<number | null>(null);

    const go = (d: number) => {
        if (d === active || isPending) return;
        setTarget(d);
        startTransition(() => router.push(`/palmares?decennie=${d}`));
    };

    return (
        <div className="mb-5 flex flex-wrap gap-1.5">
            {decades.map((d) => {
                const isActive = active === d;
                const isLoading = isPending && target === d;
                return (
                    <button
                        key={d}
                        onClick={() => go(d)}
                        disabled={isPending}
                        className={`flex items-center gap-2 rounded-[20px] border px-4 py-[7px] text-[13px] font-bold tracking-[0.5px] transition-colors ${isActive
                            ? "border-[#E10600] bg-[#E10600] text-white"
                            : "border-white/20 text-white/60 hover:border-white/50"
                            } ${isPending && !isLoading ? "opacity-50" : ""}`}
                    >
                        {isLoading && (
                            <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        )}
                        {d}s
                    </button>
                );
            })}
        </div>
    );
}