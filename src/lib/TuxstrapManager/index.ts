import { $ } from "bun";


export async function runSettingsManager() {
	console.log("Launching settings manager.");
	await $`gjs ${__dirname}/ManagerUI.js`.nothrow(); // TBD
}
