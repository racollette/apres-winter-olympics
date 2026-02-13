import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import Model from "../Model";
import {
  RigidBody,
  type RapierRigidBody,
} from "@react-three/rapier";
import { useKeyboardControls, useTexture } from "@react-three/drei";
import { useBobsled } from "../../stores/useBobsled";
import { getTrackCurve } from "./Track";
import { type ModelProps } from "./Experience";

const START_POSITION = { x: 0, y: 2, z: 5 };
const PUSH_DURATION = 3000; // 3 seconds to push

export default function Sled({
  species = "rex",
  mood = "confident",
  number = "3495",
}: ModelProps) {
  const body = useRef<RapierRigidBody | null>(null);
  const [, getKeys] = useKeyboardControls();

  const phase = useBobsled((state) => state.phase);
  const speed = useBobsled((state) => state.speed);
  const lean = useBobsled((state) => state.lean);
  const startTime = useBobsled((state) => state.startTime);
  const startPushing = useBobsled((state) => state.startPushing);
  const addPush = useBobsled((state) => state.addPush);
  const startRacing = useBobsled((state) => state.startRacing);
  const setLean = useBobsled((state) => state.setLean);
  const setSpeed = useBobsled((state) => state.setSpeed);
  const updateProgress = useBobsled((state) => state.updateProgress);
  const finish = useBobsled((state) => state.finish);

  const [trackProgress, setTrackProgress] = useState(0);
  const [smoothedCameraPosition] = useState(
    () => new THREE.Vector3(0, 10, 20)
  );
  const [smoothedCameraTarget] = useState(() => new THREE.Vector3());

  const curve = getTrackCurve();
  const matcap = useTexture("/textures/6C5DC3_352D66_5C4CAB_544CA5-256px.png");

  useFrame((state, delta) => {
    if (!body.current) return;

    const { leftward, rightward, jump } = getKeys();
    const bodyPosition = body.current.translation();

    // Handle ready/pushing phase
    if (phase === "ready" && jump) {
      startPushing();
    }

    if (phase === "pushing") {
      if (jump) {
        addPush();
      }

      // Check if push time is over
      if (Date.now() - startTime > PUSH_DURATION) {
        startRacing();
      }
    }

    // Handle racing phase - follow track spline
    if (phase === "racing") {
      // Update lean based on input
      let newLean = lean;
      if (leftward) newLean = Math.max(-1, lean - delta * 3);
      if (rightward) newLean = Math.min(1, lean + delta * 3);
      if (!leftward && !rightward) {
        // Return to center
        newLean = lean * (1 - delta * 5);
      }
      setLean(newLean);

      // Progress along track
      const progressSpeed = (speed / 50) * delta;
      const newProgress = Math.min(1, trackProgress + progressSpeed);
      setTrackProgress(newProgress);
      updateProgress(newProgress);

      // Get position on curve
      const point = curve.getPointAt(newProgress);
      const tangent = curve.getTangentAt(newProgress);

      // Apply lean offset perpendicular to track direction
      const up = new THREE.Vector3(0, 1, 0);
      const right = new THREE.Vector3().crossVectors(tangent, up).normalize();
      const leanOffset = right.multiplyScalar(newLean * 2);

      // Set sled position
      const newPosition = point.clone().add(leanOffset);
      newPosition.y += 1;
      body.current.setTranslation(
        { x: newPosition.x, y: newPosition.y, z: newPosition.z },
        true
      );

      // Set sled rotation to follow track
      const lookAt = point.clone().add(tangent);
      const matrix = new THREE.Matrix4().lookAt(
        newPosition,
        lookAt,
        up
      );
      const quaternion = new THREE.Quaternion().setFromRotationMatrix(matrix);

      // Add roll based on lean
      const rollEuler = new THREE.Euler(0, 0, -newLean * 0.3);
      const rollQuat = new THREE.Quaternion().setFromEuler(rollEuler);
      quaternion.multiply(rollQuat);

      body.current.setRotation(
        { x: quaternion.x, y: quaternion.y, z: quaternion.z, w: quaternion.w },
        true
      );

      // Speed management - lean into turns gives bonus
      const curvature = getCurvature(curve, newProgress);
      const optimalLean = curvature * 5;
      const leanDiff = Math.abs(newLean - optimalLean);
      const speedModifier = 1 - leanDiff * 0.1;

      const newSpeed = speed + (speedModifier - 0.5) * delta * 10;
      setSpeed(Math.max(10, Math.min(50, newSpeed)));

      // Check for finish
      if (newProgress >= 0.98) {
        const finalTime = (Date.now() - startTime) / 1000;
        finish(finalTime);
      }
    }

    // Camera follow
    const cameraOffset = new THREE.Vector3(0, 8, 15);
    const rotation = body.current.rotation();
    const bodyQuat = new THREE.Quaternion(
      rotation.x,
      rotation.y,
      rotation.z,
      rotation.w
    );
    const rotatedOffset = cameraOffset.clone().applyQuaternion(bodyQuat);

    const cameraPosition = new THREE.Vector3(
      bodyPosition.x + rotatedOffset.x,
      bodyPosition.y + rotatedOffset.y,
      bodyPosition.z + rotatedOffset.z
    );

    const cameraTarget = new THREE.Vector3(
      bodyPosition.x,
      bodyPosition.y,
      bodyPosition.z
    );

    smoothedCameraPosition.lerp(cameraPosition, 3 * delta);
    smoothedCameraTarget.lerp(cameraTarget, 3 * delta);

    state.camera.position.set(smoothedCameraPosition.x, smoothedCameraPosition.y, smoothedCameraPosition.z);
    state.camera.lookAt(smoothedCameraTarget.x, smoothedCameraTarget.y, smoothedCameraTarget.z);
  });

  useEffect(() => {
    const unsubscribePhase = useBobsled.subscribe(
      (state) => state.phase,
      (value) => {
        if (value === "ready") {
          body.current?.setTranslation(START_POSITION, false);
          body.current?.setLinvel({ x: 0, y: 0, z: 0 }, false);
          body.current?.setAngvel({ x: 0, y: 0, z: 0 }, false);
          body.current?.setRotation({ x: 0, y: 0, z: 0, w: 1 }, false);
          setTrackProgress(0);
        }
      }
    );

    return () => {
      unsubscribePhase();
    };
  }, []);

  return (
    <RigidBody
      ref={body}
      type="kinematicPosition"
      colliders="cuboid"
      position={[START_POSITION.x, START_POSITION.y, START_POSITION.z]}
    >
      <group castShadow>
        {/* Sled body */}
        <mesh position={[0, 0.3, 0]}>
          <boxGeometry args={[1.5, 0.5, 3]} />
          <meshMatcapMaterial matcap={matcap} />
        </mesh>
        {/* Front curved part */}
        <mesh position={[0, 0.5, -1.3]} rotation={[-0.3, 0, 0]}>
          <boxGeometry args={[1.5, 0.3, 0.8]} />
          <meshMatcapMaterial matcap={matcap} />
        </mesh>
        {/* Dino rider */}
        <group position={[0, 0.8, 0.3]} scale={0.8}>
          <Model modelName={`${species}-idle-${mood}`} nftId={number} />
        </group>
      </group>
    </RigidBody>
  );
}

function getCurvature(curve: THREE.CatmullRomCurve3, t: number): number {
  const delta = 0.01;
  const t1 = Math.max(0, t - delta);
  const t2 = Math.min(1, t + delta);

  const tangent1 = curve.getTangentAt(t1);
  const tangent2 = curve.getTangentAt(t2);

  const angleDiff = tangent1.angleTo(tangent2);
  return angleDiff / (t2 - t1);
}
