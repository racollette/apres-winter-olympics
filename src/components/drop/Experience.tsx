import {
  Environment,
  FirstPersonControls,
  OrbitControls,
  Sparkles,
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

      <Physics>
        <Lights />
        {/* <Sparkles count={100000} noise={2} size={5} color="white" scale={5}/> */}
        <Dactyl species={species} mood={mood} number={number} />
        <Target />
      </Physics>
    </>
  );
}
