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
import { link } from "fs";

const Dactyl = ({
  species = "rex",
  mood = "confident",
  number = "3495",
}: ModelProps) => {
  const dactylRef = useRef<THREE.Group>(null);
  const payloadRef = useRef<THREE.Group>(null);
  const payloadMeshRef = useRef<THREE.Mesh>(null);
  const payloadRigidBodyRef = useRef<RapierRigidBody>(null);
  const linkedRef = useRef<THREE.Group>(null);
  const [subscribeKeys, getKeys] = useKeyboardControls();
  const [dropped, setDropped] = useState(false);

  const [smoothedCameraPosition] = useState(
    () => new THREE.Vector3(2000, 2000, 2000)
  );
  const [smoothedCameraTarget] = useState(() => new THREE.Vector3(0, 10, 0));

  const startingPosition = { x: 0, y: 100, z: 75 };
  const startingRotation = { x: 0, y: 0, z: 0 }; // Store starting rotation

  // Calculate rotation difference

  const timeRef = useRef(0);
  let dropImpulseApplied: boolean = false;

  // const joint = useSphericalJoint(payloadRef, dactylRef, [
  //   // Position of the joint in bodyA's local space
  //   [0, 0, 0],
  //   // Position of the joint in bodyB's local space
  //   [0, -2, 0],
  // ]);

  useEffect(() => {
    payloadRigidBodyRef.current?.setGravityScale(0, true);
  }, []);

  useFrame((state, delta) => {
    timeRef.current += delta;
    /**
     * Controls
     */
    const { forward, backward, leftward, rightward } = getKeys();

    const impulse = { x: 0, y: 0, z: 0 };
    const torque = { x: 0, y: 0, z: 0 };

    const impulseStrength = 0.01 * delta;
    const torqueStrength = 250 * delta;

    const x = Math.sin(1 * timeRef.current) * 5 + startingPosition.x;
    const y = Math.cos(1 * timeRef.current) * 2 + startingPosition.y;
    const z = -2 * timeRef.current + startingPosition.z;

    if (dactylRef.current) {
      const rotationDiff = {
        x: startingRotation.x - dactylRef.current?.rotation.x,
        y: startingRotation.y - dactylRef.current?.rotation.y,
        z: startingRotation.z - dactylRef.current?.rotation.z,
      };

      dactylRef.current.position.set(x, y, z);

      if (!dropped) {
        // payloadRef.current.position.set(x, y, z);
        payloadRigidBodyRef.current?.setTranslation({ x, y: y - 2, z }, false);

        if (rightward) {
          console.log("rightward");
          const rotationZ = dactylRef.current.rotation.z;

          if (rotationZ > -0.75) {
            dactylRef.current?.rotateZ(-0.02);
          }
        }

        if (leftward) {
          console.log("leftward");
          const rotationZ = dactylRef.current.rotation.z;
          if (rotationZ < 0.75) {
            dactylRef.current?.rotateZ(0.02);
          }
        }

        if (forward) {
          console.log("forward");
          const rotationX = dactylRef.current.rotation.x;
          if (rotationX > -0.5) {
            dactylRef.current?.rotateX(-0.02);
          }
        }

        if (backward) {
          console.log("backward");
          const rotationX = dactylRef.current.rotation.x;
          if (rotationX < 0.5) {
            dactylRef.current?.rotateX(0.02);
          }
        }

        dactylRef.current.rotation.x += rotationDiff.x * 0.75 * delta;
        dactylRef.current.rotation.y += rotationDiff.y * 0.75 * delta;
        dactylRef.current.rotation.z += rotationDiff.z * 0.75 * delta;

        const dactylRotation =
          dactylRef.current?.rotation.clone() ?? new THREE.Euler();
        // Convert Euler angles to quaternion
        const quaternion = new THREE.Quaternion().setFromEuler(dactylRotation);

        // Update the rotation of the payload rigid body with quaternion
        if (payloadRigidBodyRef.current && quaternion) {
          payloadRigidBodyRef.current.setRotation(quaternion, true);
        }
      }

      if (dropped) {
        // apply an impulse to the payload in the direction of the rotation of the dactyl
        if (!dropImpulseApplied) {
          const dactylRotation = dactylRef.current?.rotation.clone();
          const dactylQuaternion = new THREE.Quaternion().setFromEuler(
            dactylRotation
          );
          const direction = new THREE.Vector3(0, 0, 1);
          direction.applyQuaternion(dactylQuaternion);

          impulse.x = -direction.x * impulseStrength;
          impulse.y = -direction.y * impulseStrength;
          impulse.z = -direction.z * impulseStrength;

          payloadRigidBodyRef.current?.applyImpulse(impulse, true);
          dropImpulseApplied = true;
        }
      }

      /**
       * Camera
       */

      const targetPosition = dropped
        ? payloadRef.current?.position
        : dactylRef.current.position;

      // console.log(targetPosition);

      if (targetPosition) {
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
          targetPosition.x + rotatedCameraPosition.x,
          targetPosition.y + rotatedCameraPosition.y,
          targetPosition.z + rotatedCameraPosition.z
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
          targetPosition.x + rotatedCameraTarget.x,
          targetPosition.y + rotatedCameraTarget.y,
          targetPosition.z + rotatedCameraTarget.z
        );

        smoothedCameraPosition.lerp(cameraPosition, 5 * delta);
        smoothedCameraTarget.lerp(cameraTarget, 5 * delta);

        // state.camera.position.copy(smoothedCameraPosition);
        // state.camera.lookAt(smoothedCameraTarget);
      }
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
          // payloadRigidBodyRef.current?.setTranslation(
          //   { x: 0, y: 50, z: 0 },
          //   false
          // );
          payloadRigidBodyRef.current?.setGravityScale(1, true);
          // payloadRigidBodyRef.current?.setBodyType("dynamic", true);
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
      {/* <group ref={linkedRef}> */}
      <group ref={dactylRef}>
        <Model modelName={`dactyl-flap-excited`} nftId={10176} />
      </group>

      {/* <group
        ref={payloadRef}
        > */}
      <RigidBody
        type="dynamic"
        colliders="ball"
        restitution={0.5}
        friction={0.5}
        ref={payloadRigidBodyRef}
        canSleep={false}
      >
        {/* <mesh> */}
        {/* <boxGeometry args={[10, 10, 10]} /> */}
        {/* <meshBasicMaterial color="red" /> */}
        <Model modelName={`raptor-idle-scared`} nft={3411} />
        {/* <CuboidCollider position={[0, 0.5, 0]} args={[0.5, 0.5, 0.5]} /> */}
        {/* </mesh> */}
      </RigidBody>
      {/* </group> */}
      {/* </group> */}
    </>
  );
};

export default Dactyl;
