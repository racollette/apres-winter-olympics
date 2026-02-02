import { useMemo } from "react";
import { useTexture } from "@react-three/drei";
import { RigidBody, CuboidCollider } from "@react-three/rapier";
import * as THREE from "three";

// Track control points for a winding bobsled course
const TRACK_POINTS = [
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0, -5, -30),
  new THREE.Vector3(15, -15, -70),
  new THREE.Vector3(15, -25, -110),
  new THREE.Vector3(-10, -35, -150),
  new THREE.Vector3(-20, -45, -190),
  new THREE.Vector3(0, -55, -230),
  new THREE.Vector3(20, -65, -270),
  new THREE.Vector3(10, -75, -310),
  new THREE.Vector3(0, -80, -350),
];

export const getTrackCurve = () => {
  return new THREE.CatmullRomCurve3(TRACK_POINTS, false, "catmullrom", 0.5);
};

export default function Track() {
  const snowTexture = useTexture("/textures/Snow_002_COLOR.jpg");
  snowTexture.wrapS = snowTexture.wrapT = THREE.RepeatWrapping;
  snowTexture.repeat.set(2, 20);

  const curve = useMemo(() => getTrackCurve(), []);

  // Create track geometry from curve
  const trackGeometry = useMemo(() => {
    const frames = curve.computeFrenetFrames(200);
    const points = curve.getPoints(200);

    const trackWidth = 6;
    const wallHeight = 2;

    // Create positions for track bed and walls
    const bedPositions: number[] = [];
    const leftWallPositions: number[] = [];
    const rightWallPositions: number[] = [];

    for (let i = 0; i < points.length; i++) {
      const point = points[i]!;
      const normal = frames.normals[i]!;
      const binormal = frames.binormals[i]!;

      // Track bed vertices (curved U-shape cross-section)
      const halfWidth = trackWidth / 2;

      // Left edge
      bedPositions.push(
        point.x - normal.x * halfWidth,
        point.y - normal.y * halfWidth + binormal.y * 0.5,
        point.z - normal.z * halfWidth
      );
      // Center
      bedPositions.push(point.x, point.y - 0.5, point.z);
      // Right edge
      bedPositions.push(
        point.x + normal.x * halfWidth,
        point.y + normal.y * halfWidth + binormal.y * 0.5,
        point.z + normal.z * halfWidth
      );

      // Wall positions
      leftWallPositions.push(
        point.x - normal.x * halfWidth,
        point.y - normal.y * halfWidth + wallHeight,
        point.z - normal.z * halfWidth
      );
      rightWallPositions.push(
        point.x + normal.x * halfWidth,
        point.y + normal.y * halfWidth + wallHeight,
        point.z + normal.z * halfWidth
      );
    }

    return { points, frames, trackWidth };
  }, [curve]);

  return (
    <>
      {/* Track surface using tube geometry */}
      <mesh receiveShadow>
        <tubeGeometry args={[curve, 200, 3, 8, false]} />
        <meshStandardMaterial
          map={snowTexture}
          side={THREE.DoubleSide}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>

      {/* Colliders along the track */}
      {trackGeometry.points
        .filter((_, i) => i % 10 === 0)
        .map((point, i) => (
          <RigidBody key={i} type="fixed" position={[point.x, point.y, point.z]}>
            <CuboidCollider args={[4, 0.5, 2]} />
          </RigidBody>
        ))}

      {/* Start gate */}
      <group position={[0, 2, 5]}>
        <mesh position={[-4, 0, 0]}>
          <boxGeometry args={[0.3, 4, 0.3]} />
          <meshStandardMaterial color="#cc0000" />
        </mesh>
        <mesh position={[4, 0, 0]}>
          <boxGeometry args={[0.3, 4, 0.3]} />
          <meshStandardMaterial color="#cc0000" />
        </mesh>
        <mesh position={[0, 2, 0]}>
          <boxGeometry args={[8, 0.3, 0.3]} />
          <meshStandardMaterial color="#cc0000" />
        </mesh>
      </group>

      {/* Finish gate */}
      <group position={[0, -78, -345]}>
        <mesh position={[-4, 0, 0]}>
          <boxGeometry args={[0.3, 4, 0.3]} />
          <meshStandardMaterial color="#00cc00" />
        </mesh>
        <mesh position={[4, 0, 0]}>
          <boxGeometry args={[0.3, 4, 0.3]} />
          <meshStandardMaterial color="#00cc00" />
        </mesh>
        <mesh position={[0, 2, 0]}>
          <boxGeometry args={[8, 0.3, 0.3]} />
          <meshStandardMaterial color="#00cc00" />
        </mesh>
      </group>

      {/* Ground plane */}
      <RigidBody type="fixed">
        <mesh
          position={[0, -100, -175]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[200, 400]} />
          <meshStandardMaterial color="#e8f0f8" />
        </mesh>
        <CuboidCollider position={[0, -100, -175]} args={[100, 0.1, 200]} />
      </RigidBody>
    </>
  );
}
