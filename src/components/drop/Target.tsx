import React, { useRef } from "react";
import * as THREE from "three";
import { RigidBody } from "@react-three/rapier";
import { Text3D, useGLTF, useTexture } from "@react-three/drei";
import { useControls } from "leva";

const Target = () => {
  const targetRef = useRef<THREE.Mesh | null>(null);

  const matcap4 = useTexture("/textures/68049F_C90DE6_A404CF_B304DC-256px.png");

  return (
    <>
      <group rotation={[0, 0, 0]} position={[0, 0, 0]}>
        <RigidBody type="fixed" restitution={0} friction={0}>
          <mesh ref={targetRef} position={[0, -1, 0]} receiveShadow>
            <cylinderGeometry args={[100, 100, 1]} />
            {/* <meshBasicMaterial color="white" /> */}
            <meshMatcapMaterial map={matcap4} />
          </mesh>
        </RigidBody>
      </group>
    </>
  );
};

export default Target;
