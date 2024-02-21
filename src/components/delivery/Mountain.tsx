import React, { use, useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { CuboidCollider, RigidBody, RigidBodyProps } from "@react-three/rapier";
import {
  Box,
  ContactShadows,
  Html,
  Sparkles,
  Sphere,
  Text,
  Text3D,
  useGLTF,
  useKeyboardControls,
  useTexture,
} from "@react-three/drei";
import useGame from "../../stores/useGame";
import { MeshPhysicalMaterial } from "three";

const ledgePositions = [
  { x: 0, y: 0, z: -50 },
  { x: 12, y: 4, z: -50 },
  { x: 24, y: 8, z: -50 },
  { x: 36, y: 12, z: -50 },
  { x: 48, y: 16, z: -50 },
  { x: 60, y: 20, z: -50.5 },
  { x: 72, y: 24, z: -50.5 },
  { x: 60, y: 28, z: -51 },
  { x: 48, y: 32, z: -51 },
  { x: 36, y: 36, z: -54.5 },
  { x: 24, y: 40, z: -51.5 },
  { x: 12, y: 44, z: -52 },
  { x: 0, y: 48, z: -52 },
  { x: -12, y: 52, z: -55.5 },
  { x: -24, y: 56, z: -56.5 },
  { x: -36, y: 60, z: -57 },
  { x: -48, y: 64, z: -55 },
  { x: -60, y: 68, z: -55.5 },
  { x: -72, y: 72, z: -58 },
  { x: -60, y: 76, z: -58 },
  { x: -48, y: 80, z: -57 },
  { x: -36, y: 84, z: -59 },
  { x: -24, y: 88, z: -59 },
  { x: -12, y: 92, z: -59 },
  { x: 0, y: 96, z: -60 },
  { x: 12, y: 100, z: -60 },
  { x: 24, y: 104, z: -59 },
  { x: 36, y: 108, z: -62 },
  { x: 48, y: 112, z: -60 },
  { x: 60, y: 116, z: -62 },
  { x: 72, y: 120, z: -63 },
  { x: 60, y: 124, z: -63 },
  { x: 48, y: 128, z: -64 },
  { x: 36, y: 132, z: -64 },
  { x: 24, y: 136, z: -64 },
  { x: 12, y: 140, z: -64 },
  { x: 0, y: 144, z: -64 },
  { x: -12, y: 148, z: -65 },
];

const Mountain = () => {
  const slopeRef = useRef<THREE.Mesh | null>(null);

  const phase = useGame((state) => state.phase);

  // useFrame((state, delta) => {
  //   // You can add animation logic here if needed
  // });

  const colorTexture = useTexture("/textures/snow_02_diff_4k.jpg");
  colorTexture.colorSpace = THREE.SRGBColorSpace;
  colorTexture.wrapS = THREE.RepeatWrapping;
  colorTexture.wrapT = THREE.RepeatWrapping;
  colorTexture.repeat.x = 4;
  colorTexture.repeat.y = 4;
  // const displacementTexture = useTexture("/textures/snow_02_disp_4k.jpg");
  const normalTexture = useTexture("/textures/snow_02_nor_gl_4k.jpg");
  const aoTexture = useTexture("/textures/Snow_002_OCC.jpg");
  const roughnessTexture = useTexture("/textures/Snow_002_ROUGH.jpg");

  const cliff = useGLTF("/models/cliff.glb");
  const ledge = useGLTF("/models/ledge.glb");
  const snowfield = useGLTF("/models/snowfield.glb");

  return (
    <>
      <Floor />

      <group scale={[15, 10, 10]}>
        <primitive object={cliff.scene} position={[0, 6, -11]} />
        <RigidBody type="fixed">
          <CuboidCollider
            rotation={[-0.12, 0, 0]}
            position={[0, 7, -11.75]}
            args={[6.5, 7.5, 0.9]}
          />
        </RigidBody>
      </group>

      <group rotation={[0, 0, 0]} position={[0, 0, 0]}>
        {/* Platform */}
        <RigidBody type="fixed" restitution={0.2} friction={1}>
          <primitive
            scale={[44, 4, 24]}
            rotation={[Math.PI, 0, 0]}
            object={snowfield.scene}
            position={[-22, 150, -226]}
          />
        </RigidBody>
      </group>

      <group position={[0, 0, -50]}>
        {ledgePositions.map((position, index) => (
          <RigidBody
            key={index}
            type="fixed"
            position={[position.x, position.y, position.z]}
          >
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[8, 1, 8]} />
              <meshStandardMaterial
                map={colorTexture}
                // displacementMap={displacementTexture}
                aoMap={aoTexture}
                roughnessMap={roughnessTexture}
                normalMap={normalTexture}
              />
            </mesh>
          </RigidBody>
        ))}
      </group>

      <Lodge />
    </>
  );
};

export default Mountain;

const Floor = () => {
  const snowfield1 = useGLTF("/models/snowfield1.glb");

  return (
    <group rotation={[0, 0, 0]} position={[0, 0, 0]}>
      {/* Platform */}
      <RigidBody type="fixed" restitution={0.2} friction={1}>
        {/* <mesh ref={slopeRef} position={[0, -1, -240]} receiveShadow>
        <boxGeometry args={[500, 1, 500]} />
        <meshStandardMaterial
          map={colorTexture}
          // displacementMap={displacementTexture}
          aoMap={aoTexture}
          roughnessMap={roughnessTexture}
          normalMap={normalTexture}
        />
      </mesh> */}
        <primitive
          scale={[48, 4, 20]}
          rotation={[Math.PI, 0, 0]}
          object={snowfield1.scene}
          position={[-25, -3.5, -50]}
        />
      </RigidBody>
    </group>
  );
};

const Lodge = () => {
  const lodge = useGLTF("/models/lodge.glb");

  return (
    <group scale={0.2} rotation={[0, 0, 0]} position={[-45, 100, -280]}>
      <primitive
        scale={[10, 10, 10]}
        object={lodge.scene}
        position={[0, 0, 0]}
      />
    </group>
  );
};
