import {
  Environment,
  FirstPersonControls,
  OrbitControls,
} from "@react-three/drei";
import { Physics } from "@react-three/rapier";
import Target from "./Target";
import Dactyl from "./Dactyl";
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
        // ground
        files="/textures/Dreamlike_hdri-hdr_VR360_Snow_capped_peaks_2075292812_10080786.hdr"
        background
      />
      <OrbitControls />

      <Physics debug>
        <Lights />
        <Dactyl species={species} mood={mood} number={number} />
        <Target />
      </Physics>
    </>
  );
}
