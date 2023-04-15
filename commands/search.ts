import * as Eris from "eris";

export const name: string = "search";
export const description: string = "Search places in City-17 and maybe you will find something.";
export const options = [];
export async function execute(interaction: Eris.Interaction) {
    if (interaction instanceof Eris.CommandInteraction) {
        return interaction.createMessage({
            content: "This is a message with a button.",
            components: [
                {
                    type: Eris.Constants.ComponentTypes.ACTION_ROW,
                    components: [
                        {
                            type: Eris.Constants.ComponentTypes.BUTTON,
                            label: "clic me now",
                            style: Eris.Constants.ButtonStyles.PRIMARY,
                            custom_id: "yes"
                        }
                    ]
                }
            ]
        });
    }
    if (interaction instanceof Eris.ComponentInteraction) {
        return interaction.createMessage("This is a response to a button");
    }
}