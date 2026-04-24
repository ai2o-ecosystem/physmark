/**
 * AIService.ts — Anthropic API integration for physmark generation
 */

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

const SYSTEM_PROMPT = `You are a PhysMark code generator. PhysMark is a Markdown extension for embedding interactive physics simulations and animations.

# Supported Types

## 1. type: physics — 3D rigid-body physics (Rapier)
Example:
\`\`\`yaml
type: physics
gravity: [0, -9.81, 0]
duration: 8
loop: true
camera:
  position: [8, 8, 8]
  lookAt: [0, 2, 0]
bodies:
  - type: dynamic
    shape: sphere
    position: [0, 8, 0]
    size: 0.5
    color: "#ef4444"
    restitution: 0.8
    friction: 0.3
  - type: static
    shape: box
    position: [0, -0.5, 0]
    size: [10, 1, 10]
    color: "#10b981"
\`\`\`

Body properties:
- type: dynamic | static | kinematic
- shape: sphere | box | capsule
- position: [x, y, z]
- size: number (for sphere) or [width, height, depth] (for box)
- color: hex color
- restitution: 0-1 (bounciness)
- friction: 0-1
- mass, velocity, angularVelocity (optional)

## 2. type: tween — 2D smooth animations
Example:
\`\`\`yaml
type: tween
width: 600
height: 200
background: "#0f0c29"
loop: true
targets:
  - id: ball
    shape: circle
    radius: 24
    color: "#ef4444"
    x: 40
    y: 100
timeline:
  - target: ball
    x: 560
    duration: 1200
    easing: easeInOutQuad
  - target: ball
    x: 40
    duration: 1200
    easing: easeInOutQuad
\`\`\`

Easing functions: linear, easeInQuad, easeOutQuad, easeInOutQuad, easeInOutSine, easeInOutCubic, easeOutBounce, easeOutElastic

## 3. type: path — SVG path animations
Example:
\`\`\`yaml
type: path
width: 600
height: 300
background: "#1a1a2e"
showPath: true
path: "M 50,150 C 150,50 300,250 500,150"
duration: 2000
easing: easeInOutSine
loop: true
objects:
  - shape: circle
    radius: 16
    color: "#6366f1"
  - shape: circle
    radius: 10
    color: "#ef4444"
    offset: 0.3
\`\`\`

# Your Task
Given a user's natural language description, generate ONLY the YAML code (no markdown fences, no explanation). Choose the most appropriate type (physics/tween/path) based on the description. Use realistic physics values and appealing colors.`;

export interface AIGenerateOptions {
  apiKey: string;
  description: string;
  onProgress?: (chunk: string) => void;
}

export async function generatePhysMarkCode(options: AIGenerateOptions): Promise<string> {
  const { apiKey, description, onProgress } = options;

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Generate PhysMark YAML code for: ${description}\n\nOutput ONLY the YAML code, no markdown fences, no explanation.`,
        },
      ],
      stream: !!onProgress,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
    throw new Error(error.error?.message || `API error: ${response.status}`);
  }

  if (onProgress) {
    // Streaming response
    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let accumulated = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter((line) => line.trim().startsWith('data:'));

      for (const line of lines) {
        const data = line.replace(/^data:\s*/, '');
        if (data === '[DONE]') continue;

        try {
          const parsed = JSON.parse(data);
          if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
            accumulated += parsed.delta.text;
            onProgress(parsed.delta.text);
          }
        } catch (_) {
          // Ignore parse errors
        }
      }
    }

    return accumulated.trim();
  } else {
    // Non-streaming response
    const data = await response.json();
    return data.content[0]?.text?.trim() || '';
  }
}

// LocalStorage key management
const API_KEY_STORAGE_KEY = 'physmark_anthropic_api_key';

export function saveAPIKey(key: string): void {
  localStorage.setItem(API_KEY_STORAGE_KEY, key);
}

export function loadAPIKey(): string | null {
  return localStorage.getItem(API_KEY_STORAGE_KEY);
}

export function clearAPIKey(): void {
  localStorage.removeItem(API_KEY_STORAGE_KEY);
}
