export default function Lights() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[50, 100, 50]}
        intensity={1.5}
      />
      <hemisphereLight
        args={["#87CEEB", "#f0f5ff", 0.5]}
      />
    </>
  );
}
