import { $ } from "bun";
import { SOBER_APPID } from "./api/constants";
import { libocbwoy3Greet, setConsoleTitle } from "@ocbwoy3/libocbwoy3";
import { generateConfigFile } from "./api/sober/ConfigManager";
import { exec } from "child_process";
import { ActivityWatcher } from "./api/log/ActivityWatcher";
import {
	createDesktopEntry,
	registerXDG,
	tuxstrapDesktopEntry
} from "./api/sober/DesktopEntry";
import { join } from "path";
import { registerPluginsAllFinal } from "./api/Plugin";
import "./plugins";

(async () => {
	(() => {
		const firstRobloxURLArg = process.argv.find(
			(a) => a === "tuxstrap://gendesktoproblox"
		);

		if (
			!!firstRobloxURLArg &&
			process.argv.find(
				(a) => a.startsWith("roblox:") || a.startsWith("roblox-player:")
			)
		) {
			console.error("What did you do...");
			process.exit(1);
		}
		if (firstRobloxURLArg) {
			console.log(
				createDesktopEntry(
					tuxstrapDesktopEntry,
					join(__dirname, process.argv0).replace(/^\/build\//,"/").replace(/^\/src\//,"/")
				).replaceAll("org.vinegarhq.Sober", "tuxstrap")
			);
			process.exit(0);
		}
	})();

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

	setConsoleTitle("TuxStrap");
	libocbwoy3Greet();

	console.log(process.argv0, process.argv)
	if (process.argv0.endsWith("bin/tuxstrap") || process.argv0 === ("/run/current-system/sw/bin/tuxstrap")) {
		console.log(`Using ${process.argv0.includes("/nix/store") ? "Nix" : "built"} version of TuxStrap!! ${process.argv0}`)
	}

	await registerPluginsAllFinal();

	registerXDG("tuxstrap.desktop");

	generateConfigFile();

	const firstRobloxURLArg = process.argv.find(
		(a) => a.startsWith("roblox:") || a.startsWith("roblox-player:")
	);

	const robloxLaunchURL = firstRobloxURLArg || "roblox://";

	const child = exec(`flatpak run ${SOBER_APPID} "${robloxLaunchURL}"`);

	const watcher = new ActivityWatcher(child, {
		verbose: true,
		tuxstrapLaunchTime: Date.now()
	});

	child.on("exit", (code) => {
		process.exit(code);
	});

	await watcher.stdoutWatcher();
})();
