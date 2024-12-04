import { Command } from "commander";
import { textSync } from "figlet";
import { activityWatcher, LAUNCH_COMMAND, setActivityWatcherInstance, setBloxstrapRPCInstance, TUXSTRAP_VERSION } from "./lib/Constants";
import { exec, spawn } from "child_process";
import { ActivityWatcher } from "./lib/ActivityWatcher";
import { TuxstrapOptions } from "./lib/Types";
import { BloxstrapRPC } from "./lib/BloxstrapRPC";

// console.log(textSync("TuxStrap"));
const program = new Command("tuxstrap");

program
	.version(TUXSTRAP_VERSION,"--version", "Returns the version of TuxStrap")
	.description("An alternative Roblox launcher for Linux")
	.helpOption("-h, --help", "Shows this message")
	// .option("--disable-plugins", "Disables plugins during launch")
	.option("--use-features <features>", "Enables experimental features")
	// .option("--disable-filemods", "Prevent file modifications from being applied")
	.option("--gamemode", "Launch Roblox with gamemoderun, possibly improving performance")
	.option("-s, --silent", "Disable game join and plugin notifications")
	.option("-v, --verbose", "Shows Roblox's stdout in the log")
	.option("--background", "Runs the process in the background")
	.option("--opengl", "Use the OpenGL renderer instead of Vulkan")
	.argument('[url]','A roblox:// URL for launching a specific game or server (optional)')

program.addHelpText('after',`
Example call:
  $ tuxstrap --use-features "wayland-copy,regretevator-notifications,hyprland-ipc" "roblox://placeId=4972273297"
`)
program.parse(process.argv);

const options = program.opts();

if (options.disown) {
	if (process.setgid) { try { process.setgid(0); } catch(e_) { console.warn("[INIT] FAILED TO DISOWN (SETGID 0) - ",e_) }};
	if (process.setuid) { try { process.setuid(0); } catch(e_) { console.warn("[INIT] FAILED TO DISOWN (SETUID 0) - ",e_) }};
	if (process.setegid) { try { process.setegid(0); } catch(e_) { console.warn("[INIT] FAILED TO DISOWN (SETEGID 0) - ",e_) }};
	if (exec) { try { exec(`disown ${process.pid}`) } catch(e_) { console.warn("[INIT] FAILED TO DISOWN (DISOWN PID) - ",e_) }};
	if (exec) { try { exec(`disown`) } catch(e_) { console.warn("[INIT] FAILED TO DISOWN (DISOWN) - ",e_) }};
}


let opts: TuxstrapOptions = {
	usePlugins: true,
	useFeatures: [],
	useFilemods: true,
	showNotifications: true,
	useGamemode: false,
	verbose: false,
	tuxstrapLaunchTime: Date.now()
}

if (options.disablePlugins === true) { opts.usePlugins = false };
if (options.useFeatures) { (opts.useFeatures as string[]) = (options.useFeatures as string).split(",") };
if (options.noFilemods === true) { opts.useFilemods = false };
if (options.silent === true) { opts.showNotifications = false };
if (options.gamemode === true) { opts.useGamemode = true };
if (options.verbose === true) { opts.verbose = true };

const URI = program.args[0] || "roblox://";
const sober_cmd = `${opts.useGamemode ? "gamemoderun " : ""}${LAUNCH_COMMAND}${program.args[0] ? ` "${URI}"` : ""}${options.opengl ? " --opengl" : ""}`

if (options.background) {
	console.log("[INIT]","Process argv:",process.argv.join(" "));
	const procargv = process.argv.join(" ").replace("--background","")
	if (process.env.HYPRLAND_INSTANCE_SIGNATURE) {
		console.log("[INIT]","Detected HYPRLAND_INSTANCE_SIGNATURE - Executing in background");
		spawn("hyprctl",["dispatch","exec",procargv]);
		process.exit(0);
	}
	console.error("[INIT]","Cannot execute in the background! Please use your WM/DE's preferred way to run commands in the background, or fork this process and disown it.");
	process.exit(1);
}

console.log("[INIT]","Using features:",opts.useFeatures);
console.log("[INIT]","Sober Launch Command:",sober_cmd);

if (options.opengl) exec(`notify-send -a "tuxstrap" -u low "Roblox" "Using OpenGL renderer"`);

const launch_time = Date.now();
const child = exec(sober_cmd);


const watcher = new ActivityWatcher(child,opts);
setActivityWatcherInstance(watcher);

const rpc = new BloxstrapRPC(watcher);
setBloxstrapRPCInstance(rpc);
// Fix for TypeError: undefined is not an object (evaluating 'bloxstraprpc._stashedRPCMessage') 

child.on('exit',(code)=>{
	if (code === 0) {
		process.exit(0);
	};
	console.error("[INIT]",`Sober exited with code ${code}`);
	if ((Date.now()-launch_time) > 5000) {
		console.error("[INIT]",`Roblox has likely crashed, killed or been manually closed.`);	
	} else {
		console.error("[INIT]",`There might be another instance of Sober running.`);
	}
	process.exit(1);
});

(async()=>{
	opts.useFeatures.map((v:string)=>`features/${v}`).forEach((m:string)=>{
		try {
			require(`${__dirname}/${m}`);
			console.log("[INIT]",`Successfully loaded ${m}`);
		} catch (e_) {
			if (`${e_}`.includes("find module")) {
				console.error("[INIT]",`Feature ${m} doesn't exist`)			
				if (opts.showNotifications) exec(`notify-send -a "tuxstrap" -u low "Roblox" "Cannot find ${m}"`);
			} else {
				console.error("[INIT]",`Failed to load ${m}:`,e_)
				if (opts.showNotifications) exec(`notify-send -a "tuxstrap" -u low "Roblox" "Error loading ${m}"`);
			}
		}
	})
})()

if (opts.showNotifications) {
	activityWatcher.BloxstrapRPCEvent.on("ObtainLog",()=>{
		exec(`notify-send -a tuxstrap -u low "TuxStrap" "Obtained Roblox's logfile"`);
	})
}

watcher.stdoutWatcher();
