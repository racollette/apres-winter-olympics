import { useGLTF, useTexture } from "@react-three/drei";
import { RigidBody, CuboidCollider } from "@react-three/rapier";
import * as THREE from "three";

export default function Ramp() {
  const ramp = useGLTF("/models/ramp.glb");
  const snowTexture = useTexture("/textures/Snow_002_COLOR.jpg");
  snowTexture.wrapS = snowTexture.wrapT = THREE.RepeatWrapping;
  snowTexture.repeat.set(10, 100);

  return (
    <>
      {/* Main ski jump ramp */}
      <RigidBody type="fixed" colliders="trimesh">
        <primitive
          object={ramp.scene.clone()}
          scale={[3, 3, 3]}
          position={[0, 8, -5]}
          rotation={[0, Math.PI, 0]}
        />
      </RigidBody>

      {/* Landing slope - long angled surface */}
      <RigidBody type="fixed">
        <mesh
          position={[0, -15, -80]}
          rotation={[-Math.PI / 6, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[30, 200]} />
          <meshStandardMaterial map={snowTexture} side={THREE.DoubleSide} />
        </mesh>
        <CuboidCollider
          position={[0, -15, -80]}
          rotation={[-Math.PI / 6, 0, 0]}
          args={[15, 0.1, 100]}
        />
      </RigidBody>

      {/* Flat landing area at bottom */}
      <RigidBody type="fixed">
        <mesh position={[0, -65, -170]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[50, 50]} />
          <meshStandardMaterial map={snowTexture} side={THREE.DoubleSide} />
        </mesh>
        <CuboidCollider position={[0, -65, -170]} args={[25, 0.1, 25]} />
      </RigidBody>

      {/* Distance markers every 20 meters */}
      {[20, 40, 60, 80, 100, 120, 140].map((dist) => {
        const z = -20 - dist * 0.9;
        const y = -10 - dist * 0.35;
        return (
          <group key={dist} position={[0, y, z]}>
            <mesh position={[-12, 1, 0]}>
              <boxGeometry args={[0.5, 2, 0.5]} />
              <meshStandardMaterial color="#ff6600" />
            </mesh>
            <mesh position={[12, 1, 0]}>
              <boxGeometry args={[0.5, 2, 0.5]} />
              <meshStandardMaterial color="#ff6600" />
            </mesh>
          </group>
        );
      })}
    </>
  );
}
