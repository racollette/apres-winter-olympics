import { useKeyboardControls } from "@react-three/drei";
import { useSkiJump } from "../../stores/useSkiJump";
import Link from "next/link";
import { Controls } from "../Controls";

export default function Interface() {
  const phase = useSkiJump((state) => state.phase);
  const power = useSkiJump((state) => state.power);
  const distance = useSkiJump((state) => state.distance);
  const landingAngle = useSkiJump((state) => state.landingAngle);
  const score = useSkiJump((state) => state.score);
  const bestScore = useSkiJump((state) => state.bestScore);
  const restart = useSkiJump((state) => state.restart);

  const forward = useKeyboardControls((state) => !!state.forward);
  const backward = useKeyboardControls((state) => !!state.backward);
  const jump = useKeyboardControls((state) => !!state.jump);

  return (
    <div className="pointer-events-none fixed left-0 top-0 h-screen w-screen font-clayno">
      {/* Power Meter */}
      {(phase === "ready" || phase === "charging") && (
        <div className="absolute left-1/2 top-20 flex -translate-x-1/2 flex-col items-center gap-2">
          <div className="text-xl font-bold text-white drop-shadow-lg">
            {phase === "ready" ? "Hold SPACE to charge" : "Release to jump!"}
          </div>
          <div className="h-8 w-64 overflow-hidden rounded-full border-4 border-white bg-gray-800">
            <div
              className="h-full transition-all duration-75"
              style={{
                width: `${power}%`,
                background: `linear-gradient(90deg, #22c55e ${power < 50 ? "100%" : "0%"}, #eab308 ${power < 80 ? "100%" : "0%"}, #ef4444 100%)`,
              }}
            />
          </div>
          <div className="text-2xl font-bold text-white drop-shadow-lg">
            {Math.round(power)}%
          </div>
        </div>
      )}

      {/* Instructions */}
      {phase === "ready" && (
        <div className="absolute left-0 top-1/4 flex w-full flex-col items-center justify-center gap-2 bg-black/50 py-4 text-4xl text-white">
          <div className="text-2xl font-bold">Ski Jump</div>
          <div className="text-lg">
            Charge your power, launch off the ramp, and control your angle for
            the best landing!
          </div>
          <div className="mt-4 text-sm">
            <span className="rounded bg-white/20 px-2 py-1">SPACE</span> - Charge
            &amp; Jump |{" "}
            <span className="rounded bg-white/20 px-2 py-1">W/S</span> - Pitch
            Control
          </div>
        </div>
      )}

      {/* Flying indicator */}
      {phase === "flying" && (
        <div className="absolute left-1/2 top-20 flex -translate-x-1/2 flex-col items-center gap-2">
          <div className="text-xl font-bold text-white drop-shadow-lg">
            Use W/S to adjust pitch!
          </div>
        </div>
      )}

      {/* Results */}
      {phase === "landed" && (
        <div className="absolute left-0 top-1/4 flex w-full flex-col items-center justify-center gap-2 bg-black/50 py-4 text-4xl text-white">
          <div className="text-2xl font-bold">Landed!</div>
          <div className="text-xl">Distance: {distance.toFixed(1)}m</div>
          <div className="text-xl">
            Landing Angle: {Math.abs(landingAngle).toFixed(1)}°
          </div>
          <div className="text-3xl font-extrabold text-yellow-400">
            Score: {score.toFixed(1)} points
          </div>
          {bestScore > 0 && (
            <div className="text-lg text-gray-300">
              Best: {bestScore.toFixed(1)} points
            </div>
          )}
        </div>
      )}

      {/* Restart and Menu buttons */}
      {phase === "landed" && (
        <div className="absolute left-0 top-1/2 flex w-full items-center justify-center gap-8 bg-black/50 py-4 text-xl font-bold text-white">
          <div
            className="pointer-events-auto cursor-pointer rounded-lg bg-emerald-500 p-2"
            onClick={restart}
          >
            Try Again
          </div>
          <Link
            href="/events"
            className="pointer-events-auto cursor-pointer rounded-lg bg-sky-500 p-2"
          >
            Menu
          </Link>
          <Link
            href="/leaderboard"
            target="_blank"
            className="pointer-events-auto cursor-pointer rounded-lg bg-purple-500 p-2"
          >
            Leaderboard
          </Link>
        </div>
      )}

      {/* Controls indicator */}
      <div className="controls">
        <div className="raw">
          <div className={`key ${forward ? "active" : ""}`}></div>
        </div>
        <div className="raw">
          <div className={`key`}></div>
          <div className={`key ${backward ? "active" : ""}`}></div>
          <div className={`key`}></div>
        </div>
        <div className="raw">
          <div className={`key large ${jump ? "active" : ""}`}></div>
        </div>
      </div>
    </div>
  );
}
