import { useMemo } from "react";
import useGame from "../../stores/useGame";

const GATE_POSITIONS: [number, number][] = [];
for (let i = 0; i < 50; i++) {
  const z = -20 - i * 24;
  const amplitude = 25 + Math.sin(i * 0.2) * 15;
  const x = Math.sin(i * 0.7 + 0.2) * amplitude;
  GATE_POSITIONS.push([x, z]);
}

const TOTAL_GATES = 50;

type GateIndicatorProps = {
  playerZ: number;
  playerX: number;
};

export default function GateIndicator({ playerZ, playerX }: GateIndicatorProps) {
  const passedGateIndices = useGame((state) => state.passedGateIndices);
  const gatesActivated = useGame((state) => state.gatesActivated);

  const nextGateInfo = useMemo(() => {
    for (let i = 0; i < GATE_POSITIONS.length; i++) {
      const [gateX, gateZ] = GATE_POSITIONS[i]!;
      if (gateZ < playerZ && !passedGateIndices.has(i)) {
        const dx = gateX - playerX;
        const dz = gateZ - playerZ;
        const distance = Math.sqrt(dx * dx + dz * dz);
        const angle = Math.atan2(dx, -dz) * (180 / Math.PI);
        return { index: i, x: gateX, z: gateZ, distance, angle };
      }
    }
    return null;
  }, [playerZ, playerX, passedGateIndices]);

  const gatesRemaining = TOTAL_GATES - gatesActivated;

  return (
    <div className="absolute right-6 top-24 flex flex-col items-end gap-3">
      <div className="flex flex-col items-end rounded-lg bg-black/40 px-3 py-2">
        <div className="text-xs text-white/70">GATES</div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-green-400">
            {gatesActivated}
          </span>
          <span className="text-sm text-white/50">/ {TOTAL_GATES}</span>
        </div>
      </div>

      {nextGateInfo && nextGateInfo.distance < 100 && (
        <div className="flex flex-col items-center rounded-lg bg-black/40 px-3 py-2">
          <div className="text-xs text-white/70">NEXT GATE</div>
          <div
            className="flex h-10 w-10 items-center justify-center"
            style={{ transform: `rotate(${nextGateInfo.angle}deg)` }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-8 w-8"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                d="M12 5l0 14M12 5l-5 5M12 5l5 5"
                className="text-yellow-400"
              />
            </svg>
          </div>
          <div className="text-xs text-white/70">
            {Math.round(nextGateInfo.distance)}m
          </div>
        </div>
      )}
    </div>
  );
}
