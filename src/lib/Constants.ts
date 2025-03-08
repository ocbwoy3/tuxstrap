import { homedir } from "os";
import { EventEmitter } from "stream";
import { ActivityWatcher } from "./ActivityWatcher";
import { BloxstrapRPC } from "./BloxstrapRPC";

export const TUXSTRAP_VERSION = "1.2.0";

export const SOBER_CHECK_COMMAND = `flatpak list | grep "org\\.vinegarhq\\.Sober"`;
export const SOBER_PATH = `${homedir()}/.var/app/org.vinegarhq.Sober`;
export const LAUNCH_COMMAND = "flatpak run org.vinegarhq.Sober";
export const LOGFILE_PATH = `${SOBER_PATH}/data/sober/appData/logs/`;
export const RECENT_LOG_THRESHOLD_SECONDS = 15;

export const LOCAL_CONFIG_ROOT = `${homedir()}/.config/tuxstrap`;
export const LOCAL_CONFIG_FILEMODS_ROOT = `${LOCAL_CONFIG_ROOT}/filemods`;
export const LOCAL_CONFIG_FFLAGS = `${LOCAL_CONFIG_ROOT}/fflags.json`;
export const FILEMODS_ROOT = `${homedir()}/.var/app/org.vinegarhq.Sober/data/sober/assets/content/`;
export const SOBER_CONFIG_PATH = `${SOBER_PATH}/config/sober/config.json`;

export const DISCORD_APPID = "1005469189907173486";
export const SMALL_IMAGE_KEY = "roblox";

export const PluginEventEmitter = new EventEmitter();

export let activityWatcher: ActivityWatcher;
export function setActivityWatcherInstance(a: ActivityWatcher) {
	activityWatcher = a;
}

export let bloxstraprpc: BloxstrapRPC;
export function setBloxstrapRPCInstance(a: BloxstrapRPC) {
	bloxstraprpc = a;
}
