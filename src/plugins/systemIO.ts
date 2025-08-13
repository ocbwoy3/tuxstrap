import { $ } from "bun";
import { GetProxyInterface, SendNotification } from "../api/linux";
import { registerPlugin } from "../api/Plugin";
import { getGameDetails } from "../api/roblox/GameInfo";

registerPlugin(
	{
		name: "System Clipboard & D-Bus",
		id: "tuxstrap-clip-dbus",
		forceEnable: true,
		configPrio: -9e9
	},
	async (plugin) => {

		plugin.setFFlag("FFlagClientAllowClipboardControl", true);
		plugin.setFFlag("FFlagClientAllowMPRISControl", true);
		plugin.setFFlag("FFlagIsLinux", true);

		plugin.on("BLOXSTRAP_RPC",async(a)=>{
			switch (a.type) {
				case "WaylandCopy": {
					if (typeof a.data === "string" && a.data.length <= 512) {} else {return}; 
					const gameName = await getGameDetails(plugin.currentState.getPlaceId()!);
					if (!gameName) return;
					await SendNotification(
						"Roblox",
						`${gameName} wrote to the Wayland clipboard!`,
						3000
					);
					$`echo ${a.data} | wl-copy -n`.quiet().nothrow();
					break;
				}
				case "CallDBus": {
					if (typeof a.data !== "object") return;
					if (typeof a.data.busName !== "string") return;
					if (typeof a.data.action !== "string") return;
					
					const { busName, action }: {busName: string, action: string} = a.data;

					if (busName.length >= 64) return;
					if (!busName.startsWith("org.mpris.MediaPlayer2.")) return;

					if (!["Play", "Pause", "PlayPause"].includes(action)) return;

					try {
						const i = await GetProxyInterface(busName, "/org/mpris/MediaPlayer2", "org.mpris.MediaPlayer2.Player");
						switch (action) {
							case "Play": {
								await (i as any).Play();
								break;
							}
							case "Pause": {
								await (i as any).Pause();
								break;
							}
							case "PlayPause": {
								await (i as any).PlayPause();
								break;
							}
							
						}
					} catch {}

					break;
				}
				
			}
		})

	}
);
