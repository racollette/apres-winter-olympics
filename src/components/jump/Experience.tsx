import { Environment, OrbitControls } from "@react-three/drei";
import { Physics } from "@react-three/rapier";
import SkiJumpRamp from "./SkiJumpRamp";
import Skier from "./Skier";
import Lights from "./Lights";

// Debug flag - set to true to enable free camera with OrbitControls
const DEBUG_FREE_CAM = true;

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

      {DEBUG_FREE_CAM && (
        <OrbitControls
          target={[0, 20, -40]}
          maxPolarAngle={Math.PI / 2}
        />
      )}

      <Physics debug={DEBUG_FREE_CAM}>
        <Lights />
        <Skier species={species} mood={mood} number={number} />
        <SkiJumpRamp />
      </Physics>
    </>
  );
}
