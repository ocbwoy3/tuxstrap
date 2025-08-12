import { SOBER_CONFIG_PATH, TUXSTRAP_VERSION } from "../constants";
import { getPlugins } from "../Plugin";
import type { fflagList, SoberConfig } from "../types";
import { writeFileSync } from "fs";

const defaultConfig: SoberConfig = {
	allowGamepad: false,
	bringBackOof: false,
	closeOnLeaave: false,
	enableRichPresence: true,
	enableGamemode: true,
	enableHiDPI: false,
	serverLocationIndicator: false,
	touchMode: "off",
	useConsoleExperience: false,
	useLibsecret: false,
	useOpenGL: false
};

export function generateConfiguration() {
	console.log("[api/sober/ConfigManager] Generating config file")

	// Lower configPrio means it merges first
	const plugins = getPlugins().sort((a, b) => a.configPrio - b.configPrio);

	let currentConfig: SoberConfig = { ...defaultConfig };
	let currentFFlags: fflagList = {};

	for (const plugin of plugins) {
		if (plugin.soberConfig) {
			currentConfig = { ...currentConfig, ...plugin.soberConfig };
		}
		if (plugin.fflags) {
			currentFFlags = { ...currentFFlags, ...plugin.fflags };
		}
	}

	const finalConfig = {
		"*":
			`WARNING: This file has been modified with TuxStrap. Launching it will discard all changes to this file. TuxStrap version: ${TUXSTRAP_VERSION}`,
		allow_gamepad_permission: currentConfig.allowGamepad,
		bring_back_oof: currentConfig.bringBackOof,
		close_on_leave: currentConfig.closeOnLeaave,
		discord_rpc_enabled: currentConfig.enableRichPresence,
		enable_gamemode: currentConfig.enableGamemode,
		enable_hidpi: currentConfig.enableHiDPI,
		fflags: currentFFlags,
		server_location_indicator_enabled:
			currentConfig.serverLocationIndicator,
		touch_mode: currentConfig.touchMode,
		use_console_experience: currentConfig.useConsoleExperience,
		use_libsecret: currentConfig.useLibsecret,
		use_opengl: currentConfig.useOpenGL
	};

	return finalConfig;
}

export function generateConfigFile() {
	const content = JSON.stringify(generateConfiguration(),undefined,"\t")
	writeFileSync(SOBER_CONFIG_PATH, content);
	console.log(`[api/sober/ConfigManager] Updated ${SOBER_CONFIG_PATH}`);
}
