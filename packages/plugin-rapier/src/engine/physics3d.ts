/**
 * physics3d.ts — Rapier world management with crash-safe cleanup
 */

import { useRef, useEffect, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import RAPIER from '@dimforge/rapier3d-compat';

export interface BodyConfig {
  type?: 'dynamic' | 'static' | 'kinematic';
  shape: 'sphere' | 'box' | 'capsule';
  position: [number, number, number];
  rotation?: [number, number, number, number];
  mass?: number;
  restitution?: number;
  friction?: number;
  color?: string;
  velocity?: [number, number, number];
  angularVelocity?: [number, number, number];
  size?: number | [number, number, number];
  metalness?: number;
  roughness?: number;
}

export interface Physics3DConfig {
  gravity?: [number, number, number];
  bodies?: BodyConfig[];
}

export interface BodyState {
  rigidBody: RAPIER.RigidBody;
  config: BodyConfig;
}

/**
 * Hook to manage Rapier world lifecycle with crash-safe cleanup
 */
export function usePhysicsWorld(
  config: Physics3DConfig,
  onReset?: () => void,
  ready: boolean = true
) {
  const worldRef = useRef<RAPIER.World | null>(null);
  const bodiesRef = useRef<BodyState[]>([]);

  const buildWorld = useCallback(() => {
    if (!ready) return;

    // Crash-safe cleanup: clear ref BEFORE freeing
    const old = worldRef.current;
    worldRef.current = null;
    if (old) {
      try {
        old.free();
      } catch (e) {
        console.warn('Failed to free old world:', e);
      }
    }

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
        const hh = Array.isArray(size) ? size[1] / 2 : size;
        cd = RAPIER.ColliderDesc.capsule(hh, r);
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
    bodiesRef.current = newBodies;
    onReset?.();
  }, [config, onReset, ready]);

  useEffect(() => {
    if (ready) buildWorld();
    return () => {
      // Crash-safe cleanup: clear ref BEFORE freeing
      const w = worldRef.current;
      worldRef.current = null;
      if (w) {
        try {
          w.free();
        } catch (e) {
          console.warn('Failed to free world on unmount:', e);
        }
      }
    };
  }, [buildWorld]);

  return { worldRef, bodiesRef, buildWorld };
}

/**
 * Hook to step the physics world each frame with crash-safe guards
 */
export function usePhysicsStep(worldRef: React.RefObject<RAPIER.World | null>) {
  useFrame(() => {
    const w = worldRef.current;
    if (!w) return;
    try {
      w.step();
    } catch (e) {
      console.warn('Physics step failed:', e);
    }
  });
}
