import { EventEmitter, registerPlugin } from "../index";
import type { GameJoinAction, PlrJoinLeaveAction } from "../api/types";
import { ServerType } from "../api/types";

// Example 1: Simple logging plugin
registerPlugin({
    name: "Game Logger",
    id: "game-logger",
    forceEnable: true,
    configPrio: 0
}, (plugin) => {
    console.log("🎮 Game Logger plugin initialized");

    const subscriptions = [
        plugin.on("GAME_JOIN", (gameData) => {
            console.log(`📝 [${new Date().toISOString()}] Joined game: ${gameData.placeId} (${gameData.serverType})`);
        }),

        plugin.on("GAME_LEAVE", () => {
            console.log(`📝 [${new Date().toISOString()}] Left game`);
        }),

        plugin.on("PLAYER_JOIN", (playerAction) => {
            console.log(`📝 [${new Date().toISOString()}] Player joined: ${playerAction.name} (${playerAction.id})`);
        }),

        plugin.on("PLAYER_LEAVE", (playerAction) => {
            console.log(`📝 [${new Date().toISOString()}] Player left: ${playerAction.name} (${playerAction.id})`);
        })
    ];

    return () => subscriptions.forEach(sub => sub.unsubscribe());
});

// Example 2: Player counter plugin
registerPlugin({
    name: "Player Counter",
    id: "player-counter",
    forceEnable: true,
    configPrio: 1
}, (plugin) => {
    console.log("👥 Player Counter plugin initialized");

    let playerCount = 0;

    const subscriptions = [
        plugin.on("PLAYER_JOIN", () => {
            playerCount++;
            console.log(`👥 Players in game: ${playerCount}`);
        }),

        plugin.on("PLAYER_LEAVE", () => {
            playerCount = Math.max(0, playerCount - 1);
            console.log(`👥 Players in game: ${playerCount}`);
        }),

        plugin.on("GAME_LEAVE", () => {
            playerCount = 0;
            console.log("👥 Reset player count (left game)");
        })
    ];

    return () => subscriptions.forEach(sub => sub.unsubscribe());
});

// Example 3: Game session tracker
registerPlugin({
    name: "Session Tracker",
    id: "session-tracker",
    forceEnable: true,
    configPrio: 2
}, (plugin) => {
    console.log("⏱️ Session Tracker plugin initialized");

    let sessionStartTime: number | null = null;
    let totalPlayersSeen = 0;

    const subscriptions = [
        plugin.on("GAME_JOIN", () => {
            sessionStartTime = Date.now();
            totalPlayersSeen = 0;
            console.log("⏱️ Session started");
        }),

        plugin.on("GAME_LEAVE", () => {
            if (sessionStartTime) {
                const sessionDuration = Date.now() - sessionStartTime;
                const minutes = Math.floor(sessionDuration / 60000);
                const seconds = Math.floor((sessionDuration % 60000) / 1000);
                console.log(`⏱️ Session ended after ${minutes}m ${seconds}s. Total players seen: ${totalPlayersSeen}`);
            }
            sessionStartTime = null;
        }),

        plugin.on("PLAYER_JOIN", () => {
            totalPlayersSeen++;
        })
    ];

    return () => subscriptions.forEach(sub => sub.unsubscribe());
});

// Example 4: State change monitor
registerPlugin({
    name: "State Monitor",
    id: "state-monitor",
    forceEnable: true,
    configPrio: 3
}, (plugin) => {
    console.log("📊 State Monitor plugin initialized");

    const stateSub = plugin.currentState.onStateChange((state) => {
        console.log("📊 State Update:", {
            inGame: state.isInGame,
            placeId: state.placeId || "None",
            playerCount: state.players.length,
            serverType: state.serverType,
            joinTime: state.joinTime ? new Date(state.joinTime).toLocaleTimeString() : "None"
        });
    });

    return () => stateSub();
});

// Example 5: Custom event handler
registerPlugin({
    name: "Custom Handler",
    id: "custom-handler",
    forceEnable: true,
    configPrio: 4
}, (plugin) => {
    console.log("🔧 Custom Handler plugin initialized");

    // Custom logic for specific game types
    const subscriptions = [
        plugin.on("GAME_JOIN", (gameData) => {
            // Check if it's a specific game type
            if (gameData.placeId === "123456789") {
                console.log("🎯 Joined target game! Enabling special features...");
                // Enable special features for this game
            }
        }),

        plugin.on("PLAYER_JOIN", (playerAction) => {
            // Check for specific players
            if (playerAction.name.toLowerCase().includes("admin")) {
                console.log("👑 Admin player detected!");
            }
        })
    ];

    return () => subscriptions.forEach(sub => sub.unsubscribe());
});

// Example usage: Simulate game events
export function simulateGameSession() {
    console.log("\n🎮 Simulating game session...\n");

    // Join a game
    const gameData: GameJoinAction = {
        ipAddr: "192.168.1.100",
        placeId: "123456789",
        jobId: "session-abc123",
        serverType: ServerType.PUBLIC
    };
    EventEmitter.emitGameJoin(gameData);

    // Players join
    const players = [
        { name: "Player1", id: "111111111" },
        { name: "Player2", id: "222222222" },
        { name: "AdminUser", id: "333333333" },
        { name: "Player3", id: "444444444" }
    ];

    players.forEach((player, index) => {
        setTimeout(() => {
            const playerData: PlrJoinLeaveAction = {
                name: player.name,
                id: player.id,
                action: "JOIN"
            };
            EventEmitter.emitPlayerJoin(playerData);
        }, (index + 1) * 1000);
    });

    // Some players leave
    setTimeout(() => {
        const leaveData: PlrJoinLeaveAction = {
            name: "Player2",
            id: "222222222",
            action: "LEAVE"
        };
        EventEmitter.emitPlayerLeave(leaveData);
    }, 6000);

    // Leave the game
    setTimeout(() => {
        EventEmitter.emitGameLeave();
        console.log("\n✅ Game session simulation completed");
    }, 10000);
}

// Export for external use
export { EventEmitter }; 
