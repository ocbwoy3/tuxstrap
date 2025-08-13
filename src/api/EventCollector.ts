import type {
	PlrJoinLeaveAction,
	GameJoinAction,
	BloxstrapRPCAction,
	GameState,
	TeleportAction
} from "./types";
import { currentStateManager } from "./CurrentState";

export type EventType =
	| "GAME_JOIN"
	| "GAME_LEAVE"
	| "PLAYER_JOIN"
	| "PLAYER_LEAVE"
	| "TELEPORT"
	| "BLOXSTRAP_RPC"
	| "STATE_CHANGE";

export type EventData = {
	GAME_JOIN: GameJoinAction;
	GAME_LEAVE: void;
	PLAYER_JOIN: PlrJoinLeaveAction;
	PLAYER_LEAVE: PlrJoinLeaveAction;
	BLOXSTRAP_RPC: BloxstrapRPCAction;
	STATE_CHANGE: GameState;
	TELEPORT: TeleportAction;
};

export type EventCallback<T extends EventType> = (data: EventData[T]) => void;

export type EventSubscription = {
	unsubscribe: () => void;
};

class EventCollector {
	private listeners: Map<EventType, Set<EventCallback<any>>> = new Map();

	/**
	 * Subscribe to an event type
	 */
	public on<T extends EventType>(
		eventType: T,
		callback: EventCallback<T>
	): EventSubscription {
		if (!this.listeners.has(eventType)) {
			this.listeners.set(eventType, new Set());
		}

		const eventListeners = this.listeners.get(eventType)!;
		eventListeners.add(callback);

		return {
			unsubscribe: () => {
				eventListeners.delete(callback);
				if (eventListeners.size === 0) {
					this.listeners.delete(eventType);
				}
			}
		};
	}

	/**
	 * Emit an event to all subscribed listeners
	 */
	public emit<T extends EventType>(eventType: T, data: EventData[T]): void {
		const eventListeners = this.listeners.get(eventType);
		if (eventListeners) {
			eventListeners.forEach((callback) => {
				try {
					callback(data);
				} catch (error) {
					console.error(
						`Error in event listener for ${eventType}:`,
						error
					);
				}
			});
		}
	}

	/**
	 * Emit a game join event
	 */
	public emitGameJoin(gameData: GameJoinAction): void {
		this.emit("GAME_JOIN", gameData);
		currentStateManager.handleGameJoin(gameData);
		this.emit("STATE_CHANGE", currentStateManager.getCurrentState());
	}

	/**
	 * Emit a game leave event
	 */
	public emitGameLeave(): void {
		this.emit("GAME_LEAVE", undefined);
		currentStateManager.handleGameLeave();
		this.emit("STATE_CHANGE", currentStateManager.getCurrentState());
	}

	/**
	 * Emit a player join event
	 */
	public emitPlayerJoin(playerData: PlrJoinLeaveAction): void {
		this.emit("PLAYER_JOIN", playerData);
		currentStateManager.handlePlayerAction(playerData);
		this.emit("STATE_CHANGE", currentStateManager.getCurrentState());
	}

	/**
	 * Emit a player leave event
	 */
	public emitPlayerLeave(playerData: PlrJoinLeaveAction): void {
		this.emit("PLAYER_LEAVE", playerData);
		currentStateManager.handlePlayerAction(playerData);
		this.emit("STATE_CHANGE", currentStateManager.getCurrentState());
	}

	/**
	 * Emit a Bloxstrap RPC event
	 */
	public emitBloxstrapRPC(rpcData: BloxstrapRPCAction): void {
		this.emit("BLOXSTRAP_RPC", rpcData);
	}

	/**
	 * Emit a teleport event
	 */
	public emitTeleport(data: TeleportAction): void {
		this.emit("TELEPORT", data);
	}

	/**
	 * Get the number of listeners for a specific event type
	 */
	public getListenerCount(eventType: EventType): number {
		return this.listeners.get(eventType)?.size || 0;
	}

	/**
	 * Get all registered event types
	 */
	public getRegisteredEvents(): EventType[] {
		return Array.from(this.listeners.keys());
	}

	/**
	 * Clear all listeners for a specific event type
	 */
	public clearListeners(eventType: EventType): void {
		this.listeners.delete(eventType);
	}

	/**
	 * Clear all listeners for all event types
	 */
	public clearAllListeners(): void {
		this.listeners.clear();
	}
}

// Export a singleton instance
export const eventCollector = new EventCollector();
