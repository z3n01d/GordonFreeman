import * as Eris from "eris";
import { client, getUserData } from "..";

export const name: string = "name";
export const description: string = "description";
export const options = [];
export async function execute(interaction: Eris.CommandInteraction) {
    if (!(interaction instanceof Eris.CommandInteraction)) return;
    const userData = getUserData(interaction.member.id);
    return interaction.createMessage({
        embeds: [
            {
                title: "Wallet",
                description: `You have got **$${userData.money.toString()}** in your wallet.`
            }
        ]
    });
}