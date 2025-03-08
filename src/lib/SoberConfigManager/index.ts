import { readFileSync, writeFileSync } from "fs";
import { SOBER_CONFIG_PATH } from "../Constants";
import { FeatureFFlags, defaultFFlags } from "./fflags";

export interface SoberConfigFile {
	"*comment": string | undefined, // TUXSTRAP ONLY
	bring_back_oof: boolean;
	discord_rpc_enabled: boolean;
	enable_hidpi: boolean;
	fflags: { [key: string]: string | boolean | number };
	server_location_indicator_enabled: boolean;
	touch_mode: "off" | string;
	use_opengl: boolean;
}

export const defaultSoberConfig: SoberConfigFile = {
	"*comment": "",
	bring_back_oof: true,
	discord_rpc_enabled: true,
	enable_hidpi: false,
	fflags: {
		FStringWhitelistVerifiedUserId: "1083030325"
	},
	server_location_indicator_enabled: true,
	touch_mode: "off",
	use_opengl: false
}

export function readSoberConfig(): SoberConfigFile {
	try {
		const configContent = readFileSync(SOBER_CONFIG_PATH, "utf-8");
		return JSON.parse(configContent) as SoberConfigFile;
	} catch (error) {
		console.error("[SoberConfigManager] Failed to read config file / parse json, using default");
		// throw error;
		return defaultSoberConfig
	}
}

export function updateSoberConfig(newConfig: Partial<SoberConfigFile>): void {
	try {
		const currentConfig = readSoberConfig();
		const newFflags = { ...currentConfig.fflags, ...(newConfig.fflags || {}) };
		const updatedConfig: SoberConfigFile = {
			...currentConfig,
			...newConfig,
			fflags: newFflags,
			"*comment": "THIS FILE HAS BEEN MODIFIED BY TUXSTRAP. CHANGES TO ANY DEFAULT FFLAGS WILL BE DISCARDED.",
		};
		writeFileSync(SOBER_CONFIG_PATH, JSON.stringify(updatedConfig, null, 2), "utf-8");
		console.log("[SoberConfigManager] Config file updated successfully.");
	} catch (error) {
		console.error("[SoberConfigManager] Failed to update config file:", error);
		throw error;
	}
}

export function updateSoberConfigWithFeatures(features: string[]) {
	console.log("[SoberConfigManager] Applying default fflags.");
	let fflags = defaultFFlags;
	for (const feature of features) {
		if (FeatureFFlags[feature]) {
			console.log(`[SoberConfigManager] Applying fflags for ${feature}.`);
			fflags = { ...fflags, ...FeatureFFlags[feature] }
		}
	}

	updateSoberConfig({
		fflags: fflags,
	});
}
