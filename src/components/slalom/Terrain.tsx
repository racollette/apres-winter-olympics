import { useMemo } from "react";
import * as THREE from "three";
import { HeightfieldCollider, RigidBody } from "@react-three/rapier";

const TERRAIN_WIDTH = 120;
const TERRAIN_LENGTH = 1800;
const TERRAIN_Z_OFFSET = -850;
const SEGMENTS_X = 20;
const SEGMENTS_Z = 150;
const SLOPE_ANGLE = 0.22;
const NOISE_AMPLITUDE = 0.4;
const NOISE_FREQUENCY = 0.02;

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898 + seed * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function noise2D(x: number, z: number): number {
  const ix = Math.floor(x);
  const iz = Math.floor(z);
  const fx = x - ix;
  const fz = z - iz;

  const a = seededRandom(ix + iz * 57);
  const b = seededRandom(ix + 1 + iz * 57);
  const c = seededRandom(ix + (iz + 1) * 57);
  const d = seededRandom(ix + 1 + (iz + 1) * 57);

  const ux = fx * fx * (3 - 2 * fx);
  const uz = fz * fz * (3 - 2 * fz);

  return a * (1 - ux) * (1 - uz) + b * ux * (1 - uz) + c * (1 - ux) * uz + d * ux * uz;
}

function fbm(x: number, z: number, octaves = 3): number {
  let value = 0;
  let amplitude = 1;
  let frequency = 1;
  let maxValue = 0;

  for (let i = 0; i < octaves; i++) {
    value += amplitude * noise2D(x * frequency, z * frequency);
    maxValue += amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }

  return value / maxValue;
}

export function getTerrainHeight(x: number, z: number): number {
  const courseProgress = Math.max(0, -z / TERRAIN_LENGTH);
  const baseSlope = courseProgress * TERRAIN_LENGTH * Math.tan(SLOPE_ANGLE);

  const noiseX = (x + TERRAIN_WIDTH / 2) * NOISE_FREQUENCY;
  const noiseZ = Math.abs(z) * NOISE_FREQUENCY;
  const noiseValue = (fbm(noiseX, noiseZ) - 0.5) * 2 * NOISE_AMPLITUDE;

  return -baseSlope + noiseValue;
}

export default function Terrain() {
  const { geometry, heightfieldHeights } = useMemo(() => {
    const geo = new THREE.BufferGeometry();

    const vertices: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];
    const heights: number[][] = [];

    for (let iz = 0; iz <= SEGMENTS_Z; iz++) {
      const row: number[] = [];
      for (let ix = 0; ix <= SEGMENTS_X; ix++) {
        const x = (ix / SEGMENTS_X - 0.5) * TERRAIN_WIDTH;
        const z = (iz / SEGMENTS_Z - 0.5) * TERRAIN_LENGTH + TERRAIN_Z_OFFSET;
        const y = getTerrainHeight(x, z);

        vertices.push(x, y, z);
        uvs.push(ix / SEGMENTS_X * 8, iz / SEGMENTS_Z * 40);
        row.push(y);
      }
      heights.push(row);
    }

    for (let iz = 0; iz < SEGMENTS_Z; iz++) {
      for (let ix = 0; ix < SEGMENTS_X; ix++) {
        const a = iz * (SEGMENTS_X + 1) + ix;
        const b = a + 1;
        const c = a + (SEGMENTS_X + 1);
        const d = c + 1;

        indices.push(a, c, b);
        indices.push(b, c, d);
      }
    }

    geo.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();

    const rowCount = SEGMENTS_Z + 1;
    const colCount = SEGMENTS_X + 1;
    const hfHeights: number[] = [];

    for (let row = 0; row < rowCount; row++) {
      for (let col = 0; col < colCount; col++) {
        hfHeights.push(heights[row]![col]!);
      }
    }

    return {
      geometry: geo,
      heightfieldHeights: hfHeights,
    };
  }, []);

  const snowMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: "#f5f9fc",
    });
  }, []);

  return (
    <group>
      <mesh receiveShadow>
        <primitive object={geometry} attach="geometry" />
        <primitive object={snowMaterial} attach="material" />
      </mesh>

      <RigidBody type="fixed" colliders={false} friction={0.1} restitution={0}>
        <HeightfieldCollider
          args={[
            SEGMENTS_Z,
            SEGMENTS_X,
            heightfieldHeights,
            { x: TERRAIN_WIDTH, y: 1, z: TERRAIN_LENGTH },
          ]}
          position={[0, 0, TERRAIN_Z_OFFSET]}
        />
      </RigidBody>
    </group>
  );
}
