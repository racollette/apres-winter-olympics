import { Physics } from "@react-three/rapier";
import { GradientTexture } from "@react-three/drei";
import Terrain from "./Terrain";
import Gates from "./Gates";
import Skier from "./Skier";
import Lights from "./Lights";

export type ModelProps = {
  species: string;
  mood: string;
  number: string;
};

function SkyDome() {
  return (
    <mesh scale={[-1, 1, 1]}>
      <sphereGeometry args={[2000, 16, 8]} />
      <meshBasicMaterial side={2}>
        <GradientTexture
          stops={[0, 0.35, 0.5, 0.65, 1]}
          colors={["#0a1a2e", "#2563a8", "#4a90c9", "#87CEEB", "#b8d9f0"]}
        />
      </meshBasicMaterial>
    </mesh>
  );
}

export default function Experience({ species, mood, number }: ModelProps) {
  return (
    <>
      <color attach="background" args={["#d4e8f7"]} />

      <SkyDome />

      <Physics gravity={[0, -30, 0]} timeStep="vary">
        <Lights />
        <Terrain />
        <Gates />
        <Skier species={species} mood={mood} number={number} />
      </Physics>
    </>
  );
}
