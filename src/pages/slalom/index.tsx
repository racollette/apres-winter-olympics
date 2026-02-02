import { Canvas } from "@react-three/fiber";
import { Suspense, useRef, useState } from "react";
import Experience from "../../components/slalom/Experience";
import { KeyboardControls } from "@react-three/drei";
import Interface from "../../components/slalom/Interface";
import { LoadingScreen } from "~/components/LoadingScreen";

const DEFAULT_DINO = {
  species: "rex",
  mood: "confident",
  number: "3495",
} as const;

function SlalomEvent() {
  const lastTime = useRef(0);
  const fpsRef = useRef<HTMLDivElement>(null);
  const [start, setStart] = useState(false);

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
          camera={{ fov: 75, near: 0.1, far: 2500 }}
          onCreated={({ gl }) => {
            let frameCount = 0;
            gl.setAnimationLoop((time) => {
              frameCount++;
              if (frameCount % 10 === 0 && fpsRef.current) {
                const delta = time - lastTime.current;
                lastTime.current = time;
                fpsRef.current.textContent = `${Math.round(10000 / delta)} FPS`;
              }
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
        <div ref={fpsRef} className="absolute left-5 top-6 z-10 text-xs font-semibold text-white">
          -- FPS
        </div>
        <Interface />
        <LoadingScreen
          totalFiles={9}
          started={start}
          startExperience={() => setStart(true)}
        />
      </KeyboardControls>
    </>
  );
}

export default SlalomEvent;
