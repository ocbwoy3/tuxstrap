import { activityWatcher, PluginEventEmitter } from "../lib/Constants";
import path from "path";
import { exec } from "child_process";
import { GetPlaceDetails, GetUniverseId } from "../lib/RobloxAPI";

// x/print('[BloxstrapRPC] {"message":"WaylandCopy","data":"hi"}')

PluginEventEmitter.on("WaylandCopy", async (data: any) => {
	console.warn("[WAYLANDCOPY]", typeof data, data.length, data);
	if (typeof data === "string" && data.length < 128) {
		const fixed = (data as string)
			.replace("$", "\\$")
			.replace('"', '\\"')
			.replace("\n", "\\n");
		const gmfixed = (
			await GetPlaceDetails(
				await GetUniverseId(activityWatcher.ActivityPlaceId)
			)
		).name
			.replace("$", "\\$")
			.replace('"', '\\"')
			.replace("\n", "\\n");
		exec(`echo "${fixed}" | wl-copy`);
		if (activityWatcher.options.showNotifications)
			exec(
				`notify-send -i ${path.join(
					__dirname,
					"..",
					"assets/roblox.png"
				)} -u low "Roblox" "${gmfixed} wrote to the Wayland clipboard!"`
			);
	}
});
