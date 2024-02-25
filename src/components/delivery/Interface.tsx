import { useKeyboardControls } from "@react-three/drei";
import useGame from "../../stores/useGame";
import { useEffect, useRef, useState } from "react";
import { addEffect } from "@react-three/fiber";
import { api } from "~/utils/api";
import Link from "next/link";
import { Controls } from "../Controls";
import { OLYMPICS_ENDED } from "~/utils/constants";

export default function Interface() {
  const time = useRef<HTMLDivElement | null>(null);
  const [playing, setPlaying] = useState(true);

  const restart = useGame((state) => state.restart);
  const phase = useGame((state) => state.phase);
  const userId = useGame((state) => state.userId);
  const dino = useGame((state) => state.dino);

  const forward = useKeyboardControls((state) => !!state.forward);
  const backward = useKeyboardControls((state) => !!state.backward);
  const leftward = useKeyboardControls((state) => !!state.leftward);
  const rightward = useKeyboardControls((state) => !!state.rightward);
  const jump = useKeyboardControls((state) => !!state.jump);

  const recordResult = api.leaderboard.recordResult.useMutation();

  const [score, setScore] = useState(0);

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
          setScore(elapsedTime);
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
    if (phase === "ended" && userId && dino?.mint && score) {
      recordResult.mutate({
        eventId: 3,
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
      {/* Time */}
      <div className="top-15% absolute left-0 mt-2 flex w-full flex-row justify-center gap-4 bg-black/50 py-2 text-center text-2xl text-white">
        <div ref={time}>0.00</div>
      </div>

      {phase === "ready" && (
        <div className="absolute left-0 top-1/4 flex w-full flex-col items-center justify-center gap-2 bg-black/50 py-4 text-4xl text-white">
          <div className="text-2xl font-bold">Croissant Emergency</div>
          <div className="text-lg">
            The Lodge has run out of croissants! Take these to them wif
            immediate haste.
          </div>
          <div className="text-sm">
            Be warned, The Crimson Clan is known to lurk in these parts.
          </div>

          <Controls spaceInstruction="Jump" wasdInstruction="Move" spacebar />
        </div>
      )}

      {phase === "ended" && (
        <div className="absolute left-0 top-1/4 flex w-full flex-col items-center justify-center gap-2 bg-black/50 py-4 text-4xl text-white">
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
