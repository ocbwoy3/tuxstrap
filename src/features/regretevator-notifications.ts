import { activityWatcher, bloxstraprpc, PluginEventEmitter } from "../lib/Constants";
import path from "path";
import { exec } from "child_process";
import { GetPlaceDetails, GetUniverseId } from "../lib/RobloxAPI";

PluginEventEmitter.on("SetRichPresence",async(data: any)=>{
	const isRegretevator = (await GetUniverseId(activityWatcher.ActivityPlaceId)) == (await GetUniverseId(4972273297));
	// console.log("IsRegretevator",isRegretevator,data)
	if (isRegretevator) {
		try {
			if (bloxstraprpc._stashedRPCMessage?.largeImage?.hoverText === "THE REGRET ELEVATOR" && bloxstraprpc._stashedRPCMessage?.smallImage?.hoverText === "The Axolotl Sun") {
				if ((data.state as string).match(/^On Floor ([0-9]+)$/)) {
					const f = (data.state as string).replace(/[a-zA-Z ]*/g,'')
					exec(`notify-send -a "tuxstrap" -u low "Regretevator" "On Floor ${f}"`);
				} else if ((data.state as string) === "Going up!") {
					exec(`notify-send -a "tuxstrap" -u low "Regretevator" "Going Up!"`);
				} else if ((data.state as string) === "Lounging in the lobby") {
					exec(`notify-send -a "tuxstrap" -u low "Regretevator" "u dead lol"`);
				}
			}
		} catch(e_) {}
	}
})
