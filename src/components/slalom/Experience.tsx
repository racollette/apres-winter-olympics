import {
  Environment,
  FirstPersonControls,
  OrbitControls,
} from "@react-three/drei";
import { Physics } from "@react-three/rapier";
import SkiSlope from "./SkiSlope";
import Skier from "./Skier";
import Lights from "./Lights";

export type ModelProps = {
  species: string;
  mood: string;
  number: string;
};

export default function Experience({ species, mood, number }: ModelProps) {
  return (
    <>
      <Environment
        // preset="sunset"
        files="/textures/Dreamlike_hdri-hdr_VR360_Snow_capped_peaks_2075292812_10080786.hdr"
        background
      />
      <OrbitControls />

      <Physics debug={true}>
        <Lights />
        <Skier species={species} mood={mood} number={number} />
        <SkiSlope />
      </Physics>
    </>
  );
}
