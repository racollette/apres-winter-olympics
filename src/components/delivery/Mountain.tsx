import React, { forwardRef, useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import {
  CuboidCollider,
  RapierRigidBody,
  RigidBody,
} from "@react-three/rapier";
import {
  Float,
  RoundedBox,
  Text3D,
  useGLTF,
  useTexture,
} from "@react-three/drei";
import useGame from "../../stores/useGame";
import Model from "../Model";

const ledgeObjects = [
  {
    positionX: 0,
    positionY: 0,
    positionZ: -50,
    sizeX: 8,
    sizeY: 1,
    sizeZ: 8,
    rotX: 0,
    rotY: 0,
    rotZ: 0,
    interaction: false,
  },
  {
    positionX: 12,
    positionY: 4,
    positionZ: -50,
    sizeX: 8,
    sizeY: 1,
    sizeZ: 8,
    rotX: 0,
    rotY: 0,
    rotZ: 0,
    interaction: false,
  },
  {
    positionX: 24,
    positionY: 8,
    positionZ: -50,
    sizeX: 8,
    sizeY: 1,
    sizeZ: 8,
    rotX: 0,
    rotY: 0,
    rotZ: 0,
    interaction: false,
  },
  {
    positionX: 36,
    positionY: 12,
    positionZ: -50,
    sizeX: 8,
    sizeY: 1,
    sizeZ: 8,
    rotX: 0,
    rotY: 0,
    rotZ: 0,
    interaction: false,
  },
  {
    positionX: 48,
    positionY: 16,
    positionZ: -50,
    sizeX: 8,
    sizeY: 1,
    sizeZ: 8,
    rotX: 0,
    rotY: 0,
    rotZ: 0,
    interaction: false,
  },
  {
    positionX: 60,
    positionY: 20,
    positionZ: -50.5,
    sizeX: 8,
    sizeY: 1,
    sizeZ: 8,
    rotX: 0,
    rotY: 0,
    rotZ: 0,
    interaction: false,
  },
  {
    positionX: 72,
    positionY: 24,
    positionZ: -50.5,
    sizeX: 8,
    sizeY: 1,
    sizeZ: 8,
    rotX: 0,
    rotY: 0,
    rotZ: 0,
    interaction: false,
  },

  {
    positionX: 0,
    positionY: 48,
    positionZ: -54.5,
    sizeX: 130,
    sizeY: 1,
    sizeZ: 16,
    rotX: 0,
    rotY: 0,
    rotZ: -0.3,
    interaction: "ankylo",
  },

  {
    positionX: -71,
    positionY: 72,
    positionZ: -58,
    sizeX: 8,
    sizeY: 1,
    sizeZ: 8,
    rotX: 0,
    rotY: 0,
    rotZ: 0,
    interaction: false,
  },
  {
    positionX: -60,
    positionY: 76,
    positionZ: -58,
    sizeX: 8,
    sizeY: 1,
    sizeZ: 8,
    rotX: 0,
    rotY: 0,
    rotZ: 0,
    interaction: false,
  },
  {
    positionX: -48,
    positionY: 80,
    positionZ: -57,
    sizeX: 8,
    sizeY: 1,
    sizeZ: 8,
    rotX: 0,
    rotY: 0,
    rotZ: 0,
    interaction: false,
  },
  {
    positionX: -36,
    positionY: 84,
    positionZ: -59,
    sizeX: 8,
    sizeY: 1,
    sizeZ: 8,
    rotX: 0,
    rotY: 0,
    rotZ: 0,
    interaction: false,
  },
  {
    positionX: 12,
    positionY: 100,
    positionZ: -59,
    sizeX: 85,
    sizeY: 1,
    sizeZ: 8,
    rotX: 0,
    rotY: 0,
    rotZ: 0.3,
    interaction: "bronto",
  },
  {
    positionX: 60,
    positionY: 116,
    positionZ: -62,
    sizeX: 8,
    sizeY: 1,
    sizeZ: 8,
    rotX: 0,
    rotY: 0,
    rotZ: 0,
    interaction: false,
  },
  {
    positionX: 72,
    positionY: 120,
    positionZ: -63,
    sizeX: 8,
    sizeY: 1,
    sizeZ: 8,
    rotX: 0,
    rotY: 0,
    rotZ: 0,
    interaction: false,
  },
  {
    positionX: 60,
    positionY: 124,
    positionZ: -63,
    sizeX: 8,
    sizeY: 1,
    sizeZ: 8,
    rotX: 0,
    rotY: 0,
    rotZ: 0,
    interaction: false,
  },
  {
    positionX: 48,
    positionY: 128,
    positionZ: -64,
    sizeX: 8,
    sizeY: 1,
    sizeZ: 8,
    rotX: 0,
    rotY: 0,
    rotZ: 0,
    interaction: false,
  },
  {
    positionX: 36,
    positionY: 132,
    positionZ: -64,
    sizeX: 8,
    sizeY: 1,
    sizeZ: 8,
    rotX: 0,
    rotY: 0,
    rotZ: 0,
    interaction: false,
  },
  {
    positionX: 24,
    positionY: 136,
    positionZ: -64,
    sizeX: 8,
    sizeY: 1,
    sizeZ: 8,
    rotX: 0,
    rotY: 0,
    rotZ: 0,
    interaction: false,
  },
  {
    positionX: 12,
    positionY: 140,
    positionZ: -64,
    sizeX: 8,
    sizeY: 1,
    sizeZ: 8,
    rotX: 0,
    rotY: 0,
    rotZ: 0,
    interaction: false,
  },
  {
    positionX: 0,
    positionY: 144,
    positionZ: -64,
    sizeX: 8,
    sizeY: 1,
    sizeZ: 8,
    rotX: 0,
    rotY: 0,
    rotZ: 0,
    interaction: false,
  },
  {
    positionX: -12,
    positionY: 148,
    positionZ: -65,
    sizeX: 8,
    sizeY: 1,
    sizeZ: 8,
    rotX: 0,
    rotY: 0,
    rotZ: 0,
    interaction: false,
  },
];

const ankyloPosition = { x: -45, y: 64, z: -102 };
const brontoPosition = { x: 47.5, y: 115, z: -108 };

const Mountain = () => {
  // const restart = useGame((state) => state.restart);
  // const randomSeed = useMemo(() => Math.random(), []);

  const ankyloRef = useRef<RapierRigidBody>(null);
  const brontoRef = useRef<RapierRigidBody>(null);
  const [ankyloObstacle, setAnkyloObstacle] = useState(false);
  const [brontoObstacle, setBrontoObstacle] = useState(false);

  const matcap = useTexture("/textures/ice_matcap.png");

  const cliff = useGLTF("/models/cliff.glb");
  const snowfield = useGLTF("/models/snowfield.glb");

  const triggerEvent = (
    interaction: string | boolean,
    colliderName: string | undefined
  ) => {
    if (interaction === "ankylo" && colliderName === "playerCollider") {
      // console.log("ankylo triggered");
      setAnkyloObstacle(true);
    }
    if (interaction === "bronto" && colliderName === "playerCollider") {
      // console.log("bronto triggered");
      setBrontoObstacle(true);
    }
  };

  const timeRef = useRef(0);

  useFrame((state, delta) => {
    timeRef.current += delta;

    if (ankyloObstacle === true) {
      ankyloRef.current?.applyImpulse({ x: 20, y: -8, z: 0 }, true);
    }
    if (brontoObstacle === true) {
      brontoRef.current?.applyImpulse({ x: -15, y: 0, z: 0 }, true);
    }
  });

  const reset = () => {
    setAnkyloObstacle(false);
    setBrontoObstacle(false);
    timeRef.current = 0;

    ankyloRef?.current?.setTranslation(
      { x: ankyloPosition.x, y: ankyloPosition.y, z: ankyloPosition.z },
      true
    );
    ankyloRef.current?.setRotation({ x: 0, y: -1, z: 0, w: 1 }, true);
    ankyloRef.current?.setLinvel({ x: 0, y: 0, z: 0 }, true);
    ankyloRef.current?.setAngvel({ x: 0, y: 0, z: 0 }, true);

    brontoRef?.current?.setTranslation(
      { x: brontoPosition.x, y: brontoPosition.y, z: brontoPosition.z },
      true
    );
    brontoRef.current?.setRotation({ x: 0, y: 1, z: 0, w: 1 }, true);
    brontoRef.current?.setLinvel({ x: 0, y: 0, z: 0 }, true);
    brontoRef.current?.setAngvel({ x: 0, y: 0, z: 0 }, true);
  };

  useEffect(() => {
    const unsubscribeReset = useGame.subscribe(
      (state) => state.phase,
      (value) => {
        if (value === "ready") reset();
      }
    );

    return () => {
      unsubscribeReset();
    };
  }, []);

  return (
    <>
      <Ankylo ref={ankyloRef} />
      <Bronto ref={brontoRef} />
      {/* {brontoObstacle && <Bronto />} */}
      <Floor />
      <group scale={[15, 10, 10]}>
        <primitive object={cliff.scene} position={[0, 6, -11]} />
        <RigidBody type="fixed">
          <CuboidCollider
            rotation={[-0.12, 0, 0]}
            position={[0, 7, -11.75]}
            args={[6.5, 7.5, 0.9]}
          />
        </RigidBody>
      </group>

      <group rotation={[0, 0, 0]} position={[0, 0, 0]}>
        {/* Platform */}
        <RigidBody type="fixed" restitution={0.2} friction={1}>
          <primitive
            scale={[44, 4, 24]}
            rotation={[Math.PI, 0, 0]}
            object={snowfield.scene}
            position={[-22, 150, -226]}
          />
        </RigidBody>
      </group>

      <group position={[0, 0, -50]}>
        {ledgeObjects.map((object, index) => (
          <RigidBody
            key={index}
            type="fixed"
            position={[
              object.positionX + 4 * (0.5 - Math.random()),
              object.positionY + 2 * (0.5 - Math.random()),
              object.positionZ,
            ]}
            onCollisionEnter={({ other }) => {
              triggerEvent(object.interaction, other?.colliderObject?.name);
            }}
          >
            <group
              position={[0, 0, 0]}
              rotation={[object.rotX, object.rotY, object.rotZ]}
            >
              <RoundedBox
                args={[object.sizeX, object.sizeY, object.sizeZ]}
                radius={0.5}
              >
                <meshMatcapMaterial matcap={matcap} />
              </RoundedBox>
            </group>
          </RigidBody>
        ))}
      </group>

      <Lodge />
    </>
  );
};

export default Mountain;

const Floor = () => {
  const snowfield1 = useGLTF("/models/snowfield1.glb");

  return (
    <group rotation={[0, 0, 0]} position={[0, 0, 0]}>
      {/* Platform */}
      <RigidBody type="fixed" restitution={0.2} friction={1}>
        <primitive
          scale={[48, 4, 8]}
          rotation={[Math.PI, 0, 0]}
          object={snowfield1.scene}
          position={[-25, -3.5, -90]}
        />
      </RigidBody>
    </group>
  );
};

const Lodge = () => {
  const [intersecting, setIntersection] = useState(false);
  const end = useGame((state) => state.end);

  const lodge = useGLTF("/models/lodge.glb");

  const matcap = useTexture("/textures/silver.png");

  useEffect(() => {
    if (intersecting) {
      end();
    }
  }, [intersecting, end]);

  return (
    <group scale={0.2} rotation={[0, 0, 0]} position={[-45, 100, -280]}>
      <Float floatIntensity={0.05} rotationIntensity={0.5}>
        <Text3D
          scale={20}
          font="/fonts/Titan_One_Regular.json"
          position={[150, 310, 500]}
          rotation={[0, 0, 0]}
        >
          The Lodge
          <meshMatcapMaterial matcap={matcap} />
        </Text3D>
      </Float>
      <primitive scale={[10, 10, 10]} object={lodge.scene} />
      <CuboidCollider
        sensor
        position={[0, 3700, -4300]}
        args={[200, 100, 200]}
        onIntersectionEnter={() => setIntersection(true)}
      />
    </group>
  );
};

const Ankylo = forwardRef<RapierRigidBody>((props, ref) => {
  return (
    <RigidBody
      scale={2}
      rotation={[0, -1.45, 0]}
      position={[ankyloPosition.x, ankyloPosition.y, ankyloPosition.z]}
      ref={ref}
      colliders={false}
    >
      <Model
        modelName="ankylo-gallop-confident"
        nftId={"7826"}
        playAnimation={true}
      />
      <CuboidCollider
        position={[0, 0.5, 0]}
        args={[1.5, 0.5, 0.75]}
        friction={0.25}
        name="ankyloCollider"
      />
    </RigidBody>
  );
});
Ankylo.displayName = "Ankylo";

const Bronto = forwardRef<RapierRigidBody>((props, ref) => {
  return (
    <RigidBody
      scale={1.75}
      rotation={[0, 1.5, 0]}
      position={[brontoPosition.x, brontoPosition.y, brontoPosition.z]}
      ref={ref}
      colliders={false}
    >
      <group>
        <Model
          modelName="bronto-gallop-confident"
          nftId={"7245"}
          playAnimation={true}
        />
        <CuboidCollider
          position={[0, 0.75, 0]}
          args={[1.5, 0.85, 1.5]}
          name="brontoCollider"
        />
      </group>
    </RigidBody>
  );
});
Bronto.displayName = "Bronto";
