import React, { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import Model from "../Model";
import { type Medalist } from "~/pages/podium";
import { Text3D, useTexture } from "@react-three/drei";

type MedalistProps = {
  player: Medalist;
  medal: "gold" | "silver" | "bronze";
};

const Medalist = ({ player, medal }: MedalistProps) => {
  const { model, number, handle } = player;

  const matcap = useTexture(`/textures/${medal}.png`);

  let dinoNumber = number;
  let modelString = model;
  if (
    model.includes("para") ||
    model.includes("spino") ||
    model.includes("dactyl")
  ) {
    modelString = "rex-idle-excited";
    dinoNumber = "5630";
  }

  return (
    <>
      <group position={[0, 0, 0]} castShadow>
        <Text3D
          scale={0.35}
          font="/fonts/Titan_One_Regular.json"
          position={[0.9, 1.75, 1]}
          rotation={[0, Math.PI, 0]}
        >
          {handle}
          <meshMatcapMaterial matcap={matcap} />
        </Text3D>
        <Model modelName={modelString} nftId={dinoNumber} />
      </group>
    </>
  );
};

export default Medalist;
