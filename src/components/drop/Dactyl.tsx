import React, { useRef, useEffect, useState, useMemo, use } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import Model from "../Model";
import {
  RigidBody,
  RapierRigidBody,
  CuboidCollider,
} from "@react-three/rapier";
import { useGLTF, useKeyboardControls } from "@react-three/drei";
import useGame from "../../stores/useGame";
import { type ModelProps } from "./Experience";
import { calculateDistance } from "~/utils/math";

const Dactyl = ({
  species = "rex",
  mood = "confident",
  number = "3495",
}: ModelProps) => {
  const skis = useGLTF("/models/skis.glb");
  const randomSeed = useMemo(() => Math.random(), []);

  const start = useGame((state) => state.start);
  const end = useGame((state) => state.end);
  const restart = useGame((state) => state.restart);
  const setDistance = useGame((state) => state.setDistance);

  const dactylRef = useRef<THREE.Group>(null);
  const payloadRigidBodyRef = useRef<RapierRigidBody>(null);
  const [subscribeKeys, getKeys] = useKeyboardControls();
  const [dropped, setDropped] = useState(false);
  const [dropImpulseApplied, setDropImpulseApplied] = useState(false);

  const [smoothedCameraPosition] = useState(
    () => new THREE.Vector3(2000, 2000, 2000)
  );
  const [smoothedCameraTarget] = useState(() => new THREE.Vector3(0, 10, 0));

  const startingPosition = { x: 0, y: 150, z: 175 };
  const startingRotation = { x: 0, y: 0, z: 0 }; // Store starting rotation

  // Calculate rotation difference

  const timeRef = useRef(0);
  // let dropImpulseApplied = false;

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

    const impulseStrength = 0.0 * delta;

    const x = Math.sin(timeRef.current) * 50 * randomSeed + startingPosition.x;
    const y = Math.cos(timeRef.current) * 7 * randomSeed + startingPosition.y;
    const z = -14 * timeRef.current + startingPosition.z;

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
          // console.log("rightward");
          const rotationZ = dactylRef.current.rotation.z;

          if (rotationZ > -0.75) {
            dactylRef.current?.rotateZ(-0.02);
          }
        }

        if (leftward) {
          // console.log("leftward");
          const rotationZ = dactylRef.current.rotation.z;
          if (rotationZ < 0.75) {
            dactylRef.current?.rotateZ(0.02);
          }
        }

        if (forward) {
          // console.log("forward");
          const rotationX = dactylRef.current.rotation.x;
          if (rotationX > -0.5) {
            dactylRef.current?.rotateX(-0.02);
          }
        }

        if (backward) {
          // console.log("backward");
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
          // dropImpulseApplied = true;
          setDropImpulseApplied(true);

          // if (rightward) {
          //   const rotationZ = payloadRigidBodyRef.current?.rotation().z
          //   if (rotationZ && rotationZ > -0.75) {
          //     payloadRigidBodyRef.current?.applyTorqueImpulse({ x: 0, y: 0, z: 0.1 }, true)
          //   }
          // }
          // if (leftward) {
          //   const rotationZ = payloadRigidBodyRef.current?.rotation().z
          //   if (rotationZ && rotationZ < 0.75) {
          //     payloadRigidBodyRef.current?.applyTorqueImpulse({ x: 0, y: 0, z: -0.1 }, true)
          //   }
          // }
          // if (forward) {
          //   const rotationX = payloadRigidBodyRef.current?.rotation().x
          //   if (rotationX && rotationX > -0.5) {
          //     payloadRigidBodyRef.current?.applyTorqueImpulse({ x: 2, y: 0, z: 0 }, true)
          //   }
          // }
          // if (backward) {
          //   const rotationX = payloadRigidBodyRef.current?.rotation().x
          //   if (rotationX && rotationX < 0.5) {
          //     payloadRigidBodyRef.current?.applyTorqueImpulse({ x: -2, y: 0, z: 0 }, true)
          //   }
          // }
        }

        // calculate distance of payLoadRigidBodyref from 0, 0
        const yPosition = payloadRigidBodyRef.current?.translation().y ?? 0;

        const xPosition = payloadRigidBodyRef.current?.translation().x ?? 0;
        const zPosition = payloadRigidBodyRef.current?.translation().z ?? 0;

        const distanceFromCenter = calculateDistance(
          xPosition,
          zPosition,
          0,
          0
        );

        const velocity = payloadRigidBodyRef.current?.linvel();

        if (velocity) {
          const speed = Math.sqrt(
            velocity.x * velocity.x +
              velocity.y * velocity.y +
              velocity.z * velocity.z
          );
          if (speed < 0.01) {
            recordResult(distanceFromCenter);
          }
        }

        // if the payload has fallen below the ground, reset the game
        if (yPosition < -10) {
          reset();
        }
      }

      /**
       * Camera
       */

      const targetPosition = dropped
        ? payloadRigidBodyRef.current?.translation()
        : dactylRef.current?.position;

      if (targetPosition) {
        // Set the initial camera position relative to the dactyl
        const initialCameraPosition = new THREE.Vector3(
          dropped ? 15 : 3,
          dropped ? 20 : 8,
          dropped ? 15 : 3
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
        const initialCameraTarget = new THREE.Vector3(0, 0, 0);

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

        state.camera.position.copy(smoothedCameraPosition);
        state.camera.lookAt(smoothedCameraTarget);
      }
    }
  });

  const reset = () => {
    payloadRigidBodyRef.current?.setGravityScale(0, true);
    dactylRef?.current?.position.set(
      startingPosition.x,
      startingPosition.y,
      startingPosition.z
    );
    payloadRigidBodyRef?.current?.setTranslation(
      { x: startingPosition.x, y: startingPosition.y, z: startingPosition.z },
      false
    );

    setDropped(false);
    setDropImpulseApplied(false);
    // dropImpulseApplied = false;
    timeRef.current = 0;
  };

  const recordResult = (distance: number) => {
    setDistance(distance);
    end();
  };

  useEffect(() => {
    const unsubscribeReset = useGame.subscribe(
      (state) => state.phase,
      (value) => {
        if (value === "ready") reset();
      }
    );

    const unsubscribeJump = subscribeKeys(
      (state) => state.jump,
      (value) => {
        if (value) {
          setDropped(true);
          payloadRigidBodyRef.current?.setGravityScale(1, true);
        }
      }
    );

    const unsubscribeStart = useGame.subscribe(
      (state) => state.phase,
      (value) => {
        if (value === "playing") reset();
      }
    );

    const unsubscribeAny = subscribeKeys(() => {
      start();
    });

    return () => {
      unsubscribeStart();
      unsubscribeReset();
      unsubscribeJump();
      unsubscribeAny();
    };
  }, []);

  return (
    <>
      <group ref={dactylRef}>
        <Model modelName={`dactyl-flap-excited`} nftId="10162" />
      </group>
      <RigidBody
        type="dynamic"
        // colliders="hull"
        restitution={0}
        friction={0.5}
        ref={payloadRigidBodyRef}
        canSleep={false}
      >
        <primitive scale={0.75} object={skis.scene} />
        <Model modelName={`${species}-idle-${mood}`} nftId={number} />
        <CuboidCollider
          restitution={0.2}
          position={[0, 0.5, 0]}
          args={[0.5, 0.65, 1]}
        />
      </RigidBody>
    </>
  );
};

export default Dactyl;
