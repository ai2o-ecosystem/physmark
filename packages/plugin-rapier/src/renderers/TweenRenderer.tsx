/**
 * TweenRenderer.tsx — Canvas 2D tween animation renderer
 */

import React, { useRef, useEffect, useState } from 'react';
import { TweenEngine, TweenKeyframe, TweenState } from '../engine/tween';

export interface TweenTarget {
  id: string;
  shape: 'circle' | 'rect' | 'text';
  x: number;
  y: number;
  radius?: number;
  width?: number;
  height?: number;
  color?: string;
  opacity?: number;
  rotation?: number;
  text?: string;
  fontSize?: number;
}

export interface TweenConfig {
  type: 'tween';
  width?: number;
  height?: number;
  background?: string;
  targets: TweenTarget[];
  timeline: TweenKeyframe[];
  loop?: boolean;
}

export const TweenRenderer: React.FC<{ config: TweenConfig }> = ({ config }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [states] = useState(() => {
    const map = new Map<string, TweenState>();
    config.targets.forEach(t => {
      map.set(t.id, {
        x: t.x,
        y: t.y,
        radius: t.radius ?? 20,
        opacity: t.opacity ?? 1,
        rotation: t.rotation ?? 0,
        width: t.width ?? 50,
        height: t.height ?? 50,
      });
    });
    return map;
  });

  const [engine] = useState(() => {
    const initialStates = new Map<string, TweenState>();
    states.forEach((state, id) => {
      initialStates.set(id, { ...state });
    });
    return new TweenEngine(config.timeline, initialStates);
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    engine.start();
    let animationId: number;

    const render = () => {
      const running = engine.update(states);

      ctx.fillStyle = config.background ?? '#0f0c29';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      config.targets.forEach(target => {
        const state = states.get(target.id);
        if (!state) return;

        ctx.save();
        ctx.globalAlpha = state.opacity;
        ctx.translate(state.x, state.y);
        ctx.rotate(state.rotation);

        if (target.shape === 'circle') {
          ctx.fillStyle = target.color ?? '#3b82f6';
          ctx.beginPath();
          ctx.arc(0, 0, state.radius, 0, Math.PI * 2);
          ctx.fill();
        } else if (target.shape === 'rect') {
          ctx.fillStyle = target.color ?? '#3b82f6';
          ctx.fillRect(-state.width / 2, -state.height / 2, state.width, state.height);
        } else if (target.shape === 'text' && target.text) {
          ctx.fillStyle = target.color ?? '#ffffff';
          ctx.font = `${target.fontSize ?? 24}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(target.text, 0, 0);
        }

        ctx.restore();
      });

      if (!running && config.loop) {
        engine.reset(states);
      }

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [config, states, engine]);

  return (
    <canvas
      ref={canvasRef}
      width={config.width ?? 600}
      height={config.height ?? 200}
      style={{ width: '100%', borderRadius: 12, display: 'block' }}
    />
  );
};
