import { useKeyboardControls } from "@react-three/drei";
import useGame from "../../stores/useGame";
import { useEffect, useRef, useState } from "react";
import { addEffect } from "@react-three/fiber";

export default function Interface() {
  const time = useRef();
  // const gatesActivated = useRef();
  const [gatesActivated, setGatesActivated] = useState(0);

  const restart = useGame((state) => state.restart);
  const phase = useGame((state) => state.phase);

  const forward = useKeyboardControls((state) => state.forward);
  const backward = useKeyboardControls((state) => state.backward);
  const leftward = useKeyboardControls((state) => state.leftward);
  const rightward = useKeyboardControls((state) => state.rightward);
  const jump = useKeyboardControls((state) => state.jump);

  useEffect(() => {
    const unsubscribeEffect = addEffect(() => {
      const state = useGame.getState();

      let elapsedTime = 0;

      if (state.phase === "playing") elapsedTime = Date.now() - state.startTime;
      else if (state.phase === "ended")
        elapsedTime = state.endTime - state.startTime;

      elapsedTime /= 1000;
      elapsedTime = elapsedTime.toFixed(2);

      if (time.current) time.current.textContent = elapsedTime;

      console.log(state.gatesActivated);
      setGatesActivated(state.gatesActivated);
    });

    return () => {
      unsubscribeEffect();
    };
  }, []);

  const missedGates = 21 - gatesActivated;

  return (
    <div className="pointer-events-none fixed left-0 top-0 h-screen w-screen">
      {/* Time */}
      <div className="top-15% absolute left-0 mt-2 flex w-full flex-row justify-center gap-4 bg-black/50 py-2 text-center text-2xl text-white">
        <div ref={time}>0.00</div>
      </div>

      {phase === "ended" && (
        <div className="absolute left-0 top-1/4 flex w-full flex-col items-center justify-center gap-2 py-4 text-4xl text-white">
          <div>Missed Gates: {missedGates}</div>
          <div>Time Penalty: {missedGates * 5} seconds</div>
          <div>
            Total Time:{" "}
            {(Number(time.current.textContent) + missedGates * 5).toFixed(4)}{" "}
            seconds
          </div>
        </div>
      )}

      {/* Restart */}
      {phase === "ended" && (
        <div className="absolute left-0 top-1/2 flex w-full items-center justify-center gap-8 bg-black/50 py-4 text-4xl uppercase text-white">
          <div
            className="pointer-events-auto cursor-pointer rounded-lg border-2 border-emerald-500 p-2"
            onClick={restart}
          >
            Restart
          </div>
          <div className="pointer-events-auto cursor-pointer rounded-lg border-2 border-emerald-500 p-2">
            Next Event
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
