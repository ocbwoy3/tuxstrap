// early prototype by me (ocbwoy3)
// fixed by chatgpt and v0

import { join } from "path";
import {
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	writeFileSync,
	unlinkSync,
	rmSync,
	copyFileSync,
	cpSync,
	statSync,
} from "fs";
import prompts from "prompts";

const HOME = process.env.HOME || "";
const SOBER_DATA_DIR = join(
	HOME,
	".var",
	"app",
	"org.vinegarhq.Sober",
	"data",
	"sober"
);
const SOBER_COOKIES = join(SOBER_DATA_DIR, "cookies");
const SOBER_APP_DATA = join(SOBER_DATA_DIR, "appData");
const CONFIG_DIR = join(HOME, ".config", "tuxstrap");
const PROFILES_DIR = join(CONFIG_DIR, "profiles");
const CURRENT_PROFILE_FILE = join(CONFIG_DIR, "current_profile");

// Profile structure
interface ProfileMetadata {
	nickname: string;
	createdAt: string;
	lastUsed: string;
	optionalFeatures?: string[];
}

function createTuxstrapConfigDir(): void {
	console.log(`Creating config directory at ${CONFIG_DIR}`);

	// Ensure config directories exist
	mkdirSync(CONFIG_DIR, { recursive: true });
	mkdirSync(PROFILES_DIR, { recursive: true });

	console.log(`Config directory created: ${existsSync(CONFIG_DIR)}`);
	console.log(`Profiles directory created: ${existsSync(PROFILES_DIR)}`);

	if (!existsSync(join(CONFIG_DIR, "config.json"))) {
		writeFileSync(
			join(CONFIG_DIR, ".gitignore"),
			"profiles\ncurrent_profile",
			"utf-8"
		);

		// Create default profile if it doesn't exist
		const defaultProfileDir = join(PROFILES_DIR, "default");
		if (!existsSync(defaultProfileDir)) {
			console.log(`Creating default profile at ${defaultProfileDir}`);
			mkdirSync(defaultProfileDir, { recursive: true });

			// Create metadata file
			const metadata: ProfileMetadata = {
				nickname: "Default Profile",
				createdAt: new Date().toISOString(),
				lastUsed: new Date().toISOString(),
			};
			writeFileSync(
				join(defaultProfileDir, "metadata.json"),
				JSON.stringify(metadata, null, 2),
				"utf-8"
			);

			// Always create an empty cookies file
			writeFileSync(join(defaultProfileDir, "cookies"), "", "binary");

			// Always create an empty appData directory
			mkdirSync(join(defaultProfileDir, "appData"), { recursive: true });

			// Copy current cookies and appData if they exist (overwriting the empty ones)
			if (existsSync(SOBER_COOKIES)) {
				copyFileSync(SOBER_COOKIES, join(defaultProfileDir, "cookies"));
			}

			if (existsSync(SOBER_APP_DATA)) {
				cpSync(SOBER_APP_DATA, join(defaultProfileDir, "appData"), {
					recursive: true,
				});
			}

			console.log(
				`Default profile created: ${existsSync(defaultProfileDir)}`
			);
		}

		// Set default as current profile
		writeFileSync(CURRENT_PROFILE_FILE, "default", "utf-8");

		// Create config file
		const configFile = join(CONFIG_DIR, "config.json");
		const defaultConfig = { enabledFeatures: [] };
		writeFileSync(
			configFile,
			JSON.stringify(defaultConfig, null, 2),
			"utf-8"
		);
	}
}

/**
 * Get profile metadata
 */
function getProfileMetadata(profileName: string): ProfileMetadata {
	const metadataPath = join(PROFILES_DIR, profileName, "metadata.json");
	if (existsSync(metadataPath)) {
		try {
			return JSON.parse(readFileSync(metadataPath, "utf-8"));
		} catch (error) {
			console.error(
				`Error reading metadata for profile '${profileName}':`,
				error
			);
		}
	}

	// Return default metadata if file doesn't exist or is invalid
	return {
		nickname: profileName,
		createdAt: new Date().toISOString(),
		lastUsed: new Date().toISOString(),
		optionalFeatures: [],
	};
}

