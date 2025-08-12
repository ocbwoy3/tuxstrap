# TuxStrap

A modern event-driven plugin system for Roblox game management, built with TypeScript and Bun.

## Features

- **Event-Driven Architecture**: Direct event emission to plugins without RPC overhead
- **Type-Safe Events**: Full TypeScript support with proper type checking
- **Plugin System**: Easy-to-use plugin registration and management
- **State Management**: Real-time game state tracking and updates
- **Backward Compatibility**: Legacy hook system still supported

## Installation

```bash
bun install
```

## Usage

### Basic Setup

```typescript
import { EventEmitter, registerPlugin } from "./src/index";

// Register a plugin
registerPlugin({
    name: "My Plugin",
    id: "my-plugin",
    forceEnable: true,
    configPrio: 0
}, (plugin) => {
    // Subscribe to events
    const gameJoinSub = plugin.on("GAME_JOIN", (gameData) => {
        console.log("Joined game:", gameData.placeId);
    });

    // Cleanup when done
    return () => gameJoinSub.unsubscribe();
});

// Emit events
EventEmitter.emitGameJoin({
    ipAddr: "127.0.0.1",
    placeId: "123456789",
    jobId: "test-job-id",
    serverType: "PUBLIC"
});
```

### Available Events

- `GAME_JOIN`: Emitted when joining a game
- `GAME_LEAVE`: Emitted when leaving a game
- `PLAYER_JOIN`: Emitted when a player joins
- `PLAYER_LEAVE`: Emitted when a player leaves
- `BLOXSTRAP_RPC`: Emitted for Bloxstrap RPC events
- `STATE_CHANGE`: Emitted when game state changes

## Migration from BloxstrapRPC

If you're migrating from the old BloxstrapRPC API, see the [Migration Guide](docs/EVENT_SYSTEM_MIGRATION.md) for detailed instructions.

## Development

```bash
# Run the main application
bun run src/index.ts

# Test the event system
bun run src/test-event-system.ts
```

## Project Structure

```
src/
├── api/
│   ├── CurrentState.ts      # Game state management
│   ├── EventCollector.ts    # Main event collection system
│   ├── EventEmitter.ts      # Event emission interface
│   ├── Plugin.ts           # Plugin registration system
│   ├── RobloxLogHooks.ts   # Legacy hook system (deprecated)
│   └── types.ts            # TypeScript type definitions
├── plugins/
│   ├── default.ts          # Default plugin configuration
│   ├── example.ts          # Example plugin implementation
│   └── index.ts            # Plugin loading
└── index.ts                # Main entry point
```

This project was created using `bun init` in bun v1.2.18. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
