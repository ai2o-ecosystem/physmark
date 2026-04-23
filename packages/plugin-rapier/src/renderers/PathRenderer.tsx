/**
 * PathRenderer.tsx — SVG path animation renderer
 */

import React, { useRef, useEffect, useState } from 'react';
import { easings } from '../engine/tween';

export interface PathObject {
  shape: 'circle' | 'rect';
  radius?: number;
  width?: number;
  height?: number;
  color?: string;
  offset?: number;
}

export interface PathConfig {
  type: 'path';
  width?: number;
  height?: number;
  background?: string;
  showPath?: boolean;
  path: string;
  objects: PathObject[];
  duration: number;
  easing?: string;
  loop?: boolean;
}

export const PathRenderer: React.FC<{ config: PathConfig }> = ({ config }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [pathData, setPathData] = useState<{ length: number; element: SVGPathElement } | null>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const pathEl = svg.querySelector('path');
    if (!pathEl) return;

    const length = pathEl.getTotalLength();
    setPathData({ length, element: pathEl });
  }, [config.path]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !pathData) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const startTime = Date.now();
    const easing = easings[config.easing ?? 'linear'] ?? easings.linear;
    let animationId: number;

    const render = () => {
      const elapsed = Date.now() - startTime;
      const progress = (elapsed % config.duration) / config.duration;
      const t = easing(progress);

      ctx.fillStyle = config.background ?? '#1a1a2e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (config.showPath) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 2;
        ctx.stroke(new Path2D(config.path));
      }

      config.objects.forEach(obj => {
        const offset = obj.offset ?? 0;
        const objProgress = (t + offset) % 1;
        const distance = objProgress * pathData.length;
        const point = pathData.element.getPointAtLength(distance);

        ctx.save();
        ctx.translate(point.x, point.y);

        if (obj.shape === 'circle') {
          ctx.fillStyle = obj.color ?? '#3b82f6';
          ctx.beginPath();
          ctx.arc(0, 0, obj.radius ?? 16, 0, Math.PI * 2);
          ctx.fill();
        } else if (obj.shape === 'rect') {
          const w = obj.width ?? 32;
          const h = obj.height ?? 32;
          ctx.fillStyle = obj.color ?? '#3b82f6';
          ctx.fillRect(-w / 2, -h / 2, w, h);
        }

        ctx.restore();
      });

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [config, pathData]);

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={config.width ?? 600}
        height={config.height ?? 300}
        style={{ width: '100%', borderRadius: 12, display: 'block' }}
      />
      <svg ref={svgRef} style={{ display: 'none' }}>
        <path d={config.path} />
      </svg>
    </div>
  );
};
