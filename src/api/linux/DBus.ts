import { KVStore } from "@ocbwoy3/libocbwoy3";
import { MessageBus, sessionBus, type ClientInterface, type ProxyObject } from "dbus-next";

let SessionBus: MessageBus;

const DBUSPROXYKV = new KVStore<`${string}|${string}`, ProxyObject>();

/** Gets a D-Bus proxy interface */
export async function GetProxyInterface(name: string, path: string, interfaceName: string): Promise<ClientInterface> {
	if (!SessionBus) {
		SessionBus = sessionBus();
	}
	let cachedProxy = DBUSPROXYKV.get(`${name}|${path}`);
	if (!cachedProxy) {
		cachedProxy = await SessionBus.getProxyObject(name, path);
		DBUSPROXYKV.set(`${name}|${path}`, cachedProxy);
	}
	return cachedProxy.getInterface(interfaceName);
}

/** **Sends a notification** using the **D-Bus** (`org.freedesktop.Notifications`) */
export async function SendNotification(summary: string, body: string, expireTimeout: number = 1500) {
	try {
		const itf = await GetProxyInterface("org.freedesktop.Notifications","/org/freedesktop/Notifications","org.freedesktop.Notifications")
		await (itf as any).Notify("roblox", 0, "", summary, body, [], {}, expireTimeout)
	} catch {}
}
