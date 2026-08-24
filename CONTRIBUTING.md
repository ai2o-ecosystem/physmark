# Contributing to PhysMark

Thank you for your interest in contributing to PhysMark! This document provides guidelines and instructions for contributing.

## 🎯 Ways to Contribute

- 🐛 **Report bugs** — File detailed issues with reproduction steps
- 💡 **Suggest features** — Propose new animation types or physics engines
- 📝 **Improve documentation** — Fix typos, add examples, clarify usage
- 🔧 **Submit code** — Fix bugs, implement features, optimize performance
- 🎨 **Design** — Improve UI/UX, create themes
- 📦 **Write plugins** — Create new physics engine integrations

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+
- pnpm 8+
- Git

### Setup

```bash
# Fork and clone
git clone https://github.com/YOUR_USERNAME/physmark.git
cd physmark

# Install dependencies
pnpm install

# Run development server
pnpm dev
```

### Project Structure

```
physmark/
├── packages/              # Core packages (publishable to npm)
│   ├── core/             # Type definitions and plugin system
│   ├── reader/           # Main renderer component
│   ├── plugin-rapier/    # 3D physics plugin
│   ├── theme/            # Design system
│   └── fs-adapter/       # File system utilities
├── apps/                 # Application implementations
│   ├── web/              # Web app (demo/playground)
│   ├── desktop/          # Tauri desktop app
│   └── vscode-extension/ # VS Code extension
└── example/              # Example markdown files
```

## 📝 Code Style

- **TypeScript** — All code must be TypeScript with strict mode
- **Formatting** — Use Prettier defaults (no config file needed)
- **Naming** — camelCase for variables, PascalCase for types/components
- **Comments** — Explain "why", not "what"

## 🧪 Testing

```bash
# Run tests (when implemented)
pnpm test

# Type check
pnpm -r exec tsc --noEmit

# Build all packages
pnpm build
```

## 🔌 Writing a Plugin

Plugins extend PhysMark with new rendering engines. Here's the plugin interface:

```typescript
import type { PhysMarkPlugin } from '@physmark/core';

export const MyPlugin: PhysMarkPlugin = {
  name: 'my-plugin',
  
  canHandle(config: any): boolean {
    return config.type === 'my-type' || config.plugin === 'my-plugin';
  },
  
  render(config: any, container: HTMLElement): void {
    // Your rendering logic
    // Create canvas, WebGL context, or any DOM element
    // Animate, simulate, or render based on config
  },
  
  cleanup?(): void {
    // Optional: cleanup resources when component unmounts
  }
};
```

### Plugin Guidelines

- **Lightweight** — Keep bundle size minimal
- **Self-contained** — Don't pollute global scope
- **Responsive** — Respect container dimensions
- **Performance** — Use requestAnimationFrame efficiently
- **Cleanup** — Always implement cleanup to prevent memory leaks

## 📋 Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make your changes**
   - Write clear, focused commits
   - Follow the code style
   - Add tests if applicable

3. **Test your changes**
   ```bash
   pnpm build
   pnpm dev
   ```

4. **Commit with descriptive messages**
   ```bash
   git commit -m "feat: add SVG filter support to tween plugin"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/my-feature
   ```

6. **PR Guidelines**
   - Clear title summarizing the change
   - Description explaining what, why, and how
   - Link related issues
   - Add screenshots/videos for UI changes

## 🎨 Commit Message Format

Follow conventional commits:

- `feat:` — New feature
- `fix:` — Bug fix
- `docs:` — Documentation changes
- `style:` — Code style (formatting, no logic change)
- `refactor:` — Code refactoring
- `perf:` — Performance improvement
- `test:` — Adding/updating tests
- `chore:` — Maintenance tasks

Examples:
```
feat(plugin): add particle system support
fix(reader): resolve KaTeX rendering race condition
docs(readme): add tween animation examples
```

## 🐛 Reporting Bugs

When filing an issue, include:

- **Clear title** — Summarize the bug in one line
- **Reproduction** — Minimal markdown example that triggers the bug
- **Expected behavior** — What should happen
- **Actual behavior** — What actually happens
- **Environment** — Browser, OS, PhysMark version
- **Screenshots/Videos** — If applicable

## 💡 Feature Requests

For feature requests, explain:

- **Use case** — What problem does it solve?
- **Proposed solution** — How should it work?
- **Alternatives** — Other approaches you considered
- **Examples** — Similar features in other tools

## 📦 Publishing (Maintainers Only)

```bash
# Version bump
pnpm changeset

# Build packages
pnpm build

# Publish to npm
pnpm publish -r
```

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Thank You!

Your contributions make PhysMark better for everyone. We appreciate your time and effort!

---

Questions? Open an issue or reach out to the maintainers.
