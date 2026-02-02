import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const PARTICLE_COUNT = 20;
const PARTICLE_SIZE = 0.25;
const SPRAY_SPREAD = 0.6;
const PARTICLE_LIFETIME = 0.4;
const EMIT_RATE = 10;

type SnowSprayProps = {
  isCarving: boolean;
  carvingIntensity: number;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  leanAngle: number;
};

type Particle = {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
  active: boolean;
};

export default function SnowSpray({
  isCarving,
  carvingIntensity,
  position,
  velocity,
  leanAngle,
}: SnowSprayProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const particlesRef = useRef<Particle[]>([]);
  const emitTimerRef = useRef(0);
  const tempMatrix = useMemo(() => new THREE.Matrix4(), []);
  const tempColor = useMemo(() => new THREE.Color(), []);

  if (particlesRef.current.length === 0) {
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particlesRef.current.push({
        position: new THREE.Vector3(),
        velocity: new THREE.Vector3(),
        life: 0,
        maxLife: PARTICLE_LIFETIME,
        active: false,
      });
    }
  }

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    const particles = particlesRef.current;
    const intensity = isCarving ? carvingIntensity : 0;

    if (isCarving && intensity > 0.1) {
      emitTimerRef.current += delta;
      const emitInterval = 1 / (EMIT_RATE * intensity);

      while (emitTimerRef.current >= emitInterval) {
        emitTimerRef.current -= emitInterval;

        const inactiveParticle = particles.find((p) => !p.active);
        if (inactiveParticle) {
          const sprayDirection = leanAngle > 0 ? 1 : -1;

          inactiveParticle.position.set(
            position.x + (Math.random() - 0.5) * 0.3,
            position.y + 0.1,
            position.z + (Math.random() - 0.5) * 0.3
          );

          const baseSpeed = Math.abs(velocity.x) * 0.3 + 2;
          inactiveParticle.velocity.set(
            sprayDirection * baseSpeed * (0.5 + Math.random() * 0.5) + (Math.random() - 0.5) * SPRAY_SPREAD,
            2 + Math.random() * 2,
            -Math.abs(velocity.z) * 0.1 + (Math.random() - 0.5) * SPRAY_SPREAD
          );

          inactiveParticle.life = PARTICLE_LIFETIME * (0.7 + Math.random() * 0.3);
          inactiveParticle.maxLife = inactiveParticle.life;
          inactiveParticle.active = true;
        }
      }
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const particle = particles[i]!;

      if (particle.active) {
        particle.life -= delta;

        if (particle.life <= 0) {
          particle.active = false;
        } else {
          particle.velocity.y -= 15 * delta;
          particle.position.x += particle.velocity.x * delta;
          particle.position.y += particle.velocity.y * delta;
          particle.position.z += particle.velocity.z * delta;

          if (particle.position.y < position.y - 0.5) {
            particle.active = false;
          }
        }
      }

      if (particle.active) {
        const lifeRatio = particle.life / particle.maxLife;
        const scale = PARTICLE_SIZE * lifeRatio * (0.5 + intensity * 0.5);

        tempMatrix.makeScale(scale, scale, scale);
        tempMatrix.setPosition(particle.position);
        meshRef.current.setMatrixAt(i, tempMatrix);

        tempColor.setRGB(1, 1, 1);
        meshRef.current.setColorAt(i, tempColor);
      } else {
        tempMatrix.makeScale(0, 0, 0);
        meshRef.current.setMatrixAt(i, tempMatrix);
      }
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, PARTICLE_COUNT]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial
        color="#ffffff"
        transparent
        opacity={0.8}
        depthWrite={false}
      />
    </instancedMesh>
  );
}
