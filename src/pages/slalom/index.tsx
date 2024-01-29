import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import Experience from "../../components/slalom/Experience";
import { KeyboardControls } from "@react-three/drei";
import Interface from "../../components/slalom/Interface";

function App() {
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
            <Experience />
          </Suspense>
        </Canvas>
        <Interface />
      </KeyboardControls>
    </>
  );
}

export default App;
