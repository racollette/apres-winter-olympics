import { useKeyboardControls } from "@react-three/drei";
import { useBobsled } from "../../stores/useBobsled";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Interface() {
  const phase = useBobsled((state) => state.phase);
  const pushPower = useBobsled((state) => state.pushPower);
  const speed = useBobsled((state) => state.speed);
  const lean = useBobsled((state) => state.lean);
  const time = useBobsled((state) => state.time);
  const bestTime = useBobsled((state) => state.bestTime);
  const trackProgress = useBobsled((state) => state.trackProgress);
  const startTime = useBobsled((state) => state.startTime);
  const restart = useBobsled((state) => state.restart);

  const [elapsedTime, setElapsedTime] = useState(0);

  const leftward = useKeyboardControls((state) => !!state.leftward);
  const rightward = useKeyboardControls((state) => !!state.rightward);
  const jump = useKeyboardControls((state) => !!state.jump);

  useEffect(() => {
    if (phase === "racing" || phase === "pushing") {
      const interval = setInterval(() => {
        setElapsedTime((Date.now() - startTime) / 1000);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [phase, startTime]);

  return (
    <div className="pointer-events-none fixed left-0 top-0 h-screen w-screen font-clayno">
      {/* Timer */}
      {(phase === "racing" || phase === "pushing") && (
        <div className="absolute left-1/2 top-6 flex -translate-x-1/2 flex-col items-center">
          <div className="rounded-lg bg-black/50 px-6 py-2 text-3xl font-bold text-white">
            {elapsedTime.toFixed(2)}s
          </div>
        </div>
      )}

      {/* Push meter during pushing phase */}
      {phase === "pushing" && (
        <div className="absolute left-1/2 top-20 flex -translate-x-1/2 flex-col items-center gap-2">
          <div className="text-xl font-bold text-white drop-shadow-lg">
            MASH SPACE TO PUSH!
          </div>
          <div className="h-8 w-64 overflow-hidden rounded-full border-4 border-white bg-gray-800">
            <div
              className="h-full bg-green-500 transition-all duration-75"
              style={{ width: `${pushPower}%` }}
            />
          </div>
        </div>
      )}

      {/* Speed and lean indicators during racing */}
      {phase === "racing" && (
        <>
          {/* Speed gauge */}
          <div className="absolute left-10 top-1/2 flex -translate-y-1/2 flex-col items-center gap-2">
            <div className="text-lg font-bold text-white drop-shadow-lg">
              Speed
            </div>
            <div className="h-40 w-8 overflow-hidden rounded-full border-4 border-white bg-gray-800">
              <div
                className="w-full bg-gradient-to-t from-green-500 via-yellow-500 to-red-500 transition-all duration-100"
                style={{
                  height: `${(speed / 50) * 100}%`,
                  marginTop: `${100 - (speed / 50) * 100}%`,
                }}
              />
            </div>
            <div className="text-xl font-bold text-white">
              {Math.round(speed)} km/h
            </div>
          </div>

          {/* Lean indicator */}
          <div className="absolute bottom-20 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2">
            <div className="text-lg font-bold text-white drop-shadow-lg">
              Lean
            </div>
            <div className="relative h-4 w-48 rounded-full bg-gray-800">
              <div
                className="absolute top-0 h-4 w-4 rounded-full bg-yellow-400 transition-all duration-100"
                style={{
                  left: `${50 + lean * 45}%`,
                  transform: "translateX(-50%)",
                }}
              />
              <div className="absolute left-1/2 top-0 h-4 w-0.5 -translate-x-1/2 bg-white/50" />
            </div>
            <div className="text-sm text-white">A/D to lean</div>
          </div>

          {/* Progress bar */}
          <div className="absolute bottom-10 left-1/2 w-1/2 -translate-x-1/2">
            <div className="h-3 w-full overflow-hidden rounded-full bg-gray-800">
              <div
                className="h-full bg-blue-500 transition-all duration-100"
                style={{ width: `${trackProgress * 100}%` }}
              />
            </div>
          </div>
        </>
      )}

      {/* Instructions */}
      {phase === "ready" && (
        <div className="absolute left-0 top-1/4 flex w-full flex-col items-center justify-center gap-2 bg-black/50 py-4 text-4xl text-white">
          <div className="text-2xl font-bold">Bobsled</div>
          <div className="text-lg">
            Push to build speed, then lean into turns for the fastest time!
          </div>
          <div className="mt-4 text-sm">
            <span className="rounded bg-white/20 px-2 py-1">SPACE</span> - Start
            &amp; Push |{" "}
            <span className="rounded bg-white/20 px-2 py-1">A/D</span> - Lean
            Left/Right
          </div>
        </div>
      )}

      {/* Results */}
      {phase === "finished" && (
        <div className="absolute left-0 top-1/4 flex w-full flex-col items-center justify-center gap-2 bg-black/50 py-4 text-4xl text-white">
          <div className="text-2xl font-bold">Finish!</div>
          <div className="text-3xl font-extrabold text-yellow-400">
            Time: {time.toFixed(2)}s
          </div>
          {bestTime > 0 && time > bestTime && (
            <div className="text-lg text-gray-300">
              Best: {bestTime.toFixed(2)}s
            </div>
          )}
          {time <= bestTime && (
            <div className="text-lg font-bold text-green-400">New Best Time!</div>
          )}
        </div>
      )}

      {/* Restart and Menu */}
      {phase === "finished" && (
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
          <div className="key"></div>
        </div>
        <div className="raw">
          <div className={`key ${leftward ? "active" : ""}`}></div>
          <div className="key"></div>
          <div className={`key ${rightward ? "active" : ""}`}></div>
        </div>
        <div className="raw">
          <div className={`key large ${jump ? "active" : ""}`}></div>
        </div>
      </div>
    </div>
  );
}
