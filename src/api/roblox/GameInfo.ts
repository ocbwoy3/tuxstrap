import { TimedDataCache } from "@ocbwoy3/libocbwoy3";

const GameNameCache = new TimedDataCache<string, string>(900); // 30 minutes

export async function getGameDetails(placeId: string): Promise<string | null> {
	// Check cache first
	const cached = GameNameCache.get(placeId);
	if (cached) return cached;

	try {
		const res = await fetch(
			`https://games.roblox.com/v1/games/multiget-place-details?placeIds=${placeId}`,
			{ headers: { accept: "application/json" } }
		);

		if (!res.ok) return null;

		const data: {
			name: string;
			placeId: number;
		}[] = (await res.json()) as any;

		const gameName = data[0]?.name ?? "Unknown Game";

		if (gameName) GameNameCache.set(placeId, gameName, 900_000);

		return gameName;
	} catch (e) {
		console.error("Failed to fetch game details:", e);
		return null;
	}
}
