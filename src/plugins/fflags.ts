import { SendNotification } from "../api/linux";
import { registerPlugin } from "../api/Plugin";

registerPlugin(
	{
		name: "Default FFlags",
		id: "tuxstrap-fflags",
		forceEnable: true,
		configPrio: -9e9
	},
	async (plugin) => {
		await SendNotification("Roblox", "Launching with TuxStrap");

		/* FFlags */
		const fflags = {
			DFIntS2PhysicsSendRate: "38000",
			DFIntTaskSchedulerTargetFps: "9999",
			FFlagDisableFeedbackSoothsayerCheck: true,
			FFlagLuaAppUseUIBloxColorPalettes1: true,
			FFlagUIBloxUseNewThemeColorPalettes: true,
			FIntTargetRefreshRate: "9999",
			FStringAdGuiHorizontalRobloxFallbackImageAssetId: 86999279798758,
			FStringAdGuiHorizontalStudioPlaceHolderImageAssetId: 86999279798758,
			FStringAdGuiLivePreviewWatermarkV2: 86999279798758,
			FStringWhitelistVerifiedUserId: "1083030325"
		};

		for (const [fflag, value] of Object.entries(fflags)) {
			plugin.setFFlag(fflag, value);
		}

		/* Sober config */

		plugin.setSoberConfigOption("serverLocationIndicator", true);
		plugin.setSoberConfigOption("bringBackOof", true);
	}
);
