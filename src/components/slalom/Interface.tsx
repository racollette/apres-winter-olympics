import { useKeyboardControls } from "@react-three/drei";
import useGame from "../../stores/useGame";
import useAudio from "../../stores/useAudio";
import { useEffect, useRef, useState } from "react";
import { addEffect } from "@react-three/fiber";
import { api } from "~/utils/api";
import Link from "next/link";
import { OLYMPICS_ENDED } from "~/utils/constants";
import { Controls } from "../Controls";
import SpeedIndicator from "./SpeedIndicator";

export default function Interface() {
  const time = useRef<HTMLDivElement | null>(null);
  // const gatesActivated = useRef();
  const [gatesActivated, setGatesActivated] = useState(0);
  const [playing, setPlaying] = useState(true);

  const restart = useGame((state) => state.restart);
  const phase = useGame((state) => state.phase);
  const countdown = useGame((state) => state.countdown);
  const userId = useGame((state) => state.userId);
  const dino = useGame((state) => state.dino);

  const forward = useKeyboardControls((state) => !!state.forward);
  const backward = useKeyboardControls((state) => !!state.backward);
  const leftward = useKeyboardControls((state) => !!state.leftward);
  const rightward = useKeyboardControls((state) => !!state.rightward);
  const jump = useKeyboardControls((state) => !!state.jump);
  const toggleMute = useAudio((state) => state.toggleMute);
  const muted = useAudio((state) => state.muted);
  const currentGates = useGame((state) => state.gatesActivated);

  const recordResult = api.leaderboard.recordResult.useMutation({
    retry: 3,
    retryDelay: 1000,
    onError: (error) => {
      console.error("Mutation failed:", error);
      // You can also add additional error handling logic here if needed
    },
  });

  const [score, setScore] = useState(0);
  const totalGates = 50;

  useEffect(() => {
    const unsubscribeEffect = addEffect(() => {
      const state = useGame.getState();
      let elapsedTime = 0;

      if (state.phase === "playing") {
        elapsedTime = (Date.now() - state.startTime) / 1000;
        setScore(0);
        setPlaying(true);
      } else if (state.phase === "ended") {
        elapsedTime = (state.endTime - state.startTime) / 1000;
        if (playing) {
          setGatesActivated(state.gatesActivated);
          const score = elapsedTime + (totalGates - state.gatesActivated) * 5;
          setScore(score);
        }
        setPlaying(false);
      }

      if (time.current) time.current.textContent = elapsedTime.toFixed(2);
    });

    return () => {
      unsubscribeEffect();
    };
  }, [playing]);

  useEffect(() => {
    if (OLYMPICS_ENDED) return;
    if (!userId) {
      console.log("User not logged in");
    }
    if (!score) {
      console.log("No score updated");
    }
    if (!dino?.mint) {
      console.log("No dino registered");
    }

    if (phase === "ended" && userId && dino?.mint && score) {
      console.log("Recording result", {
        eventId: 3,
        userId,
        score,
        dinoId: dino?.mint,
      });

      recordResult.mutate({
        eventId: 1,
        userId,
        score: score,
        dinoId: dino?.mint ?? "",
      });
    }
  }, [score]);

  useEffect(() => {
    restart();
  }, []);

  return (
    <div className="pointer-events-none fixed left-0 top-0 h-screen w-screen font-clayno">
      {/* Time and Gates */}
      <div className="top-15% absolute left-0 mt-2 flex w-full flex-row items-center justify-center gap-6 bg-black/50 py-2 text-center text-white">
        <div className="flex flex-col items-center">
          <div className="text-xs text-white/70">TIME</div>
          <div ref={time} className="text-2xl font-bold tabular-nums">0.00</div>
        </div>
        <div className="h-8 w-px bg-white/30" />
        <div className="flex flex-col items-center">
          <div className="text-xs text-white/70">GATES</div>
          <div className="text-2xl font-bold">
            <span className="text-green-400">{currentGates}</span>
            <span className="text-white/50">/{totalGates}</span>
          </div>
        </div>
      </div>

      {/* Speed Indicator */}
      {phase === "playing" && <SpeedIndicator />}

      {/* Mute button */}
      <button
        className="pointer-events-auto absolute right-4 top-4 rounded-lg bg-black/40 p-2 text-white transition-colors hover:bg-black/60"
        onClick={toggleMute}
      >
        {muted ? (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
        ) : (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
        )}
      </button>

      {phase === "ready" && (
        <div className="absolute left-0 top-1/4 flex w-full flex-col items-center justify-center gap-4 bg-black/50 py-6 text-white">
          <div className="text-3xl font-bold">Slalom Time Trial</div>
          <div className="text-lg">
            Pass through the gates. Each missed gate adds 5 seconds.
          </div>
          <div className="mt-4 animate-pulse text-2xl font-bold text-yellow-400">
            Press SPACE to start
          </div>
          <Controls wasdInstruction="Steer" spacebar={false} />
        </div>
      )}

      {phase === "countdown" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-9xl font-bold text-white drop-shadow-lg">
            {countdown}
          </div>
        </div>
      )}

      {phase === "ended" && (
        <div className="absolute left-0 top-1/4 flex w-full flex-col items-center justify-center gap-2 bg-black/50 py-4 text-4xl text-white">
          <div className="text-xl">
            Missed Gates: {totalGates - gatesActivated}
          </div>
          <div className="text-xl">
            Penalty: {(totalGates - gatesActivated) * 5} seconds
          </div>
          <div className="text-2xl font-extrabold">
            Score: {score.toFixed(4)} seconds
          </div>
        </div>
      )}

      {/* Restart */}
      {phase === "ended" && (
        <div className="absolute left-0 top-1/2 flex w-full items-center justify-center gap-8 bg-black/50 py-4 text-xl font-bold text-white">
          <div
            className="pointer-events-auto cursor-pointer rounded-lg bg-emerald-500 p-2"
            onClick={restart}
          >
            Restart
          </div>
          {/* <div className="pointer-events-auto cursor-pointer rounded-lg bg-sky-500 p-2">
            Next Event
          </div> */}
          <Link
            href={`/events`}
            className="pointer-events-auto cursor-pointer rounded-lg bg-sky-500 p-2"
          >
            Menu
          </Link>
          <Link
            href={`/leaderboard`}
            target="_blank"
            className="pointer-events-auto cursor-pointer rounded-lg bg-purple-500 p-2"
          >
            Leaderboard
          </Link>
          <Link
            href={`/delivery`}
            className="pointer-events-auto cursor-pointer rounded-lg bg-blue-600 p-2"
          >
            Next Event
          </Link>
        </div>
      )}

      {phase === "playing" && (
        <div className="absolute bottom-5 left-10 flex w-full items-center py-4 text-xl uppercase text-white">
          <div
            className="pointer-events-auto cursor-pointer rounded-lg bg-emerald-500 p-2"
            onClick={restart}
          >
            Restart
          </div>
        </div>
      )}

      {!userId && (
        <div className="absolute bottom-5 right-10 flex w-[150px] flex-col items-center rounded-lg bg-fuchsia-800 py-2 text-xs uppercase text-white">
          <div className="text-md p-1 text-center">Not logged in!</div>
          <p className="text-center text-xs text-neutral-300">
            {`Scores won't be recorded.`}
          </p>
          <Link
            href={`/events`}
            className="pointer-events-auto cursor-pointer rounded-lg bg-sky-500 p-2"
          >
            Back to Menu
          </Link>
        </div>
      )}

      {/* Controls */}
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