/**
 * Update profile metadata
 */
function updateProfileMetadata(
	profileName: string,
	updates: Partial<ProfileMetadata>
): void {
	const profileDir = join(PROFILES_DIR, profileName);
	const metadataPath = join(profileDir, "metadata.json");

	// Get current metadata or create default
	let metadata = getProfileMetadata(profileName);

	// Apply updates
	metadata = { ...metadata, ...updates };

	// Save updated metadata
	writeFileSync(metadataPath, JSON.stringify(metadata, null, 2), "utf-8");
}

/**
 * Save current Sober state to the specified profile
 */
function saveProfileState(profileName: string): boolean {
	const profileDir = join(PROFILES_DIR, profileName);

	// Ensure profile directory exists
	if (!existsSync(profileDir)) {
		console.log(`Creating profile directory: ${profileDir}`);
		mkdirSync(profileDir, { recursive: true });
		console.log(`Profile directory created: ${existsSync(profileDir)}`);

		// Create default metadata if this is a new profile
		const metadata: ProfileMetadata = {
			nickname: profileName,
			createdAt: new Date().toISOString(),
			lastUsed: new Date().toISOString(),
		};
		writeFileSync(
			join(profileDir, "metadata.json"),
			JSON.stringify(metadata, null, 2),
			"utf-8"
		);

		// Create empty cookies file and appData directory
		writeFileSync(join(profileDir, "cookies"), "", "binary");
		mkdirSync(join(profileDir, "appData"), { recursive: true });
	}

	try {
		// Save cookies if they exist
		if (existsSync(SOBER_COOKIES)) {
			copyFileSync(SOBER_COOKIES, join(profileDir, "cookies"));
		}

		// Save appData if it exists
		if (existsSync(SOBER_APP_DATA)) {
			const profileAppDataDir = join(profileDir, "appData");

			// Remove existing appData directory if it exists
			if (existsSync(profileAppDataDir)) {
				rmSync(profileAppDataDir, { recursive: true, force: true });
			}

			// Create appData directory and copy contents
			mkdirSync(profileAppDataDir, { recursive: true });
			cpSync(SOBER_APP_DATA, profileAppDataDir, { recursive: true });
		}

		// Update last used timestamp
		updateProfileMetadata(profileName, {
			lastUsed: new Date().toISOString(),
		});

		console.log(`Saved state to profile '${profileName}'.`);
		return true;
	} catch (error) {
		console.error(`Error saving state to profile '${profileName}':`, error);
		return false;
	}
}

/**
 * Load profile state into Sober
 */
function loadProfileState(profileName: string): void {
	const profileDir = join(PROFILES_DIR, profileName);
	if (!existsSync(profileDir)) {
		throw new Error(`Profile '${profileName}' not found.`);
	}

	// Check if profile has cookies
	const profileCookies = join(profileDir, "cookies");
	if (!existsSync(profileCookies)) {
		console.log(
			`Warning: Profile '${profileName}' has no cookie data. Creating empty file.`
		);
		writeFileSync(profileCookies, "", "binary");
	}

	// Check if profile has appData
	const profileAppData = join(profileDir, "appData");
	if (!existsSync(profileAppData)) {
		console.log(
			`Warning: Profile '${profileName}' has no appData directory. Creating empty directory.`
		);
		mkdirSync(profileAppData, { recursive: true });
	}

	try {
		// Ensure Sober data directory exists
		mkdirSync(SOBER_DATA_DIR, { recursive: true });

		// Copy cookies
		// Remove existing cookies if they exist
		if (existsSync(SOBER_COOKIES)) {
			unlinkSync(SOBER_COOKIES);
		}

		// Copy profile cookies to Sober
		copyFileSync(profileCookies, SOBER_COOKIES);

		// Copy appData
		// Remove existing appData if it exists
		if (existsSync(SOBER_APP_DATA)) {
			rmSync(SOBER_APP_DATA, { recursive: true, force: true });
		}

		// Create appData directory and copy contents
		mkdirSync(SOBER_APP_DATA, { recursive: true });
		cpSync(profileAppData, SOBER_APP_DATA, { recursive: true });

		// Update last used timestamp
		updateProfileMetadata(profileName, {
			lastUsed: new Date().toISOString(),
		});

		const metadata = getProfileMetadata(profileName);
		console.log(
			`Switched to profile '${metadata.nickname}' (${profileName}).`
		);
	} catch (error) {
		console.error(`Error loading profile '${profileName}':`, error);
		throw error;
	}
}

