import { useKeyboardControls } from "@react-three/drei";
import useGame from "../../stores/useGame";
import { use, useEffect, useRef, useState } from "react";
import { addEffect } from "@react-three/fiber";
import { api } from "~/utils/api";
import Link from "next/link";
import { Controls } from "../Controls";
import { OLYMPICS_ENDED } from "~/utils/constants";

export default function Interface({
  species,
  mood,
  number,
}: {
  species: string;
  mood: string;
  number: string;
}) {
  const [playing, setPlaying] = useState(true);

  const restart = useGame((state) => state.restart);
  const phase = useGame((state) => state.phase);
  const userId = useGame((state) => state.userId);
  const dino = useGame((state) => state.dino);
  const distanceFromCenter = useGame((state) => state.distanceFromCenter);

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
      // You can also add additional error handling logic here if needed
    },
  });

  const [score, setScore] = useState(0);

  useEffect(() => {
    const unsubscribeEffect = addEffect(() => {
      const state = useGame.getState();

      if (state.phase === "playing") {
        setPlaying(true);
      } else if (state.phase === "ended") {
        if (playing) {
          setScore(state.distanceFromCenter);
          setPlaying(false);
        }
      }
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
        eventId: 2,
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
      {/* <div className="top-15% absolute left-0 mt-2 flex w-full flex-row justify-center gap-4 bg-black/50 py-2 text-center text-2xl text-white">
        <div>{distanceFromCenter.toFixed(0)}</div>
      </div> */}

      {phase === "ready" && (
        <div className="absolute left-0 top-1/4 flex w-full flex-col items-center justify-center gap-2 bg-black/50 py-4 text-4xl text-white">
          <div className="text-2xl">Taxi Training</div>
          <div className="text-xl">
            Drop your Clayno as close to the center of target as possible.
          </div>

          <Controls spaceInstruction="Drop" wasdInstruction="Aim" spacebar />
        </div>
      )}

      {phase === "ended" && (
        <div className="absolute left-0 top-1/4 flex w-full flex-col items-center justify-center gap-2 bg-black/50 py-4 text-4xl text-white">
          <div className="text-xl">
            Distance from center: {distanceFromCenter.toFixed(2)} meters
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
            href={`/delivery?species=${species}&mood=${mood}&number=${number}`}
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

      <div className="absolute bottom-5 right-10 flex w-[150px] flex-col items-center rounded-md bg-fuchsia-800 py-2 text-xs uppercase text-white">
        {!userId && (
          <>
            <div className="text-md p-1 text-center">Not logged in!</div>
            <p className="text-center text-xs text-neutral-300">
              {`Scores won't be recorded.`}
            </p>
          </>
        )}
        <Link
          href={`/events`}
          className="pointer-events-auto cursor-pointer rounded-lg bg-sky-500 px-2 py-1"
        >
          Back to Menu
        </Link>
      </div>

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
