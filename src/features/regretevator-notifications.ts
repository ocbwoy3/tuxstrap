import {
	activityWatcher,
	bloxstraprpc,
	PluginEventEmitter,
} from "../lib/Constants";
import path from "path";
import { exec } from "child_process";
import { GetPlaceDetails, GetUniverseId } from "../lib/RobloxAPI";

let regretevator: boolean = false;

PluginEventEmitter.on("SetRichPresence", async (data: any) => {
	const isRegretevator =
		(await GetUniverseId(activityWatcher.ActivityPlaceId)) ===
		(await GetUniverseId(4972273297));
	// console.log("IsRegretevator",isRegretevator,data)
	if (isRegretevator) {
		if (!regretevator) {
			regretevator = true;
			exec(`notify-send -a "tuxstrap" -u low "Regretevator" "???????"`);
		}
		try {
			if (
				bloxstraprpc._stashedRPCMessage?.largeImage?.hoverText ===
					"THE REGRET ELEVATOR" &&
				bloxstraprpc._stashedRPCMessage?.smallImage?.hoverText ===
					"The Axolotl Sun"
			) {
				if ((data.state as string).match(/^On Floor ([0-9]+)$/)) {
					const f = (data.state as string).replace(/[a-zA-Z ]*/g, "");
					exec(
						`notify-send -a "tuxstrap" -u low "Regretevator" "On Floor ${f}"`
					);
				} else if ((data.state as string) === "Going up!") {
					exec(
						`notify-send -a "tuxstrap" -u low "Regretevator" "Going Up!"`
					);
				} else if ((data.state as string) === "Lounging in the lobby") {
					exec(
						`notify-send "OCbwoy3's Dotfiles" "i thought you said you loved playing regretevator :("`
					);
				}
			}
		} catch (e_) {}
	} else {
		regretevator = false;
	}
});
