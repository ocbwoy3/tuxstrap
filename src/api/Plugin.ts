import type { CurrentStateAPI, fflagList, fflagValue, SoberConfig } from "./types";
import { currentStateManager } from "./CurrentState";
import { eventCollector, type EventType, type EventCallback, type EventSubscription } from "./EventCollector";

type PluginMeta = {
	name: string;
	id: string;
	forceEnable?: boolean;
	/** the lower, the earlier configs are applied. higher means more priority over end value */
	configPrio?: number;
};

export class Plugin {
	public name: string;
	public id: string;
	public force: boolean;
	public configPrio: number;

	private runtimeSetFFlags: fflagList = {};
	private runtimeSetSoberConfig: SoberConfig = {};

	constructor({ name, id, forceEnable, configPrio }: PluginMeta) {
		this.name = name;
		this.id = id;
		this.force = forceEnable ?? false;
		this.configPrio = configPrio ?? 0;
		this.runtimeSetFFlags = {};
	}

	get fflags(): fflagList {
		return this.runtimeSetFFlags;
	}

	get soberConfig(): SoberConfig {
		return this.runtimeSetSoberConfig;
	}

	public setFFlag(flag: string, value: fflagValue) {
		this.runtimeSetFFlags[flag] = value;
	}

	public setSoberConfigOption<K extends keyof SoberConfig>(
		opt: K,
		value: NonNullable<SoberConfig[K]>
	) {
		this.runtimeSetSoberConfig[opt] = value;
	}

	/**
	 * Subscribe to events using the new event system
	 */
	public on<T extends EventType>(eventType: T, callback: EventCallback<T>): EventSubscription {
		return eventCollector.on(eventType, callback);
	}

	/**
	 * Legacy method for backward compatibility - maps to new event system
	 */
	public hookLog = {
		GAME_JOIN: (callback: EventCallback<"GAME_JOIN">) => this.on("GAME_JOIN", callback),
		GAME_LEAVE: (callback: EventCallback<"GAME_LEAVE">) => this.on("GAME_LEAVE", callback),
		JOIN_LEAVE: (callback: EventCallback<"PLAYER_JOIN" | "PLAYER_LEAVE">) => {
			// Subscribe to both player join and leave events
			const joinSub = this.on("PLAYER_JOIN", callback as EventCallback<"PLAYER_JOIN">);
			const leaveSub = this.on("PLAYER_LEAVE", callback as EventCallback<"PLAYER_LEAVE">);
			
			return {
				unsubscribe: () => {
					joinSub.unsubscribe();
					leaveSub.unsubscribe();
				}
			};
		},
		BLOXSTRAP: (callback: EventCallback<"BLOXSTRAP_RPC">) => this.on("BLOXSTRAP_RPC", callback)
	};

	get currentState(): CurrentStateAPI {
		return {
			getCurrentState: () => currentStateManager.getCurrentState(),
			onStateChange: (callback) =>
				currentStateManager.onStateChange(callback),
			isInGame: () => currentStateManager.isInGame(),
			getPlaceId: () => currentStateManager.getPlaceId(),
			getJobId: () => currentStateManager.getJobId()
		};
	}
}

let pluginsRegistered: Plugin[] = [];
let pluginsRegisterFuncs: (()=>void)[] = [];

export function registerPlugin(
	details: PluginMeta,
	initFunc: (plugin: Plugin) => void
) {
	pluginsRegisterFuncs.push(()=>{
		if (!details.forceEnable) return;
		const plugin = new Plugin(details);
		try {
			initFunc(plugin);
			pluginsRegistered.push(plugin);
			console.log(
				`[api/Plugin] PluginInit(${plugin.id}): "${plugin.name}" successfully initalized`
			);
		} catch (error) {
			console.error(
				`[api/Plugin] PluginInitError(${plugin.id}): "${plugin.name}" errored:`,
				error
			);
		}
	})
}

export function registerPluginsAllFinal() {
	for (const f of pluginsRegisterFuncs) {
		f()
	}
}

export function getPlugins(): Plugin[] {
	return pluginsRegistered
}
