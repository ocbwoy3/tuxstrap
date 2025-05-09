import { Command } from "commander";
import {
	activityWatcher,
	LAUNCH_COMMAND,
	setActivityWatcherInstance,
	setBloxstrapRPCInstance,
	SOBER_CONFIG_PATH,
	TUXSTRAP_VERSION,
} from "./lib/Constants";
import { exec, spawn } from "child_process";
import { ActivityWatcher } from "./lib/ActivityWatcher";
import { TuxstrapOptions } from "./lib/Types";
import { BloxstrapRPC } from "./lib/BloxstrapRPC";
import { registerXdgOpen } from "./lib/XdgRegistration";
import { readdirSync, readFileSync, rmSync } from "fs";
import { join } from "path";

import chalk from "chalk";
import { updateSoberConfigWithFeatures } from "./lib/SoberConfigManager";
import {
	getOptionalFeaturesForCurrentProfile,
	linkCurrentRobloxAccountCookies,
	runSettingsManager,
} from "./lib/TuxstrapManager";

// console.log(textSync("TuxStrap"));
const program = new Command("tuxstrap");

program
	.version(TUXSTRAP_VERSION, "--version", "Returns the version of TuxStrap")
	.description("An alternative Roblox launcher for Linux")
	.helpOption("-h, --help", "Shows this message")
	// .option("--disable-plugins", "Disables plugins during launch") // WIP
	.option("--use-features <features>", "Enables features (e.g. wayland-copy)")
	// .option("--disable-filemods", "Prevent file modifications from being applied") // WIP
	.option(
		"--gamemode",
		"Launch Roblox with gamemoderun, possibly improving performance"
	)
	.option("-s, --silent", "Disable game join and plugin notifications")
	.option("-v, --verbose", "Shows Roblox's stdout in the log")
	.option(
		"--background",
		"Attempts to disown the Roblox process or run it with hyprctl"
	)
	.option(
		"--all-features",
		"Use all featurs of TuxStrap. Cannot be used with `--use-features`."
	)
	.option("--reset-sober-config", "Resets the Sober config.")
	.argument(
		"[url]",
		"A roblox:// URL for launching a specific game or server (optional)"
	);

program.addHelpText(
	"after",
	`
Example call:
  $ tuxstrap --use-features "wayland-copy,hyprland-ipc" "roblox://placeId=4972273297"
`
);
program.parse(process.argv);

const options = program.opts();

console.log(
	readFileSync(
		join(__dirname, "lib", "tuxstrap_files", "tuxstrap-figlet.txt")
	).toString()
);

if (options.disown) {
	if (process.setgid) {
		try {
			process.setgid(0);
		} catch (e_) {
			console.warn("[INIT] FAILED TO DISOWN (SETGID 0) - ", e_);
		}
	}
	if (process.setuid) {
		try {
			process.setuid(0);
		} catch (e_) {
			console.warn("[INIT] FAILED TO DISOWN (SETUID 0) - ", e_);
		}
	}
	if (process.setegid) {
		try {
			process.setegid(0);
		} catch (e_) {
			console.warn("[INIT] FAILED TO DISOWN (SETEGID 0) - ", e_);
		}
	}
	if (exec) {
		try {
			exec(`disown ${process.pid}`);
		} catch (e_) {
			console.warn("[INIT] FAILED TO DISOWN (DISOWN PID) - ", e_);
		}
	}
	if (exec) {
		try {
			exec(`disown`);
		} catch (e_) {
			console.warn("[INIT] FAILED TO DISOWN (DISOWN) - ", e_);
		}
	}
}

let opts: TuxstrapOptions = {
	usePlugins: true,
	useFeatures: [],
	useFilemods: true, // ! DEPRECATED: Sober has file overlays
	showNotifications: true,
	useGamemode: false,
	verbose: false,
	tuxstrapLaunchTime: Date.now(),
};

