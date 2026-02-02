import { useMemo, useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Text3D, useTexture } from "@react-three/drei";
import useGame from "../../stores/useGame";
import { getTerrainHeight } from "./Terrain";

const POLE_RADIUS = 0.08;
const POLE_HEIGHT = 2.5;
const GATE_HALF_WIDTH = 2.5;
const GATE_COUNT = 50;

export const GATE_POSITIONS: [number, number][] = [];
for (let i = 0; i < GATE_COUNT; i++) {
  const z = -20 - i * 22;
  const baseAmplitude = 12 + Math.sin(i * 0.25) * 8;
  const progressBonus = Math.min(i * 0.15, 6);
  const amplitude = baseAmplitude + progressBonus;
  const frequency = 0.8 + Math.sin(i * 0.15) * 0.3;
  const x = Math.sin(i * frequency + 0.3) * amplitude;
  GATE_POSITIONS.push([x, z]);
}
export const FINISH_LINE_Z = -1150;

const tempMatrix = new THREE.Matrix4();
const tempColor = new THREE.Color();

export default function Gates() {
  const matcapPurple = useTexture(
    "/textures/6C5DC3_352D66_5C4CAB_544CA5-256px.png"
  );

  const redPolesRef = useRef<THREE.InstancedMesh>(null);
  const bluePolesRef = useRef<THREE.InstancedMesh>(null);
  const markersRef = useRef<THREE.InstancedMesh>(null);

  const passedGateIndices = useGame((state) => state.passedGateIndices);

  const { poleGeometry, markerGeometry } = useMemo(() => {
    return {
      poleGeometry: new THREE.CylinderGeometry(POLE_RADIUS, POLE_RADIUS, POLE_HEIGHT, 6),
      markerGeometry: new THREE.CircleGeometry(0.25, 8),
    };
  }, []);

  // Initialize pole positions
  useEffect(() => {
    if (!redPolesRef.current || !bluePolesRef.current || !markersRef.current) return;

    let redIdx = 0;
    let blueIdx = 0;
    let markerIdx = 0;

    GATE_POSITIONS.forEach(([x, z], idx) => {
      const y = getTerrainHeight(x, z);
      const isRed = idx % 2 === 0;
      const polesRef = isRed ? redPolesRef : bluePolesRef;
      const poleIdx = isRed ? redIdx : blueIdx;

      // Left pole
      tempMatrix.makeTranslation(x - GATE_HALF_WIDTH, y + POLE_HEIGHT / 2, z);
      polesRef.current!.setMatrixAt(poleIdx * 2, tempMatrix);

      // Right pole
      tempMatrix.makeTranslation(x + GATE_HALF_WIDTH, y + POLE_HEIGHT / 2, z);
      polesRef.current!.setMatrixAt(poleIdx * 2 + 1, tempMatrix);

      if (isRed) redIdx++;
      else blueIdx++;

      // Markers (rotated to face up)
      const markerMatrix = new THREE.Matrix4();
      markerMatrix.makeRotationX(-Math.PI / 2);
      markerMatrix.setPosition(x - GATE_HALF_WIDTH, y + 0.05, z);
      markersRef.current!.setMatrixAt(markerIdx++, markerMatrix);

      markerMatrix.makeRotationX(-Math.PI / 2);
      markerMatrix.setPosition(x + GATE_HALF_WIDTH, y + 0.05, z);
      markersRef.current!.setMatrixAt(markerIdx++, markerMatrix);
    });

    redPolesRef.current.instanceMatrix.needsUpdate = true;
    bluePolesRef.current.instanceMatrix.needsUpdate = true;
    markersRef.current.instanceMatrix.needsUpdate = true;
  }, []);

  // Update marker colors based on passed gates
  useFrame(() => {
    if (!markersRef.current) return;

    let markerIdx = 0;
    GATE_POSITIONS.forEach((_, idx) => {
      const passed = passedGateIndices.has(idx);
      tempColor.set(passed ? "#00ff88" : "#ffffff");
      markersRef.current!.setColorAt(markerIdx++, tempColor);
      markersRef.current!.setColorAt(markerIdx++, tempColor);
    });

    if (markersRef.current.instanceColor) {
      markersRef.current.instanceColor.needsUpdate = true;
    }
  });

  const startY = getTerrainHeight(0, -5) + 2;
  const finishY = getTerrainHeight(0, FINISH_LINE_Z) + 2;

  const redCount = Math.ceil(GATE_COUNT / 2);
  const blueCount = Math.floor(GATE_COUNT / 2);

  return (
    <group>
      <Text3D
        font="/fonts/Titan_One_Regular.json"
        position={[-6, getTerrainHeight(-6, -10) + 3, -10]}
        size={0.8}
      >
        SLALOM
        <meshMatcapMaterial matcap={matcapPurple} />
      </Text3D>

      {/* Start gate */}
      <group position={[0, startY, -5]}>
        <mesh position={[-5, 0, 0]}>
          <boxGeometry args={[0.5, 5, 0.5]} />
          <meshMatcapMaterial matcap={matcapPurple} />
        </mesh>
        <mesh position={[5, 0, 0]}>
          <boxGeometry args={[0.5, 5, 0.5]} />
          <meshMatcapMaterial matcap={matcapPurple} />
        </mesh>
        <mesh position={[0, 2.5, 0]}>
          <boxGeometry args={[10, 0.5, 0.5]} />
          <meshMatcapMaterial matcap={matcapPurple} />
        </mesh>
      </group>

      {/* Red poles (instanced) */}
      <instancedMesh
        ref={redPolesRef}
        args={[poleGeometry, undefined, redCount * 2]}
      >
        <meshBasicMaterial color="#e63946" />
      </instancedMesh>

      {/* Blue poles (instanced) */}
      <instancedMesh
        ref={bluePolesRef}
        args={[poleGeometry, undefined, blueCount * 2]}
      >
        <meshBasicMaterial color="#1d3557" />
      </instancedMesh>

      {/* Markers (instanced) */}
      <instancedMesh
        ref={markersRef}
        args={[markerGeometry, undefined, GATE_COUNT * 2]}
      >
        <meshBasicMaterial />
      </instancedMesh>

      {/* Finish gate */}
      <group position={[0, finishY, FINISH_LINE_Z]}>
        <mesh position={[-5, 0, 0]}>
          <boxGeometry args={[0.5, 5, 0.5]} />
          <meshMatcapMaterial matcap={matcapPurple} />
        </mesh>
        <mesh position={[5, 0, 0]}>
          <boxGeometry args={[0.5, 5, 0.5]} />
          <meshMatcapMaterial matcap={matcapPurple} />
        </mesh>
        <mesh position={[0, 2.5, 0]}>
          <boxGeometry args={[10, 0.5, 0.5]} />
          <meshMatcapMaterial matcap={matcapPurple} />
        </mesh>
      </group>
    </group>
  );
}
