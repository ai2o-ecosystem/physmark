/**
 * Physics3DRenderer.tsx — R3F 3D physics scene renderer
 *
 * Crash-safe design:
 * - RAPIER.init() completes before any World is created
 * - world.free() always clears worldRef FIRST, so no stale pointer
 * - Loop reset is two-phase: clear bodies state (unmounts PhysicsBody) →
 *   useEffect sees resetKey change → builds new world with fresh RigidBodies
 *   This guarantees PhysicsBody.useFrame never touches a freed body.
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
}

// ─── Canvas wrapper ────────────────────────────────────────────────────────

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

// ─── PhysicsWorld ──────────────────────────────────────────────────────────

const PhysicsWorld: React.FC<{ config: Physics3DConfig }> = ({ config }) => {
  const [rapierReady, setRapierReady] = useState(false);
  // resetKey increment triggers useEffect to rebuild world
  const [resetKey, setResetKey] = useState(0);
  // bodies state drives rendering; empty = no PhysicsBody mounted
  const [bodies, setBodies] = useState<BodyState[]>([]);

  const worldRef = useRef<RAPIER.World | null>(null);
  const startTime = useRef(Date.now());
  // true while bodies===[] and we're waiting for useEffect to rebuild
  const rebuilding = useRef(false);

  // ── Init Rapier WASM once
  useEffect(() => {
    RAPIER.init().then(() => setRapierReady(true));
  }, []);

  // ── Build world whenever Rapier is ready or resetKey changes
  useEffect(() => {
    if (!rapierReady) return;

    // Crash-safe free
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
      return { rigidBody: rb, config: bc };
    });

    worldRef.current = w;
    startTime.current = Date.now();
    rebuilding.current = false;
    setBodies(newBodies);

    return () => {
      // Cleanup on unmount or before next effect run
      const w2 = worldRef.current;
      worldRef.current = null;
      setBodies([]);
      if (w2) { try { w2.free(); } catch (_) {} }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rapierReady, resetKey]);

  // ── Step world + handle loop
  useFrame(() => {
    const w = worldRef.current;
    if (w) {
      try { w.step(); } catch (_) {}
    }

    if (!config.loop || rebuilding.current) return;
    const elapsed = (Date.now() - startTime.current) / 1000;
    if (elapsed > (config.duration ?? 10)) {
      // Phase 1: free world now so existing RigidBody pointers become invalid,
      // clear bodies state → PhysicsBody components unmount this frame
      rebuilding.current = true;
      const old = worldRef.current;
      worldRef.current = null;
      if (old) { try { old.free(); } catch (_) {} }
      setBodies([]);
      // Phase 2: after React unmounts old bodies, increment resetKey to rebuild
      setTimeout(() => setResetKey(k => k + 1), 0);
    }
  });

  return (
    <>
      {bodies.map((b, i) => (
        <PhysicsBody key={`${resetKey}-${i}`} body={b.rigidBody} config={b.config} />
      ))}
    </>
  );
};

// ─── Body mesh ─────────────────────────────────────────────────────────────

const PhysicsBody: React.FC<{ body: RAPIER.RigidBody; config: BodyConfig }> = ({ body, config }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!meshRef.current) return;
    // body is guaranteed valid: it's unmounted before world.free() takes effect
    const t = body.translation();
    const r = body.rotation();
    meshRef.current.position.set(t.x, t.y, t.z);
    meshRef.current.quaternion.set(r.x, r.y, r.z, r.w);
  });

  const color = config.color ?? '#3b82f6';
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
        color={color}
        metalness={config.metalness ?? 0.1}
        roughness={config.roughness ?? 0.65}
        envMapIntensity={0.6}
      />
    </mesh>
  );
};
