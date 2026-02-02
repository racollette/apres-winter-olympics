import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import Model from "../Model";
import {
  RigidBody,
  useRapier,
  type RapierRigidBody,
} from "@react-three/rapier";
import { useGLTF, useKeyboardControls, useTexture } from "@react-three/drei";
import { useSkiJump } from "../../stores/useSkiJump";
import { type ModelProps } from "./Experience";

const START_POSITION = { x: 0, y: 12, z: 0 };
const LAUNCH_VELOCITY_MULTIPLIER = 0.5;
const AIR_CONTROL_STRENGTH = 0.02;

export default function Jumper({
  species = "rex",
  mood = "confident",
  number = "3495",
}: ModelProps) {
  const body = useRef<RapierRigidBody | null>(null);
  const [subscribeKeys, getKeys] = useKeyboardControls();
  const { rapier, world } = useRapier();

  const phase = useSkiJump((state) => state.phase);
  const power = useSkiJump((state) => state.power);
  const startCharging = useSkiJump((state) => state.startCharging);
  const updatePower = useSkiJump((state) => state.updatePower);
  const launch = useSkiJump((state) => state.launch);
  const land = useSkiJump((state) => state.land);
  const restart = useSkiJump((state) => state.restart);

  const [pitch, setPitch] = useState(0);
  const [smoothedCameraPosition] = useState(
    () => new THREE.Vector3(0, 20, 10)
  );
  const [smoothedCameraTarget] = useState(() => new THREE.Vector3());
  const launchPosition = useRef<THREE.Vector3 | null>(null);

  useFrame((state, delta) => {
    if (!body.current) return;

    const { forward, backward, jump } = getKeys();
    const bodyPosition = body.current.translation();
    const bodyVelocity = body.current.linvel();

    // Handle charging phase
    if (phase === "ready" && jump) {
      startCharging();
    }

    if (phase === "charging") {
      if (jump) {
        updatePower(delta);
      } else {
        // Release - launch!
        const launchPower = power / 100;
        const velocity = {
          x: 0,
          y: launchPower * 5,
          z: -launchPower * LAUNCH_VELOCITY_MULTIPLIER * 40,
        };
        body.current.setLinvel(velocity, true);
        launchPosition.current = new THREE.Vector3(
          bodyPosition.x,
          bodyPosition.y,
          bodyPosition.z
        );
        launch();
      }
    }

    // Handle flying phase - pitch control
    if (phase === "flying") {
      let pitchChange = 0;
      if (forward) pitchChange = -AIR_CONTROL_STRENGTH;
      if (backward) pitchChange = AIR_CONTROL_STRENGTH;

      if (pitchChange !== 0) {
        const newPitch = Math.max(-0.5, Math.min(0.5, pitch + pitchChange));
        setPitch(newPitch);

        // Apply rotation to body
        const currentRotation = body.current.rotation();
        const euler = new THREE.Euler().setFromQuaternion(
          new THREE.Quaternion(
            currentRotation.x,
            currentRotation.y,
            currentRotation.z,
            currentRotation.w
          )
        );
        euler.x = newPitch;
        const newQuat = new THREE.Quaternion().setFromEuler(euler);
        body.current.setRotation(
          { x: newQuat.x, y: newQuat.y, z: newQuat.z, w: newQuat.w },
          true
        );
      }

      // Check for landing
      const origin = { x: bodyPosition.x, y: bodyPosition.y, z: bodyPosition.z };
      origin.y -= 1;
      const direction = { x: 0, y: -1, z: 0 };
      const ray = new rapier.Ray(origin, direction);
      const hit = world.castRay(ray, 5, true);

      if (hit && hit.toi <= 1 && bodyVelocity.y < 0) {
        // Calculate distance from launch point
        if (launchPosition.current) {
          const distance = Math.abs(bodyPosition.z - launchPosition.current.z);
          const landingAngle = (pitch * 180) / Math.PI;
          land(distance, landingAngle);
        }
      }
    }

    // Camera follow
    const cameraOffset = new THREE.Vector3(0, 5, 15);
    const cameraPosition = new THREE.Vector3(
      bodyPosition.x + cameraOffset.x,
      bodyPosition.y + cameraOffset.y,
      bodyPosition.z + cameraOffset.z
    );

    const cameraTarget = new THREE.Vector3(
      bodyPosition.x,
      bodyPosition.y,
      bodyPosition.z
    );

    smoothedCameraPosition.lerp(cameraPosition, 3 * delta);
    smoothedCameraTarget.lerp(cameraTarget, 3 * delta);

    state.camera.position.copy(smoothedCameraPosition);
    state.camera.lookAt(smoothedCameraTarget);

    // Reset if fell off
    if (bodyPosition.y < -100) {
      reset();
    }
  });

  const reset = () => {
    body.current?.setTranslation(START_POSITION, false);
    body.current?.setLinvel({ x: 0, y: 0, z: 0 }, false);
    body.current?.setAngvel({ x: 0, y: 0, z: 0 }, false);
    body.current?.setRotation({ x: 0, y: 0, z: 0, w: 1 }, false);
    setPitch(0);
    launchPosition.current = null;
    restart();
  };

  useEffect(() => {
    const unsubscribePhase = useSkiJump.subscribe(
      (state) => state.phase,
      (value) => {
        if (value === "ready") {
          body.current?.setTranslation(START_POSITION, false);
          body.current?.setLinvel({ x: 0, y: 0, z: 0 }, false);
          body.current?.setAngvel({ x: 0, y: 0, z: 0 }, false);
          body.current?.setRotation({ x: 0, y: 0, z: 0, w: 1 }, false);
          setPitch(0);
        }
      }
    );

    return () => {
      unsubscribePhase();
    };
  }, []);

  const skis = useGLTF("/models/skis.glb");

  return (
    <RigidBody
      ref={body}
      canSleep={false}
      colliders="cuboid"
      restitution={0.1}
      friction={0.3}
      linearDamping={0.1}
      angularDamping={0.5}
      position={[START_POSITION.x, START_POSITION.y, START_POSITION.z]}
    >
      <group position={[0, 1.05, 0]} castShadow>
        <primitive scale={0.75} object={skis.scene.clone()} />
        <Model modelName={`${species}-idle-${mood}`} nftId={number} />
      </group>
    </RigidBody>
  );
}
