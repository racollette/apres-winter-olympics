import { useRef, useMemo, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Trail } from "@react-three/drei";

type SkiTrailsProps = {
  skierPosition: THREE.Vector3;
  skierRotation: THREE.Quaternion;
  isMoving: boolean;
  isCarving: boolean;
};

const SKI_OFFSET_X = 0.25;
const SKI_OFFSET_Z = -0.2;

export default function SkiTrails({
  skierPosition,
  skierRotation,
  isMoving,
  isCarving,
}: SkiTrailsProps) {
  const leftSkiRef = useRef<THREE.Mesh>(null);
  const rightSkiRef = useRef<THREE.Mesh>(null);
  const leftOffset = useMemo(() => new THREE.Vector3(), []);
  const rightOffset = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    if (!leftSkiRef.current || !rightSkiRef.current) return;

    leftOffset.set(-SKI_OFFSET_X, 0, SKI_OFFSET_Z);
    leftOffset.applyQuaternion(skierRotation);
    leftSkiRef.current.position.copy(skierPosition).add(leftOffset);
    leftSkiRef.current.quaternion.copy(skierRotation);

    rightOffset.set(SKI_OFFSET_X, 0, SKI_OFFSET_Z);
    rightOffset.applyQuaternion(skierRotation);
    rightSkiRef.current.position.copy(skierPosition).add(rightOffset);
    rightSkiRef.current.quaternion.copy(skierRotation);
  });

  const trailWidth = isCarving ? 0.12 : 0.06;
  const trailColor = isCarving ? "#c8daf0" : "#e8f0f8";

  return (
    <>
      <Trail
        width={trailWidth}
        length={15}
        color={trailColor}
        attenuation={(t) => t}
        target={leftSkiRef as MutableRefObject<THREE.Object3D>}
      >
        <mesh ref={leftSkiRef}>
          <sphereGeometry args={[0.01, 4, 4]} />
          <meshBasicMaterial visible={false} />
        </mesh>
      </Trail>

      <Trail
        width={trailWidth}
        length={15}
        color={trailColor}
        attenuation={(t) => t}
        target={rightSkiRef as MutableRefObject<THREE.Object3D>}
      >
        <mesh ref={rightSkiRef}>
          <sphereGeometry args={[0.01, 4, 4]} />
          <meshBasicMaterial visible={false} />
        </mesh>
      </Trail>
    </>
  );
}
