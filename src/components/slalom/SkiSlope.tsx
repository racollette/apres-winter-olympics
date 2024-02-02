import React, { use, useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { CuboidCollider, RigidBody, RigidBodyProps } from "@react-three/rapier";
import {
  Box,
  ContactShadows,
  Html,
  Sparkles,
  Text,
  Text3D,
  useGLTF,
  useKeyboardControls,
  useTexture,
} from "@react-three/drei";
import useGame from "../../stores/useGame";
import { MeshPhysicalMaterial } from "three";

const GATE_POSITIONS = [
  [0, 0, -20],
  [10, 0, -40],
  [20, 0, -60],
  [25, 0, -80],
  [20, 0, -100],
  [10, 0, -120],
  [-10, 0, -140],
  [-30, 0, -160],
  [-50, 0, -180],
  [-25, 0, -205],
  [-10, 0, -220],
  [0, 0, -240],
  [20, 0, -260],
  [35, 0, -280],
  [45, 0, -300],
  [50, 0, -320],
  [35, 0, -340],
  [20, 0, -360],
  [10, 0, -380],
  [0, 0, -400],
  [0, 0, -420],
];

console.log(GATE_POSITIONS);

const SkiSlope = () => {
  const slopeRef = useRef<THREE.Mesh | null>(null);

  const phase = useGame((state) => state.phase);
  console.log(phase);
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

  const matcap1 = useTexture("/textures/7877EE_D87FC5_75D9C7_1C78C0-256px.png");
  const matcap2 = useTexture("/textures/C7C7D7_4C4E5A_818393_6C6C74-256px.png");

  const matcap3 = useTexture("/textures/6C5DC3_352D66_5C4CAB_544CA5-256px.png");
  const matcap4 = useTexture("/textures/68049F_C90DE6_A404CF_B304DC-256px.png");

  return (
    <>
      <group rotation={[-0.35, 0, 0]} position={[0, 0, 0]}>
        {/* Platform */}
        <RigidBody type="fixed" restitution={0.2} friction={0}>
          <mesh ref={slopeRef} position={[0, -1, -240]} receiveShadow>
            <boxGeometry args={[500, 1, 500]} />
            {/* <meshBasicMaterial color="white" /> */}
            <meshStandardMaterial
              map={colorTexture}
              // displacementMap={displacementTexture}
              aoMap={aoTexture}
              roughnessMap={roughnessTexture}
              normalMap={normalTexture}
            />
          </mesh>
        </RigidBody>

        {/* Starting Gate */}
        {/* {phase === "ready" ? (
          <>
            <RigidBody type="fixed" restitution={0} position={[0, 0, -4]}>
              <mesh castShadow>
                <boxGeometry args={[10, 2, 1]} />
                <meshBasicMaterial color="green" />
              </mesh>
              <Text
                color="black"
                anchorX="center"
                anchorY="middle"
                position={[0, 0, 0.51]}
              >
                TAP TO START
              </Text>
            </RigidBody>
          </>
        ) : null} */}

        <Text3D
          font="/fonts/Titan_One_Regular.json"
          position={[-8, 4, -15]}
          rotation={[0, 0, 0]}
        >
          2024 Winter Olympics
          <meshMatcapMaterial matcap={matcap3} />
        </Text3D>

        <Text3D
          font="/fonts/Titan_One_Regular.json"
          position={[-13, 3, -25]}
          rotation={[0, 0, 0]}
        >
          Sponsored by Apres Mountain Lodge
          <meshMatcapMaterial matcap={matcap4} />
        </Text3D>

        <Gate
          type="fixed"
          version="start"
          restitution={0}
          position={[0, 2, -4]}
        />

        {/* Slalom Gates */}
        {/* <group position={[0, 0, -30]}>
          {new Array(NUMBER_OF_GATES).fill(0).map((_, i) => (
            <SlalomGate
              positionX={(Math.random() - 1) * RANGE}
              positionZ={
                -i * SPACING + (Math.random() - 1) * SPACING_VARIABILITY
              }
              index={i}
            />
          ))}
        </group> */}

        <group position={[0, 0, -30]}>
          {GATE_POSITIONS.map((position, idx) => {
            if (
              typeof position[0] === "number" &&
              typeof position[2] === "number"
            ) {
              return (
                <SlalomGate
                  key={idx}
                  positionX={position[0]}
                  positionZ={position[2]}
                  index={idx}
                />
              );
            }
          })}
        </group>

        {/* Finish */}
        <Gate
          type="fixed"
          version="finish"
          restitution={0}
          position={[0, 2.5, -475]}
          // ... other RigidBodyProps
        />

        <RigidBody type="fixed">
          <mesh position={[0, 0, -490]}>
            <boxGeometry args={[500, 10, 0.5]} />
            <meshMatcapMaterial matcap={matcap1} />
          </mesh>
        </RigidBody>

        {/* <RigidBody type="fixed" restitution={0} position={[0, 0, -475]}>
          <mesh castShadow>
            <boxGeometry args={[10, 2, 1]} />
            <meshBasicMaterial color="purple" />
          </mesh>
          <Text
            color="black"
            anchorX="center"
            anchorY="middle"
            position={[0, 0, 0.51]}
          >
            FINISH
          </Text>
        </RigidBody> */}
      </group>
    </>
  );
};

export default SkiSlope;

type GateProps = RigidBodyProps & {
  version: "start" | "finish";
};
const Gate = (props: GateProps) => {
  const { version, ...rigidBodyProps } = props;
  const [intersecting, setIntersection] = useState(false);
  const material = new MeshPhysicalMaterial();
  const gateTexture = useTexture("/textures/triangles.jpg");
  material.map = gateTexture;

  const end = useGame((state) => state.end);
  const start = useGame((state) => state.start);

  useEffect(() => {
    if (intersecting) {
      if (version === "finish") {
        end();
      }
      if (version === "start") {
        start();
      }
    }
  }, [intersecting, version, end]);

  return (
    <RigidBody {...rigidBodyProps}>
      <Box
        scale={[11, 1, 1]}
        position={[0, 3.5, 0]}
        material={material}
        castShadow
      />
      <Box
        scale={[1, 6, 1]}
        position={[-5, 0, 0]}
        material={material}
        castShadow
      />
      <Box
        scale={[1, 6, 1]}
        position={[5, 0, 0]}
        material={material}
        castShadow
      />

      {/* <Box
        scale={[1, 1, 3]}
        position={[-5, -3, 0]}
        material={material}
        castShadow
      />
      <Box
        scale={[1, 1, 3]}
        position={[5, -3, 0]}
        material={material}
        castShadow
      /> */}

      {/* {intersecting && (
        <Text color="red" position={[0, 5, 0]} fontSize={2}>
          {text}
        </Text>
      )} */}

      {/**
       * We create a collider and set it to be a 'sensor'
       * This enabled intersection events, and enables
       * colliders to pass through it.
       */}
      <CuboidCollider
        position={[0, -4, 0]}
        args={[5, 7, 0.25]}
        sensor
        onIntersectionEnter={() => setIntersection(true)}
        onIntersectionExit={() => setIntersection(false)}
      />
    </RigidBody>
  );
};

type SlalomGateProps = {
  positionX: number;
  positionZ: number;
  index: number;
};

const SlalomGate = ({ positionX, positionZ }: SlalomGateProps) => {
  const [intersected, setIntersected] = useState(false);
  const gateActivated = useGame((state) => state.gateActivated);

  const matcap3 = useTexture("/textures/6C5DC3_352D66_5C4CAB_544CA5-256px.png");
  const matcap4 = useTexture("/textures/68049F_C90DE6_A404CF_B304DC-256px.png");
  const texture = intersected ? matcap3 : matcap4;

  useEffect(() => {
    if (intersected) {
      gateActivated();
    }
  }, [intersected]);

  useEffect(() => {
    const unsubscribeReset = useGame.subscribe(
      (state) => state.phase,
      (value) => {
        if (value === "ready") setIntersected(false);
      }
    );

    return () => {
      unsubscribeReset();
    };
  }, []);

  return (
    <RigidBody
      type="fixed"
      restitution={0.2}
      friction={0}
      position={[positionX, 0, positionZ]}
    >
      <mesh position={[-4, 0.5, 0]} castShadow>
        <boxGeometry args={[0.1, 5, 0.1]} />
        <meshMatcapMaterial matcap={texture} />
      </mesh>
      <mesh position={[4, 0.5, 0]}>
        <boxGeometry args={[0.1, 5, 0.1]} />
        <meshMatcapMaterial matcap={texture} />
      </mesh>
      <CuboidCollider
        position={[0, 0, 0]}
        args={[3.9, 3, 0.05]}
        sensor
        onIntersectionEnter={() => setIntersected(true)}
        // onIntersectionExit={() => setIntersected(false)}
      />
    </RigidBody>
  );
};
