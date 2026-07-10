"use client";
import { ErrorState } from "@/components/ErrorState";

export default function Error({ reset }: { reset: () => void }) {
    return <ErrorState message="Impossible de charger le palmarès" reset={reset} />;
}