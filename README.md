# PhysMark

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb)](https://react.dev/)

**Interactive Physics Simulations in Markdown** — Embed 3D physics, smooth animations, and mathematical visualizations directly in your documentation.

Part of [Mathematical Intuition for Polymath Engineers](https://github.com/ai2o-ecosystem/MathematicaL-Intuition-for-Polymath-Engineers) — a new kind of interactive textbook.

## ✨ Features

- 📝 **Markdown-Native** — Write simulations in simple JSON code blocks
- 🎮 **Interactive 3D Physics** — Real-time rigid body dynamics powered by Rapier.js
- 🎨 **Smooth 2D Animations** — Tween timelines with easing functions
- 🛤️ **Path Animations** — Objects following SVG paths
- 🔌 **Plugin Architecture** — Extensible for custom physics engines
- ⚡ **High Performance** — Optimized rendering with React Three Fiber
- 🎯 **Three Deployment Modes** — Web app, desktop app (Tauri), or VS Code extension

## 🚀 Quick Start

### Web Viewer (Standalone HTML)

The simplest way to view PhysMark documents:

```bash
# Open md-viewer.html in your browser and drag-drop any .md file
open md-viewer.html
```

### React Integration

```bash
pnpm install @physmark/reader @physmark/plugin-rapier
```

```tsx
import { PhysMarkReader } from '@physmark/reader';
import { RapierPlugin } from '@physmark/plugin-rapier';
import '@physmark/reader/style.css';

const App = () => (
  <PhysMarkReader
    content={markdownContent}
    plugins={{ rapier: RapierPlugin }}
  />
);
```

## 📝 Syntax Examples

### Type 1: 3D Physics Simulation

````markdown
```physmark
type: physics
gravity: [0, -9.81, 0]
duration: 8
loop: true
bodies:
  - type: dynamic
    shape: sphere
    position: [0, 8, 0]
    size: 0.5
    color: "#ef4444"
    restitution: 0.8
  - type: static
    shape: box
    position: [0, -0.5, 0]
    size: [10, 1, 10]
    color: "#10b981"
```
````

### Type 2: 2D Tween Animation

````markdown
```physmark
type: tween
width: 600
height: 200
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
```
````

### Type 3: SVG Path Animation

````markdown
```physmark
type: path
width: 600
height: 300
path: "M 50,150 C 150,50 300,250 500,150"
duration: 2000
loop: true
objects:
  - shape: circle
    radius: 16
    color: "#6366f1"
```
````

## 🏗️ Project Structure

```
physmark/
├── packages/
│   ├── core/              # Core types and abstractions
│   ├── reader/            # Markdown parser & React renderer
│   ├── plugin-rapier/     # 3D physics plugin (Rapier.js)
│   ├── theme/             # UI theme system
│   └── fs-adapter/        # File system utilities
├── apps/
│   ├── web/               # Web application (Vite + React)
│   ├── desktop/           # Desktop app (Tauri)
│   └── vscode-extension/  # VS Code extension
├── example/
│   ├── demo.md            # Full feature demonstration
│   └── test-features.md   # Testing playground
└── md-viewer.html         # Standalone HTML viewer (no build required)
```

## 🛠️ Development

```bash
# Install dependencies
pnpm install

# Run web app
pnpm dev

# Run desktop app
pnpm dev:desktop

# Build all packages
pnpm build

# Build specific target
pnpm build:web
pnpm build:desktop
pnpm build:vscode
```

## 📦 Packages

### Core Packages

- **@physmark/core** — Core types, interfaces, and plugin system
- **@physmark/reader** — Markdown parser and React renderer with KaTeX and syntax highlighting
- **@physmark/theme** — Design system and UI components

### Physics Engines

- **@physmark/plugin-rapier** — 3D rigid body physics (Rapier.js + React Three Fiber)

### Utilities

- **@physmark/fs-adapter** — File system adapters for different platforms

## 🎯 Use Cases

- 📚 **Interactive Textbooks** — Embed live physics demonstrations
- 📖 **Technical Documentation** — Visualize algorithms and data structures
- 🎓 **Educational Content** — Make STEM concepts tangible
- 🔬 **Research Papers** — Interactive figures and simulations
- 💡 **Engineering Notebooks** — Document experiments with live demos

## 🎨 Configuration Schema

### Physics Bodies

```typescript
{
  type?: "dynamic" | "static" | "kinematic"  // Default: dynamic
  shape: "sphere" | "box" | "capsule"
  position: [x, y, z]
  rotation?: [x, y, z, w]                    // Quaternion
  size?: number | [x, y, z]                  // Shape-dependent
  mass?: number
  restitution?: number                       // Bounciness (0-1)
  friction?: number
  color?: string                             // CSS color
  velocity?: [x, y, z]
  angularVelocity?: [x, y, z]
}
```

### Tween Timeline

```typescript
{
  target: string                             // Target object ID
  duration: number                           // Milliseconds
  easing?: string                            // Easing function name
  delay?: number                             // Start delay in ms
  x?: number
  y?: number
  rotation?: number                          // Radians
  opacity?: number
}
```

### Available Easing Functions

- Linear: `linear`
- Quad: `easeInQuad`, `easeOutQuad`, `easeInOutQuad`
- Cubic: `easeInCubic`, `easeOutCubic`, `easeInOutCubic`
- Sine: `easeInSine`, `easeOutSine`, `easeInOutSine`
- Bounce: `easeOutBounce`, `easeInBounce`, `easeInOutBounce`
- Elastic: `easeOutElastic`, `easeInElastic`, `easeInOutElastic`

## 🌐 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## 🤝 Contributing

Contributions are welcome! This project is the foundation for a new generation of interactive technical education.

```bash
# Fork and clone
git clone https://github.com/ai2o-ecosystem/physmark.git
cd physmark

# Create feature branch
git checkout -b feature/amazing-feature

# Make changes and test
pnpm install
pnpm dev

# Commit and push
git commit -m "Add amazing feature"
git push origin feature/amazing-feature
```

## 📄 License

MIT © 2024

## 🔗 Links

- 📖 [Full Documentation](./docs/)
- 🎮 [Live Demo](./example/demo.md)
- 📚 [Mathematical Intuition for Polymath Engineers](https://github.com/ai2o-ecosystem/MathematicaL-Intuition-for-Polymath-Engineers)
- 🐛 [Report Issues](https://github.com/ai2o-ecosystem/physmark/issues)

---

Built with ❤️ for engineers who think in motion
