import { exec } from "child_process";
import { readFileSync } from "fs";
import { join } from "path";
import { promisify } from "util";
import { createHash } from "crypto";
import { existsSync, writeFileSync } from "fs";

const execAsync = promisify(exec);

export async function registerXdgOpen() {
	try {
		const commandToRun = process.argv[0]+' run '+join(__dirname,"..","index.ts")
		console.log("[TUXSTRAP] Possible bun run command:", commandToRun);
		
		const newDesktopSource = readFileSync(join(__dirname,"tuxstrap_files","tuxstrap.desktop")).toString().replace("%TUXSTRAP_BIN%",commandToRun)
		const desktopFilePath = join(process.env.HOME || "", ".local", "share", "applications", "tuxstrap.desktop");

		function hashContent(content: Buffer): string {
			return createHash("sha256").update(content).digest("hex");
		}

		const newDesktopHash = hashContent(new Buffer(newDesktopSource));

		if (!existsSync(desktopFilePath) || hashContent(readFileSync(desktopFilePath)) !== newDesktopHash) {
			writeFileSync(desktopFilePath, newDesktopSource);
			console.warn("[TUXSTRAP] Placed tuxstrap.desktop");
		} else {
			console.warn("[TUXSTRAP] tuxstrap.desktop already exists");	
		}
	} catch (error) {
		console.error("[TUXSTRAP] Failed to place tuxstrap.desktop", error);
	}
	try {
		await execAsync(`xdg-mime default tuxstrap.desktop x-scheme-handler/roblox`);
		await execAsync(`xdg-mime default tuxstrap.desktop x-scheme-handler/roblox-player`);
		console.warn("[TUXSTRAP] Registered Roblox URI protocols");
	} catch (error) {
		console.error("[TUXSTRAP] Failed to register Roblox URI protocols", error);
	}
}
