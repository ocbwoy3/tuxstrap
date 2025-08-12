import { registerPlugin } from "../api/Plugin";

registerPlugin(
	{
		name: "TuxStrap Debug",
		id: "tuxstrap-debug",
		forceEnable: true,
		configPrio: -9e9
	},
	(plugin) => {
		plugin.on("BLOXSTRAP_RPC",a=>console.log("BLOXSTRAP_RPC",a))
		plugin.on("GAME_JOIN",a=>console.log("GAME_JOIN",a))
		plugin.on("GAME_LEAVE",a=>console.log("GAME_LEAVE",a))
		plugin.on("PLAYER_JOIN",a=>console.log("PLAYER_JOIN",a))
		plugin.on("PLAYER_LEAVE",a=>console.log("PLAYER_LEAVE",a))
		plugin.on("STATE_CHANGE",a=>console.log("STATE_CHANGE",a))
		plugin.currentState.onStateChange(a=>{
			console.log("onStateChange",a)
		})
	}
);
