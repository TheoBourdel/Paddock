import type { CircuitTrack } from "@/lib/circuitGeo";

export function CircuitMap({ track }: { track: CircuitTrack }) {
    const { path, sf } = track;
    return (
        <svg viewBox="0 0 400 300" className="block h-auto w-full max-w-[440px]">
            {/* ombre, asphalte, ligne de course */}
            <path d={path} fill="none" stroke="rgba(0,0,0,0.55)" strokeWidth="17" strokeLinejoin="round" strokeLinecap="round" />
            <path d={path} fill="none" stroke="#3A3A4A" strokeWidth="13" strokeLinejoin="round" strokeLinecap="round" />
            <path d={path} fill="none" stroke="#E10600" strokeWidth="2.5" strokeDasharray="10 7" strokeLinejoin="round" strokeLinecap="round" />
            {/* ligne de départ/arrivée */}
            <rect
                x={sf.x - 4}
                y={sf.y - 8}
                width="8"
                height="16"
                fill="#fff"
                transform={`rotate(${sf.angle.toFixed(1)} ${sf.x.toFixed(1)} ${sf.y.toFixed(1)})`}
            />
        </svg>
    );
}