import { useKeyboardControls } from "@react-three/drei";
import { useJumpGame } from "../../stores/useJumpGame";
import { useEffect, useRef, useState } from "react";
import { addEffect } from "@react-three/fiber";
import { api } from "~/utils/api";
import Link from "next/link";
import { OLYMPICS_ENDED } from "~/utils/constants";
import { K_POINT_DISTANCE } from "./SkiJumpRamp";

export default function Interface() {
  const speedRef = useRef<HTMLDivElement | null>(null);

  const restart = useJumpGame((state) => state.restart);
  const phase = useJumpGame((state) => state.phase);
  const countdown = useJumpGame((state) => state.countdown);
  const userId = useJumpGame((state) => state.userId);
  const dino = useJumpGame((state) => state.dino);
  const distance = useJumpGame((state) => state.distance);
  const stylePoints = useJumpGame((state) => state.stylePoints);
  const takeoffSpeed = useJumpGame((state) => state.takeoffSpeed);

  const forward = useKeyboardControls((state) => !!state.forward);
  const backward = useKeyboardControls((state) => !!state.backward);
  const leftward = useKeyboardControls((state) => !!state.leftward);
  const rightward = useKeyboardControls((state) => !!state.rightward);
  const jump = useKeyboardControls((state) => !!state.jump);

  const recordResult = api.leaderboard.recordResult.useMutation({
    retry: 3,
    retryDelay: 1000,
    onError: (error) => {
      console.error("Mutation failed:", error);
    },
  });

  const [finalScore, setFinalScore] = useState(0);

  useEffect(() => {
    const unsubscribeEffect = addEffect(() => {
      const state = useJumpGame.getState();

      if (speedRef.current) {
        speedRef.current.textContent = `${(state.speed * 3.6).toFixed(0)} km/h`;
      }
    });

    return () => {
      unsubscribeEffect();
    };
  }, []);

  useEffect(() => {
    if (phase === "results" && distance > 0) {
      const distancePoints = distance;
      const kPointBonus = distance >= K_POINT_DISTANCE ? 10 : 0;
      const total = distancePoints + stylePoints + kPointBonus;
      setFinalScore(Math.round(total * 10) / 10);
    }
  }, [phase, distance, stylePoints]);

  useEffect(() => {
    if (OLYMPICS_ENDED) return;
    if (!userId || !dino?.mint || !finalScore) return;

    if (phase === "results" && finalScore > 0) {
      recordResult.mutate({
        eventId: 2,
        userId,
        score: finalScore,
        dinoId: dino.mint,
      });
    }
  }, [phase, finalScore]);

  useEffect(() => {
    restart();
  }, []);

  return (
    <div className="pointer-events-none fixed left-0 top-0 h-screen w-screen font-clayno">
      {/* Speed display during inrun/flight */}
      {(phase === "inrun" || phase === "flight") && (
        <div className="absolute left-0 top-[15%] mt-2 flex w-full flex-row items-center justify-center gap-6 bg-black/50 py-2 text-center text-white">
          <div className="flex flex-col items-center">
            <div className="text-xs text-white/70">SPEED</div>
            <div ref={speedRef} className="text-2xl font-bold tabular-nums">
              0 km/h
            </div>
          </div>
        </div>
      )}

      {/* Ready screen */}
      {phase === "ready" && (
        <div className="absolute left-0 top-1/4 flex w-full flex-col items-center justify-center gap-4 bg-black/50 py-6 text-white">
          <div className="text-3xl font-bold">Ski Jump</div>
          <div className="text-lg">
            Build speed on the in-run, control your flight, land with style!
          </div>
          <div className="mt-4 animate-pulse text-2xl font-bold text-yellow-400">
            Press SPACE to start
          </div>
          <div className="mt-4 flex flex-col items-center gap-2 rounded-lg bg-black/50 p-4">
            <div className="text-xl font-bold">Controls</div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <span className="text-white/70">In-Run</span>
              <span></span>
              <span className="text-white/70">W</span>
              <span>Tuck (faster)</span>
              <span className="text-white/70 mt-2">Flight</span>
              <span></span>
              <span className="text-white/70">W / S</span>
              <span>Lean forward / back</span>
              <span className="text-white/70">A / D</span>
              <span>Roll left / right</span>
            </div>
          </div>
        </div>
      )}

      {/* Countdown */}
      {phase === "countdown" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-9xl font-bold text-white drop-shadow-lg">
            {countdown}
          </div>
        </div>
      )}

      {/* Flight indicator */}
      {phase === "flight" && (
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 rounded-lg bg-black/50 px-6 py-3 text-white">
          <div className="text-center text-xl font-bold text-yellow-400">
            CONTROL YOUR FLIGHT
          </div>
          <div className="mt-1 text-center text-sm text-white/70">
            Lean forward (W) for more lift
          </div>
        </div>
      )}

      {/* Landed indicator */}
      {phase === "landed" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="rounded-lg bg-black/70 px-8 py-4 text-center text-white">
            <div className="text-4xl font-bold text-green-400">LANDED!</div>
            <div className="mt-2 text-2xl">{distance}m</div>
          </div>
        </div>
      )}

      {/* Results screen */}
      {phase === "results" && (
        <div className="absolute left-0 top-1/4 flex w-full flex-col items-center justify-center gap-2 bg-black/50 py-4 text-white">
          <div className="text-3xl font-bold">Results</div>
          <div className="mt-2 grid grid-cols-2 gap-x-8 gap-y-2 text-xl">
            <span className="text-white/70">Distance:</span>
            <span className="font-bold">{distance}m</span>
            <span className="text-white/70">Takeoff Speed:</span>
            <span className="font-bold">{(takeoffSpeed * 3.6).toFixed(1)} km/h</span>
            <span className="text-white/70">Style Points:</span>
            <span className="font-bold">{stylePoints}</span>
            {distance >= K_POINT_DISTANCE && (
              <>
                <span className="text-green-400">K-Point Bonus:</span>
                <span className="font-bold text-green-400">+10</span>
              </>
            )}
          </div>
          <div className="mt-4 text-3xl font-extrabold">
            Total Score: {finalScore}
          </div>
        </div>
      )}

      {/* Restart button on results */}
      {phase === "results" && (
        <div className="absolute left-0 top-1/2 mt-16 flex w-full items-center justify-center gap-8 bg-black/50 py-4 text-xl font-bold text-white">
          <div
            className="pointer-events-auto cursor-pointer rounded-lg bg-emerald-500 p-2"
            onClick={restart}
          >
            Restart
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

      {/* Restart during play */}
      {(phase === "inrun" || phase === "flight") && (
        <div className="absolute bottom-5 left-10 flex w-full items-center py-4 text-xl uppercase text-white">
          <div
            className="pointer-events-auto cursor-pointer rounded-lg bg-emerald-500 p-2"
            onClick={restart}
          >
            Restart
          </div>
        </div>
      )}

      {/* Not logged in warning */}
      {!userId && (
        <div className="absolute bottom-5 right-10 flex w-[150px] flex-col items-center rounded-lg bg-fuchsia-800 py-2 text-xs uppercase text-white">
          <div className="text-md p-1 text-center">Not logged in!</div>
          <p className="text-center text-xs text-neutral-300">
            {`Scores won't be recorded.`}
          </p>
          <Link
            href="/events"
            className="pointer-events-auto cursor-pointer rounded-lg bg-sky-500 p-2"
          >
            Back to Menu
          </Link>
        </div>
      )}

      {/* Controls indicator */}
      <div className="controls">
        <div className="raw">
          <div className={`key ${forward ? "active" : ""}`}></div>
        </div>
        <div className="raw">
          <div className={`key ${leftward ? "active" : ""}`}></div>
          <div className={`key ${backward ? "active" : ""}`}></div>
          <div className={`key ${rightward ? "active" : ""}`}></div>
        </div>
        <div className="raw">
          <div className={`key large ${jump ? "active" : ""}`}></div>
        </div>
      </div>
    </div>
  );
}
