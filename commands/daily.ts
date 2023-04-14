import * as Eris from "eris";
import { client, getUserData, setUserData, randomRange } from "..";
import ms from "parse-ms";

export const name: string = "daily";
export const description: string = "Get your random daily dose of money!";
export const options = [];
export async function execute(interaction: Eris.CommandInteraction) {
    if (!(interaction instanceof Eris.CommandInteraction)) return;
    const userData = getUserData(interaction.member.id);
    if (86400000 - (Date.now() - userData.dailyTime) > 0) {
        const timeLeft = ms(86400000 - (Date.now() - userData.dailyTime));
        return interaction.createMessage(`You have already claimed your daily award, try again later after ${timeLeft.hours}`);
    } else {
        const reward = randomRange(10,500);
        userData.money += reward;
        userData.dailyTime = Date.now();
        setUserData(interaction.member.id,userData);
        return interaction.createMessage(`You have claimed your daily award of $${reward.toString()}.`);
    }
}