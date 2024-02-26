import { Environment, OrbitControls } from "@react-three/drei";
import { Physics } from "@react-three/rapier";
import Lights from "./Lights";
import useGame from "../../stores/useGame";
import { useEffect } from "react";
import Mountain from "./Mountain";
import Player from "./Player";

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

      {/* <Physics> */}
      <Physics debug>
        <Lights />
        <Player species={species} mood={mood} number={number} />
        <Mountain />
      </Physics>
    </>
  );
}
