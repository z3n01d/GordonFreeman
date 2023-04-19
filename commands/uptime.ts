import * as Eris from "eris";
import { client } from "..";

export const name: string = "uptime";
export const description: string = "Check bot's uptime";
export const options = [];
export async function execute(interaction: Eris.Interaction) {
    if (!(interaction instanceof Eris.CommandInteraction)) return;
    return interaction.createMessage({
        embeds: [
            {
                title: "Bot uptime",
                description: `Gordon Freeman has been online for **${Math.round(client.uptime / 3600000)} hours, ${Math.round(client.uptime / 60000) % 59} minutes and ${Math.round(client.uptime / 1000) % 59} seconds**`,
                color: 16755968
            }
        ]
    })
}