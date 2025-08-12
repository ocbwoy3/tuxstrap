import type { GameState, PlayerInfo, GameJoinAction, PlrJoinLeaveAction } from "./types";
import { ServerType } from "./types";

export class CurrentStateManager {
	private currentState: GameState = {
		placeId: "",
		jobId: "",
		ipAddr: "",
		ipAddrUdmux: undefined,
		serverType: ServerType.PUBLIC,
		isInGame: false,
		joinTime: undefined,
		players: []
	};

	private stateChangeCallbacks: Array<(state: GameState) => void> = [];

	/**
	 * Get the current game state
	 */
	getCurrentState(): GameState {
		return { ...this.currentState };
	}

	/**
	 * Subscribe to state changes
	 * @param callback Function to call when state changes
	 * @returns Unsubscribe function
	 */
	onStateChange(callback: (state: GameState) => void): () => void {
		this.stateChangeCallbacks.push(callback);
		
		// Return unsubscribe function
		return () => {
			const index = this.stateChangeCallbacks.indexOf(callback);
			if (index > -1) {
				this.stateChangeCallbacks.splice(index, 1);
			}
		};
	}

	/**
	 * Check if currently in a game
	 */
	isInGame(): boolean {
		return this.currentState.isInGame;
	}

	/**
	 * Get the current place ID
	 */
	getPlaceId(): string | null {
		return this.currentState.isInGame ? this.currentState.placeId : null;
	}

	/**
	 * Get the current job ID
	 */
	getJobId(): string | null {
		return this.currentState.isInGame ? this.currentState.jobId : null;
	}

	/**
	 * Update state when joining a game
	 */
	handleGameJoin(gameData: GameJoinAction): void {
		this.currentState = {
			placeId: gameData.placeId,
			jobId: gameData.jobId,
			ipAddr: gameData.ipAddr,
			ipAddrUdmux: gameData.ipAddrUdmux,
			serverType: gameData.serverType,
			isInGame: true,
			joinTime: Date.now(),
			players: []
		};

		this.notifyStateChange();
	}

	/**
	 * Update state when leaving a game
	 */
	handleGameLeave(): void {
		this.currentState = {
			placeId: "",
			jobId: "",
			ipAddr: "",
			ipAddrUdmux: undefined,
			serverType: ServerType.PUBLIC,
			isInGame: false,
			joinTime: undefined,
			players: []
		};

		this.notifyStateChange();
	}

	/**
	 * Handle player join/leave events
	 */
	handlePlayerAction(action: PlrJoinLeaveAction): void {
		if (!this.currentState.isInGame) return;

		if (action.action === "JOIN") {
			const playerInfo: PlayerInfo = {
				name: action.name,
				id: action.id,
				joinTime: Date.now()
			};

			// Check if player already exists
			const existingPlayerIndex = this.currentState.players.findIndex(p => p.id === action.id);
			if (existingPlayerIndex === -1) {
				this.currentState.players.push(playerInfo);
				this.notifyStateChange();
			}
		} else if (action.action === "LEAVE") {
			// Remove player from the list
			this.currentState.players = this.currentState.players.filter(p => p.id !== action.id);
			this.notifyStateChange();
		}
	}

	/**
	 * Notify all subscribers of state changes
	 */
	private notifyStateChange(): void {
		const stateCopy = this.getCurrentState();
		this.stateChangeCallbacks.forEach(callback => {
			try {
				callback(stateCopy);
			} catch (error) {
				console.error("Error in state change callback:", error);
			}
		});
	}
}

// Create a singleton instance
export const currentStateManager = new CurrentStateManager(); 