/**
 * Save current state and load the specified profile
 */
function switchProfile(name: string): void {
	const currentProfile = existsSync(CURRENT_PROFILE_FILE)
		? readFileSync(CURRENT_PROFILE_FILE, "utf-8").trim()
		: null;

	// Don't do anything if switching to the same profile
	if (currentProfile === name) {
		console.log(`Already using profile '${name}'.`);
		return;
	}

	// Save current state to the old profile
	if (currentProfile) {
		saveProfileState(currentProfile);
	}

	try {
		// Load new profile state
		loadProfileState(name);

		// Update current profile
		writeFileSync(CURRENT_PROFILE_FILE, name, "utf-8");

		console.log(`Successfully switched to profile '${name}'.`);
	} catch (error) {
		console.error(`Failed to switch to profile '${name}':`, error);

		// If we failed to switch, try to restore the previous profile
		if (currentProfile) {
			try {
				loadProfileState(currentProfile);
				console.log(`Restored previous profile '${currentProfile}'.`);
			} catch (restoreError) {
				console.error(
					`Failed to restore previous profile:`,
					restoreError
				);
			}
		}
	}
}

export function linkCurrentRobloxAccountCookies(): void {
	createTuxstrapConfigDir();
	const current = existsSync(CURRENT_PROFILE_FILE)
		? readFileSync(CURRENT_PROFILE_FILE, "utf-8").trim()
		: null;
	if (!current) throw new Error("No current profile set.");
	loadProfileState(current);
}

export function getOptionalFeaturesForCurrentProfile(): string[] {
	const current = existsSync(CURRENT_PROFILE_FILE)
		? readFileSync(CURRENT_PROFILE_FILE, "utf-8").trim()
		: null;
	if (!current) throw new Error("No current profile set.");
	return getProfileMetadata(current).optionalFeatures || [];
}

/**
 * Check if a directory is empty
 */
function isDirectoryEmpty(dirPath: string): boolean {
	try {
		const files = readdirSync(dirPath);
		return files.length === 0;
	} catch (error) {
		console.error(
			`Error checking if directory is empty: ${dirPath}`,
			error
		);
		return false;
	}
}

/**
 * Debug function to list all files in a directory
 */
function debugListDirectory(dirPath: string, indent = ""): void {
	return;
	/*
	// console.log(`${indent}Directory: ${dirPath}`);

	try {
		if (!existsSync(dirPath)) {
			console.log(`${indent}  [Directory does not exist]`);
			return;
		}

		const entries = readdirSync(dirPath, { withFileTypes: true });

		if (entries.length === 0) {
			console.log(`${indent}  [Empty directory]`);
			return;
		}

		for (const entry of entries) {
			if (entry.isDirectory()) {
				console.log(`${indent}  📁 ${entry.name}/`);
				debugListDirectory(join(dirPath, entry.name), `${indent}    `);
			} else {
				try {
					const stats = statSync(join(dirPath, entry.name));
					console.log(
						`${indent}  📄 ${entry.name} (${stats.size} bytes)`
					);
				} catch (error) {
					console.log(`${indent}  📄 ${entry.name} (size unknown)`);
				}
			}
		}
	} catch (error) {
		console.error(`Error listing directory: ${dirPath}`, error);
	}
		*/
}

