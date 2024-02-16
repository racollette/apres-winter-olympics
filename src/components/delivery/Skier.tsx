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

const Skier = ({
  species = "rex",
  mood = "confident",
  number = "3495",
}: ModelProps) => {
  const body = useRef<RapierRigidBody | null>(null);
  const [subscribeKeys, getKeys] = useKeyboardControls();
  const { rapier, world } = useRapier();
  const restart = useGame((state) => state.restart);
  const [smoothedCameraPosition] = useState(
    () => new THREE.Vector3(2000, 2000, 2000)
  );
  const [smoothedCameraTarget] = useState(() => new THREE.Vector3());

  useFrame((state, delta) => {
    /**
     * Controls
     */
    const { forward, backward, leftward, rightward } = getKeys();

    const impulse = { x: 0, y: 0, z: 0 };
    const torque = { x: 0, y: 0, z: 0 };

    const impulseStrength = 2 * delta;
    const torqueStrength = 0.5 * delta;

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
        torque.y -= torqueStrength;
        // impulse.x -= impulseStrength * modelForward.x;
        // impulse.y -= impulseStrength * modelForward.y * 10;
        // impulse.z -= impulseStrength * modelForward.z;
      }

      if (backward) {
        impulse.x += impulseStrength * modelForward.x;
        impulse.y += impulseStrength * modelForward.y;
        impulse.z += impulseStrength * modelForward.z;
      }

      if (leftward) {
        torque.y += torqueStrength;
        // impulse.x -= impulseStrength * modelForward.x;
        // impulse.y -= impulseStrength * modelForward.y;
        // impulse.z -= impulseStrength * modelForward.z;
      }

      body.current.applyImpulse(impulse, true);
      body.current.applyTorqueImpulse(torque, true);

      /**
       * Camera
       */

      const bodyPosition = body.current.translation();
      // const bodyQuaternion = body.current.rotation();

      // Set the initial camera position relative to the skier
      const initialCameraPosition = new THREE.Vector3(0, 2.5, 3);

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

      // Set the initial camera target relative to the skier
      const initialCameraTarget = new THREE.Vector3(0, 2, 0);

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

      smoothedCameraPosition.lerp(cameraPosition, 5 * delta);
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
    if (body.current) {
      const origin = body.current.translation();
      origin.y -= 0.01;
      const direction = { x: 0, y: -1, z: 0 };
      const ray = new rapier.Ray(origin, direction);
      const hit = world.castRay(ray, 10, true);

      if (hit && hit.toi <= 0.11) {
        body.current.applyImpulse({ x: 0, y: 0.5, z: 0 }, true);
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
      // start();
    });

    return () => {
      unsubscribeReset();
      unsubscribeJump();
      unsubscribeAny();
    };
  }, []);

  const matcap = useTexture("/textures/7877EE_D87FC5_75D9C7_1C78C0-256px.png");

  const skis = useGLTF("/models/skis.glb");

  return (
    <>
      <RigidBody
        // type="fixed"
        ref={body}
        canSleep={false}
        colliders="cuboid"
        restitution={0}
        friction={0.75}
        linearDamping={0.5}
        angularDamping={0.5}
        // position={[0, 1, 0]}
      >
        <group position={[0, 1.05, 0]} castShadow>
          {/* <mesh position={[-0.2, 0, -0.75]}>
            <boxGeometry args={[0.25, 0.1, 3]} />
            <meshMatcapMaterial matcap={matcap} />
          </mesh>
          <mesh position={[0.15, 0, -0.75]}>
            <boxGeometry args={[0.25, 0.1, 3]} />
            <meshMatcapMaterial matcap={matcap} />
          </mesh> */}
          <primitive
            scale={0.75}
            // rotation={[0, Math.PI / 2, 0]}
            // position={[0, 0, 0]}
            object={skis.scene}
          />

          {/* <Model modelName={`rex-idle-confident`} nftId="3495" /> */}
          <Model modelName={`${species}-idle-${mood}`} nftId={number} />
          {/* <CuboidCollider position={[0, 0.5, 0]} args={[0.5, 0.5, 0.5]} /> */}
        </group>
      </RigidBody>
    </>
  );
};

export default Skier;
