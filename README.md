# PhysMark

**Mathematical Intuition for Polymath Engineers** - Interactive physics simulations embedded in Markdown.

## What is PhysMark?

PhysMark is a markup language and rendering system that allows you to embed interactive 3D physics simulations directly in Markdown documents. Perfect for educational content, technical documentation, and interactive textbooks.

## Features

- 📝 **Markdown-native** - Write physics simulations in JSON blocks
- 🎮 **Interactive** - Real-time 3D physics powered by Rapier.js
- 🔌 **Plugin-based** - Extensible architecture for custom physics engines
- 🎨 **Beautiful** - Clean, modern UI inspired by best design practices
- ⚡ **Fast** - Optimized rendering with React Three Fiber

## Quick Start

### Installation

```bash
pnpm install @physmark/reader @physmark/plugin-rapier
```

### Usage

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

### Markdown Syntax

````markdown
# My Physics Lesson

```physmark
{
  "plugin": "rapier",
  "config": {
    "gravity": [0, -9.81, 0],
    "bodies": [
      {
        "type": "dynamic",
        "shape": "sphere",
        "position": [0, 5, 0],
        "mass": 2.0,
        "color": "#ef4444"
      }
    ]
  }
}
```
````

## Plugin Syntax: Rapier

### Configuration Schema

```typescript
{
  plugin: "rapier",
  config: {
    gravity?: [x, y, z],           // Default: [0, -9.81, 0]
    duration?: number,              // Simulation time in seconds
    camera?: {
      position?: [x, y, z],
      lookAt?: [x, y, z]
    },
    bodies: [
      {
        type?: "dynamic" | "static" | "kinematic",  // Default: dynamic
        shape: "sphere" | "box" | "capsule",
        position: [x, y, z],
        rotation?: [x, y, z, w],    // Quaternion
        size?: number | [x, y, z],  // Depends on shape
        mass?: number,
        restitution?: number,       // Bounciness (0-1)
        friction?: number,
        color?: string,             // CSS color
        velocity?: [x, y, z],
        angularVelocity?: [x, y, z]
      }
    ]
  }
}
```

### Body Types

- **dynamic**: Affected by forces and gravity
- **static**: Fixed in place, never moves
- **kinematic**: Moves programmatically, not affected by forces

### Shapes

- **sphere**: `size` = radius
- **box**: `size` = [width, height, depth]
- **capsule**: `size` = [radius, height]

## Development

```bash
# Install dependencies
pnpm install

# Run example
pnpm dev

# Build packages
pnpm build
```

## Project Structure

```
physmark/
├── packages/
│   ├── reader/          # Core Markdown parser & renderer
│   └── plugin-rapier/   # Rapier.js physics plugin
└── example/             # Demo application
```

## License

MIT

## Contributing

Contributions welcome! This is the foundation for "Mathematical Intuition for Polymath Engineers" - a new kind of interactive textbook.
