// Use this template to create more commands

import * as Eris from "eris";

export const name: string = "name";
export const description: string = "description";
export const options = [];
export async function execute(interaction: Eris.Interaction) {
    if (!(interaction instanceof Eris.CommandInteraction)) return;
    return interaction.createMessage("")
}