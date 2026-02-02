import { Environment } from "@react-three/drei";
import { Physics } from "@react-three/rapier";
import Sled from "./Sled";
import Track from "./Track";
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
        files="/textures/Dreamlike_hdri-hdr_VR360_Snow_capped_peaks_2075292812_10080786.hdr"
        background
      />

      <Physics gravity={[0, -9.81, 0]}>
        <Lights />
        <Sled species={species} mood={mood} number={number} />
        <Track />
      </Physics>
    </>
  );
}
