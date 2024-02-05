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
import { useKeyboardControls, useTexture } from "@react-three/drei";
import useGame from "../../stores/useGame";
import { type ModelProps } from "./Experience";

const Dactyl = ({
  species = "rex",
  mood = "confident",
  number = "3495",
}: ModelProps) => {
  const dactylRef = useRef<THREE.Group | null>(null);
  const [subscribeKeys, getKeys] = useKeyboardControls();
  const { rapier, world } = useRapier();
  const setSpeed = useGame((state) => state.setSpeed);
  const [smoothedCameraPosition] = useState(
    () => new THREE.Vector3(2000, 2000, 2000)
  );
  const [smoothedCameraTarget] = useState(() => new THREE.Vector3(0, 100, 0));
  useFrame((state, delta) => {
    /**
     * Controls
     */
    const { forward, backward, leftward, rightward } = getKeys();

    dactylRef.current.position.x -= Math.sin(delta) * 2; // Adjust the amplitude (2 in this case) as needed
    dactylRef.current.position.y -= Math.sin(delta) * 2; // Adjust the amplitude (2 in this case) as needed
    dactylRef.current.position.z -= delta * 5;

    /**
     * Camera
     */
    const bodyPosition = dactylRef.current.position;

    // Set the initial camera position relative to the dactyl
    const initialCameraPosition = new THREE.Vector3(3, 3, 2);

    // Rotate the initial position based on the dactyl's rotation
    const rotatedCameraPosition = initialCameraPosition.clone();

    // Update the camera position relative to the dactyl's position
    const cameraPosition = new THREE.Vector3(
      bodyPosition.x + rotatedCameraPosition.x,
      bodyPosition.y + rotatedCameraPosition.y,
      bodyPosition.z + rotatedCameraPosition.z
    );

    // Set the initial camera target relative to the dactyl
    const initialCameraTarget = new THREE.Vector3(0, 0, 0);

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

    // const unsubscribeJump = subscribeKeys(
    //   (state) => state.jump,
    //   (value) => {
    //     if (value) jump();
    //   }
    // );

    // const unsubscribeAny = subscribeKeys(() => {
    //   // start();
    // });

    return () => {
      // unsubscribeReset();
      // unsubscribeJump();
      // unsubscribeAny();
    };
  }, []);

  return (
    <group ref={dactylRef} scale={1}>
      <mesh position={[0, 0, 0]}>
        <Model modelName={`dactyl-flap-excited`} nftId={10176} />
      </mesh>
    </group>
  );
};

export default Dactyl;
