import fs from "fs";
import path from "path";
import { exec } from "child_process";

const stateFilePath = path.join(
	process.env.HOME || "~",
	".regretevator-challenge-state"
);

function sendReminderNotification() {
	exec(
		`notify-send -a "tuxstrap" -u low "OCbwoy3's Dotfiles" "It's time for Regretevator!"`
	);
}

function sendReminderNotificationPlayed(floors: number) {
	exec(
		`notify-send -a "tuxstrap" -u low "OCbwoy3's Dotfiles" "Man... Only ${floors} floors, really? You can do better than that."`
	);
}

function sendSpamNotifications() {
	for (let i = 0; i < 10; i++) {
		exec(
			`notify-send -a "tuxstrap" -u low "OCbwoy3's Dotfiles" "HURRY UP!!!!!"`
		);
	}
}

function writeState(floorsSurvived: number) {
	const state = {
		date: new Date().toISOString().split("T")[0],
		floorsSurvived: floorsSurvived,
	};
	fs.writeFileSync(stateFilePath, JSON.stringify(state, null, 2));
}

function checkChallengeState() {
	if (fs.existsSync(stateFilePath)) {
		const state = JSON.parse(fs.readFileSync(stateFilePath, "utf-8"));
		const today = new Date().toISOString().split("T")[0];
		const stateDate = state.date;
		const floorsSurvived = state.floorsSurvived;

		const now = new Date();
		const hoursLeft = 24 - now.getHours();

		if (stateDate === today) {
			if (floorsSurvived < 25) {
				if (hoursLeft <= 4) {
					sendSpamNotifications();
				} else {
					sendReminderNotificationPlayed(floorsSurvived);
				}
			}
		} else {
			sendReminderNotification();
			writeState(0); // Write state with 0 floors if the user hasn't played today
		}
	} else {
		sendReminderNotification();
		writeState(0); // Write state with 0 floors if no state file exists
	}
}

// Run the check
checkChallengeState();