export async function runSettingsManager(): Promise<void> {
	console.log("Starting settings manager...");

	try {
		createTuxstrapConfigDir();

		// Debug: List the profiles directory
		console.log("\nDebug: Listing profiles directory structure:");
		debugListDirectory(PROFILES_DIR);
		console.log("");
	} catch (error) {
		console.error("Error during initialization:", error);
	}

	function listProfiles(): string[] {
		if (!existsSync(PROFILES_DIR)) {
			console.log(`Profiles directory does not exist: ${PROFILES_DIR}`);
			return [];
		}

		try {
			const entries = readdirSync(PROFILES_DIR, { withFileTypes: true });
			const profiles = entries
				.filter(
					(dirent) =>
						dirent.isDirectory() && dirent.name !== ".gitignore"
				)
				.map((dirent) => dirent.name);

			console.log(
				`Found ${profiles.length} profiles: ${profiles.join(", ")}`
			);
			return profiles;
		} catch (error) {
			console.error("Error listing profiles:", error);
			return [];
		}
	}

	function createProfile(name: string, nickname: string): void {
		console.log(`Creating profile: ${name} (${nickname})`);

		const profileDir = join(PROFILES_DIR, name);
		if (existsSync(profileDir)) {
			console.log(`Profile '${name}' already exists.`);
			return;
		}

		try {
			// Create profile directory
			console.log(`Creating profile directory: ${profileDir}`);
			mkdirSync(profileDir, { recursive: true });

			if (!existsSync(profileDir)) {
				throw new Error(
					`Failed to create profile directory: ${profileDir}`
				);
			}

			console.log(`Profile directory created: ${existsSync(profileDir)}`);

			// Create metadata file
			const metadata: ProfileMetadata = {
				nickname: nickname || name,
				createdAt: new Date().toISOString(),
				lastUsed: new Date().toISOString(),
			};

			const metadataPath = join(profileDir, "metadata.json");
			console.log(`Creating metadata file: ${metadataPath}`);
			writeFileSync(
				metadataPath,
				JSON.stringify(metadata, null, 2),
				"utf-8"
			);
			console.log(`Metadata file created: ${existsSync(metadataPath)}`);

			// ALWAYS create an empty cookies file
			const profileCookiesPath = join(profileDir, "cookies");
			console.log(`Creating empty cookies file: ${profileCookiesPath}`);
			writeFileSync(profileCookiesPath, "", "binary");
			console.log(
				`Empty cookies file created: ${existsSync(profileCookiesPath)}`
			);

			// ALWAYS create an empty appData directory
			const profileAppDataDir = join(profileDir, "appData");
			console.log(
				`Creating empty appData directory: ${profileAppDataDir}`
			);
			mkdirSync(profileAppDataDir, { recursive: true });
			console.log(
				`Empty appData directory created: ${existsSync(
					profileAppDataDir
				)}`
			);

			// Copy current state if available (overwriting the empty files)
			if (existsSync(SOBER_COOKIES)) {
				console.log(
					`Copying existing cookies to: ${profileCookiesPath}`
				);
				copyFileSync(SOBER_COOKIES, profileCookiesPath);
			}

			if (existsSync(SOBER_APP_DATA)) {
				console.log(
					`Copying existing appData to: ${profileAppDataDir}`
				);
				cpSync(SOBER_APP_DATA, profileAppDataDir, { recursive: true });
			}

			console.log(`Created profile '${nickname || name}'.`);

			// Debug: List the created profile directory
			console.log(
				"\nDebug: Listing created profile directory structure:"
			);
			debugListDirectory(profileDir);
			console.log("");
		} catch (error) {
			console.error(`Error creating profile '${name}':`, error);
		}
	}

	function deleteProfile(name: string): void {
		const profileDir = join(PROFILES_DIR, name);
		if (!existsSync(profileDir)) {
			console.log(`Profile '${name}' not found.`);
			return;
		}

		try {
			rmSync(profileDir, { recursive: true, force: true });
			console.log(`Deleted profile '${name}'.`);

			// Reset current profile to default if we deleted the current one
			const cur = readFileSync(CURRENT_PROFILE_FILE, "utf-8").trim();
			if (cur === name) {
				writeFileSync(CURRENT_PROFILE_FILE, "default", "utf-8");
				console.log("Reset current profile to 'default'.");
			}
		} catch (error) {
			console.error(`Error deleting profile '${name}':`, error);
		}
	}

	function renameProfileNickname(name: string, newNickname: string): void {
		const profileDir = join(PROFILES_DIR, name);
		if (!existsSync(profileDir)) {
			console.log(`Profile '${name}' not found.`);
			return;
		}

		try {
			updateProfileMetadata(name, { nickname: newNickname });
			console.log(`Renamed profile '${name}' to '${newNickname}'.`);
		} catch (error) {
			console.error(`Error renaming profile '${name}':`, error);
		}
	}

	while (true) {
		const profiles = listProfiles();
		const profileChoices = profiles.map((name) => {
			const metadata = getProfileMetadata(name);
			return {
				title: `${metadata.nickname} (${name})`,
				value: name,
			};
		});

		const { action } = await prompts({
			type: "select",
			name: "action",
			message: "Action:",
			choices: [
				{ title: "Switch Profile", value: "switch" },
				{ title: "Create Profile", value: "create" },
				{ title: "Rename Profile", value: "rename" },
				{ title: "Delete Profile", value: "delete" },
				{ title: "Debug: List Directories", value: "debug" },
				{ title: "Exit", value: "exit" },
			],
		});

		switch (action) {
			case "exit":
				process.exit(0);
			case "debug": {
				console.log("\nDebug: Listing directory structure:");
				console.log(`CONFIG_DIR: ${CONFIG_DIR}`);
				debugListDirectory(CONFIG_DIR);
				console.log(`\nPROFILES_DIR: ${PROFILES_DIR}`);
				debugListDirectory(PROFILES_DIR);
				console.log(`\nSOBER_DATA_DIR: ${SOBER_DATA_DIR}`);
				if (existsSync(SOBER_DATA_DIR)) {
					debugListDirectory(SOBER_DATA_DIR);
				} else {
					console.log("  [Directory does not exist]");
				}
				console.log("");
				break;
			}
			case "delete": {
				if (profiles.length === 0) {
					console.log("No profiles to delete.");
					break;
				}

				const { profile } = await prompts({
					type: "select",
					name: "profile",
					message: "Delete which profile?",
					choices: profileChoices,
				});

				if (profile) {
					const { ok } = await prompts({
						type: "confirm",
						name: "ok",
						message: `Really delete profile '${profile}'?`,
					});

					if (ok) deleteProfile(profile);
				}
				break;
			}
			case "switch": {
				if (profiles.length === 0) {
					console.log(
						"No profiles to switch to. Create a profile first."
					);
					break;
				}

				const { profile } = await prompts({
					type: "select",
					name: "profile",
					message: "Switch to which profile?",
					choices: profileChoices,
				});

				if (profile) switchProfile(profile);
				break;
			}
			case "create": {
				const { name } = await prompts({
					type: "text",
					name: "name",
					message:
						"New profile ID (no spaces, used for file naming):",
					validate: (value) =>
						value.trim() === ""
							? "Profile ID cannot be empty"
							: /\s/.test(value)
							? "Profile ID cannot contain spaces"
							: profiles.includes(value)
							? "Profile ID already exists"
							: true,
				});

				if (name) {
					const { nickname } = await prompts({
						type: "text",
						name: "nickname",
						message: "Profile nickname (display name):",
						initial: name,
					});

					createProfile(name, nickname);

					// Verify the profile was created
					console.log(`Verifying profile creation...`);
					const updatedProfiles = listProfiles();
					if (updatedProfiles.includes(name)) {
						console.log(
							`Profile '${name}' was successfully created and is in the profiles list.`
						);
					} else {
						console.log(
							`Warning: Profile '${name}' was not found in the profiles list after creation.`
						);
					}
				}
				break;
			}
			case "rename": {
				if (profiles.length === 0) {
					console.log("No profiles to rename.");
					break;
				}

				const { profile } = await prompts({
					type: "select",
					name: "profile",
					message: "Rename which profile?",
					choices: profileChoices,
				});

				if (profile) {
					const currentMetadata = getProfileMetadata(profile);
					const { nickname } = await prompts({
						type: "text",
						name: "nickname",
						message: "New nickname:",
						initial: currentMetadata.nickname,
					});

					if (nickname) renameProfileNickname(profile, nickname);
				}
				break;
			}
		}
	}
}
