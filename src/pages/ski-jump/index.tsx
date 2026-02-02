import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState } from "react";
import Experience from "../../components/jump/Experience";
import { KeyboardControls, useProgress } from "@react-three/drei";
import Interface from "../../components/jump/Interface";

const DEFAULT_DINO = {
  species: "rex",
  mood: "confident",
  number: "3495",
} as const;

function LoadingOverlay() {
  const { progress } = useProgress();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (progress >= 100 && !dismissed) {
      const timer = setTimeout(() => {
        setDismissed(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [progress, dismissed]);

  if (dismissed) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-purple-800 to-sky-600 transition-opacity duration-500 ${
        progress >= 100 ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="mx-8 flex w-full flex-col items-center justify-center gap-3 md:mx-0 md:gap-6">
        <div className="font-pangolin text-xl font-extrabold text-white md:text-3xl">
          Preparing jump...
        </div>
        <div className="relative flex h-[45px] w-full items-center justify-center overflow-clip rounded-xl border-4 border-fuchsia-700/80 p-4 md:w-1/3">
          <div
            className="absolute left-0 top-0 h-full bg-fuchsia-600 transition-all duration-300"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
          <div className="font-pangolin absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xl font-extrabold text-white">
            {Math.min(progress, 100).toFixed(0)}%
          </div>
        </div>
      </div>
    </div>
  );
}

function SkiJumpEvent() {
  const [frameRate, setFrameRate] = useState(0);
  const lastTime = useRef(0);

  return (
    <>
      <KeyboardControls
        map={[
          { name: "forward", keys: ["ArrowUp", "KeyW"] },
          { name: "backward", keys: ["ArrowDown", "KeyS"] },
          { name: "leftward", keys: ["ArrowLeft", "KeyA"] },
          { name: "rightward", keys: ["ArrowRight", "KeyD"] },
          { name: "jump", keys: ["Space"] },
        ]}
      >
        <Canvas
          onCreated={({ gl }) => {
            gl.setAnimationLoop((time) => {
              const delta = time - lastTime.current;
              lastTime.current = time;
              const currentFrameRate = Math.round(1000 / delta);
              setFrameRate(currentFrameRate);
            });
          }}
        >
          <color attach="background" args={["black"]} />
          <Suspense fallback={null}>
            <Experience
              species={DEFAULT_DINO.species}
              mood={DEFAULT_DINO.mood}
              number={DEFAULT_DINO.number}
            />
          </Suspense>
        </Canvas>
        <div className="absolute left-5 top-6 z-10 text-xs font-semibold text-white">
          {frameRate} FPS
        </div>
        <Interface />
        <LoadingOverlay />
      </KeyboardControls>
    </>
  );
}

export default SkiJumpEvent;
