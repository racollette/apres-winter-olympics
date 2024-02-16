import { Canvas } from "@react-three/fiber";
import { Suspense, useState } from "react";
import Experience from "../../components/slalom/Experience";
import { KeyboardControls } from "@react-three/drei";
import Interface from "../../components/slalom/Interface";
import { useRouter } from "next/router";
import { LoadingScreen } from "~/components/LoadingScreen";

function SlalomEvent() {
  const router = useRouter();
  const { species, mood, number } = router.query;

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
        <Canvas>
          <color attach="background" args={["black"]} />
          <Suspense fallback={null}>
            <Experience
              species={species as string}
              mood={mood as string}
              number={number as string}
            />
          </Suspense>
        </Canvas>
        <Interface          species={species as string}
              mood={mood as string}
              number={number as string} />
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
