import React, { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import Model from "../Model";
import {
  RigidBody,
  useRapier,
  type RapierRigidBody,
  CuboidCollider,
} from "@react-three/rapier";
import { useGLTF, useKeyboardControls, useTexture } from "@react-three/drei";
import useGame from "../../stores/useGame";
import { type ModelProps } from "./Experience";

type CrossaintPositions = {
  [key: string]: {
    x: number;
    y: number;
    z: number;
    scale: number;
    rotationY: number;
  };
};

const CrossaintPositions: CrossaintPositions = {
  ankylo: { x: 0, y: 0.18, z: -0.77, scale: 0.5, rotationY: 0 },
  stego: { x: 0, y: 0.175, z: -0.78, scale: 0.5, rotationY: 0 },
  rex: { x: 0, y: 0.95, z: -0.8, scale: 1, rotationY: 0 },
  trice: { x: 0, y: 0.175, z: -0.75, scale: 0.75, rotationY: 0 },
  raptor: { x: 0, y: 0.9, z: -0.7, scale: 0.75, rotationY: 0 },
  bronto: { x: 0, y: 1.8, z: -1.1, scale: 1.8, rotationY: 0 },
};

const CrossaintPositionsAnimated: CrossaintPositions = {
  ankylo: { x: 0, y: 0.18, z: -0.77, scale: 0.5, rotationY: 0 },
  stego: { x: 0, y: 0.175, z: -0.78, scale: 0.5, rotationY: 0 },
  rex: { x: 0, y: 0.95, z: -0.8, scale: 1, rotationY: 0 },
  trice: { x: 0, y: 0.175, z: -0.75, scale: 0.75, rotationY: 0 },
  raptor: { x: 0, y: 0.9, z: -0.7, scale: 0.75, rotationY: 0 },
  bronto: { x: 0, y: 1.65, z: -1.5, scale: 1.8, rotationY: 0 },
};

const Player = ({
  species = "rex",
  mood = "confident",
  number = "3495",
}: ModelProps) => {
  const body = useRef<RapierRigidBody | null>(null);
  const [playAnimation, setPlayAnimation] = useState<boolean>(false);
  const [subscribeKeys, getKeys] = useKeyboardControls();
  const { rapier, world } = useRapier();
  const restart = useGame((state) => state.restart);
  const start = useGame((state) => state.start);
  const [smoothedCameraPosition] = useState(
    () => new THREE.Vector3(2000, 4000, -2000)
  );
  const [smoothedCameraTarget] = useState(() => new THREE.Vector3());

  const jumpStrength = 37;
  const cameraHeight = species === "bronto" ? 4 : 2;

  useFrame((state, delta) => {
    /**
     * Controls
     */
    const { forward, backward, leftward, rightward } = getKeys();

    const impulse = { x: 0, y: 0, z: 0 };
    const torque = { x: 0, y: 0, z: 0 };

    const impulseStrength = 50 * delta;
    const torqueStrength = 22 * delta;

    // console.log(delta);

    const modelForward = new THREE.Vector3(0, 0, 1);

    if (body.current) {
      const modelRotation = body.current.rotation();
      const modelQuaternion = new THREE.Quaternion(
        modelRotation.x,
        modelRotation.y,
        modelRotation.z,
        modelRotation.w
      );
      modelForward.applyQuaternion(modelQuaternion);

      if (forward) {
        impulse.x -= impulseStrength * modelForward.x;
        impulse.y -= impulseStrength * modelForward.y;
        impulse.z -= impulseStrength * modelForward.z;
      }

      if (rightward) {
        console.log("right");
        torque.y -= torqueStrength;
      }

      if (backward) {
        impulse.x += impulseStrength * modelForward.x;
        impulse.y += impulseStrength * modelForward.y;
        impulse.z += impulseStrength * modelForward.z;
      }

      if (leftward) {
        console.log("left");
        torque.y += torqueStrength;
      }

      // Apply corrective torque to counteract rotation
      const currentRotation = body.current.rotation();
      const uprightQuaternion = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(0, currentRotation.y, 0)
      );

      // Get the up vector from the upright quaternion
      const upVector = new THREE.Vector3(0, 1, 0);
      upVector.applyQuaternion(uprightQuaternion);

      // Get the up vector from the model quaternion
      const modelUpVector = new THREE.Vector3(0, 1, 0);
      modelUpVector.applyQuaternion(modelQuaternion);

      // Calculate the corrective torque
      const correctiveTorque = new THREE.Vector3();
      correctiveTorque.crossVectors(modelUpVector, upVector);

      torque.x += correctiveTorque.x * torqueStrength;
      torque.y += correctiveTorque.y * torqueStrength;
      torque.z += correctiveTorque.z * torqueStrength;

      body.current.applyImpulse(impulse, true);
      body.current.applyTorqueImpulse(torque, true);
      // body.current.applyTorqueImpulse({ x: 0, y: 0.5, z: 0}, true);

      const velocity = body.current.linvel();
      if (velocity) {
        const speed = Math.sqrt(
          velocity.x * velocity.x +
            velocity.y * velocity.y +
            velocity.z * velocity.z
        );
        if (speed > 0.01) {
          setPlayAnimation(true);
        } else {
          setPlayAnimation(false);
        }
      }

      /**
       * Camera
       */

      const bodyPosition = body.current.translation();
      // const bodyQuaternion = body.current.rotation();

      // Set the initial camera position relative to the skier
      const initialCameraPosition = new THREE.Vector3(0, cameraHeight + 0.5, 4);

      // Rotate the initial position based on the skier's rotation
      const rotatedCameraPosition = initialCameraPosition
        .clone()
        .applyQuaternion(modelQuaternion);

      // Update the camera position
      const cameraPosition = new THREE.Vector3(
        bodyPosition.x,
        bodyPosition.y,
        bodyPosition.z
      ).add(rotatedCameraPosition);
      //.add(initialCameraPosition);

      // Set the initial camera target relative to the skier
      const initialCameraTarget = new THREE.Vector3(0, cameraHeight, 0);

      // Rotate the initial target based on the skier's rotation
      const rotatedCameraTarget = initialCameraTarget
        .clone()
        .applyQuaternion(modelQuaternion);

      // Update the camera target
      const cameraTarget = new THREE.Vector3(
        bodyPosition.x,
        bodyPosition.y,
        bodyPosition.z
      ).add(rotatedCameraTarget);

      smoothedCameraPosition.lerp(cameraPosition, 3 * delta);
      smoothedCameraTarget.lerp(cameraTarget, 5 * delta);

      state.camera.position.copy(smoothedCameraPosition);
      state.camera.lookAt(smoothedCameraTarget);

      if (bodyPosition.z > 15 || bodyPosition.z < -460) {
        reset();
        restart();
      }
    }
  });

  const jump = () => {
    console.log("jump");
    if (body.current) {
      const origin = body.current.translation();
      origin.y -= -0.01;
      const direction = { x: 0, y: -1, z: 0 };
      const ray = new rapier.Ray(origin, direction);
      const hit = world.castRay(ray, 10, true);

      if (hit && hit.toi <= 0.01) {
        console.log(hit.toi);
        body.current.applyImpulse({ x: 0, y: jumpStrength, z: 0 }, true);
      }
    }
  };

  const reset = () => {
    body.current?.setTranslation({ x: 0, y: 1, z: 0 }, false);
    body.current?.setLinvel({ x: 0, y: 0, z: 0 }, false);
    body.current?.setAngvel({ x: 0, y: 0, z: 0 }, false);
    body.current?.setRotation({ x: 0, y: 0, z: 0, w: 1 }, false);
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
        if (value) jump();
      }
    );

    const unsubscribeAny = subscribeKeys(() => {
      start();
    });

    return () => {
      unsubscribeReset();
      unsubscribeJump();
      unsubscribeAny();
    };
  }, []);

  const croissants = useGLTF("/models/croissants.glb");

  return (
    <>
      <RigidBody
        ref={body}
        canSleep={false}
        colliders={false}
        restitution={0}
        friction={0.5}
        linearDamping={0.5}
        angularDamping={0.5}
        position={[0, 2, 0]}
      >
        <group castShadow>
          <Model
            modelName={`${species}-trot-${mood}`}
            nftId={number}
            playAnimation={playAnimation}
          />
          <primitive
            position={
              !playAnimation
                ? [
                    CrossaintPositions[species]?.x,
                    CrossaintPositions[species]?.y,
                    CrossaintPositions[species]?.z,
                  ]
                : [
                    CrossaintPositionsAnimated[species]?.x,
                    CrossaintPositionsAnimated[species]?.y,
                    CrossaintPositionsAnimated[species]?.z,
                  ]
            }
            scale={CrossaintPositions[species]?.scale}
            rotation={[0, CrossaintPositions[species]?.rotationY, 0]}
            object={croissants.scene}
          />
          <CuboidCollider position={[0, 0.8, 0]} args={[0.75, 0.75, 0.75]} />
        </group>
      </RigidBody>
    </>
  );
};

export default Player;
