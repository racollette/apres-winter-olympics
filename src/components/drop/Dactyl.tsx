import React, { useRef, useEffect, useState } from "react";
import { useFrame, GroupProps } from "@react-three/fiber";
import * as THREE from "three";
import Model from "../Model";
import {
  RigidBody,
  useRapier,
  RapierRigidBody,
  RigidBodyOptions,
  CuboidCollider,
  useSphericalJoint,
  MeshCollider,
} from "@react-three/rapier";
import { RigidBodyTypeString } from "@react-three/rapier";
import {
  Box,
  Sphere,
  useKeyboardControls,
  useTexture,
} from "@react-three/drei";
import useGame from "../../stores/useGame";
import { type ModelProps } from "./Experience";

const Dactyl = ({
  species = "rex",
  mood = "confident",
  number = "3495",
}: ModelProps) => {
  const dactylRef = useRef<RapierRigidBody>(null);
  const packageRef = useRef<RapierRigidBody>(null);
  const [subscribeKeys, getKeys] = useKeyboardControls();
  const [dropped, setDropped] = useState(false);

  const [smoothedCameraPosition] = useState(
    () => new THREE.Vector3(2000, 2000, 2000)
  );
  const [smoothedCameraTarget] = useState(() => new THREE.Vector3(0, 10, 0));

  const startingPosition = { x: 0, y: 50, z: 75 };
  const timeRef = useRef(0);

  // const joint = useSphericalJoint(packageRef, dactylRef, [
  //   // Position of the joint in bodyA's local space
  //   [0, 0, 0],
  //   // Position of the joint in bodyB's local space
  //   [0, -2, 0],
  // ]);

  // useEffect(() => {
  //   dactylRef.current?.sleep();
  // }, []);

  useFrame((state, delta) => {
    timeRef.current += delta;
    /**
     * Controls
     */
    const { forward, backward, leftward, rightward } = getKeys();

    const impulse = { x: 0, y: 0, z: 0 };
    const torque = { x: 0, y: 0, z: 0 };

    const impulseStrength = 0.02 * delta;
    const torqueStrength = 250 * delta;

    const x = Math.sin(1 * timeRef.current) * 5 + startingPosition.x;
    const y = Math.cos(1 * timeRef.current) * 2 + startingPosition.y;
    const z = -2 * timeRef.current + startingPosition.z;

    if (dactylRef.current) {
      if (rightward) {
        // dactylRef.current?.setRotation({ x: 0, y: 0, z: -0.5, w: 1 }, false);
        // torque.x -= torqueStrength;
      }

      if (leftward) {
        console.log("leftward");
        torque.y += torqueStrength;
        torque.z += torqueStrength;
        torque.x += torqueStrength;
      }

      if (!dropped) {
        dactylRef.current?.setTranslation({ x, y, z }, false);
      }

      /**
       * Camera
       */

      const bodyPosition = dactylRef.current.translation();

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
      <RigidBody type="fixed" ref={dactylRef}>
        <mesh>
          <Model modelName={`dactyl-flap-excited`} nftId={10176} />
        </mesh>
      </RigidBody>
      <RigidBody ref={packageRef}>
        <mesh>
          <Model modelName={`raptor-idle-scared`} nft={3411} />
        </mesh>
      </RigidBody>
    </>
  );
};

export default Dactyl;
