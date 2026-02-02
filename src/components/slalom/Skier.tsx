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

const BASE_DOWNHILL_ACCEL = 12;
const TUCK_ACCEL_BONUS = 8;
const MAX_SPEED = 35;
const BASE_CARVE_ACCEL = 45;
const HIGH_SPEED_TURN_PENALTY = 0.75;
const BASE_DRAG = 0.015;
const TUCK_DRAG = 0.008;
const BRAKE_DRAG = 0.06;
const CARVE_SPEED_DRAG = 0.04;
const GROUND_OFFSET = 0.05;
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

const _tempVec3A = new THREE.Vector3();
const _tempVec3B = new THREE.Vector3();
const _tempVec3C = new THREE.Vector3();
const _tempQuat = new THREE.Quaternion();
const _tempEuler = new THREE.Euler();

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
  const skierStateRef = useRef<SkierState>({
    isCarving: false,
    carvingIntensity: 0,
    speed: 0,
    speedRatio: 0,
    leanAngle: 0,
  });
  const [subscribeKeys, getKeys] = useKeyboardControls();
  const { rapier, world } = useRapier();
  const restart = useGame((state) => state.restart);
  const startCountdown = useGame((state) => state.startCountdown);
  const end = useGame((state) => state.end);
  const gateActivated = useGame((state) => state.gateActivated);
  const setSpeedRef = useRef(useGame.getState().setSpeed);
  const initAudio = useAudio((state) => state.init);
  const updateWindRef = useRef(useAudio.getState().updateWind);
  const playCarveRef = useRef(useAudio.getState().playCarve);
  const stopCarveRef = useRef(useAudio.getState().stopCarve);
  const playGatePassRef = useRef(useAudio.getState().playGatePass);
  const [smoothedCameraPosition] = useState(
    () => new THREE.Vector3(0, 10, 10)
  );
  const [smoothedCameraTarget] = useState(() => new THREE.Vector3(0, 0, -10));
  const [particlePosition] = useState(() => new THREE.Vector3(0, 0, 0));
  const [particleVelocity] = useState(() => new THREE.Vector3(0, 0, 0));
  const [skierRotation] = useState(() => new THREE.Quaternion());
  const frameCountRef = useRef(0);

  useFrame((state, delta) => {
    if (!body.current) return;

    const phase = useGame.getState().phase;

    // Hold position during ready and countdown
    if (phase === "ready" || phase === "countdown") {
      const startY = getTerrainHeight(0, 0) + GROUND_OFFSET;
      body.current.setNextKinematicTranslation({ x: 0, y: startY, z: 0 });

      // Still update camera
      const bodyPosition = body.current.translation();
      _tempVec3A.set(0, bodyPosition.y + 3, bodyPosition.z + 5);
      _tempVec3B.set(0, bodyPosition.y + 0.5, bodyPosition.z - 8);
      smoothedCameraPosition.lerp(_tempVec3A, CAMERA_LERP * delta);
      smoothedCameraTarget.lerp(_tempVec3B, CAMERA_LERP * delta);
      state.camera.position.copy(smoothedCameraPosition);
      state.camera.lookAt(smoothedCameraTarget);
      return;
    }

    const { forward, leftward, rightward, backward } = getKeys();
    const velocity = velocityRef.current;
    const position = body.current.translation();

    const isTucking = forward;
    const isBraking = backward;

    // Downhill acceleration (reduced when braking)
    if (!isBraking) {
      const downhillAccel = isTucking
        ? BASE_DOWNHILL_ACCEL + TUCK_ACCEL_BONUS
        : BASE_DOWNHILL_ACCEL;
      velocity.z -= downhillAccel * delta;
    }

    let speed = velocity.length();
    const speedRatio = Math.min(speed / MAX_SPEED, 1);
    const carveMultiplier = 1 - (speedRatio * HIGH_SPEED_TURN_PENALTY);
    const effectiveCarveAccel = BASE_CARVE_ACCEL * carveMultiplier;

    let targetLean = 0;
    let isCarving = false;
    let carvingIntensity = 0;

    // Braking - direct velocity reduction
    if (isBraking && speed > 2) {
      velocity.multiplyScalar(0.97);
      speed = velocity.length();
    }

    // Steering
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

    // Drag calculation based on stance
    if (speed > 0.1) {
      let dragCoeff = BASE_DRAG;
      if (isTucking) {
        dragCoeff = TUCK_DRAG;
      }

      let drag = dragCoeff * speed * speed;
      if (isCarving) {
        drag += CARVE_SPEED_DRAG * speed * speedRatio;
      }
      _tempVec3A.copy(velocity).normalize().multiplyScalar(-drag * delta);
      velocity.add(_tempVec3A);
    }

    // Debug logging (throttled)
    if (frameCountRef.current % 30 === 0) {
      console.log(`Speed: ${speed.toFixed(1)}, Tuck: ${isTucking}, Brake: ${isBraking}, Z: ${position.z.toFixed(0)}`);
    }

    if (speed > MAX_SPEED) {
      velocity.normalize().multiplyScalar(MAX_SPEED);
    }

    if (!leftward && !rightward && Math.abs(velocity.x) > 0.5) {
      const momentumTransfer = velocity.x * 0.02;
      velocity.z -= Math.abs(momentumTransfer);
    }

    velocity.x *= 0.97;

    const clampedIntensity = Math.min(carvingIntensity, 1);
    skierStateRef.current.isCarving = isCarving;
    skierStateRef.current.carvingIntensity = clampedIntensity;
    skierStateRef.current.speed = speed;
    skierStateRef.current.speedRatio = speedRatio;
    skierStateRef.current.leanAngle = currentLeanRef.current;

    frameCountRef.current++;
    if (frameCountRef.current % 3 === 0) {
      setSpeedRef.current(speed);
      updateWindRef.current(speedRatio);
      if (isCarving && carvingIntensity > 0.2) {
        playCarveRef.current(carvingIntensity);
      } else {
        stopCarveRef.current();
      }
    }

    const newX = position.x + velocity.x * delta;
    const newZ = position.z + velocity.z * delta;

    const terrainY = getTerrainHeight(newX, newZ);
    const newY = terrainY + GROUND_OFFSET;

    body.current.setNextKinematicTranslation({ x: newX, y: newY, z: newZ });

    const terrainNormal = getTerrainNormal(newX, newZ);
    if (speed > 0.5) {
      _tempVec3A.set(velocity.x, 0, velocity.z).normalize();
    } else {
      _tempVec3A.set(0, 0, -1);
    }
    const yawAngle = Math.atan2(_tempVec3A.x, _tempVec3A.z) + Math.PI;

    const slopeAngle = Math.acos(terrainNormal.y);
    const slopeDirection = Math.atan2(terrainNormal.x, terrainNormal.z);

    const pitchFromSlope = slopeAngle * Math.cos(slopeDirection - yawAngle);
    const rollFromSlope = slopeAngle * Math.sin(slopeDirection - yawAngle) * 0.5;

    _tempEuler.set(pitchFromSlope, yawAngle, rollFromSlope, "YXZ");
    _tempQuat.setFromEuler(_tempEuler);

    const currentRotation = body.current.rotation();
    _tempVec3A.set(currentRotation.x, currentRotation.y, currentRotation.z);
    const currentQuat = skierRotation;
    currentQuat.set(currentRotation.x, currentRotation.y, currentRotation.z, currentRotation.w);

    currentQuat.slerp(_tempQuat, 8 * delta);
    body.current.setNextKinematicRotation({
      x: currentQuat.x,
      y: currentQuat.y,
      z: currentQuat.z,
      w: currentQuat.w,
    });

    const bodyPosition = body.current.translation();
    particlePosition.set(bodyPosition.x, bodyPosition.y, bodyPosition.z);
    particleVelocity.copy(velocity);

    _tempVec3B.set(
      bodyPosition.x * 0.9,
      bodyPosition.y + 3,
      bodyPosition.z + 5
    );

    _tempVec3C.set(
      bodyPosition.x * 0.7,
      bodyPosition.y + 0.5,
      bodyPosition.z - 8
    );

    smoothedCameraPosition.lerp(_tempVec3B, CAMERA_LERP * delta);
    smoothedCameraTarget.lerp(_tempVec3C, CAMERA_LERP * delta);

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
          playGatePassRef.current();
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
      const hit = world.castRay(ray, 10, true) as { timeOfImpact: number } | null;

      if (hit && hit.timeOfImpact <= 1) {
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
        isCarving={skierStateRef.current.isCarving}
        carvingIntensity={skierStateRef.current.carvingIntensity}
        position={particlePosition}
        velocity={particleVelocity}
        leanAngle={skierStateRef.current.leanAngle}
      />

      <SkiTrails
        skierPosition={particlePosition}
        skierRotation={skierRotation}
        isMoving={skierStateRef.current.speed > 1}
        isCarving={skierStateRef.current.isCarving}
      />
    </>
  );
};

export default Skier;
