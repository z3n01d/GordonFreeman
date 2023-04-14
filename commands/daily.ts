import * as Eris from "eris";
import { client, getUserData, setUserData, randomRange } from "..";

export const name: string = "daily";
export const description: string = "Get your random daily dose of money!";
export const options = [];
export async function execute(interaction: Eris.CommandInteraction) {
    if (!(interaction instanceof Eris.CommandInteraction)) return;
    const userData = getUserData(interaction.member.id);
    if (Date.now() - userData.dailyTime > 86400000) {
        const reward = randomRange(10,500);
        userData.money += reward;
        userData.dailyTime = Date.now();
        setUserData(interaction.member.id,userData);
        return interaction.createMessage(`You have claimed your daily reward of $${reward.toString()}.`);
    } else {
        const timeLeft = Date.now() - userData.dailyTime;
        return interaction.createMessage(`You can collect your daily reward in ${timeLeft / 3600000} hours and ${timeLeft / 60000} minutes.`);
    }
}