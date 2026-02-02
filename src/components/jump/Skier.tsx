import { useRef, useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import Model from "../Model";
import {
  RigidBody,
  CuboidCollider,
  type RapierRigidBody,
} from "@react-three/rapier";
import { useKeyboardControls, useTexture } from "@react-three/drei";
import { useJumpGame } from "../../stores/useJumpGame";
import { type ModelProps } from "./Experience";
import { TAKEOFF_Z, K_POINT_DISTANCE } from "./SkiJumpRamp";

// Debug flag - set to true to enable free camera
const DEBUG_FREE_CAM = true;

// Ramp constants (must match SkiJumpRamp)
const INRUN_LENGTH = 80;
const INRUN_HEIGHT = 40;

// Physics constants
const GRAVITY_ACCEL = 12;
const TUCK_BONUS = 4;
const MAX_SPEED = 22;
const DRAG = 0.01;

// Flight physics
const PITCH_RATE = 2.0;
const ROLL_RATE = 1.2;
const OPTIMAL_PITCH = -0.25;
const LIFT_COEFFICIENT = 0.03;
const TAKEOFF_UPWARD_VEL = 2.5;

// Start at top of ramp
const START_POSITION = new THREE.Vector3(0, INRUN_HEIGHT + 1, 0);

// Reusable objects
const _tempVec3 = new THREE.Vector3();
const _tempQuat = new THREE.Quaternion();
const _tempEuler = new THREE.Euler();

const Skier = ({
  species = "rex",
  mood = "confident",
  number = "3495",
}: ModelProps) => {
  const body = useRef<RapierRigidBody | null>(null);
  const velocityRef = useRef(new THREE.Vector3(0, 0, 0));
  const flightRotRef = useRef({ pitch: 0, roll: 0 });
  const frameCount = useRef(0);

  const [subscribeKeys, getKeys] = useKeyboardControls();

  const startCountdown = useJumpGame((state) => state.startCountdown);
  const takeoff = useJumpGame((state) => state.takeoff);
  const land = useJumpGame((state) => state.land);
  const setSpeed = useJumpGame((state) => state.setSpeed);

  const [camPos] = useState(() => new THREE.Vector3(0, INRUN_HEIGHT + 10, 20));
  const [camTarget] = useState(() => new THREE.Vector3(0, INRUN_HEIGHT, -20));

  const matcap = useTexture("/textures/7877EE_D87FC5_75D9C7_1C78C0-256px.png");

  // Get height on ramp based on Z position
  function getRampHeight(z: number): number {
    if (z >= 0) return INRUN_HEIGHT;
    if (z <= -INRUN_LENGTH) return 0;
    const t = -z / INRUN_LENGTH;
    return INRUN_HEIGHT * (1 - t);
  }

  useFrame((state, delta) => {
    if (!body.current) return;

    const { forward, backward, leftward, rightward, jump } = getKeys();
    const phase = useJumpGame.getState().phase;
    const pos = body.current.translation();

    if (phase === "ready" || phase === "countdown") {
      // Hold at start
      body.current.setTranslation(
        { x: START_POSITION.x, y: START_POSITION.y, z: START_POSITION.z },
        true
      );
      body.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      body.current.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true);
      velocityRef.current.set(0, 0, 0);
      flightRotRef.current = { pitch: 0, roll: 0 };

      // Camera: behind and above, looking down the ramp
      if (!DEBUG_FREE_CAM) {
        _tempVec3.set(0, INRUN_HEIGHT + 8, 15);
        camPos.lerp(_tempVec3, 4 * delta);
        camTarget.set(0, INRUN_HEIGHT / 2, -40);
        state.camera.position.copy(camPos);
        state.camera.lookAt(camTarget.x, camTarget.y, camTarget.z);
      }
      return;
    }

    if (phase === "inrun") {
      const vel = velocityRef.current;

      // Accelerate down slope
      const accel = forward ? GRAVITY_ACCEL + TUCK_BONUS : GRAVITY_ACCEL;
      vel.z -= accel * delta;

      // Drag
      const speed = Math.abs(vel.z);
      if (speed > 0.5) {
        vel.z += DRAG * vel.z * speed * delta;
      }

      // Clamp
      if (Math.abs(vel.z) > MAX_SPEED) {
        vel.z = -MAX_SPEED;
      }

      // Move along ramp
      const newZ = pos.z + vel.z * delta;
      const newY = getRampHeight(newZ) + 0.8;

      body.current.setTranslation({ x: 0, y: newY, z: newZ }, true);

      // Log every 30 frames
      frameCount.current++;
      if (frameCount.current % 30 === 0) {
        console.log(`[INRUN] pos: (${pos.x.toFixed(1)}, ${newY.toFixed(1)}, ${newZ.toFixed(1)}) vel.z: ${vel.z.toFixed(1)} speed: ${speed.toFixed(1)} TAKEOFF_Z: ${TAKEOFF_Z}`);
      }

      // Tilt skier to match slope
      const slopeAngle = Math.atan2(INRUN_HEIGHT, INRUN_LENGTH);
      _tempEuler.set(-slopeAngle, 0, 0);
      _tempQuat.setFromEuler(_tempEuler);
      body.current.setRotation(
        { x: _tempQuat.x, y: _tempQuat.y, z: _tempQuat.z, w: _tempQuat.w },
        true
      );

      // Check takeoff
      if (newZ <= TAKEOFF_Z) {
        console.log(`[TAKEOFF] at z=${newZ.toFixed(1)}, speed=${Math.abs(vel.z).toFixed(1)}`);
        takeoff({ x: 0, y: newY, z: newZ }, Math.abs(vel.z));

        // Switch to dynamic and launch
        body.current.setBodyType(0, true);
        body.current.setLinvel({ x: 0, y: TAKEOFF_UPWARD_VEL, z: vel.z }, true);
      }

      // Update HUD
      if (frameCount.current % 3 === 0) {
        setSpeed(Math.abs(vel.z));
      }

      // Camera follows from behind
      if (!DEBUG_FREE_CAM) {
        _tempVec3.set(0, pos.y + 5, pos.z + 12);
        camPos.lerp(_tempVec3, 6 * delta);
        camTarget.set(0, pos.y - 2, pos.z - 20);
        state.camera.position.copy(camPos);
        state.camera.lookAt(camTarget.x, camTarget.y, camTarget.z);
      }
      return;
    }

    if (phase === "flight") {
      const linvel = body.current.linvel();
      const rot = flightRotRef.current;

      // Player controls
      if (forward) rot.pitch -= PITCH_RATE * delta;
      if (backward) rot.pitch += PITCH_RATE * delta;
      if (leftward) rot.roll -= ROLL_RATE * delta;
      if (rightward) rot.roll += ROLL_RATE * delta;

      rot.pitch = THREE.MathUtils.clamp(rot.pitch, -0.7, 0.4);
      rot.roll = THREE.MathUtils.clamp(rot.roll, -0.3, 0.3);

      // Apply rotation
      _tempEuler.set(rot.pitch, 0, rot.roll);
      _tempQuat.setFromEuler(_tempEuler);
      body.current.setRotation(
        { x: _tempQuat.x, y: _tempQuat.y, z: _tempQuat.z, w: _tempQuat.w },
        true
      );

      // Lift based on pitch
      const pitchDiff = Math.abs(rot.pitch - OPTIMAL_PITCH);
      const liftFactor = Math.max(0, 1 - pitchDiff * 2.5);
      const hSpeed = Math.sqrt(linvel.x ** 2 + linvel.z ** 2);
      const lift = LIFT_COEFFICIENT * hSpeed * liftFactor;
      body.current.applyImpulse({ x: 0, y: lift * delta * 50, z: 0 }, true);

      // Log every 30 frames
      frameCount.current++;
      if (frameCount.current % 30 === 0) {
        console.log(`[FLIGHT] pos: (${pos.x.toFixed(1)}, ${pos.y.toFixed(1)}, ${pos.z.toFixed(1)}) vel: (${linvel.x.toFixed(1)}, ${linvel.y.toFixed(1)}, ${linvel.z.toFixed(1)})`);
      }

      // Update speed
      if (frameCount.current % 3 === 0) {
        setSpeed(hSpeed);
      }

      // Camera - side view during flight
      if (!DEBUG_FREE_CAM) {
        _tempVec3.set(pos.x + 8, pos.y + 4, pos.z + 12);
        camPos.lerp(_tempVec3, 4 * delta);
        camTarget.set(pos.x, pos.y, pos.z);
        state.camera.position.copy(camPos);
        state.camera.lookAt(camTarget.x, camTarget.y, camTarget.z);
      }
      return;
    }

    if (phase === "landed" || phase === "results") {
      // Just follow
      if (!DEBUG_FREE_CAM) {
        _tempVec3.set(pos.x + 5, pos.y + 4, pos.z + 10);
        camPos.lerp(_tempVec3, 4 * delta);
        state.camera.position.copy(camPos);
        state.camera.lookAt(pos.x, pos.y, pos.z);
      }
    }
  });

  function calculateStyle(pitch: number, roll: number): number {
    const pitchScore = 1 - Math.abs(pitch - OPTIMAL_PITCH) * 2;
    const rollScore = 1 - Math.abs(roll) * 4;
    return Math.max(0, Math.min(20, (pitchScore + rollScore) * 10));
  }

  function reset() {
    if (!body.current) return;
    body.current.setBodyType(1, true);
    body.current.setTranslation(
      { x: START_POSITION.x, y: START_POSITION.y, z: START_POSITION.z },
      true
    );
    body.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
    body.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
    body.current.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true);
    velocityRef.current.set(0, 0, 0);
    flightRotRef.current = { pitch: 0, roll: 0 };
  }

  useEffect(() => {
    const unsub1 = useJumpGame.subscribe(
      (s) => s.phase,
      (phase) => {
        if (phase === "ready") reset();
      }
    );

    const unsub2 = subscribeKeys(
      (state) => state.jump,
      (pressed) => {
        if (pressed && useJumpGame.getState().phase === "ready") {
          startCountdown();
        }
      }
    );

    return () => {
      unsub1();
      unsub2();
    };
  }, []);

  const handleCollision = () => {
    const phase = useJumpGame.getState().phase;
    if (phase !== "flight") return;

    const pos = body.current?.translation();
    if (!pos) return;

    const rot = flightRotRef.current;
    console.log(`[LAND] collision at z=${pos.z.toFixed(1)}`);
    const style = calculateStyle(rot.pitch, rot.roll);
    land({ x: pos.x, y: pos.y, z: pos.z }, style);
  };

  return (
    <RigidBody
      ref={body}
      type="kinematicPosition"
      position={[START_POSITION.x, START_POSITION.y, START_POSITION.z]}
      colliders={false}
      linearDamping={0.1}
      onCollisionEnter={handleCollision}
    >
      <CuboidCollider args={[0.4, 0.6, 0.8]} position={[0, 0.6, 0]} />

      {/* Skis */}
      <mesh position={[-0.2, 0.05, 0]}>
        <boxGeometry args={[0.12, 0.04, 2.2]} />
        <meshMatcapMaterial matcap={matcap} />
      </mesh>
      <mesh position={[0.2, 0.05, 0]}>
        <boxGeometry args={[0.12, 0.04, 2.2]} />
        <meshMatcapMaterial matcap={matcap} />
      </mesh>

      {/* Dino */}
      <group position={[0, 0.4, 0.2]}>
        <Model modelName={`${species}-idle-${mood}`} nftId={number} />
      </group>
    </RigidBody>
  );
};

export default Skier;
