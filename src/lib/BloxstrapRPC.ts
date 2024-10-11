import { ActivityWatcher } from "./ActivityWatcher";
import * as constants from "./Constants";
import { GameDetailResponse, RichPresence, ServerType, UniverseIdResponse } from "./Types";
import { GetPlaceDetails, GetPlaceIcon, GetUniverseId } from "./RobloxAPI";
import rpc, { Presence } from "discord-rpc";
import { exec } from "node:child_process";

export class BloxstrapRPC {
	public aw: ActivityWatcher | undefined;
	public rp: rpc.Client | undefined;
	public _timeStartedUniverse: number = 0;
	public _currentUniverseId: number = 0;
	public _stashedRPCMessage: RichPresence|undefined;

	constructor(aw: ActivityWatcher) {
		this.aw = aw;
		this.rp = new rpc.Client({transport:'ipc'});
		this.rp.on('ready', () => {
			console.log("[BloxstrapRPC]",`Connected to Discord as ${this.rp?.user?.username}#${this.rp?.user?.discriminator} - ${this.rp?.user?.id}`);
		});
		aw.BloxstrapRPCEvent.on("Message",(a)=>{
			// console.log("[BloxstrapRPC]","Setting Rich Presence:");
			// console.log(a);
			try {
				this.setStashedMessage(a);
			} catch {}

		})
		aw.BloxstrapRPCEvent.on("OnGameJoin",()=>{
			this._stashedRPCMessage = {
				timeStart: this._timeStartedUniverse
			}
		})
		this.rp.login({ clientId: constants.DISCORD_APPID }).catch(console.error)
	};

	public async setStashedMessage(rp: RichPresence) {
		if (!rp) {
			this._stashedRPCMessage = undefined;
			return;
		};

		if (!this._stashedRPCMessage) this._stashedRPCMessage = {}
		if (rp.timeStart) this._stashedRPCMessage.timeStart = ((<any>rp.timeStart === 0) ? undefined : rp.timeStart);
		if (rp.timeEnd) this._stashedRPCMessage.timeStart = ((<any>rp.timeEnd === 0) ? undefined : rp.timeEnd);
		if (rp.details) this._stashedRPCMessage.details = ((rp.details.length === 0) ? undefined : rp.details);
		if (rp.state) this._stashedRPCMessage.state = ((rp.state.length === 0) ? undefined : rp.state);

		if (rp.largeImage) {
			if (!this._stashedRPCMessage.largeImage) this._stashedRPCMessage.largeImage = {};
			if (rp.largeImage.assetId) this._stashedRPCMessage.largeImage.assetId = rp.largeImage.assetId;
			if (rp.largeImage.hoverText) this._stashedRPCMessage.largeImage.hoverText = rp.largeImage.hoverText;
			if (rp.largeImage.clear) this._stashedRPCMessage.largeImage.hoverText = undefined;
			if (rp.largeImage.reset) this._stashedRPCMessage.largeImage = {};
		};
		if (rp.smallImage) {
			if (!this._stashedRPCMessage.smallImage) this._stashedRPCMessage.smallImage = {};
			if (rp.smallImage.assetId) this._stashedRPCMessage.smallImage.assetId = rp.smallImage.assetId;
			if (rp.smallImage.hoverText) this._stashedRPCMessage.smallImage.hoverText = rp.smallImage.hoverText;
			if (rp.smallImage.clear) this._stashedRPCMessage.smallImage.hoverText = undefined;
			if (rp.smallImage.reset) this._stashedRPCMessage.smallImage = {};
		};
	}

	public async updateRichPresence() {
		if (!this.aw) return;
		if (!this.rp) return;

		if (this.aw.ActivityPlaceId === 0) {
			this._currentUniverseId = 0;
			this._stashedRPCMessage = undefined;
			try {
				this.rp.setActivity({},1)
			} catch {};
			return;
		}

		let universeId = 0;
		try {
			universeId = await GetUniverseId(this.aw.ActivityPlaceId);
		} catch {
			// exec(`notify-send -u low "Roblox" "Failed to get Universe ID of ${this.aw.ActivityPlaceId}."`)
			console.log("[BloxstrapRPC]", `Could not get Universe ID! PlaceId: ${this.aw.ActivityPlaceId}`);
			return false;
		}

		if (universeId != this._currentUniverseId) {
			this._timeStartedUniverse = Math.floor(Date.now()/1000);
		}

		//if (this._timeStartedUniverse === 0 || !this.aw.ActivityIsTeleport || universeId != this._currentUniverseId) this._timeStartedUniverse = Math.floor(Date.now()/1000);

		this._currentUniverseId = universeId;

		let universeDetails: GameDetailResponse|undefined;
		try {
			universeDetails = (await GetPlaceDetails(universeId)) as GameDetailResponse;
		} catch {
			// exec(`notify-send -u low "Roblox" "Failed to get Universe Details for ${universeId}."`)
			console.log("[BloxstrapRPC]", `Could not get Universe details! PlaceId: ${this.aw.ActivityPlaceId} UniverseId: ${universeId}`);
			return false;
		}

		if (universeDetails.name.length < 2) universeDetails.name = `${universeDetails.name}\xE2\xE2\xE2`;

		let thumbnailIcon: string|undefined;
		try {
			thumbnailIcon = (await GetPlaceIcon(universeId)) as string;
		} catch {
			// exec(`notify-send -u low "Roblox" "Failed to get Universe Icon for ${universeId}."`)
			console.log("[BloxstrapRPC]", `Could not get Universe icon! PlaceId: ${this.aw.ActivityPlaceId} UniverseId: ${universeId}`);
			return false;
		}

		let status = ("by "+(universeDetails.creator.name)) + (universeDetails.creator.hasVerifiedBadge ? " ☑️" : "");
		switch (this.aw.ActivityServerType) {
			case ServerType.PRIVATE:
				status = "In a private server.";
				break;
			case ServerType.RESEREVED:
				status = "In a reserved server.";
				break;
			default:
				break;
		};

		try {
			let rpc: Presence = {
				details: (this._stashedRPCMessage?.details ? this._stashedRPCMessage.details : universeDetails.name),
				state: (this._stashedRPCMessage?.state ? this._stashedRPCMessage.state : status),
				startTimestamp: this._stashedRPCMessage?.timeStart,
				endTimestamp: this._stashedRPCMessage?.timeEnd,
				largeImageKey: (this._stashedRPCMessage?.largeImage?.assetId ? `https://assetdelivery.roblox.com/v1/asset/?id=${this._stashedRPCMessage.largeImage.assetId}` : thumbnailIcon),
				largeImageText: this._stashedRPCMessage?.largeImage?.hoverText,
				smallImageKey: (this._stashedRPCMessage?.smallImage?.assetId ? `https://assetdelivery.roblox.com/v1/asset/?id=${this._stashedRPCMessage.smallImage.assetId}` : constants.SMALL_IMAGE_KEY),
				smallImageText: this._stashedRPCMessage?.smallImage?.hoverText,
				buttons: [
					{label: "See game page", url: `https://www.roblox.com/games/${this.aw.ActivityPlaceId}`}
				]
			}
			if (this.aw.ActivityServerType === ServerType.PUBLIC) {
				rpc.buttons?.push(
					{
						label: "Join server",
						url: `roblox://experiences/start?placeId=${this.aw.ActivityPlaceId}&gameInstanceId=${this.aw.ActivityJobId}`
					}
				)
			}
			await this.rp.setActivity(rpc,1)
		} catch (e_) {
			console.error("[BloxstrapRPC]", "Failed to update Rich Presence!")
		}

	}
}
