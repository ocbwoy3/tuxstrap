import { SendNotification } from "../api/linux";
import { registerPlugin } from "../api/Plugin";

registerPlugin(
	{
		name: "Default FFlags",
		id: "default",
		forceEnable: true,
		configPrio: -9e9
	},
	async (plugin) => {
		await SendNotification("Roblox", "Launching with TuxStrap");

		/* FFlags */
		const fflags = {
			DFIntS2PhysicsSendRate: 38000,
			DFIntTaskSchedulerTargetFps: 999999,
			FFlagDisableFeedbackSoothsayerCheck: true,
			FFlagLuaAppUseUIBloxColorPalettes1: true,
			FFlagUIBloxUseNewThemeColorPalettes: true,
			FIntTargetRefreshRate: 999999,
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
		plugin.setSoberConfigOption("enableGamemode", true);
	}
);

registerPlugin(
	{
		name: "Super Performance FFlags",
		id: "super",
		forceEnable: false,
		configPrio: 1
	},
	async (plugin) => {
		/* FFlags */
		const fflags = {
			DFFlagDebugRenderForceTechnologyVoxel: true,
			FIntFRMMinGrassDistance: 0,
			FIntFRMMaxGrassDistance: 0,
			FIntRenderGrassDetailStrands: 0,
			FIntRenderGrassHeightScaler: 0,
			DFFlagDebugPauseVoxelizer: true,
			DFFlagDisableDPIScale: true,
			FStringPartTexturePackTablePre2022: "",
			FStringPartTexturePackTable2022: "",
			FStringTerrainMaterialTablePre2022: "",
			FStringTerrainMaterialTable2022: "",
			FIntRenderShadowIntensity: 0,
			FFlagDisablePostFx: true,
			FIntDebugForceMSAASamples: 0,
			DFFlagTextureQualityOverrideEnabled: true,
			DFIntTextureQualityOverride: 0,
			DFIntCSGLevelOfDetailSwitchingDistance: 0,
			DFIntCSGLevelOfDetailSwitchingDistanceL12: 0,
			DFIntCSGLevelOfDetailSwitchingDistanceL23: 0,
			DFIntCSGLevelOfDetailSwitchingDistanceL34: 0,
			FIntRenderLocalLightUpdatesMax: 1,
			FIntRenderLocalLightUpdatesMin: 1,
			FFlagDebugSkyGray: true,
			FFlagCoreGuiTypeSelfViewPresent: false,
			DFIntDebugFRMQualityLevelOverride: 1,
			FFlagRenderCheckThreading: true,
			DFIntTextureCompositorActiveJobs: 0,
			FFlagTaskSchedulerLimitTargetFpsTo2402: false,
			FFlagNewLightAttenuation: false,
			FIntCSGVoxelizerFadeRadius: 0,
			FIntTerrainArraySliceSize: 0,
			FIntRomarkStartWithGraphicQualityLevel: 1,
			FFlagMSRefactor5: false,
			FIntDebugTextureManagerSkipMips: -1,
			FFlagEnableQuickGameLaunch: false,
			FFlagGlobalWindActivated: false,
			FFlagDebugSSAOForce: false,
			FIntSSAOMipLevels: 0,
			FFlagAdServiceEnabled: false,
			FFlagEnableCommandAutocomplete: false,
			FIntRobloxGuiBlurIntensity: 0,
			DFIntAnimationLodFacsDistanceMin: 0,
			DFIntAnimationLodFacsDistanceMax: 0,
			DFIntAnimationLodFacsVisibilityDenominator: 0,
			FIntViewportFrameMaxSize: 0,

		};

		for (const [fflag, value] of Object.entries(fflags)) {
			plugin.setFFlag(fflag, value);
		}
	}
);

registerPlugin(
	{
		name: "Unstable FFlags",
		id: "unstable",
		forceEnable: true,
		configPrio: -9e9
	},
	async (plugin) => {
		/* FFlags */
		const fflags = {
			FFlagOptimizeNetwork: true,
			FFlagOptimizeNetworkTransport: true,
			DFIntConnectionMTUSize: 900,
			FFlagEnableNewInput: true,
			FFlagUseUnifiedRenderStepped: false,
			DFIntMaxFrameBufferSize: 4
		};

		for (const [fflag, value] of Object.entries(fflags)) {
			plugin.setFFlag(fflag, value);
		}
	}
);
