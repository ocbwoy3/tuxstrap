import { exec } from "child_process";
import { readFileSync } from "fs";
import { join } from "path";
import { promisify } from "util";
import { createHash } from "crypto";
import { existsSync, writeFileSync } from "fs";

const execAsync = promisify(exec);

export async function registerDesktopFile(filename: string, runPath: string): Promise<void> {
	try {
		const commandToRun = process.argv[0] + ' run ' + runPath;
		console.log("[TUXSTRAP] Possible bun run command:", commandToRun);

		const newDesktopSource = readFileSync(join(__dirname, "tuxstrap_files", filename)).toString().replace("%TUXSTRAP_BIN%", commandToRun);
		const desktopFilePath = join(process.env.HOME || "", ".local", "share", "applications", filename);

		function hashContent(content: Buffer): string {
			return createHash("sha256").update(content).digest("hex");
		}

		const newDesktopHash = hashContent(Buffer.from(newDesktopSource));

		if (!existsSync(desktopFilePath) || hashContent(readFileSync(desktopFilePath)) !== newDesktopHash) {
			writeFileSync(desktopFilePath, newDesktopSource);
			console.warn(`[TUXSTRAP] Placed ${filename}`);
		} else {
			console.warn(`[TUXSTRAP] Desktop file registration already exists (${filename})`);
		}
	} catch (error) {
		console.error(`[TUXSTRAP] Failed to place ${filename}`, error);
	}
}

export async function registerXdgOpen(): Promise<void> {
	try {
		await registerDesktopFile(
			"tuxstrap.desktop",
			join(__dirname, "..", "index.ts")
		);
		await registerDesktopFile(
			"tuxstrap-manager.desktop",
			join(__dirname, "..", "index.ts")
		);
	} catch (error) {
		console.error("[TUXSTRAP] Failed to register desktop file", error);
	}

	try {
		await execAsync(`xdg-mime default tuxstrap.desktop x-scheme-handler/roblox`);
		await execAsync(`xdg-mime default tuxstrap.desktop x-scheme-handler/roblox-player`);
		console.warn("[TUXSTRAP] Registered Roblox URI protocols with XDG");
	} catch (error) {
		console.error("[TUXSTRAP] Failed to register Roblox URI protocols", error);
	}
}
