/* eslint-disable @typescript-eslint/no-explicit-any */
const GEO_URL =
    "https://raw.githubusercontent.com/bacinger/f1-circuits/master/f1-circuits.geojson";

export interface CircuitTrack {
    path: string; // path SVG dans un viewBox 400×300
    sf: { x: number; y: number; angle: number }; // ligne de départ/arrivée
    lengthM: number | null;
    altitude: number | null;
}

/**
 * Trouve le tracé du circuit le plus proche des coordonnées jolpica
 * dans le GeoJSON de bacinger/f1-circuits, et le projette en path SVG.
 * Renvoie null si aucun tracé à moins de ~30 km (circuit absent du dépôt).
 */
export async function getCircuitTrack(
    lat: number,
    lng: number
): Promise<CircuitTrack | null> {
    try {
        const res = await fetch(GEO_URL, {
            next: { revalidate: 60 * 60 * 24 * 7 },
        });
        if (!res.ok) return null;
        const geo = await res.json();

        // ——— Correspondance par proximité (centre de bbox le plus proche) ———
        let best: any = null;
        let bestD = Infinity;
        for (const f of geo.features ?? []) {
            if (f.geometry?.type !== "LineString" || !f.bbox) continue;
            const [minX, minY, maxX, maxY] = f.bbox;
            const d = Math.hypot((minX + maxX) / 2 - lng, (minY + maxY) / 2 - lat);
            if (d < bestD) {
                bestD = d;
                best = f;
            }
        }
        if (!best || bestD > 0.3) return null;

        // ——— Projection équirectangulaire → viewBox 400×300 ———
        const coords: [number, number][] = best.geometry.coordinates;
        const latMid =
            coords.reduce((s, c) => s + c[1], 0) / coords.length;
        const kx = Math.cos((latMid * Math.PI) / 180);

        const xs = coords.map((c) => c[0] * kx);
        const ys = coords.map((c) => c[1]);
        const minX = Math.min(...xs), maxX = Math.max(...xs);
        const minY = Math.min(...ys), maxY = Math.max(...ys);

        const W = 400, H = 300, M = 26;
        const scale = Math.min(
            (W - 2 * M) / (maxX - minX || 1),
            (H - 2 * M) / (maxY - minY || 1)
        );
        const offX = (W - (maxX - minX) * scale) / 2;
        const offY = (H - (maxY - minY) * scale) / 2;

        const X = (i: number) => (xs[i] - minX) * scale + offX;
        const Y = (i: number) => H - ((ys[i] - minY) * scale + offY);

        const pts = coords.map((_, i) => `${X(i).toFixed(1)},${Y(i).toFixed(1)}`);
        const path = `M ${pts[0]} L ${pts.slice(1).join(" ")}`;

        // ——— Ligne de départ : perpendiculaire au premier segment ———
        const j = Math.min(3, coords.length - 1);
        const angle =
            (Math.atan2(Y(j) - Y(0), X(j) - X(0)) * 180) / Math.PI;

        return {
            path,
            sf: { x: X(0), y: Y(0), angle },
            lengthM: best.properties?.length ?? null,
            altitude: best.properties?.altitude ?? null,
        };
    } catch {
        return null;
    }
}