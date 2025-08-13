import { eventCollector } from "./EventCollector";
import type {
	PlrJoinLeaveAction,
	GameJoinAction,
	BloxstrapRPCAction
} from "./types";

/**
 * Main EventEmitter class for emitting events to all registered plugins
 * This replaces the old BloxstrapRPC API with a direct event system
 */
export class EventEmitter {
	/**
	 * Emit a game join event
	 */
	public static emitGameJoin(gameData: GameJoinAction): void {
		eventCollector.emitGameJoin(gameData);
	}

	/**
	 * Emit a game leave event
	 */
	public static emitGameLeave(): void {
		eventCollector.emitGameLeave();
	}

	/**
	 * Emit a player join event
	 */
	public static emitPlayerJoin(playerData: PlrJoinLeaveAction): void {
		eventCollector.emitPlayerJoin(playerData);
	}

	/**
	 * Emit a player leave event
	 */
	public static emitPlayerLeave(playerData: PlrJoinLeaveAction): void {
		eventCollector.emitPlayerLeave(playerData);
	}

	/**
	 * Emit a Bloxstrap RPC event
	 */
	public static emitBloxstrapRPC(rpcData: BloxstrapRPCAction): void {
		eventCollector.emitBloxstrapRPC(rpcData);
	}

	/**
	 * Get the number of listeners for a specific event type
	 */
	public static getListenerCount(eventType: string): number {
		return eventCollector.getListenerCount(eventType as any);
	}

	/**
	 * Get all registered event types
	 */
	public static getRegisteredEvents(): string[] {
		return eventCollector.getRegisteredEvents();
	}

	/**
	 * Clear all listeners for a specific event type
	 */
	public static clearListeners(eventType: string): void {
		eventCollector.clearListeners(eventType as any);
	}

	/**
	 * Clear all listeners for all event types
	 */
	public static clearAllListeners(): void {
		eventCollector.clearAllListeners();
	}
}
