export const ordinalFr = (p: number) => (p === 1 ? "1er" : `${p}e`);

export function timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return "à l'instant";
    if (min < 60) return `il y a ${min} min`;
    const h = Math.floor(min / 60);
    if (h < 24) return `il y a ${h} h`;
    const d = Math.floor(h / 24);
    if (d === 1) return "hier";
    if (d < 7) return `il y a ${d} jours`;
    return new Date(iso).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
    });
}