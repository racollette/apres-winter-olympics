import React, { useRef } from "react";
import * as THREE from "three";
import { RigidBody } from "@react-three/rapier";
import { Text3D, useGLTF, useTexture } from "@react-three/drei";
import { useControls } from "leva";

const SkiJump = () => {
  const slopeRef = useRef<THREE.Mesh | null>(null);

  const matcap3 = useTexture("/textures/6C5DC3_352D66_5C4CAB_544CA5-256px.png");
  const matcap4 = useTexture("/textures/68049F_C90DE6_A404CF_B304DC-256px.png");

  const ramp = useGLTF("/models/ramp.glb");

  // add leva tweaks for ramp position scale and rotation
  const rampControls = useControls("ramp", {
    position: {
      value: { x: -20, y: -0.3, z: -75 },
      step: 0.01,
    },
    rotation: {
      value: { x: 1.6, y: 0, z: -1.57 },
      step: 0.01,
    },
  });

  return (
    <>
      <group rotation={[-0.45, 0, 0]} position={[0, 0, -50]}>
        {/* Ski Jump Ramp */}
        <RigidBody type="fixed" restitution={0} friction={0}>
          <mesh ref={slopeRef} position={[0, -1, 0]} receiveShadow>
            <boxGeometry args={[50, 2, 200]} />
            {/* <meshBasicMaterial color="white" /> */}
            <meshMatcapMaterial map={matcap4} />
          </mesh>
        </RigidBody>

        <RigidBody
          type="fixed"
          colliders="trimesh"
          restitution={0.2}
          friction={0}
          position={[
            rampControls.position.x,
            rampControls.position.y,
            rampControls.position.z,
          ]}
          rotation={[
            rampControls.rotation.x,
            rampControls.rotation.y,
            rampControls.rotation.z,
          ]}
          scale={12}
        >
          {/* <mesh> */}
          {/* <boxGeometry args={[0.5, 0.5, 0.5]} /> */}
          <primitive object={ramp.scene} />
          {/* <meshMatcapMaterial map={matcap3} /> */}
          {/* </mesh> */}
        </RigidBody>
      </group>

      {/* Landing Ramp */}
      <group rotation={[-0.45, 0, 0]} position={[0, -200, -300]}>
        <RigidBody type="fixed" restitution={0.2} friction={0}>
          <mesh ref={slopeRef} position={[0, -1, 0]} receiveShadow>
            <boxGeometry args={[50, 2, 200]} />
            {/* <meshBasicMaterial color="white" /> */}
            <meshMatcapMaterial map={matcap4} />
          </mesh>
        </RigidBody>
      </group>
    </>
  );
};

export default SkiJump;
