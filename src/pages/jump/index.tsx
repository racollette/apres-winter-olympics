import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import Experience from "../../components/jump/Experience";
import { KeyboardControls } from "@react-three/drei";
import Interface from "../../components/jump/Interface";

const DEFAULT_DINO = {
  species: "rex",
  mood: "confident",
  number: "3495",
} as const;

function JumpEvent() {
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
              species={DEFAULT_DINO.species}
              mood={DEFAULT_DINO.mood}
              number={DEFAULT_DINO.number}
            />
          </Suspense>
        </Canvas>
        <Interface />
      </KeyboardControls>
    </>
  );
}

export default JumpEvent;
