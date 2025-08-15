import { $ } from "bun";
import { isCompiled, isNixOS, SOBER_APPID, TUXSTRAP_VERSION } from "./api/constants";
import {
	_libocbwoy3Version,
	libocbwoy3Greet,
	setConsoleTitle
} from "@ocbwoy3/libocbwoy3";
import { generateConfigFile } from "./api/sober/ConfigManager";
import { exec } from "child_process";
import { ActivityWatcher } from "./api/log/ActivityWatcher";
import {
	createDesktopEntry,
	registerXDG,
	tuxstrapDesktopEntry
} from "./api/sober/DesktopEntry";
import { join } from "path";
import { getPluginInfos, registerPluginsAllFinal } from "./api/Plugin";
import "./plugins";
import { eventCollector } from "./api/EventCollector";

(() => {
	const listPluginsSwitch = process.argv.find((a) => a === "--list-plugins");

	const helpSwitch = process.argv.find((a) => a === "-h" || a === "--help");
	const debugSwitch = process.argv.find((a) => a === "--debug" );

	if (debugSwitch) {
		console.log("argv0", process.argv0);
		console.log("argv", process.argv);
		console.log("isCompiled", isCompiled);
		console.log("isNixOS", isNixOS);
		process.exit(0);
	}

	if (helpSwitch) {
		console.log(
			`TuxStrap - Basically Bloxstrap for Linux!

		List FFlag/Plugin profiles:
		\\ttuxstrap --list-plugins

		Enable versbose mode for Roblox logs:
		\\ttuxstrap -v / --verbose

		Enable a plugin:
		\\ttuxstrap +super

		Disable a plugin:
		\\ttuxstrap -unstable

		Launch Roblox from a URL:
		\\ttuxstrap "roblox://placeId=69420"

		You can combine profiles together:
		\\ttuxstrap +super +unstable -dbus

		GitHub: https://github.com/ocbwoy3/tuxstrap
		`
				.replaceAll("\t", "")
				.replaceAll("\\t", "\t")
		);
		if (
			isCompiled
		) {
			console.log(
				`TuxStrap ${TUXSTRAP_VERSION}, libocbwoy3 ${_libocbwoy3Version}, Bun ${
					Bun.version_with_sha
				}, ${
					isNixOS
						? "Nix build"
						: "compiled"
				}`
			);
		}
		process.exit(0);
	}

	if (listPluginsSwitch) {
		for (const plugin of getPluginInfos()) {
			console.log(
				`${plugin.name} (${plugin.id})${
					plugin.forceEnable ? " [default]" : ""
				}`
			);
		}
		process.exit(0);
	}
})();

eventCollector.on("BLOXSTRAP_RPC", ({ type, data }) => {
	console.log("[BLOXSTRAPRPC]", type, data);
});

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
					join(__dirname, process.argv0)
						.replace(/^\/build\//, "/")
						.replace(/^\/src\//, "/")
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

	if (
		isCompiled
	) {
		console.log(
			`Using ${
				isNixOS ? "Nix" : "built"
			} version of TuxStrap!! ${process.argv0}`
		);
	}

	// await createWaylandContext(); <-- we need c for this shit
	// await copyToClipboard("haha funny"); <-- and this

	const pluginsEnable = process.argv
		.filter(
			(a) => a.startsWith("+") && !a.includes("-") && !a.includes(" ")
		)
		.map((a) => a.replace(/^\+/, ""));
	const pluginsDisable = process.argv
		.filter(
			(a) =>
				a.startsWith("-") &&
				!a.startsWith("--") &&
				!a.includes("+") &&
				!a.includes(" ")
		)
		.map((a) => a.replace(/^\-\-/, ""));

	await registerPluginsAllFinal(pluginsEnable, pluginsDisable);

	if (process.env.NODE_ENV !== "development") {
		registerXDG("tuxstrap.desktop");
	}

	generateConfigFile();

	const firstRobloxURLArg = process.argv.find(
		(a) => a.startsWith("roblox:") || a.startsWith("roblox-player:")
	);

	const robloxLaunchURL = firstRobloxURLArg || "roblox://";

	const child = exec(`flatpak run ${SOBER_APPID} "${robloxLaunchURL}"`);

	const isVerbose = process.argv.find(
		(a) => (a === "-v") || (a === "--verbose")
	);

	const watcher = new ActivityWatcher(child, {
		verbose: !!isVerbose,
		tuxstrapLaunchTime: Date.now()
	});

	child.on("exit", (code) => {
		process.exit(code);
	});

	await watcher.stdoutWatcher();
})();
