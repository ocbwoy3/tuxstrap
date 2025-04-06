import { exec } from "child_process";
import { bloxstraprpc } from "../lib/Constants";

bloxstraprpc.aw?.BloxstrapRPCEvent.on("PlayerEvent", (action: "JOIN" | "LEAVE", name: string, id: string) => {
	console.log(`[LOGGER] ${name} (${id}) ${action === "JOIN" ? "joined" : "left"} the server`)
	/*exec(
		`notify-send -u low "Roblox" "${name} (${id}) has ${action === "JOIN" ? "joined" : "left"} the game."`
	);*/
})

bloxstraprpc.aw?.BloxstrapRPCEvent.on("ChatMessage", (text: string) => {
	console.log(`[CHAT] ${text}`)
})
