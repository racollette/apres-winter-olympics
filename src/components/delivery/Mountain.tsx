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

  const cliff = useGLTF("/models/cliff.glb");
  const ledge = useGLTF("/models/ledge.glb");

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

      <group scale={[15, 10, 10]}>
        <RigidBody type="fixed">
          <primitive object={cliff.scene} position={[0, 6, -10]} />
          <CuboidCollider args={[10, 10, 10]} />
        </RigidBody>
      </group>

      <group position={[0, 0, -40]}>
        <RigidBody type="fixed" position={[0, 2, -50]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[8, 1.5, 8]} />
            <meshBasicMaterial color="blue" />
          </mesh>
        </RigidBody>
      </group>
    </>
  );
};

export default Mountain;
