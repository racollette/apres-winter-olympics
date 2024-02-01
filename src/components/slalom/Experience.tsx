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
        files="/textures/Dreamlike_hdri-hdr_VR360_Snow_capped_peaks_147910178_10003270.hdr"
        background
      />
      <OrbitControls />

      <Physics debug>
        <Lights />
        <Skier species={species} mood={mood} number={number} />
        <SkiSlope />
      </Physics>
    </>
  );
}
