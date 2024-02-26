import { Canvas } from "@react-three/fiber";
import { Suspense, useRef, useState } from "react";
import Experience from "../../components/slalom/Experience";
import { KeyboardControls } from "@react-three/drei";
import Interface from "../../components/slalom/Interface";
import { useRouter } from "next/router";
import { LoadingScreen } from "~/components/LoadingScreen";

function SlalomEvent() {
  const router = useRouter();
  const { species, mood, number } = router.query;

  const [frameRate, setFrameRate] = useState(0);
  const lastTime = useRef(0);

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
          onCreated={({ gl }) => {
            gl.setAnimationLoop((time) => {
              const delta = time - lastTime.current;
              lastTime.current = time;
              const currentFrameRate = Math.round(1000 / delta); // Convert milliseconds to frames per second
              setFrameRate(currentFrameRate);
            });
          }}
        >
          <color attach="background" args={["black"]} />
          <Suspense fallback={null}>
            <Experience
              species={species as string}
              mood={mood as string}
              number={number as string}
            />
          </Suspense>
        </Canvas>
        <div className="absolute left-5 top-6 z-10 text-xs font-semibold text-white">
          {frameRate} FPS
        </div>
        <Interface
          species={species as string}
          mood={mood as string}
          number={number as string}
        />
        <LoadingScreen
          totalFiles={20}
          started={start}
          startExperience={() => setStart(true)}
        />
      </KeyboardControls>
    </>
  );
}

export default SlalomEvent;
