import {
  Environment,
  OrbitControls,
  PerspectiveCamera,
  Text,
  useGLTF,
  useTexture,
} from "@react-three/drei";
import Lights from "./Lights";
import Medalist from "./Medalist";
import { useEffect, useRef } from "react";
import * as THREE from "three";

export type PodiumProps = {
  gold: Medalist;
  silver: Medalist;
  bronze: Medalist;
};

export default function Experience({ gold, silver, bronze }: PodiumProps) {
  const podium = useGLTF("/models/podium.glb");

  // Ref for accessing the camera
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  // Function to set camera position and target
  const setCameraPositionAndTarget = () => {
    if (cameraRef.current) {
      // Set camera position
      // cameraRef.current.position.set(0, 5, 30); // Example position

      // Set camera target (lookAt)
      cameraRef.current.lookAt(0, 0, 0); // Example target
    }
  };

  useEffect(() => {
    setCameraPositionAndTarget();
  }, []); // Call only once after mount

  const triangles = useTexture("/textures/apres_triangles_transformed.png");

  triangles.repeat.x = 3;
  triangles.repeat.y = 0.5;
  triangles.wrapS = THREE.RepeatWrapping;
  triangles.wrapT = THREE.RepeatWrapping;
  triangles.colorSpace = THREE.SRGBColorSpace;

  return (
    <>
      <PerspectiveCamera makeDefault ref={cameraRef} position={[0, 1, 7]} />
      <Environment
        // preset="sunset"
        files="/textures/Dreamlike_hdri-hdr_VR360_Snow_capped_peaks_2075292812_10080786.hdr"
        background
      />
      <OrbitControls />

      <Lights />
      <group position={[0, 0, 0]} rotation={[0, -Math.PI, 0]}>
        <Medalist player={gold} medal="gold" />
      </group>
      <group position={[2.25, -0.7, 0]} rotation={[0, -Math.PI, 0]}>
        <Medalist player={silver} medal="silver" />
      </group>
      <group position={[-2.25, -1.25, 0]} rotation={[0, -Math.PI, 0]}>
        <Medalist player={bronze} medal="bronze" />
      </group>

      <group position={[-1, -2.9, -0.5]} rotation={[0, -Math.PI / 2, 0]}>
        <primitive object={podium.scene} />
        {/* <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[20, 20]} />
          <meshPhysicalMaterial map={triangles} />
        </mesh> */}
      </group>
    </>
  );
}
