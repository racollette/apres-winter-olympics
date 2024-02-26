import React, { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import Model from "../Model";
import { type Medalist } from "~/pages/podium";
import { Center, Text3D, useTexture } from "@react-three/drei";
import { shortAccount } from "~/utils/addresses";

type MedalistProps = {
  player: Medalist;
  medal: "gold" | "silver" | "bronze";
};

const Medalist = ({ player, medal }: MedalistProps) => {
  const { model, number, handle } = player;

  const matcap = useTexture(`/textures/${medal}.png`);

  let dinoNumber = number;
  let modelString = model;

  if (model.includes("para") || model.includes("spino")) {
    modelString = "rex-idle-excited";
    dinoNumber = "5630";
  }

  const chunks = handle?.split(" ");
  const displayName =
    handle && handle?.length >= 10
      ? chunks && chunks.length > 1
        ? chunks[0]
        : shortAccount(handle, 10)
      : handle;

  return (
    <>
      <group position={[0, 0, 0]} castShadow>
        <Center position={[0, 2, 0]}>
          <Text3D
            scale={0.35}
            font="/fonts/Titan_One_Regular.json"
            position={[1, 1.75, 1]}
            rotation={[0, Math.PI, 0]}
          >
            {displayName}
            <meshMatcapMaterial matcap={matcap} />
          </Text3D>
        </Center>
        <Model modelName={modelString} nftId={dinoNumber} />
      </group>
    </>
  );
};

export default Medalist;
