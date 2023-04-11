import * as Eris from "eris";

export const name: string = "test";
export const description: string = "testing";
export const options = [];
export async function execute(interaction: Eris.CommandInteraction) {
    return interaction.createMessage("Hello, my name is Gordon Freeman.")
}