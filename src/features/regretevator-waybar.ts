import {
	activityWatcher,
	bloxstraprpc,
	PluginEventEmitter,
} from "../lib/Constants";
import { GetUniverseId } from "../lib/RobloxAPI";
import { rmSync, writeFileSync } from "fs";
import { homedir } from "os";

function writeState(data: string) {
	writeFileSync(`${homedir()}/.regretevator_state`, data);
}

let isInitalLaunch = true;
let lastFloorNum = "0";

activityWatcher.BloxstrapRPCEvent.on("OnGameLeave", () => {
	isInitalLaunch = true;
	lastFloorNum = "0";
	try {
		rmSync(`${homedir()}/.regretevator_state`);
	} catch { }
});

PluginEventEmitter.on("SetRichPresence", async (data: any) => {
	const isRegretevator =
		(await GetUniverseId(activityWatcher.ActivityPlaceId)) ==
		(await GetUniverseId(4972273297));
	// console.log("IsRegretevator",isRegretevator,data)
	if (isRegretevator) {
		try {
			if (
				bloxstraprpc._stashedRPCMessage?.largeImage?.hoverText ===
				"THE REGRET ELEVATOR" &&
				bloxstraprpc._stashedRPCMessage?.smallImage?.hoverText ===
				"The Axolotl Sun"
			) {
				if ((data.state as string).match(/^On Floor ([0-9]+)$/)) {
					const f = (data.state as string).replace(/[a-zA-Z ]*/g, "");
					lastFloorNum = f;
					writeState(`{"text":"ý ${f}","tooltip":"On Floor ${f}"}`);
				} else if (
					(data.state as string).match(/^Currently spectating (.*)$/)
				) {
					const f = (data.state as string).replace(
						/^Currently spectating /g,
						""
					);
					// let nextFloorNum = "0";
					// try { nextFloorNum = Number(lastFloorNum)+1 } catch {};
					writeState(`{"text":"ý ${f}","tooltip":"Spectating ${f}"}`);
				} else if ((data.state as string) === "Going up!") {
					writeState(
						`{"text":"ý ","tooltip":"Floor ${lastFloorNum}  ${Number(lastFloorNum) + 1
						}"}`
					);
				} else if ((data.state as string) === "Lounging in the lobby") {
					writeState(`{"text":"ý ","tooltip":"In Lobby"}`);
				} else {
					if (isInitalLaunch) {
						isInitalLaunch = false;
						writeState(
							`{"text":"ý","tooltip":"Playing Regretevator"}`
						);
					} else {
						writeState(
							`{"text":"ý ","tooltip":"Floor ${lastFloorNum}  ${Number(lastFloorNum) + 1
							}"}`
						);
					}
				}
			}
		} catch (e_) { }
	}
});
