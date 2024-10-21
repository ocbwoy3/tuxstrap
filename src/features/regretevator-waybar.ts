import { activityWatcher, bloxstraprpc, PluginEventEmitter } from "../lib/Constants";
import path from "path";
import { exec } from "child_process";
import { GetPlaceDetails, GetUniverseId } from "../lib/RobloxAPI";
import { rmSync, writeFileSync } from "fs";
import { homedir } from "os";

function writeState(data: string) {
	writeFileSync(`${homedir()}/.regretevator_state`,data)	
}

activityWatcher.BloxstrapRPCEvent.on("OnGameLeave",()=>{
	try {
		rmSync(`${homedir()}/.regretevator_state`);
	} catch {};
})

PluginEventEmitter.on("SetRichPresence",async(data: any)=>{
	const isRegretevator = (await GetUniverseId(activityWatcher.ActivityPlaceId)) == (await GetUniverseId(4972273297));
	// console.log("IsRegretevator",isRegretevator,data)
	if (isRegretevator) {
		try {
			if (bloxstraprpc._stashedRPCMessage?.largeImage?.hoverText === "THE REGRET ELEVATOR" && bloxstraprpc._stashedRPCMessage?.smallImage?.hoverText === "The Axolotl Sun") {
				if ((data.state as string).match(/^On Floor ([0-9]+)$/)) {
					const f = (data.state as string).replace(/[a-zA-Z ]*/g,'');
					writeState(`ý ${f}`);
				} else if ((data.state as string).match(/^Currently spectating (.*)$/)) {
					const f = (data.state as string).replace(/^Currently spectating /g,'');
					writeState(`ý ${f}`);
				} else if ((data.state as string) === "Going up!") {
					writeState(`ý `);
				} else if ((data.state as string) === "Lounging in the lobby") {
					writeState(`ý 󰱮`);
				} else {
					writeState(`ý`);
				}
			}
		} catch(e_) {}
	}
})

if (activityWatcher.options.showNotifications) exec(`notify-send -a "tuxstrap" -u low "Roblox" "Loaded: Regretevator Waybar (OCbwoy3's Dotfiles)"`);
