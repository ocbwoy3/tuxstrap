import { homedir } from "os";

export const TUXSTRAP_VERSION = "2.0.0";

export const SOBER_APPID = "org.vinegarhq.Sober";
export const SOBER_PATH = `${homedir()}/.var/app/org.vinegarhq.Sober`;
export const LAUNCH_COMMAND = "flatpak run org.vinegarhq.Sober";
export const LOGFILE_PATH = `${SOBER_PATH}/data/sober/appData/logs/`;
export const RECENT_LOG_THRESHOLD_SECONDS = 15;

export const LOCAL_CONFIG_ROOT = `${homedir()}/.config/tuxstrap`;
export const SOBER_CONFIG_PATH = `${SOBER_PATH}/config/sober/config.json`;
export const ROBLOX_COOKIES_FILE = `${SOBER_PATH}/data/sober/cookies`;

export const DISCORD_APPID = "1005469189907173486";
export const SMALL_IMAGE_KEY = "roblox";

export const isCompiled = process.argv0.includes("/bin/")
export const isNixOS = isCompiled && ((process.argv0 === "/run/current-system/sw/bin/tuxstrap") || process.argv0.includes("/nix/store"))
