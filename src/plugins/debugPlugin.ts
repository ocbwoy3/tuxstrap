import { getGameDetails } from "api/roblox/GameInfo";
import { registerPlugin } from "../api/Plugin";
import { SendNotification } from "api/linux";
import { ServerType } from "api/types";

registerPlugin(
	{
		name: "TuxStrap Debug",
		id: "tuxstrap-debug",
		forceEnable: true,
		configPrio: -9e9
	},
	(plugin) => {
		plugin.on("BLOXSTRAP_RPC", (a) => console.log("BLOXSTRAP_RPC", a));
		plugin.on("GAME_JOIN", async (a) => {
			console.log("GAME_JOIN", a);
			const gameName = await getGameDetails(a.placeId);
			if (!gameName) return;
			await SendNotification(
				"Roblox",
				`${gameName}${a.ipAddrUdmux ? "\n(UDMUX Protected)" : ""}`
			);
		});
		plugin.on("TELEPORT", async (a) => {
			console.log("TELEPORT", a);
			const pi = plugin.currentState.getPlaceId();
			if (!pi) return;
			const gameName = await getGameDetails(pi);
			if (!gameName) return;
			await SendNotification(
				"Roblox",
				`${gameName} is teleporting you to another place (${a.serverType})`
			);
		});
		plugin.on("GAME_LEAVE", (a) => console.log("GAME_LEAVE", a));
		plugin.on("PLAYER_JOIN", (a) => console.log("PLAYER_JOIN", a));
		plugin.on("PLAYER_LEAVE", (a) => console.log("PLAYER_LEAVE", a));
		plugin.on("STATE_CHANGE", (a) => console.log("STATE_CHANGE", a));
		plugin.currentState.onStateChange((a) => {
			console.log("onStateChange", a);
		});
	}
);
