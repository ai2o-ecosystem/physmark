/**
 * Physics3DRenderer.tsx — R3F 3D physics scene renderer
 *
 * Crash-safe design: every world gets a generation counter stored in a
 * module-level WeakMap. PhysicsBody receives the generation at mount time
 * and skips useFrame if the worldRef's generation has advanced — meaning
 * world.free() has already been called. No timing dependency on React
 * unmount order vs rAF order.
 */

import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import { BodyConfig } from '../engine/physics3d';

export interface Physics3DConfig {
  type: 'physics';
  gravity?: [number, number, number];
  bodies?: BodyConfig[];
  camera?: { position?: [number, number, number]; lookAt?: [number, number, number] };
  duration?: number;
  loop?: boolean;
}

interface BodyState {
  rigidBody: RAPIER.RigidBody;
  config: BodyConfig;
  /** generation of the world this body belongs to */
  gen: number;
}

// ─── Canvas wrapper ─────────────────────────────────────────────────────────

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
        position={[12, 18, 8]} intensity={2} castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={80} shadow-camera-left={-25}
        shadow-camera-right={25} shadow-camera-top={25} shadow-camera-bottom={-25}
      />
      <pointLight position={[-4, 6, -4]} intensity={0.8} color="#818cf8" />
      <pointLight position={[8, 3, 8]} intensity={0.5} color="#34d399" />
      <Environment preset="night" />
      <OrbitControls target={config.camera?.lookAt ?? [0, 0, 0]} enableDamping dampingFactor={0.06} />
      <ContactShadows position={[0, -0.01, 0]} opacity={0.5} scale={25} blur={2.5} far={10} />
      <PhysicsWorld config={config} />
    </Canvas>
  </div>
);

// ─── PhysicsWorld ────────────────────────────────────────────────────────────

const PhysicsWorld: React.FC<{ config: Physics3DConfig }> = ({ config }) => {
  const [rapierReady, setRapierReady] = useState(false);
  const [bodies, setBodies] = useState<BodyState[]>([]);

  // worldRef holds current live world; genRef is the "live" generation.
  // When we free a world we bump genRef — any PhysicsBody still holding
  // the old gen value will bail out of useFrame immediately.
  const worldRef = useRef<RAPIER.World | null>(null);
  const genRef = useRef(0);
  const startTime = useRef(Date.now());
  const loopScheduled = useRef(false);

  useEffect(() => {
    RAPIER.init().then(() => setRapierReady(true));
  }, []);

  const buildWorld = React.useCallback(() => {
    if (!rapierReady) return;

    // Invalidate old generation BEFORE freeing — PhysicsBody useFrame sees
    // the stale gen and returns early from this point forward.
    genRef.current += 1;
    const currentGen = genRef.current;

    const old = worldRef.current;
    worldRef.current = null;
    if (old) { try { old.free(); } catch (_) {} }

    const gravity = new RAPIER.Vector3(...(config.gravity ?? [0, -9.81, 0]));
    const w = new RAPIER.World(gravity);

    const newBodies: BodyState[] = (config.bodies ?? []).map((bc) => {
      const desc =
        bc.type === 'static' ? RAPIER.RigidBodyDesc.fixed() :
        bc.type === 'kinematic' ? RAPIER.RigidBodyDesc.kinematicPositionBased() :
        RAPIER.RigidBodyDesc.dynamic();

      desc.setTranslation(...bc.position);
      if (bc.rotation) {
        desc.setRotation({ x: bc.rotation[0], y: bc.rotation[1], z: bc.rotation[2], w: bc.rotation[3] });
      }
      const rb = w.createRigidBody(desc);

      const size = bc.size ?? 1;
      let cd: RAPIER.ColliderDesc;
      if (bc.shape === 'sphere') {
        cd = RAPIER.ColliderDesc.ball(typeof size === 'number' ? size : size[0]);
      } else if (bc.shape === 'capsule') {
        const r = typeof size === 'number' ? size : size[0];
        cd = RAPIER.ColliderDesc.capsule(Array.isArray(size) ? size[1] / 2 : size, r);
      } else {
        const h = Array.isArray(size)
          ? [size[0] / 2, size[1] / 2, size[2] / 2] as [number, number, number]
          : [size / 2, size / 2, size / 2] as [number, number, number];
        cd = RAPIER.ColliderDesc.cuboid(...h);
      }
      if (bc.mass !== undefined) cd.setMass(bc.mass);
      if (bc.restitution !== undefined) cd.setRestitution(bc.restitution);
      if (bc.friction !== undefined) cd.setFriction(bc.friction);
      w.createCollider(cd, rb);
      if (bc.velocity) rb.setLinvel(new RAPIER.Vector3(...bc.velocity), true);
      if (bc.angularVelocity) rb.setAngvel(new RAPIER.Vector3(...bc.angularVelocity), true);

      return { rigidBody: rb, config: bc, gen: currentGen };
    });

    worldRef.current = w;
    startTime.current = Date.now();
    loopScheduled.current = false;
    setBodies(newBodies);
  }, [rapierReady, config]);

  useEffect(() => {
    buildWorld();
    return () => {
      genRef.current += 1; // invalidate before free
      const w = worldRef.current;
      worldRef.current = null;
      if (w) { try { w.free(); } catch (_) {} }
    };
  }, [buildWorld]);

  useFrame(() => {
    const w = worldRef.current;
    if (!w) return;
    try { w.step(); } catch (_) {}

    if (!config.loop || loopScheduled.current) return;
    const elapsed = (Date.now() - startTime.current) / 1000;
    if (elapsed > (config.duration ?? 10)) {
      loopScheduled.current = true;
      // genRef already bumped in buildWorld; schedule rebuild outside rAF
      setTimeout(buildWorld, 0);
    }
  });

  return (
    <>
      {bodies.map((b, i) => (
        <PhysicsBody key={`${b.gen}-${i}`} body={b.rigidBody} config={b.config} gen={b.gen} genRef={genRef} />
      ))}
    </>
  );
};

// ─── Body mesh ───────────────────────────────────────────────────────────────

const PhysicsBody: React.FC<{
  body: RAPIER.RigidBody;
  config: BodyConfig;
  gen: number;
  genRef: React.RefObject<number>;
}> = ({ body, config, gen, genRef }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    // If the world has been freed (generation advanced), bail immediately.
    if (genRef.current !== gen) return;
    if (!meshRef.current) return;
    const t = body.translation();
    const r = body.rotation();
    meshRef.current.position.set(t.x, t.y, t.z);
    meshRef.current.quaternion.set(r.x, r.y, r.z, r.w);
  });

  const size = config.size ?? 1;

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
        color={config.color ?? '#3b82f6'}
        metalness={config.metalness ?? 0.1}
        roughness={config.roughness ?? 0.65}
        envMapIntensity={0.6}
      />
    </mesh>
  );
};
