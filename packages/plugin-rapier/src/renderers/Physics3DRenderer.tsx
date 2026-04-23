/**
 * Physics3DRenderer.tsx — R3F 3D physics scene renderer
 */

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import { usePhysicsWorld, usePhysicsStep, BodyConfig } from '../engine/physics3d';

export interface Physics3DConfig {
  type: 'physics';
  gravity?: [number, number, number];
  bodies?: BodyConfig[];
  camera?: { position?: [number, number, number]; lookAt?: [number, number, number] };
  duration?: number;
  loop?: boolean;
}

export const Physics3DRenderer: React.FC<{ config: Physics3DConfig }> = ({ config }) => (
  <div style={{
    width: '100%', height: '480px',
    background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
    borderRadius: 12, overflow: 'hidden',
  }}>
    <Canvas
      shadows
      camera={{ position: config.camera?.position ?? [10, 10, 10], fov: 50 }}
      gl={{ antialias: true }}
    >
      <color attach="background" args={['#0f0c29']} />
      <fog attach="fog" args={['#0f0c29', 30, 80]} />
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[12, 18, 8]}
        intensity={2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={80}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
      />
      <pointLight position={[-4, 6, -4]} intensity={0.8} color="#818cf8" />
      <pointLight position={[8, 3, 8]} intensity={0.5} color="#34d399" />
      <Environment preset="night" />
      <OrbitControls
        target={config.camera?.lookAt ?? [0, 0, 0]}
        enableDamping
        dampingFactor={0.06}
      />
      <ContactShadows
        position={[0, -0.01, 0]}
        opacity={0.5}
        scale={25}
        blur={2.5}
        far={10}
      />
      <PhysicsWorld config={config} />
    </Canvas>
  </div>
);

const PhysicsWorld: React.FC<{ config: Physics3DConfig }> = ({ config }) => {
  const [ready, setReady] = React.useState(false);
  const startTime = useRef(Date.now());
  const rev = useRef(0);

  React.useEffect(() => {
    import('@dimforge/rapier3d-compat').then(RAPIER =>
      RAPIER.init().then(() => setReady(true))
    );
  }, []);

  const onReset = () => {
    startTime.current = Date.now();
    rev.current += 1;
  };

  const { worldRef, bodiesRef, buildWorld } = usePhysicsWorld(
    { gravity: config.gravity, bodies: config.bodies },
    onReset,
    ready
  );

  if (!ready) return null;

  usePhysicsStep(worldRef);

  useFrame(() => {
    const elapsed = (Date.now() - startTime.current) / 1000;
    const duration = config.duration ?? 10;
    if (elapsed > duration && config.loop) {
      buildWorld();
    }
  });

  return (
    <>
      {bodiesRef.current.map((b, i) => (
        <PhysicsBody key={`${rev.current}-${i}`} body={b.rigidBody} config={b.config} />
      ))}
    </>
  );
};

const PhysicsBody: React.FC<{ body: RAPIER.RigidBody; config: BodyConfig }> = ({ body, config }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!meshRef.current) return;
    const t = body.translation();
    const r = body.rotation();
    meshRef.current.position.set(t.x, t.y, t.z);
    meshRef.current.quaternion.set(r.x, r.y, r.z, r.w);
  });

  const color = config.color ?? '#3b82f6';
  const size = config.size ?? 1;
  const metalness = config.metalness ?? 0.1;
  const roughness = config.roughness ?? 0.65;

  return (
    <mesh ref={meshRef} castShadow receiveShadow>
      {config.shape === 'sphere' && (
        <sphereGeometry args={[typeof size === 'number' ? size : size[0], 48, 48]} />
      )}
      {config.shape === 'box' && (
        <boxGeometry args={Array.isArray(size) ? size : [size, size, size]} />
      )}
      {config.shape === 'capsule' && (
        <capsuleGeometry args={[
          typeof size === 'number' ? size : size[0],
          Array.isArray(size) ? size[1] : size,
          16, 32,
        ]} />
      )}
      <meshStandardMaterial
        color={color}
        metalness={metalness}
        roughness={roughness}
        envMapIntensity={0.6}
      />
    </mesh>
  );
};
