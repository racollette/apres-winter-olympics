import { useGLTF, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useEffect, useMemo } from "react";
import * as THREE from "three";

type ModelProps = {
  modelName: string;
  nftId: string;
  playAnimation?: boolean;
};

export default function Model({
  modelName,
  nftId,
  playAnimation = false,
}: ModelProps) {
  const localURL = `/models/rex-idle-confident.gltf.glb`;
  const { scene, animations } = useGLTF(localURL);

  const meshRef = useRef<THREE.Group | null>(null);
  const mixer = useMemo(
    () => new THREE.AnimationMixer(scene as unknown as THREE.Object3D),
    [scene]
  );

  const textureA = useTexture(`/textures/${nftId}_1001.jpg`);
  const textureB = useTexture(`/textures/${nftId}_1002.jpg`);

  useEffect(() => {
    if (!scene) return;

    textureA.flipY = false;
    textureA.colorSpace = THREE.SRGBColorSpace;
    textureA.wrapS = THREE.RepeatWrapping;
    textureA.wrapT = THREE.RepeatWrapping;
    textureA.needsUpdate = true;

    textureB.flipY = false;
    textureB.colorSpace = THREE.SRGBColorSpace;
    textureB.wrapS = THREE.RepeatWrapping;
    textureB.wrapT = THREE.RepeatWrapping;
    textureB.needsUpdate = true;

    const materialsProcessed = new Set<string>();

    scene.traverse((child) => {
      const obj = child as any;
      if (!obj.isMesh && !obj.isSkinnedMesh) return;

      const materials = Array.isArray(obj.material) ? obj.material : [obj.material];

      materials.forEach((material: any) => {
        if (materialsProcessed.has(material.uuid)) return;
        materialsProcessed.add(material.uuid);

        const originalMap = material.map;
        const repeat = new THREE.Vector2(1, 1);
        const offset = new THREE.Vector2(0, 0);

        if (originalMap) {
          repeat.copy(originalMap.repeat);
          offset.copy(originalMap.offset);
        }

        const texture = material.name === "Shader_B" ? textureB : textureA;

        texture.repeat.copy(repeat);
        texture.offset.copy(offset);

        material.map = texture;
        material.metalness = 0.5;
        material.roughness = 1;
        material.needsUpdate = true;
      });
    });

  }, [scene, textureA, textureB]);

  useEffect(() => {
    if (playAnimation && animations.length > 0) {
      animations.forEach((clip) => {
        mixer.clipAction(
          clip as unknown as THREE.AnimationClip,
          scene as unknown as THREE.Object3D
        ).play();
      });
    } else {
      mixer.stopAllAction();
    }
  }, [playAnimation, animations, mixer, scene]);

  useFrame((_, delta) => {
    mixer.update(delta);
  });

  return (
    <primitive
      ref={meshRef}
      object={scene}
      scale={1}
      rotation={[0, Math.PI, 0]}
      position={[0, 0, 0]}
    />
  );
}
