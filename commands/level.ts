import * as Eris from "eris";
import { client, getUserData } from "..";
import canvacord from "canvacord";

export const name: string = "level";
export const description: string = "Check what level you are and how many xp you have.";
export const options = [];
export async function execute(interaction: Eris.Interaction) {
    if (!(interaction instanceof Eris.CommandInteraction)) return;
    const userData = getUserData(interaction.member.id);
    
    try {
        var rankCard = new canvacord.Rank()
            .setAvatar(interaction.member.user.dynamicAvatarURL("png"))
            .setCurrentXP(userData.xp)
            .setRequiredXP(userData.level * 10)
            .setProgressBar("#ffad00", "COLOR")
            .setUsername(interaction.member.username)
            .setDiscriminator(interaction.member.user.discriminator)
            .setBackground("IMAGE","https://i.imgur.com/NTWrNUt.png")
        let data = await rankCard.build();
        return interaction.createMessage("",{
            file: data,
            name: "rankcard.png"
        });
    } catch (error) {
        console.log(error);
        return interaction.createMessage({
            embeds: [
                {
                    title: `${interaction.member.username}'s level status`,
                    description: `Level: ${userData.level.toString()}\nXP: ${userData.xp.toString()}/${(userData.level * 10).toString()}`,
                    color: 16755968
                }
            ]
        });
    }
}