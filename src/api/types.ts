export type PlrJoinLeaveAction = {
	name: string;
	id: string;
	action: "JOIN" | "LEAVE";
};

export enum ServerType {
	PUBLIC = "PUBLIC",
	PRIVATE = "PRIVATE",
	RESERVED = "RESERVED"
}

export type fflagValue = string | number | boolean;

export type fflagList = {
	[flag: string]: fflagValue;
};

export type GameJoinAction = {
	ipAddr: string;
	/** roblox's proxy ip address */
	ipAddrUdmux?: string;
	placeId: string;
	jobId: string;
	serverType: ServerType;
};

export type BloxstrapRPCAction = {
	type: string;
	data: any;
};

export type TeleportAction = {
	serverType: ServerType;
};

export interface Message {
	command: string;
	data: any;
}

// CurrentState API types
export interface GameState {
	/** The Roblox Place ID of the current game */
	placeId: string;
	/** The Job ID of the current server instance */
	jobId: string;
	/** The IP address of the server */
	ipAddr: string;
	/** Roblox's proxy IP address (if available) */
	ipAddrUdmux?: string;
	/** The type of server (public, private, reserved) */
	serverType: ServerType;
	/** Whether the user is currently in a game */
	isInGame: boolean;
	/** Timestamp when the game was joined */
	joinTime?: number;
	/** List of players currently in the game */
	players: PlayerInfo[];
}

export interface PlayerInfo {
	/** Player's display name */
	name: string;
	/** Player's user ID */
	id: string;
	/** When the player joined (timestamp) */
	joinTime: number;
}

export interface CurrentStateAPI {
	/** Get the current game state */
	getCurrentState(): GameState;
	/** Subscribe to state changes */
	onStateChange(callback: (state: GameState) => void): () => void;
	/** Check if currently in a game */
	isInGame(): boolean;
	/** Get the current place ID */
	getPlaceId(): string | null;
	/** Get the current job ID */
	getJobId(): string | null;
}

/**
 * https://vinegarhq.org/Sober/Configuration/index.html
 */
export type SoberConfig = {
	/**
	 * Enables the service to use gamepads or controllers
	 * @note Will prompt Sober to update Flatpak permissions
	 * @name allow_gamepad_permission
	 * @default false
	 */
	allowGamepad?: boolean;

	/**
	 * Bring back the nostalgic 'oof' sound
	 * @name bring_back_oof
	 * @default false
	 */
	bringBackOof?: boolean;

	/**
	 * Closes Sober upon leaving a game
	 * @name close_on_leave
	 * @default false
	 */
	closeOnLeaave?: boolean;

	/**
	 * Share the game you're playing with your Discord servers and contacts
	 * @name discord_rpc_enabled
	 * @default true
	 */
	enableRichPresence?: boolean;

	/**
	 * Enables gamemode, a tool which enhances game performance
	 * @name enable_gamemode
	 * @default true
	 */
	enableGamemode?: boolean;

	/**
	 * Scale Sober's game window depending on your screen's pixel density, useful for very high resolution displays/laptops
	 * @name enable_hidpi
	 * @default false
	 */
	enableHiDPI?: boolean;

	/**
	 * Show a popup with the location of the gameserver you connected to upon visiting an experience
	 * @name server_location_indicator_enabled
	 * @default false
	 */
	serverLocationIndicator?: boolean;

	/**
	 * - "off" - touchscreen is disabled
	 * - "on" - touchscreen is enabled, experiences will use the mobile UI
	 * - "fake-off" - touchscreen is enabled, experiences will use the desktop UI
	 * @name touch_mode
	 * @default "off"
	 */
	touchMode?: "off" | "on" | "fake-off";

	/**
	 * @todo I have NO IDEA what this does - ocbwoy3
	 * @name use_console_experience
	 * @default false
	 */
	useConsoleExperience?: boolean;

	/**
	 * use libsecret for storing the session cookie instead of plaintext, experimental
	 * @name use_libsecret
	 * @default false
	 */
	useLibsecret?: boolean;

	/**
	 * use OpenGL instead of Vulkan as the graphics API, useful as a workaround for certain issues, like "OutOfMemory" repeated crashes
	 * @name use_opengl
	 * @default false
	 */
	useOpenGL?: boolean;
};
