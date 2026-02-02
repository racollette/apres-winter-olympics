import { useMemo } from "react";
import useGame from "../../stores/useGame";

const MAX_SPEED = 32;
const SPEED_TO_KMH = 3.6;

export default function SpeedIndicator() {
  const velocity = useGame((state) => state.velocity);

  const speedKmh = useMemo(() => {
    return Math.round(velocity * SPEED_TO_KMH);
  }, [velocity]);

  const speedRatio = Math.min(velocity / MAX_SPEED, 1);

  const barColor = useMemo(() => {
    if (speedRatio < 0.4) return "bg-blue-400";
    if (speedRatio < 0.7) return "bg-green-400";
    if (speedRatio < 0.9) return "bg-yellow-400";
    return "bg-red-500";
  }, [speedRatio]);

  return (
    <div className="absolute bottom-24 left-6 flex flex-col items-start gap-1">
      <div className="text-sm font-medium text-white/80">SPEED</div>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold text-white tabular-nums">
          {speedKmh}
        </span>
        <span className="text-sm text-white/70">km/h</span>
      </div>
      <div className="h-2 w-32 overflow-hidden rounded-full bg-white/20">
        <div
          className={`h-full transition-all duration-75 ${barColor}`}
          style={{ width: `${speedRatio * 100}%` }}
        />
      </div>
    </div>
  );
}
