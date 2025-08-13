import { $ } from "bun";
import { writeFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";

type DesktopEntry = {
	name: string,
	genericName: string,
	comment: string,
	keywords?: string[],
	executable: string,
	type: "Application",
	noDisplay: boolean,
	categories: string[],
	icon?: string,
	mimeTypes: string[]
}

/** tuxstrap.desktop */
export const tuxstrapDesktopEntry: DesktopEntry = {
	name: "TuxStrap",
	genericName: "Roblox Player",
	comment: "Basically just Bloxstrap, but for Linux!",
	keywords: ["roblox", "vinegar", "game", "gaming", "social", "experience", "launcher"],
	type: "Application",
	noDisplay: false,
	icon: "org.vinegarhq.Sober",
	mimeTypes: ["x-scheme-handler/roblox", "x-scheme-handler/roblox-player"],
	categories: ["GNOME", "GTK", "Game"],
	executable: `${process.argv.filter(a=>!a.includes("roblox")).join(" ")} -- @@u %u @@`
}

export function createDesktopEntry(d: DesktopEntry, realPath?: string) {
	return `[Desktop Entry]
	Type=${d.type}
	Name=${d.name}
	GenericName=${d.genericName}
	Comment=${d.comment}
	${d.keywords && `Keywords=${d.keywords.join(";")};`}
	${d.icon && `Icon=${d.icon}`}
	NoDisplay=${d.noDisplay}
	Categories=${d.categories.join(";")};
	Exec=${realPath ? (realPath + " -- @@u %u @@") : d.executable}
	MimeType=${d.mimeTypes.join(";")};
	`.replace(/^\t+/mg,"").replaceAll("\n\n","\n")
}

export async function registerXDG(fileName: string) {
	if (process.argv0.endsWith("bin/tuxstrap")) {
		for (const mimeType of tuxstrapDesktopEntry.mimeTypes) {
			const r = await $`xdg-mime default ${fileName} ${mimeType}`.nothrow().quiet();
			if (r.exitCode === 0) {
				console.log(`Registered Default XDG Mime ${mimeType} -> ${fileName}`);
			} else {
				console.error(`Failed to Register Default XDG Mime ${mimeType} -> ${fileName} (Exit code ${r.exitCode})`);
			}
		}
		return;
	}
	const desktopEntry = createDesktopEntry(tuxstrapDesktopEntry);
	const dir = join(homedir(), ".local", "share", "applications")
	try {
		writeFileSync(join(dir, fileName), desktopEntry);
		console.log(`Placed ${fileName} in ${dir}`);
		for (const mimeType of tuxstrapDesktopEntry.mimeTypes) {
			const r = await $`xdg-mime default ${fileName} ${mimeType}`.nothrow().quiet();
			if (r.exitCode === 0) {
				console.log(`Registered Default XDG Mime ${mimeType} -> ${fileName}`);
			} else {
				console.error(`Failed to Register Default XDG Mime ${mimeType} -> ${fileName} (Exit code ${r.exitCode})`);
			}
		}
	} catch {}
}
