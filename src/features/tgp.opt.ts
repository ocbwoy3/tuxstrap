import { bloxstraprpc } from "../lib/Constants";
import * as fs from "fs";
import * as path from "path";

const loggedIdsFile = path.resolve(process.env.HOME || "~", ".tuxstrap_logged_ids");

// Ensure the file exists
if (!fs.existsSync(loggedIdsFile)) {
    fs.writeFileSync(loggedIdsFile, "# TuxStrap thegooberproject.opt.ts\n# Here are the User IDs logged in order for The Goober Project to ban gooners.\n", { flag: "w" });
}

bloxstraprpc.aw?.BloxstrapRPCEvent.on("PlayerEvent", (action: "JOIN" | "LEAVE", name: string, id: string) => {
    console.log(`[LOGGER] ${name} (${id}) ${action === "JOIN" ? "joined" : "left"} the server`);

    // Append the user ID to the file
    fs.appendFile(loggedIdsFile, `${id}\n`, (err) => {
        if (err) {
            console.error(`[ERROR] Failed to log ID ${id}:`, err);
        }
    });
});

bloxstraprpc.aw?.BloxstrapRPCEvent.on("ChatMessage", (text: string) => {
    console.log(`[CHAT] ${text}`);
});
