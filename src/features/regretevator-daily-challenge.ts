import {
	activityWatcher,
	bloxstraprpc,
	PluginEventEmitter,
} from "../lib/Constants";
import path from "path";
import { exec } from "child_process";
import { GetPlaceDetails, GetUniverseId } from "../lib/RobloxAPI";

// TODO: find a way to detect the daily challenge has already been done, to disable this func.

let regretevator: boolean = false;
let floorNumStart = 999999;
let floorNumEnd = 999999;
let numFloors = 50;
let numFloorsDeath = 5;
let challengeDone: boolean = false;

bloxstraprpc.aw!.BloxstrapRPCEvent.on("OnGameJoin", () => {
	regretevator = false;
	floorNumStart = 999999;
	floorNumEnd = 999999;
	challengeDone = false;
});

PluginEventEmitter.on("SetRichPresence", async (data: any) => {
	const isRegretevator =
		(await GetUniverseId(activityWatcher.ActivityPlaceId)) ===
		(await GetUniverseId(4972273297));
	// console.log("IsRegretevator",isRegretevator,data)
	if (isRegretevator) {
		if (!regretevator) {
			regretevator = true;
		}
		if (challengeDone) return;
		try {
			if (
				bloxstraprpc._stashedRPCMessage?.largeImage?.hoverText ===
					"THE REGRET ELEVATOR" &&
				bloxstraprpc._stashedRPCMessage?.smallImage?.hoverText ===
					"The Axolotl Sun"
			) {
				if ((data.state as string).match(/^On Floor ([0-9]+)$/)) {
					const f = Number(
						(data.state as string).replace(/[a-zA-Z ]*/g, "")
					);
					if (floorNumStart === 999999) {
						floorNumStart = f;
						floorNumEnd = f + numFloors;
						exec(
							`notify-send -a "tuxstrap" -u low "Regretevator" "Challenge: Survive ${
								floorNumEnd - floorNumStart
							} floors"`
						);
						return;
					}
					if (f === floorNumEnd) {
						challengeDone = true;
						exec(
							`notify-send -a "tuxstrap" -u low "Regretevator" "You survived ${
								floorNumEnd - floorNumStart
							}" floors, congrats!`
						);
						return;
					}
					exec(
						`notify-send -a "tuxstrap" -u low "Regretevator" "Floor ${
							f - floorNumStart
						}/${floorNumEnd - floorNumStart}"`
					);
				} else if ((data.state as string) === "Going up!") {
					// exec(`notify-send -a "tuxstrap" -u low "Regretevator" "Going Up!"`);
				} else if ((data.state as string) === "Lounging in the lobby") {
					floorNumEnd += numFloorsDeath;
					exec(
						`notify-send -a "tuxstrap" -u low "Regretevator" "haha im making you do ${numFloorsDeath} more floors >:3"`
					);
				}
			}
		} catch (e_) {}
	} else {
		floorNumStart = 999999;
		regretevator = false;
	}
});
