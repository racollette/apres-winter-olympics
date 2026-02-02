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
      <sphereGeometry args={[1000, 32, 16]} />
      <meshBasicMaterial side={2}>
        <GradientTexture
          stops={[0, 0.3, 0.6, 1]}
          colors={["#1a3a5c", "#5b9bd5", "#87CEEB", "#d4e8f7"]}
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
