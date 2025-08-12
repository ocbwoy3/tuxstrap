export async function initPlugins() {
	await import("./default");
	await import("./debugPlugin");
}
