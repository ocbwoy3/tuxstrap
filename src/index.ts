import { $ } from "bun";
import { SOBER_APPID } from "./api/constants";

const soberCheck = await $`flatpak list | grep ${SOBER_APPID}`
	.nothrow()
	.quiet();

if (soberCheck.exitCode !== 0) {
	console.error("Install Sober before using TuxStrap!");
	console.log("https://flathub.org/apps/org.vinegarhq.Sober");
	console.log(
		"> flatpak remote-add --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo"
	);
	console.log("> flatpak install flathub org.vinegarhq.Sober");
	process.exit(1);
}

import { libocbwoy3Greet, setConsoleTitle } from "@ocbwoy3/libocbwoy3";

setConsoleTitle("TuxStrap");
libocbwoy3Greet();

import { initPlugins } from "./plugins";
initPlugins();

import { generateConfigFile } from "./api/sober/ConfigManager";

generateConfigFile();

const firstRobloxURLArg = process.argv.find(
	(a) => a.startsWith("roblox:") || a.startsWith("roblox-player:")
);

const robloxLaunchURL = firstRobloxURLArg || "roblox://";

import { exec } from "child_process";
import { ActivityWatcher } from "./api/log/ActivityWatcher";

const child = exec(`flatpak run ${SOBER_APPID} "${robloxLaunchURL}"`);

const watcher = new ActivityWatcher(child, {
	verbose: false,
	tuxstrapLaunchTime: Date.now()
});

child.on("exit",(code)=>{
	process.exit(code)
})

await watcher.stdoutWatcher();
