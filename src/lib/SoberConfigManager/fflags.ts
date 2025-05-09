export const FeatureFFlags: {[feature: string]: { [key: string]: string | boolean | number }} = {
	["roblox-logger.opt"]: {
		FStringDebugLuaLogLevel: "trace",
		FStringDebugLuaLogPattern: "ExpChat/mountClientApp"
	},
	["tgp.opt"]: {
		FStringDebugLuaLogLevel: "trace",
		FStringDebugLuaLogPattern: "ExpChat/mountClientApp"
	}
}

export const defaultFFlags: { [key: string]: string | boolean | number } = {
	FFlagDisableFeedbackSoothsayerCheck: true,
	FFlagExample: true,
	FFlagLuaAppUseUIBloxColorPalettes1: true,
	FFlagUIBloxUseNewThemeColorPalettes: true,
	FStringAdGuiHorizontalRobloxFallbackImageAssetId: 86999279798758,
	FStringAdGuiHorizontalStudioPlaceHolderImageAssetId: 86999279798758,
	FStringAdGuiLivePreviewWatermarkV2: 86999279798758,
	FStringWhitelistVerifiedUserId: "1083030325",
}
