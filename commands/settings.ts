import * as Eris from "eris";
import { client, getGuildData, setGuildData } from "..";

export const name: string = "settings";
export const description: string = "Commands related to settings";
export const options = [
    {
        type: Eris.Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
        name: "set",
        description: "Set a setting to a value.",
        options: [
            {
                type: Eris.Constants.ApplicationCommandOptionTypes.STRING,
                name: "setting",
                description: "What setting do you want to edit?",
                required: true,
                choices: [
                    {
                        name: "Leveling channel id",
                        value: "levelChannelId"
                    }
                ]
            },
            {
                type: Eris.Constants.ApplicationCommandOptionTypes.STRING,
                name: "newvalue",
                description: "New value of a setting",
                required: true,
            }
        ]
    },
];
export async function execute(interaction: Eris.Interaction) {
    if (!(interaction instanceof Eris.CommandInteraction)) return;
    if (typeof(interaction.member) === "undefined") return;
    if (typeof(interaction.guildID) === "undefined") return;
    if (typeof(interaction.data.options) === "undefined") return;
    if (!interaction.member.permissions.json.administrator) return interaction.createMessage({
        content: "You have to have Administrator permissions to use this command.",
        flags: 64
    });

    if (interaction.data.options[0].name == "set") {
        const setting = interaction.data.options[0]["options"][0].value;
        const newValue = interaction.data.options[0]["options"][1].value;
        try {
            var guildData = getGuildData(interaction.guildID);
            if (guildData != null) {
                guildData.settings[setting] = newValue;
            }
            setGuildData(interaction.guildID,guildData);
        } catch (error) {
            console.log(error);
            interaction.createMessage(`Failed to update setting ${setting} to ${newValue}`);
        }
        interaction.createMessage(`Successfully updated setting ${setting} to ${newValue}`);
    }
}