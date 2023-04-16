import * as Eris from "eris";
import { client, getUserData } from "..";

export const name: string = "wallet";
export const description: string = "Check how many money you have in your wallet.";
export const options = [];
export async function execute(interaction: Eris.Interaction) {
    if (!(interaction instanceof Eris.CommandInteraction)) return;
    const userData = getUserData(interaction.member.id);
    return interaction.createMessage({
        embeds: [
            {
                title: "Wallet",
                description: `You have got **$${userData.money.toString()}** in your wallet.`,
                color: 16755968
            }
        ]
    });
}