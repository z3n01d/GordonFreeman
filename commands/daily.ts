import * as Eris from "eris";
import { client, getUserData, setUserData, randomRange } from "..";

export const name: string = "daily";
export const description: string = "Get your random daily dose of money!";
export const options = [];
export async function execute(interaction: Eris.Interaction) {
    if (!(interaction instanceof Eris.CommandInteraction)) return;
    var userData = getUserData(interaction.member.id);
    if (86400000 - (Date.now() - userData.dailyTime) > 0) {
        const timeLeft = 86400000 - (Date.now() - userData.dailyTime);
        return interaction.createMessage(`You have already claimed your daily award, try again later after **${Math.round((timeLeft / 3600000) % 24)} hours**`);
    } else {
        const reward = randomRange(10,500);
        userData.money += reward;
        userData.dailyTime = Date.now();
        setUserData(interaction.member.id,userData);
        return interaction.createMessage(`You have claimed your daily award of $${reward.toString()}.`);
    }
}