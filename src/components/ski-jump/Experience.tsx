import { Environment, OrbitControls } from "@react-three/drei";
import { Physics } from "@react-three/rapier";
import Jumper from "./Jumper";
import Ramp from "./Ramp";
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
      <OrbitControls />

      <Physics gravity={[0, -9.81, 0]}>
        <Lights />
        <Jumper species={species} mood={mood} number={number} />
        <Ramp />
      </Physics>
    </>
  );
}
