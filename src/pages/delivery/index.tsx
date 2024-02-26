"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useRef, useState } from "react";
import Experience from "../../components/delivery/Experience";
import { KeyboardControls, PerformanceMonitor } from "@react-three/drei";
import Interface from "../../components/delivery/Interface";
import { useRouter } from "next/router";
import { LoadingScreen } from "~/components/LoadingScreen";

function DeliveryEvent() {
  const router = useRouter();
  const { species, mood, number } = router.query;

  const [frameRate, setFrameRate] = useState(0);
  const lastTime = useRef(0);

  const [start, setStart] = useState(false);
  // const [dpr, setDpr] = useState(1.5);
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
          {/* <PerformanceMonitor
            factor={1}
            // onChange={({ factor }) => setDpr(Math.floor(0.5 + 1.5 * factor))}
            // onIncline={() => setDpr(2)}
            // onDecline={() => setDpr(1)}
            onChange={({ fps, refreshrate }) => console.log(fps, refreshrate)}
          /> */}

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
        <Interface />
        <LoadingScreen
          totalFiles={110}
          started={start}
          startExperience={() => setStart(true)}
        />
      </KeyboardControls>
    </>
  );
}

export default DeliveryEvent;
