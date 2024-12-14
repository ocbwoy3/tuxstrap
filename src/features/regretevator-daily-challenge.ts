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
let numFloorsDead = 0;
let challengeDone: boolean = false;
let dead: boolean = false;
let activeFloorCount = 0;

bloxstraprpc.aw!.BloxstrapRPCEvent.on("OnGameJoin", () => {
	regretevator = false;
	floorNumStart = 999999;
	floorNumEnd = 999999;
	numFloorsDead = 0;
	challengeDone = false;
	dead = false;
	activeFloorCount = 0;
	(process as any).REGRETEVATOR_DAILY_CHALLENGE_ACTIVE = false;
	console.log("[RegretevatorDailyChallenge]", `Detected OnGameJoin`);
});

(process as any).REGRETEVATOR_DAILY_CHALLENGE_ACTIVE = false;

PluginEventEmitter.on("SetRichPresence", async (data: any) => {
	const isRegretevator =
		(await GetUniverseId(activityWatcher.ActivityPlaceId)) ===
		(await GetUniverseId(4972273297));

	if (isRegretevator) {
		if (!regretevator) {
			regretevator = true;
			(process as any).REGRETEVATOR_DAILY_CHALLENGE_ACTIVE =
				!challengeDone;
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
						console.log(
							"[RegretevatorDailyChallenge]",
							`Detected Regretevator, floor ${floorNumStart}, target floor ${floorNumEnd}`
						);
						exec(
							`notify-send -a "tuxstrap" -u low "Regretevator" "Challenge: Survive ${
								floorNumEnd - floorNumStart
							} floors"`
						);
						return;
					}
					if (!dead) {
						activeFloorCount++;
					}
					if (activeFloorCount === numFloors) {
						challengeDone = true;
						(process as any).REGRETEVATOR_DAILY_CHALLENGE_ACTIVE =
							false;
						exec(
							`notify-send -a "tuxstrap" -u low "Regretevator" "You survived ${numFloors} floors, congrats! :3"`
						);
						console.log(
							"[RegretevatorDailyChallenge]",
							`Finished challenge, floors survived: ${numFloors}`
						);
						return;
					}
					console.log(
						"[RegretevatorDailyChallenge]",
						`On floor ${f}, active floor ${activeFloorCount}/${numFloors}`
					);
					exec(
						`notify-send -a "tuxstrap" -u low "Regretevator" "Floor ${f} - ${activeFloorCount}/${numFloors}"`
					);
				} else if ((data.state as string) === "Going up!") {
					// exec(`notify-send -a "tuxstrap" -u low "Regretevator" "Going Up!"`);
				} else if ((data.state as string) === "Lounging in the lobby") {
					if (!dead) {
						dead = true;
						numFloorsDead++;
						console.log(
							"[RegretevatorDailyChallenge]",
							`Player died, resetting active floor count`
						);
						exec(
							`notify-send -a "tuxstrap" -u low "Regretevator" "haha im making you do ${numFloorsDeath} more floors >:3"`
						);
					}
				} else if ((data.state as string) === "In the elevator") {
					dead = false;
				}
			}
		} catch (e_) {}
	} else {
		floorNumStart = 999999;
		regretevator = false;
		(process as any).REGRETEVATOR_DAILY_CHALLENGE_ACTIVE = false;
	}
});
