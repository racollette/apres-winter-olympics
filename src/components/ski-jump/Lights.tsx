export default function Lights() {
  return (
    <>
      <directionalLight
        castShadow
        position={[4, 10, 6]}
        intensity={1.5}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={1}
        shadow-camera-far={50}
        shadow-camera-top={25}
        shadow-camera-right={25}
        shadow-camera-bottom={-25}
        shadow-camera-left={-25}
      />
      <ambientLight intensity={0.5} />
    </>
  );
}