if (options.disablePlugins === true) {
	opts.usePlugins = false;
}
if (options.resetSoberConfig === true) {
	try {
		rmSync(SOBER_CONFIG_PATH);
	} catch {}
}
if (options.useFeatures) {
	(opts.useFeatures as string[]) = (options.useFeatures as string).split(",");
}
if (options.allFeatures === true) {
	if (options.useFeatures) {
		console.error(
			"[TUXSTRAP]",
			"Cannot use --use-features together with --all-features. Choose only one of them."
		);
		process.exit(1);
	}
	(opts.useFeatures as string[]) = [...getOptionalFeaturesForCurrentProfile(), ...readdirSync(
		join(__dirname, "features")
	).filter(a=>!a.endsWith(".opt.ts")).map((a) => a.replace(".ts", ""))];

	
}
if (options.noFilemods === true) {
	opts.useFilemods = false;
}
if (options.silent === true) {
	opts.showNotifications = false;
}
if (options.gamemode === true) {
	opts.useGamemode = true;
}
if (options.verbose === true) {
	opts.verbose = true;
}

(() => {
	const URI = program.args[0] || "roblox://";

	if (URI === "roblox://tuxstrap") {
		runSettingsManager();
		return;
	}

	updateSoberConfigWithFeatures(opts.useFeatures);

	const sober_cmd = `${
		opts.useGamemode ? "gamemoderun " : ""
	}${LAUNCH_COMMAND}${program.args[0] ? ` "${URI}"` : ""}`;

	console.log(
		"[TUXSTRAP]",
		"Using features: " + opts.useFeatures.join(" ").replace('"', "")
	);

	registerXdgOpen();

	if (options.background) {
		// console.log("[TUXSTRAP]", "Process argv:", process.argv.join(" "));
		const procargv = process.argv.join(" ").replace("--background", "");
		if (process.env.HYPRLAND_INSTANCE_SIGNATURE) {
			console.log(
				"[TUXSTRAP]",
				"Detected HYPRLAND_INSTANCE_SIGNATURE - Executing in background"
			);
			spawn("hyprctl", ["dispatch", "exec", procargv]);
			console.log(chalk.yellow("Launching Roblox, have fun!"));
			process.exit(0);
		}
		console.error(
			"[TUXSTRAP]",
			"Cannot execute in the background! Please use your WM/DE's preferred way to run commands in the background, or fork this process and disown it."
		);
		process.exit(1);
	}

	console.log(chalk.yellow("Launching Roblox, have fun!"));

	if (options.opengl)
		exec(
			`notify-send -a "tuxstrap" -u low "Roblox" "Using OpenGL renderer"`
		);

	linkCurrentRobloxAccountCookies();

	const launch_time = Date.now();
	const child = exec(sober_cmd);

	const watcher = new ActivityWatcher(child, opts);
	setActivityWatcherInstance(watcher);

	const rpc = new BloxstrapRPC(watcher);
	setBloxstrapRPCInstance(rpc);
	// Fix for TypeError: undefined is not an object (evaluating 'bloxstraprpc._stashedRPCMessage')

	child.on("exit", (code) => {
		if (code === 0) {
			process.exit(0);
		}
		console.error("[TUXSTRAP]", `Sober exited with code ${code}`);
		if (Date.now() - launch_time > 5000) {
			console.error(
				"[TUXSTRAP]",
				`Roblox has likely crashed, killed or been manually closed.`
			);
		} else {
			console.error(
				"[TUXSTRAP]",
				`There might be another instance of Sober running.`
			);
		}
		process.exit(1);
	});

	(async () => {
		opts.useFeatures
			.map((v: string) => `features/${v}`)
			.forEach((m: string) => {
				try {
					require(`${__dirname}/${m}`);
					console.log("[TUXSTRAP]", `Successfully loaded ${m}`);
				} catch (e_) {
					if (`${e_}`.includes("find module")) {
						console.error(
							"[TUXSTRAP]",
							`Feature ${m} doesn't exist`
						);
						if (opts.showNotifications)
							exec(
								`notify-send -a "tuxstrap" -u low "Roblox" "Cannot find ${m}"`
							);
					} else {
						console.error("[INIT]", `Failed to load ${m}:`, e_);
						if (opts.showNotifications)
							exec(
								`notify-send -a "tuxstrap" -u low "Roblox" "Error loading ${m}"`
							);
					}
				}
			});
	})();

	if (opts.showNotifications) {
		activityWatcher.BloxstrapRPCEvent.on("ObtainLog", () => {
			exec(
				`notify-send -a tuxstrap -u low "TuxStrap" "Obtained Roblox's logfile"`
			);
		});
	}

	watcher.stdoutWatcher();
})();
