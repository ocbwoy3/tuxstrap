import {
	activityWatcher,
	bloxstraprpc,
	PluginEventEmitter,
} from "../lib/Constants";
import path from "path";
import { exec } from "child_process";
import { GetPlaceDetails, GetUniverseId } from "../lib/RobloxAPI";
import fs from "fs";
import os from "os";

// TODO: find a way to detect the daily challenge has already been done, to disable this func.

let regretevator: boolean = false;
let floorNumStart = 999999;
let floorNumEnd = 999999;
let numFloorsGoal = 50;
let numFloorsDeath = 5;
let numFloorsDead = 0;
let challengeDone: boolean = false;
let dead: boolean = false;
let activeFloorCount = 0;

function writeState(floors: number) {
	// write json to ~/.regretevator-challenge-state
	// only if: date is not today or the floor count is less than 25
	const stateFilePath = path.join(
		os.homedir(),
		".regretevator-challenge-state"
	);

	const today = new Date().toISOString().split("T")[0];
	const writeState = (floors2: number, date2: string) => {
		if (date2 !== today || floors2 < 25) {
			const state = { floors, today };
			console.log(
				"[RegretevatorDailyChallenge]",
				`Writing challenge state file: ${today} - ${floors} floors`
			);
			fs.writeFileSync(stateFilePath, JSON.stringify(state, null, 2));
		}
	};

	if (fs.existsSync(stateFilePath)) {
		const state = JSON.parse(fs.readFileSync(stateFilePath, "utf-8"));
		const { floors: savedFloors, date: savedDate } = state;
		writeState(savedFloors, savedDate);
	} else {
		writeState(floors, today);
	}
}

function getProgressPercentage(current: number, goal: number): number {
	const percentage = (current / goal) * 100;
	return Math.min(100, Math.max(0, Number(percentage.toFixed(2))));
}

bloxstraprpc.aw!.BloxstrapRPCEvent.on("OnGameJoin", () => {
	regretevator = false;
	floorNumStart = 999999;
	floorNumEnd = 999999;
	numFloorsGoal = 50;
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
						floorNumEnd = f + numFloorsGoal;
						console.log(
							"[RegretevatorDailyChallenge]",
							`Detected Regretevator, floor ${floorNumStart}, target floor ${floorNumEnd}`
						);
						exec(
							`notify-send -a "tuxstrap" -u low -h int:value:0 "Regretevator" "Challenge: Survive ${numFloorsGoal} floors"`
						);
						return;
					}
					activeFloorCount++;
					writeState(activeFloorCount);
					if (activeFloorCount === numFloorsGoal) {
						challengeDone = true;
						(process as any).REGRETEVATOR_DAILY_CHALLENGE_ACTIVE =
							false;
						exec(
							`notify-send -a "tuxstrap" -u low -h int:value:100 "Regretevator" "You survived ${numFloorsGoal} floors.\nCongrats! :3"`
						);
						console.log(
							"[RegretevatorDailyChallenge]",
							`Finished challenge, floors survived: ${numFloorsGoal}`
						);
						return;
					}
					console.log(
						"[RegretevatorDailyChallenge]",
						`On floor ${f}, active floor ${activeFloorCount}/${numFloorsGoal}`
					);
					exec(
						`notify-send -a "tuxstrap" -u low -h int:value:${getProgressPercentage(
							activeFloorCount,
							numFloorsGoal
						)} "Regretevator" "Floor ${f} - ${activeFloorCount}/${numFloorsGoal}"`
					);
				} else if ((data.state as string) === "Going up!") {
					// exec(`notify-send -a "tuxstrap" -u low "Regretevator" "Going Up!"`);
				} else if ((data.state as string) === "Lounging in the lobby") {
					if (!dead) {
						floorNumEnd += numFloorsDeath;
						numFloorsDead++;
						numFloorsGoal += numFloorsDeath;
						console.log(
							"[RegretevatorDailyChallenge]",
							`Player died`
						);
						exec(
							`notify-send -a "tuxstrap" -u low -h int:value:${getProgressPercentage(
								activeFloorCount,
								numFloorsGoal
							)} "Regretevator" "haha im making you do ${numFloorsDeath} more floors >:3"`
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
		exec(
			`notify-send -a "tuxstrap" -u low -h int:value:${getProgressPercentage(
				activeFloorCount,
				numFloorsGoal
			)} "Regretevator" "BRO YOU AIN'T EVEN FINISH 25 FLOORS BRUH"`
		);
	}
});
