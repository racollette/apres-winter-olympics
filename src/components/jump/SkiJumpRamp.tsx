import * as THREE from "three";
import { RigidBody } from "@react-three/rapier";
import { useTexture } from "@react-three/drei";

/*
 * SKI JUMP GEOMETRY - First Principles
 *
 * Coordinate system:
 *   X = left/right
 *   Y = up/down (height)
 *   Z = forward/backward (negative Z = forward/down the hill)
 *
 * Layout:
 *   Start gate at (0, 40, 0)
 *   In-run slopes from (0, 40, 0) down to (0, 0, -80)
 *   Takeoff at z = -80
 *   Landing hill from (0, -3, -85) down to (0, -68, -245)
 */

const INRUN_LENGTH = 80;
const INRUN_HEIGHT = 40;
const INRUN_WIDTH = 4;

const LANDING_LENGTH = 160;
const LANDING_WIDTH = 15;
const LANDING_DROP = 65; // How much it drops
const LANDING_GAP = 5; // Gap between takeoff and landing start

// Calculate the angle of the in-run slope
const INRUN_ANGLE = Math.atan2(INRUN_HEIGHT, INRUN_LENGTH);
// Hypotenuse length for the tilted plane
const INRUN_HYPOTENUSE = Math.sqrt(INRUN_LENGTH ** 2 + INRUN_HEIGHT ** 2);

const LANDING_ANGLE = Math.atan2(LANDING_DROP, LANDING_LENGTH);
const LANDING_HYPOTENUSE = Math.sqrt(LANDING_LENGTH ** 2 + LANDING_DROP ** 2);

export const K_POINT_DISTANCE = 90;
export const TAKEOFF_Z = -INRUN_LENGTH;

export default function SkiJumpRamp() {
  const snowTexture = useTexture("/textures/Snow_002_COLOR.jpg");
  snowTexture.wrapS = THREE.RepeatWrapping;
  snowTexture.wrapT = THREE.RepeatWrapping;
  snowTexture.repeat.set(1, 8);

  return (
    <group>
      {/* IN-RUN SLOPE
          A box tilted to create the slope.
          Center is at midpoint: (0, 20, -40)
          Rotated around X axis so top surface slopes down toward -Z
      */}
      <RigidBody type="fixed" colliders="cuboid" friction={0.01}>
        <mesh
          position={[0, INRUN_HEIGHT / 2, -INRUN_LENGTH / 2]}
          rotation={[-INRUN_ANGLE, 0, 0]}
        >
          <boxGeometry args={[INRUN_WIDTH, 0.5, INRUN_HYPOTENUSE]} />
          <meshStandardMaterial
            map={snowTexture}
            color="#c8e8ff"
          />
        </mesh>
      </RigidBody>

      {/* TAKEOFF RAMP - slight upward kick at the end */}
      <RigidBody type="fixed" colliders="cuboid" friction={0.01}>
        <mesh
          position={[0, 0.5, -INRUN_LENGTH - 3]}
          rotation={[-0.15, 0, 0]}
        >
          <boxGeometry args={[INRUN_WIDTH, 0.5, 6]} />
          <meshStandardMaterial color="#90c8f0" />
        </mesh>
      </RigidBody>

      {/* LANDING HILL
          Starts below takeoff and continues downward
      */}
      <RigidBody type="fixed" colliders="cuboid" friction={0.3}>
        <mesh
          position={[0, -3 - LANDING_DROP / 2, -INRUN_LENGTH - LANDING_GAP - LANDING_LENGTH / 2]}
          rotation={[-LANDING_ANGLE, 0, 0]}
        >
          <boxGeometry args={[LANDING_WIDTH, 0.5, LANDING_HYPOTENUSE]} />
          <meshStandardMaterial
            map={snowTexture}
            color="#e8f4ff"
          />
        </mesh>
      </RigidBody>

      {/* FLAT CATCH ZONE at end of landing */}
      <RigidBody type="fixed" colliders="cuboid" friction={0.5}>
        <mesh
          position={[0, -3 - LANDING_DROP, -INRUN_LENGTH - LANDING_GAP - LANDING_LENGTH - 20]}
        >
          <boxGeometry args={[LANDING_WIDTH + 10, 0.5, 40]} />
          <meshStandardMaterial
            map={snowTexture}
            color="#d0e8ff"
          />
        </mesh>
      </RigidBody>

      {/* START GATE - Red bar at top */}
      <mesh position={[0, INRUN_HEIGHT + 1.5, 1]}>
        <boxGeometry args={[INRUN_WIDTH + 2, 2, 0.3]} />
        <meshStandardMaterial color="#ff4444" />
      </mesh>

      {/* DISTANCE MARKERS */}
      <DistanceMarkers />

      {/* DEBUG: Axis helper at origin */}
      <axesHelper args={[10]} />

      {/* DEBUG: Markers at key positions */}
      <mesh position={[0, INRUN_HEIGHT, 0]}>
        <sphereGeometry args={[1]} />
        <meshStandardMaterial color="green" />
      </mesh>
      <mesh position={[0, 0, -INRUN_LENGTH]}>
        <sphereGeometry args={[1]} />
        <meshStandardMaterial color="blue" />
      </mesh>
    </group>
  );
}

function DistanceMarkers() {
  const markers = [50, 70, 90, 110, 130];
  const startZ = -INRUN_LENGTH - LANDING_GAP;

  return (
    <group>
      {markers.map((distance) => {
        const t = distance / LANDING_LENGTH;
        const z = startZ - distance;
        const y = -3 - t * LANDING_DROP + 0.5;

        return (
          <mesh key={distance} position={[0, y, z]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.2, 0.2, LANDING_WIDTH, 8]} />
            <meshStandardMaterial
              color={distance === K_POINT_DISTANCE ? "#00ff00" : "#ff6600"}
            />
          </mesh>
        );
      })}
    </group>
  );
}
