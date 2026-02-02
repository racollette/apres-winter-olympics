import { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import Model from "../Model";
import {
  CuboidCollider,
  RigidBody,
  useRapier,
  type RapierRigidBody,
} from "@react-three/rapier";
import { useGLTF, useKeyboardControls } from "@react-three/drei";
import useGame from "../../stores/useGame";
import useAudio from "../../stores/useAudio";
import { type ModelProps } from "./Experience";
import { getTerrainHeight } from "./Terrain";
import { GATE_POSITIONS, FINISH_LINE_Z } from "./Gates";
import SnowSpray from "./SnowSpray";
import SkiTrails from "./SkiTrails";

const DOWNHILL_ACCEL = 16;
const MAX_SPEED = 35;
const BASE_CARVE_ACCEL = 45;
const HIGH_SPEED_TURN_PENALTY = 0.75;
const DRAG_COEFFICIENT = 0.012;
const BRAKE_STRENGTH = 25;
const CARVE_SPEED_DRAG = 0.04;
const GROUND_OFFSET = 0.15;
const CAMERA_LERP = 12;
const TERRAIN_SAMPLE_DIST = 0.5;
const GATE_PASS_BOOST = 1.06;
const MAX_LEAN_ANGLE = 0.4;
const GATE_WIDTH = 4.5;
const GATE_TRIGGER_DIST = 3;


function getTerrainNormal(x: number, z: number): THREE.Vector3 {
  const hCenter = getTerrainHeight(x, z);
  const hRight = getTerrainHeight(x + TERRAIN_SAMPLE_DIST, z);
  const hForward = getTerrainHeight(x, z - TERRAIN_SAMPLE_DIST);

  const tangentX = new THREE.Vector3(TERRAIN_SAMPLE_DIST, hRight - hCenter, 0);
  const tangentZ = new THREE.Vector3(0, hForward - hCenter, -TERRAIN_SAMPLE_DIST);

  return new THREE.Vector3().crossVectors(tangentX, tangentZ).normalize();
}

export type SkierState = {
  isCarving: boolean;
  carvingIntensity: number;
  speed: number;
  speedRatio: number;
  leanAngle: number;
};

const Skier = ({
  species = "rex",
  mood = "confident",
  number = "3495",
}: ModelProps) => {
  const body = useRef<RapierRigidBody | null>(null);
  const skierGroupRef = useRef<THREE.Group>(null);
  const velocityRef = useRef(new THREE.Vector3(0, 0, 0));
  const currentLeanRef = useRef(0);
  const passedGatesRef = useRef<Set<number>>(new Set());
  const [subscribeKeys, getKeys] = useKeyboardControls();
  const { rapier, world } = useRapier();
  const restart = useGame((state) => state.restart);
  const startCountdown = useGame((state) => state.startCountdown);
  const end = useGame((state) => state.end);
  const gateActivated = useGame((state) => state.gateActivated);
  const setSpeed = useGame((state) => state.setSpeed);
  const initAudio = useAudio((state) => state.init);
  const updateWind = useAudio((state) => state.updateWind);
  const playCarve = useAudio((state) => state.playCarve);
  const stopCarve = useAudio((state) => state.stopCarve);
  const playGatePass = useAudio((state) => state.playGatePass);
  const [smoothedCameraPosition] = useState(
    () => new THREE.Vector3(0, 10, 10)
  );
  const [smoothedCameraTarget] = useState(() => new THREE.Vector3(0, 0, -10));
  const [skierState, setSkierState] = useState<SkierState>({
    isCarving: false,
    carvingIntensity: 0,
    speed: 0,
    speedRatio: 0,
    leanAngle: 0,
  });

  useFrame((state, delta) => {
    if (!body.current) return;

    const phase = useGame.getState().phase;

    // Hold position during ready and countdown
    if (phase === "ready" || phase === "countdown") {
      const startY = getTerrainHeight(0, 0) + GROUND_OFFSET;
      body.current.setNextKinematicTranslation({ x: 0, y: startY, z: 0 });

      // Still update camera
      const bodyPosition = body.current.translation();
      const cameraPosition = new THREE.Vector3(0, bodyPosition.y + 3, bodyPosition.z + 5);
      const cameraTarget = new THREE.Vector3(0, bodyPosition.y + 0.5, bodyPosition.z - 8);
      smoothedCameraPosition.lerp(cameraPosition, CAMERA_LERP * delta);
      smoothedCameraTarget.lerp(cameraTarget, CAMERA_LERP * delta);
      state.camera.position.copy(smoothedCameraPosition);
      state.camera.lookAt(smoothedCameraTarget);
      return;
    }

    const { leftward, rightward, backward } = getKeys();
    const velocity = velocityRef.current;
    const position = body.current.translation();

    velocity.z -= DOWNHILL_ACCEL * delta;

    const speed = velocity.length();
    const speedRatio = Math.min(speed / MAX_SPEED, 1);
    const carveMultiplier = 1 - (speedRatio * HIGH_SPEED_TURN_PENALTY);
    const effectiveCarveAccel = BASE_CARVE_ACCEL * carveMultiplier;

    let targetLean = 0;
    let isCarving = false;
    let carvingIntensity = 0;
    let isBraking = false;

    if (backward && speed > 5) {
      isBraking = true;
      const brakeForce = BRAKE_STRENGTH * delta;
      velocity.z += brakeForce;
      if (velocity.z > -2) velocity.z = -2;
    }

    if (leftward) {
      velocity.x -= effectiveCarveAccel * delta;
      targetLean = MAX_LEAN_ANGLE;
      isCarving = true;
      carvingIntensity = Math.abs(velocity.x) / 12;
    }
    if (rightward) {
      velocity.x += effectiveCarveAccel * delta;
      targetLean = -MAX_LEAN_ANGLE;
      isCarving = true;
      carvingIntensity = Math.abs(velocity.x) / 12;
    }

    currentLeanRef.current = THREE.MathUtils.lerp(
      currentLeanRef.current,
      targetLean,
      8 * delta
    );

    if (skierGroupRef.current) {
      skierGroupRef.current.rotation.z = currentLeanRef.current;
    }

    if (speed > 0.1) {
      let drag = DRAG_COEFFICIENT * speed * speed;
      if (isCarving) {
        drag += CARVE_SPEED_DRAG * speed * speedRatio;
      }
      const dragForce = velocity.clone().normalize().multiplyScalar(-drag * delta);
      velocity.add(dragForce);
    }

    if (speed > MAX_SPEED) {
      velocity.normalize().multiplyScalar(MAX_SPEED);
    }

    if (!leftward && !rightward && Math.abs(velocity.x) > 0.5) {
      const momentumTransfer = velocity.x * 0.02;
      velocity.z -= Math.abs(momentumTransfer);
    }

    velocity.x *= 0.97;

    setSkierState({
      isCarving,
      carvingIntensity: Math.min(carvingIntensity, 1),
      speed,
      speedRatio,
      leanAngle: currentLeanRef.current,
    });
    setSpeed(speed);

    updateWind(speedRatio);
    if (isCarving && carvingIntensity > 0.2) {
      playCarve(carvingIntensity);
    } else {
      stopCarve();
    }

    const newX = position.x + velocity.x * delta;
    const newZ = position.z + velocity.z * delta;

    const terrainY = getTerrainHeight(newX, newZ);
    const newY = terrainY + GROUND_OFFSET;

    body.current.setNextKinematicTranslation({ x: newX, y: newY, z: newZ });

    const terrainNormal = getTerrainNormal(newX, newZ);
    const forward = speed > 0.5
      ? new THREE.Vector3(velocity.x, 0, velocity.z).normalize()
      : new THREE.Vector3(0, 0, -1);
    const yawAngle = Math.atan2(forward.x, forward.z) + Math.PI;

    const slopeAngle = Math.acos(terrainNormal.y);
    const slopeDirection = Math.atan2(terrainNormal.x, terrainNormal.z);

    const pitchFromSlope = slopeAngle * Math.cos(slopeDirection - yawAngle);
    const rollFromSlope = slopeAngle * Math.sin(slopeDirection - yawAngle) * 0.5;

    const targetQuat = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(pitchFromSlope, yawAngle, rollFromSlope, "YXZ")
    );

    const currentRotation = body.current.rotation();
    const currentQuat = new THREE.Quaternion(
      currentRotation.x,
      currentRotation.y,
      currentRotation.z,
      currentRotation.w
    );

    currentQuat.slerp(targetQuat, 8 * delta);
    body.current.setNextKinematicRotation({
      x: currentQuat.x,
      y: currentQuat.y,
      z: currentQuat.z,
      w: currentQuat.w,
    });

    const bodyPosition = body.current.translation();

    const cameraHeight = 3;
    const cameraDistance = 5;
    const cameraPosition = new THREE.Vector3(
      bodyPosition.x * 0.9,
      bodyPosition.y + cameraHeight,
      bodyPosition.z + cameraDistance
    );

    const cameraTarget = new THREE.Vector3(
      bodyPosition.x * 0.7,
      bodyPosition.y + 0.5,
      bodyPosition.z - 8
    );

    smoothedCameraPosition.lerp(cameraPosition, CAMERA_LERP * delta);
    smoothedCameraTarget.lerp(cameraTarget, CAMERA_LERP * delta);

    state.camera.position.copy(smoothedCameraPosition);
    state.camera.lookAt(smoothedCameraTarget);

    if (phase === "playing") {
      // Gate detection
      for (let i = 0; i < GATE_POSITIONS.length; i++) {
        if (passedGatesRef.current.has(i)) continue;
        const [gateX, gateZ] = GATE_POSITIONS[i]!;
        const distZ = Math.abs(newZ - gateZ);
        const distX = Math.abs(newX - gateX);
        if (distZ < GATE_TRIGGER_DIST && distX < GATE_WIDTH) {
          passedGatesRef.current.add(i);
          gateActivated(i);
          // Speed boost on gate pass
          const currentSpeed = velocity.length();
          const boostSpeed = Math.min(currentSpeed * GATE_PASS_BOOST, MAX_SPEED * 1.05);
          velocity.normalize().multiplyScalar(boostSpeed);
          playGatePass();
          break;
        }
      }

      // Finish line detection
      if (newZ < FINISH_LINE_Z && Math.abs(newX) < 10) {
        end();
      }

      // Out of bounds
      if (newZ > 15 || newZ < -1250 || newX < -50 || newX > 50) {
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

      if (hit && hit.toi <= 1) {
        velocityRef.current.y = 8;
      }
    }
  };

  const reset = () => {
    const startY = getTerrainHeight(0, 0) + GROUND_OFFSET;
    body.current?.setTranslation({ x: 0, y: startY, z: 0 }, false);
    body.current?.setRotation({ x: 0, y: 0, z: 0, w: 1 }, false);
    velocityRef.current.set(0, 0, 0);
    passedGatesRef.current.clear();
  };

  useEffect(() => {
    initAudio();
  }, [initAudio]);

  useEffect(() => {
    const unsubscribeReset = useGame.subscribe(
      (state) => state.phase,
      (value) => {
        if (value === "ready") reset();
      }
    );

    const unsubscribeJump = subscribeKeys(
      (state) => state.jump,
      (pressed) => {
        if (!pressed) return;
        const phase = useGame.getState().phase;
        if (phase === "ready") {
          startCountdown();
        } else if (phase === "playing") {
          jump();
        }
      }
    );

    return () => {
      unsubscribeReset();
      unsubscribeJump();
    };
  }, []);

  const skis = useGLTF("/models/skis.glb");
  const startY = getTerrainHeight(0, 0) + GROUND_OFFSET;

  const [particlePosition] = useState(() => new THREE.Vector3(0, startY, 0));
  const [particleVelocity] = useState(() => new THREE.Vector3(0, 0, 0));
  const [skierRotation] = useState(() => new THREE.Quaternion());

  useFrame(() => {
    if (body.current) {
      const pos = body.current.translation();
      particlePosition.set(pos.x, pos.y, pos.z);
      particleVelocity.copy(velocityRef.current);
      const rot = body.current.rotation();
      skierRotation.set(rot.x, rot.y, rot.z, rot.w);
    }
  });

  return (
    <>
      <RigidBody
        ref={body}
        type="kinematicPosition"
        position={[0, startY, 0]}
        colliders={false}
        ccd
      >
        <CuboidCollider args={[0.5, 1, 0.5]} position={[0, 1, 0]} />
        <group ref={skierGroupRef} position={[0, 0.55, 0]}>
          <primitive scale={0.75} object={skis.scene} castShadow />
          <group castShadow>
            <Model modelName={`${species}-idle-${mood}`} nftId={number} />
          </group>
        </group>
      </RigidBody>

      <SnowSpray
        isCarving={skierState.isCarving}
        carvingIntensity={skierState.carvingIntensity}
        position={particlePosition}
        velocity={particleVelocity}
        leanAngle={skierState.leanAngle}
      />

      <SkiTrails
        skierPosition={particlePosition}
        skierRotation={skierRotation}
        isMoving={skierState.speed > 1}
        isCarving={skierState.isCarving}
      />
    </>
  );
};

export default Skier;
