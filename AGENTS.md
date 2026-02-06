# AGENTS.md - Coding Guidelines for Nianshou Game

## Build & Development Commands

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Type check only
pnpm typecheck

# Build for production (runs typecheck + vite build)
pnpm build

# Preview production build
pnpm preview
```

**Package Manager**: Use `pnpm` exclusively. Do NOT use npm or yarn.

## Project Structure

```
src/
  scenes/       # Phaser scene classes (BootScene, GameScene, etc.)
  objects/      # Game objects extending Phaser classes (Player, Obstacles, Items)
  managers/     # Singleton managers (AudioManager, ScoreManager, etc.)
  ui/           # UI components (HUD, HealthBar, VirtualButtons)
  utils/        # Utility functions and constants
  types/        # TypeScript type definitions
  main.ts       # Entry point
  config.ts     # Game configuration
```

## Code Style Guidelines

### TypeScript Configuration
- **Target**: ES2020 with strict mode enabled
- **Module**: ESNext with `.js` extensions on imports
- **No emit**: TypeScript only for type checking (Vite handles compilation)

### Import Rules
```typescript
// Type imports must use 'type' keyword
import type { Scene } from 'phaser';
import type { PlayerState } from '../types/index.js';

// Value imports
import { PLAYER } from '../utils/constants.js';
import { AudioManager } from '../managers/AudioManager.js';
```

### Naming Conventions
- **Constants**: UPPER_CASE (`const GAME_WIDTH = 1280`)
- **Classes/Interfaces/Types**: PascalCase (`class Player`, `interface GameData`)
- **Variables/Functions**: camelCase (`let scrollSpeed`, `function clamp()`)
- **Private members**: Use `private` modifier, no underscore prefix
- **File names**: PascalCase for classes, camelCase for utilities

### Formatting
- **Indent**: 4 spaces (see .editorconfig)
- **Semicolons**: Required
- **Quotes**: Single quotes
- **Line endings**: CRLF (Windows style per .editorconfig)
- **Max line length**: ~100 characters

### Type Safety
- Enable `strict`, `noUnusedLocals`, `noUnusedParameters` in tsconfig
- Use explicit return types on public methods
- Prefer `type` over `interface` for simple unions
- Use `readonly` and `as const` for immutable data

### Error Handling Patterns
```typescript
// Guard clauses with early returns
if (!this.scene) return;

// Optional chaining for potentially undefined
this.wingSprite?.destroy();

// Non-null assertion when certain
this.pool.pop()!;

// Try-catch for animation creation
if (anims.exists('run')) {
    try {
        this.play('run');
    } catch (e) {
        console.warn('无法播放动画:', e);
    }
}
```

### Game Development Patterns

**Singleton Managers**:
```typescript
export class AudioManager {
    private static instance: AudioManager;
    private constructor() {}
    static getInstance(): AudioManager {
        if (!AudioManager.instance) {
            AudioManager.instance = new AudioManager();
        }
        return AudioManager.instance;
    }
}
```

**Extending Phaser Classes**:
```typescript
export class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene: Scene, x: number, y: number) {
        super(scene, x, y, 'texture_key');
        scene.add.existing(this);
        scene.physics.add.existing(this);
    }
}
```

**Scene Configuration**:
```typescript
export class GameScene extends Scene {
    constructor(config?: Phaser.Types.Scenes.SettingsConfig) {
        super(config || { key: 'GameScene' });
    }
}
```

### Constants Organization
- Group related constants in objects with `as const`
- Export individual constants for simple values
- Keep game balance numbers in `constants.ts`

### State Management
- Use explicit state types (`type PlayerState = 'IDLE' | 'RUNNING' | ...`)
- Private setters with public getters
- Boolean flags for simple states (isPaused, isGameOver)

### Animation Safety
Always check if textures/animations exist before creating/playing:
```typescript
if (this.scene.textures.exists('key') && !anims.exists('anim')) {
    // Create animation
}
```

## Pre-Commit Checklist

1. Run `pnpm typecheck` - must pass with no errors
2. Run `pnpm build` - must complete successfully
3. Check for unused imports or variables (TypeScript strict mode catches these)
4. Ensure all `console.log` statements are removed or changed to `console.warn` for errors

## Dependencies

- **Phaser**: ^3.90.0 (game engine)
- **TypeScript**: ^5.9.3 (language)
- **Vite**: ^5.1.6 (build tool)
- **pnpm**: Package manager

No testing framework is currently configured.
