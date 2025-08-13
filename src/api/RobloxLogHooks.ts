import type {
	PlrJoinLeaveAction,
	GameJoinAction,
	BloxstrapRPCAction
} from "./types";
import { eventCollector } from "./EventCollector";

/**
 * @deprecated Use plugin.on(), eventCollector.emitGameJoin(), eventCollector.emitGameLeave(), etc.
 */
export function hookRobloxLogAction(
	hookableThing: "JOIN_LEAVE",
	func: (a: PlrJoinLeaveAction) => any
): void;
export function hookRobloxLogAction(
	hookableThing: "GAME_JOIN",
	func: (a: GameJoinAction) => any
): void;
export function hookRobloxLogAction(
	hookableThing: "GAME_LEAVE",
	func: () => any
): void;
export function hookRobloxLogAction(
	hookableThing: "BLOXSTRAP",
	func: (a: BloxstrapRPCAction) => any
): void;

export function hookRobloxLogAction(
	hookableThing: "JOIN_LEAVE" | "GAME_JOIN" | "GAME_LEAVE" | "BLOXSTRAP",
	func:
		| ((a: PlrJoinLeaveAction) => any)
		| ((a: GameJoinAction) => any)
		| ((a: BloxstrapRPCAction) => any)
		| (() => any)
): void {
	// console.warn("hookRobloxLogAction is deprecated. Use the new event system instead.");

	// For backward compatibility, we'll still register the callback
	// but it's recommended to use the new event system
	switch (hookableThing) {
		case "GAME_JOIN":
			eventCollector.on("GAME_JOIN", func as any);
			break;
		case "GAME_LEAVE":
			eventCollector.on("GAME_LEAVE", func as any);
			break;
		case "JOIN_LEAVE":
			// Subscribe to both player join and leave events
			eventCollector.on("PLAYER_JOIN", func as any);
			eventCollector.on("PLAYER_LEAVE", func as any);
			break;
		case "BLOXSTRAP":
			eventCollector.on("BLOXSTRAP_RPC", func as any);
			break;
	}
}
