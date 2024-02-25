/* eslint-disable @typescript-eslint/no-explicit-any */
import { useGLTF, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useEffect, useState } from "react";
import {
  Euler,
  Vector2,
  Vector3,
  Texture,
  Group,
  AnimationMixer,
  Mesh,
  SRGBColorSpace,
} from "three";

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
  // weird bug with trice moods
  let model = modelName;
  const species = modelName.split("-")[0];
  const motion = modelName.split("-")[1];
  const mood = modelName.split("-")[2];
  if (species === "trice") {
    if (mood === "confident" || mood === "happy" || mood === "sad") {
      model = `trice-${motion}-excited`;
    }
  }

  const externalURL = `https://cdn.hellomoon.io/public/claynos/models/${model}.gltf.glb`;

  // const { scene, animations } = useGLTF(`/models/${modelName}.gltf.glb`);
  const { scene, animations } = useGLTF(externalURL);

  // console.log(scene);
  // console.log(animations);

  const meshRef = useRef<Group | null>(null);
  const [mixer] = useState(() => new AnimationMixer(scene));

  const textureShaderA = useRef<Texture | null>(null);
  const textureShaderB = useRef<Texture | null>(null);

  const [textureParamsShaderA, setTextureParamsShaderA] = useState<any>(null);
  const [textureParamsShaderB, setTextureParamsShaderB] = useState<any>(null);

  const loadTexture = (url: string) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const texture = useTexture(url);
    texture.flipY = false;

    return texture;
  };

  if (nftId) {
    textureShaderA.current = loadTexture(
      `https://cdn.hellomoon.io/public/claynos/textures/${nftId}_1001.jpg`
      // `textures/${nftId}_1001.jpg`
    );
    textureShaderB.current = loadTexture(
      `https://cdn.hellomoon.io/public/claynos/textures/${nftId}_1002.jpg`
      // `/textures/${nftId}_1002.jpg`
    );
  }

  useEffect(() => {
    if (scene) {
      meshRef.current = scene.children[0] as Group;

      meshRef.current.traverse((child) => {
        if (child instanceof Mesh) {
          const materials = Array.isArray(child.material)
            ? child.material
            : [child.material];

          materials.forEach((material) => {
            if (material.map) {
              const paramsShader = {
                wrapS: material.map.wrapS,
                wrapT: material.map.wrapT,
                repeat: new Vector2(
                  material.map.repeat.x,
                  material.map.repeat.y
                ),
                offset: new Vector2(
                  material.map.offset.x,
                  material.map.offset.y
                ),
              };

              if (material.name === "Shader_A") {
                setTextureParamsShaderA(paramsShader);
              } else if (material.name === "Shader_B") {
                setTextureParamsShaderB(paramsShader);
              }
            }
          });
        }
      });
    }
  }, [scene]);

  const applyTexture = (texture: Texture, materialName: string) => {
    if (textureParamsShaderA && materialName === "Shader_A") {
      texture.wrapS = textureParamsShaderA.wrapS;
      texture.wrapT = textureParamsShaderA.wrapT;
      texture.repeat.copy(textureParamsShaderA.repeat);
      texture.offset.copy(textureParamsShaderA.offset);
    } else if (textureParamsShaderB && materialName === "Shader_B") {
      texture.wrapS = textureParamsShaderB.wrapS;
      texture.wrapT = textureParamsShaderB.wrapT;
      texture.repeat.copy(textureParamsShaderB.repeat);
      texture.offset.copy(textureParamsShaderB.offset);
    }

    texture.colorSpace = SRGBColorSpace;
    texture.needsUpdate = true;

    meshRef.current?.traverse((child) => {
      if (child instanceof Mesh) {
        const materials = Array.isArray(child.material)
          ? child.material
          : [child.material];
        materials.forEach((material) => {
          if (material.name === materialName) {
            material.map = texture;
            material.metalness = 0.5;
            material.roughness = 1;
            material.needsUpdate = true;
          }
        });
      }
    });
  };

  useEffect(() => {
    if (textureParamsShaderA && textureShaderA.current) {
      applyTexture(textureShaderA.current, "Shader_A");
    }
    if (textureParamsShaderB && textureShaderB.current) {
      applyTexture(textureShaderB.current, "Shader_B");
    }
  }, [
    textureParamsShaderA,
    textureParamsShaderB,
    textureShaderA,
    textureShaderB,
  ]);

  useEffect(() => {
    if (scene) {
      meshRef.current = scene.children[0] as Group;
    }
  }, [scene]);

  useEffect(() => {
    if (playAnimation) {
      animations.forEach((clip) => mixer.clipAction(clip, scene).play());
    } else {
      mixer.stopAllAction();
    }
  }, [playAnimation]);

  useFrame((_, delta) => {
    mixer.update(delta);
  });

  return (
    <>
      <primitive
        ref={meshRef}
        object={scene}
        scale={1}
        rotation={[0, Math.PI, 0]}
        position={new Vector3(0, 0, 0)}
      />

      {animations &&
        animations.map((clip) => (
          <primitive
            key={clip.uuid}
            object={mixer.clipAction(clip, scene).play()}
          />
        ))}
    </>
  );
}
