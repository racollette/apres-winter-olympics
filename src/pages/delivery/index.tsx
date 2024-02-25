import { Canvas } from "@react-three/fiber";
import { Suspense, useState } from "react";
import Experience from "../../components/delivery/Experience";
import { KeyboardControls } from "@react-three/drei";
import Interface from "../../components/delivery/Interface";
import { useRouter } from "next/router";
import { LoadingScreen } from "~/components/LoadingScreen";

function DeliveryEvent() {
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
        <Interface />
        <LoadingScreen
          totalFiles={79}
          started={start}
          startExperience={() => setStart(true)}
        />
      </KeyboardControls>
    </>
  );
}

export default DeliveryEvent;
