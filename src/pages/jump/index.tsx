import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import Experience from "../../components/jump/Experience";
import { KeyboardControls } from "@react-three/drei";
import Interface from "../../components/jump/Interface";
import { useRouter } from "next/router";

function JumpEvent() {
  const router = useRouter();
  const { species, mood, number } = router.query;

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
      </KeyboardControls>
    </>
  );
}

export default JumpEvent;
