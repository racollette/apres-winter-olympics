import React, { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import Model from "../Model";
import {
  RigidBody,
  useRapier,
  RapierRigidBody,
  RigidBodyOptions,
  CuboidCollider,
} from "@react-three/rapier";
import { RigidBodyTypeString } from "@react-three/rapier";
import { useKeyboardControls, useTexture } from "@react-three/drei";
import useGame from "../../stores/useGame";
import { type ModelProps } from "./Experience";

const Dactyl = ({
  species = "rex",
  mood = "confident",
  number = "3495",
}: ModelProps) => {
  const dactylRef = useRef<THREE.Mesh | null>(null);
  const packageRef = useRef<RapierRigidBody | null>(null);
  // const packageRigidBodyRef = useRef<RapierRigidBody | null>(null);
  const [subscribeKeys, getKeys] = useKeyboardControls();
  const [dropped, setDropped] = useState(false);
  const { rapier, world } = useRapier();
  const [smoothedCameraPosition] = useState(
    () => new THREE.Vector3(2000, 2000, 2000)
  );
  const [smoothedCameraTarget] = useState(() => new THREE.Vector3(0, 10, 0));

  const startingPosition = { x: 0, y: 50, z: 75 };
  const timeRef = useRef(0);

  // useEffect(() => {
  //   if (packageRef.current) {
  //     packageRef.current.sleep();
  //   }
  // }, []);

  useFrame((state, delta) => {
    timeRef.current += delta;
    /**
     * Controls
     */
    const { forward, backward, leftward, rightward } = getKeys();

    const impulse = { x: 0, y: 0, z: 0 };
    const torque = { x: 0, y: 0, z: 0 };

    const impulseStrength = 200 * delta;
    const torqueStrength = 25 * delta;

    const x = Math.sin(1 * timeRef.current) * 5 + startingPosition.x;
    const y = Math.cos(1 * timeRef.current) * 2 + startingPosition.y;
    const z = -2 * timeRef.current + startingPosition.z;
    // const z = Math.sin(1 * timeRef.current) * 5 + startingPosition.z;

    if (dactylRef.current) {
      dactylRef.current.position.x = x;
      dactylRef.current.position.y = y;
      dactylRef.current.position.z = z;

      // packageRef.current.applyImpulse({ x: 0, y: 0, z: 1 }, true);
      // packageRef.current?.addForce({ x: 0, y: 9.81, z: -8 }, true);

      if (rightward) {
        torque.z -= torqueStrength;
      }

      if (leftward) {
        torque.z += torqueStrength;
      }

      if (!dropped) {
        packageRef.current?.setTranslation({ x, y, z }, false);
        packageRef.current?.applyTorqueImpulse(torque, true);
      }

      // packageRef.current?.rotation

      /**
       * Camera
       */
      const bodyPosition = dactylRef.current.position;

      // Set the initial camera position relative to the dactyl
      const initialCameraPosition = new THREE.Vector3(
        // startingPosition.x + 3,
        // startingPosition.y + 7,
        // startingPosition.z + 3
        3,
        7,
        3
      );

      // Rotate the initial position based on the dactyl's rotation
      const rotatedCameraPosition = initialCameraPosition.clone();

      // Update the camera position relative to the dactyl's position
      const cameraPosition = new THREE.Vector3(
        bodyPosition.x + rotatedCameraPosition.x,
        bodyPosition.y + rotatedCameraPosition.y,
        bodyPosition.z + rotatedCameraPosition.z
      );

      // Set the initial camera target relative to the dactyl
      const initialCameraTarget = new THREE.Vector3(
        // startingPosition.x,
        // startingPosition.y,
        // startingPosition.z
        0,
        0,
        0
      );

      // Rotate the initial target based on the dactyl's rotation
      const rotatedCameraTarget = initialCameraTarget.clone();

      // Update the camera target relative to the dactyl's position
      const cameraTarget = new THREE.Vector3(
        bodyPosition.x + rotatedCameraTarget.x,
        bodyPosition.y + rotatedCameraTarget.y,
        bodyPosition.z + rotatedCameraTarget.z
      );

      smoothedCameraPosition.lerp(cameraPosition, 5 * delta);
      smoothedCameraTarget.lerp(cameraTarget, 5 * delta);

      state.camera.position.copy(smoothedCameraPosition);
      state.camera.lookAt(smoothedCameraTarget);
    }
  });
  // const jump = () => {
  //   if (body.current) {
  //     const origin = body.current.translation();
  //     origin.y -= 0.25;
  //     const direction = { x: 0, y: -1, z: 0 };
  //     const ray = new rapier.Ray(origin, direction);
  //     const hit = world.castRay(ray, 10, true);

  //     console.log(ray);
  //     console.log(hit);
  //     if (hit && hit.toi <= 0.6) {
  //       body.current.applyImpulse({ x: 0, y: 70, z: 0 }, true);
  //     }
  //   }
  // };

  // const reset = () => {
  //   body.current?.setTranslation({ x: 0, y: 50, z: 40 }, false);
  //   body.current?.setLinvel({ x: 0, y: 0, z: 0 }, false);
  //   body.current?.setAngvel({ x: 0, y: 0, z: 0 }, false);
  //   body.current?.setRotation({ x: 0, y: 0, z: 0, w: 1 }, false);
  // };

  useEffect(() => {
    // const unsubscribeReset = useGame.subscribe(
    //   (state) => state.phase,
    //   (value) => {
    //     if (value === "ready") reset();
    //   }
    // );

    const unsubscribeJump = subscribeKeys(
      (state) => state.jump,
      (value) => {
        if (value) {
          setDropped(true);
          packageRef.current?.wakeUp();
        }
      }
    );

    // const unsubscribeAny = subscribeKeys(() => {
    //   // start();
    // });

    return () => {
      // unsubscribeReset();
      unsubscribeJump();
      // unsubscribeAny();
    };
  }, []);

  return (
    <>
      <group
      // position={[startingPosition.x, startingPosition.y, startingPosition.z]}
      >
        <mesh position={[0, 0, 0]} ref={dactylRef}>
          <Model modelName={`dactyl-flap-excited`} nftId={10176} />
        </mesh>
        <RigidBody
          ref={packageRef}
          restitution={0}
          friction={0.25}
          linearDamping={0.35}
          angularDamping={0.5}
          colliders="cuboid"
        >
          <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
            <Model modelName={`raptor-idle-scared`} nft={3411} />
            {/* <boxGeometry args={[11, 11, 11]} /> */}
            {/* <meshBasicMaterial color="red" /> */}
          </mesh>
        </RigidBody>
      </group>
    </>
  );
};

export default Dactyl;
