/**
 * tween.ts — Tween animation engine with easing functions
 */

export type EasingFunction = (t: number) => number;

// Easing functions collection
export const easings: Record<string, EasingFunction> = {
  linear: (t) => t,
  easeInQuad: (t) => t * t,
  easeOutQuad: (t) => t * (2 - t),
  easeInOutQuad: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  easeInOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
  easeInOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 + (t - 1) * (2 * (t - 1)) * (2 * (t - 1))),
  easeOutBounce: (t) => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) return n1 * t * t;
    if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
    if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  },
  easeOutElastic: (t) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
};

export interface TweenKeyframe {
  target: string;
  duration: number;
  easing?: string;
  delay?: number;
  x?: number;
  y?: number;
  radius?: number;
  opacity?: number;
  rotation?: number;
  width?: number;
  height?: number;
}

export interface TweenState {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  rotation: number;
  width: number;
  height: number;
}

export class TweenEngine {
  private startTime: number = 0;
  private currentKeyframeIndex: number = 0;
  private keyframeStartTime: number = 0;

  constructor(
    private timeline: TweenKeyframe[],
    private initialStates: Map<string, TweenState>
  ) {}

  start() {
    this.startTime = Date.now();
    this.currentKeyframeIndex = 0;
    this.keyframeStartTime = this.startTime;
  }

  update(states: Map<string, TweenState>): boolean {
    if (this.currentKeyframeIndex >= this.timeline.length) return false;

    const now = Date.now();
    const kf = this.timeline[this.currentKeyframeIndex];
    const elapsed = now - this.keyframeStartTime - (kf.delay ?? 0);

    if (elapsed < 0) return true;

    const state = states.get(kf.target);
    const initial = this.initialStates.get(kf.target);
    if (!state || !initial) return true;

    const progress = Math.min(elapsed / kf.duration, 1);
    const easing = easings[kf.easing ?? 'linear'] ?? easings.linear;
    const t = easing(progress);

    if (kf.x !== undefined) state.x = initial.x + (kf.x - initial.x) * t;
    if (kf.y !== undefined) state.y = initial.y + (kf.y - initial.y) * t;
    if (kf.radius !== undefined) state.radius = initial.radius + (kf.radius - initial.radius) * t;
    if (kf.opacity !== undefined) state.opacity = initial.opacity + (kf.opacity - initial.opacity) * t;
    if (kf.rotation !== undefined) state.rotation = initial.rotation + (kf.rotation - initial.rotation) * t;
    if (kf.width !== undefined) state.width = initial.width + (kf.width - initial.width) * t;
    if (kf.height !== undefined) state.height = initial.height + (kf.height - initial.height) * t;

    if (progress >= 1) {
      this.currentKeyframeIndex++;
      this.keyframeStartTime = now;
      if (this.currentKeyframeIndex < this.timeline.length) {
        const nextKf = this.timeline[this.currentKeyframeIndex];
        const nextInitial = this.initialStates.get(nextKf.target);
        if (nextInitial) {
          const currentState = states.get(nextKf.target);
          if (currentState) {
            Object.assign(nextInitial, currentState);
          }
        }
      }
    }

    return true;
  }

  reset(states: Map<string, TweenState>) {
    this.initialStates.forEach((initial, target) => {
      const state = states.get(target);
      if (state) Object.assign(state, initial);
    });
    this.start();
  }
}
