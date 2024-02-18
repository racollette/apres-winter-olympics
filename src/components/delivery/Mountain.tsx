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

const Mountain = () => {
  const slopeRef = useRef<THREE.Mesh | null>(null);

  const phase = useGame((state) => state.phase);

  // useFrame((state, delta) => {
  //   // You can add animation logic here if needed
  // });

  return (
    <>
      <group rotation={[0, 0, 0]} position={[0, 0, 0]}>
        {/* Platform */}
        <RigidBody type="fixed" restitution={0.2} friction={1}>
          <mesh ref={slopeRef} position={[0, -1, -240]} receiveShadow>
            <boxGeometry args={[500, 1, 500]} />
            <meshBasicMaterial color="white" />
          </mesh>
        </RigidBody>
      </group>

      <group position={[0, 0, -40]}>
        <RigidBody type="fixed" colliders="cuboid">
          <mesh>
            <boxGeometry args={[10, 2, 10]} />
            <meshBasicMaterial color="blue" />
          </mesh>
          <mesh position={[0, 2, -6]}>
            <boxGeometry args={[4, 2, 4]} />
            <meshBasicMaterial color="pink" />
          </mesh>
          <mesh position={[0, 4, -10]}>
            <boxGeometry args={[4, 2, 4]} />
            <meshBasicMaterial color="cyan" />
          </mesh>
          <mesh position={[0, 6, -14]}>
            <boxGeometry args={[4, 2, 4]} />
            <meshBasicMaterial color="green" />
          </mesh>
          <mesh position={[0, 8, -18]}>
            <boxGeometry args={[4, 2, 4]} />
            <meshBasicMaterial color="blue" />
          </mesh>
          <mesh position={[0, 10, -22]}>
            <boxGeometry args={[4, 2, 4]} />
            <meshBasicMaterial color="red" />
          </mesh>
          <mesh position={[0, 12, -26]}>
            <boxGeometry args={[4, 2, 4]} />
            <meshBasicMaterial color="blue" />
          </mesh>
          <mesh position={[0, 14, -30]}>
            <boxGeometry args={[4, 2, 4]} />
            <meshBasicMaterial color="red" />
          </mesh>
          <mesh position={[0, 16, -34]}>
            <boxGeometry args={[4, 2, 4]} />
            <meshBasicMaterial color="blue" />
          </mesh>
        </RigidBody>
      </group>
    </>
  );
};

export default Mountain;
