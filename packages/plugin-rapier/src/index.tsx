/**
 * @physmark/plugin-rapier — PhysMark Motion Engine
 *
 * Unified animation/physics engine supporting:
 * - type: physics — 3D rigid-body physics (Rapier)
 * - type: tween — 2D tween animations (Canvas)
 * - type: path — SVG path animations (Canvas)
 *
 * Supports YAML syntax for cleaner, more readable configs.
 * Legacy JSON format still supported for backward compatibility.
 */

import React from 'react';
import RAPIER from '@dimforge/rapier3d-compat';
import yaml from 'js-yaml';
import type { PhysMarkPlugin, PhysMarkParsedBlock, PhysMarkRenderContext } from '@physmark/core';
import { Physics3DRenderer, Physics3DConfig } from './renderers/Physics3DRenderer';
import { TweenRenderer, TweenConfig } from './renderers/TweenRenderer';
import { PathRenderer, PathConfig } from './renderers/PathRenderer';

// Legacy ball-roll preset support
interface BallPresetConfig {
  radius?: number;
  color?: string;
  restitution?: number;
  friction?: number;
  metalness?: number;
  roughness?: number;
}

interface RampPresetConfig {
  angle?: number;
  length?: number;
  width?: number;
  color?: string;
}

interface LegacyConfig extends Physics3DConfig {
  scene?: string;
  ball?: BallPresetConfig;
  ramp?: RampPresetConfig;
}

type MotionConfig = Physics3DConfig | TweenConfig | PathConfig | LegacyConfig;

// Rapier initialization
let rapierReady = false;
let rapierInitPromise: Promise<void> | null = null;

function ensureRapier(): Promise<void> {
  if (rapierReady) return Promise.resolve();
  if (!rapierInitPromise) {
    rapierInitPromise = RAPIER.init().then(() => { rapierReady = true; });
  }
  return rapierInitPromise;
}

// Ball-roll preset builder
function quatFromZAngle(angle: number): [number, number, number, number] {
  return [0, 0, -Math.sin(angle / 2), Math.cos(angle / 2)];
}

function buildBallRollBodies(config: LegacyConfig): Physics3DConfig {
  const ball = config.ball ?? {};
  const ramp = config.ramp ?? {};
  const angleDeg = ramp.angle ?? 18;
  const angleRad = (angleDeg * Math.PI) / 180;
  const len = ramp.length ?? 10;
  const w = ramp.width ?? 2;
  const thickness = 0.25;
  const rampColor = ramp.color ?? '#6366f1';
  const radius = ball.radius ?? 0.35;
  const rot = quatFromZAngle(angleRad);

  const rampCx = (Math.cos(angleRad) * len) / 2;
  const rampCy = (Math.sin(angleRad) * len) / 2;

  const bodies = [
    { type: 'static' as const, shape: 'box' as const, position: [rampCx, rampCy, 0] as [number, number, number],
      rotation: rot, size: [len, thickness, w] as [number, number, number], color: rampColor, friction: 0.55, roughness: 0.6 },
    { type: 'static' as const, shape: 'box' as const, position: [rampCx, rampCy + thickness / 2 + 0.18, w / 2 + 0.1] as [number, number, number],
      rotation: rot, size: [len, 0.35, 0.12] as [number, number, number], color: rampColor, roughness: 0.6 },
    { type: 'static' as const, shape: 'box' as const, position: [rampCx, rampCy + thickness / 2 + 0.18, -(w / 2 + 0.1)] as [number, number, number],
      rotation: rot, size: [len, 0.35, 0.12] as [number, number, number], color: rampColor, roughness: 0.6 },
    { type: 'static' as const, shape: 'box' as const, position: [Math.cos(angleRad) * len + 3, 0, 0] as [number, number, number],
      size: [6, thickness, w + 0.6] as [number, number, number], color: '#10b981', friction: 0.85, roughness: 0.7 },
    { type: 'dynamic' as const, shape: 'sphere' as const,
      position: [Math.cos(angleRad) * len * 0.05 + radius * 0.5, Math.sin(angleRad) * len * 0.95 + radius + thickness / 2, 0] as [number, number, number],
      size: radius, color: ball.color ?? '#ef4444', restitution: ball.restitution ?? 0.25,
      friction: ball.friction ?? 0.55, metalness: ball.metalness ?? 0.5, roughness: ball.roughness ?? 0.25 },
  ];

  return { type: 'physics', gravity: config.gravity ?? [0, -9.81, 0], bodies, camera: config.camera, duration: config.duration, loop: config.loop };
}

// Plugin export
export const RapierPlugin: PhysMarkPlugin = {
  id: 'rapier',
  name: 'PhysMark Motion Engine',
  version: '0.3.0',
  syntaxDeclarations: [
    { language: 'physmark', description: 'Motion engine: physics/tween/path animations' },
  ],

  async initialize(_ctx: PhysMarkRenderContext) {
    await ensureRapier();
  },

  render(block: PhysMarkParsedBlock, _ctx: PhysMarkRenderContext): React.ReactElement {
    let config: MotionConfig;
    try {
      // Try YAML first, fallback to JSON
      const content = block.rawContent.trim();
      if (content.startsWith('{')) {
        config = (block.parsedConfig as MotionConfig) ?? JSON.parse(content);
      } else {
        config = yaml.load(content) as MotionConfig;
      }
    } catch (e) {
      return (
        <div style={{ padding: 16, color: 'red' }}>
          Invalid physmark config: {String(e).slice(0, 100)}
        </div>
      );
    }

    // Route by type field
    if ('type' in config) {
      if (config.type === 'tween') {
        return <TweenRenderer config={config as TweenConfig} />;
      }
      if (config.type === 'path') {
        return <PathRenderer config={config as PathConfig} />;
      }
      if (config.type === 'physics') {
        return <Physics3DRenderer config={config as Physics3DConfig} />;
      }
    }

    // Legacy: ball-roll preset
    const legacy = config as LegacyConfig;
    if (legacy.scene === 'ball-roll') {
      const physicsConfig = buildBallRollBodies(legacy);
      return <Physics3DRenderer config={physicsConfig} />;
    }

    // Legacy: bodies array without type field → physics
    if ('bodies' in config && Array.isArray((config as any).bodies)) {
      const legacyPhysicsConfig: Physics3DConfig = {
        type: 'physics',
        gravity: (config as any).gravity,
        bodies: (config as any).bodies,
        camera: (config as any).camera,
        duration: (config as any).duration,
        loop: (config as any).loop,
      };
      return <Physics3DRenderer config={legacyPhysicsConfig} />;
    }

    return (
      <div style={{ padding: 16, color: 'red' }}>
        Unknown physmark config format
      </div>
    );
  },
};
