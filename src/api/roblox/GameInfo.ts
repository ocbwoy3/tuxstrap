import { TimedDataCache } from "@ocbwoy3/libocbwoy3";
import { ROBLOX_COOKIES_FILE } from "../constants";
import { readFileSync } from "fs";

const GameNameCache = new TimedDataCache<string, string>(900); // 30 minutes

let cookies = "";

try {
	cookies = readFileSync(ROBLOX_COOKIES_FILE, "utf-8")?.toString() || "";
} catch {}

export async function getGameDetails(placeId: string): Promise<string | null> {
	// Check cache first
	if (GameNameCache.has(placeId)) {
		return GameNameCache.get(placeId) || "???";
	}

	try {
		// roblox is stupid for making this endpoint locked behind an account
		const res = await fetch(
			`https://games.roblox.com/v1/games/multiget-place-details?placeIds=${placeId}`,
			{
				headers: {
					accept: "application/json",
					cookie: cookies
				}
			}
		);

		// console.log(res,await res.body?.text());

		if (!res.ok) return null;

		const data: {
			name: string;
			placeId: number;
		}[] = (await res.json()) as any;

		const gameName = data[0]?.name ?? "Unknown Game";

		if (gameName) {
			GameNameCache.set(placeId, gameName, 900_000);
		}

		return gameName;
	} catch (e) {
		console.error("Failed to fetch game details:", e);
		return null;
	}
}
