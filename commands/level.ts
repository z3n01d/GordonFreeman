import * as Eris from "eris";
import { client, getUserData } from "..";
import canvacord from "canvacord";

export const name: string = "level";
export const description: string = "Check what level you are and how many xp you have.";
export const options = [];
export async function execute(interaction: Eris.Interaction) {
    if (!(interaction instanceof Eris.CommandInteraction)) return;
    const userData = getUserData(interaction.member.id);
    
    var rankCard = new canvacord.Rank();
    rankCard.setAvatar(interaction.member.user.avatar || interaction.member.user.defaultAvatar);
    rankCard.setCurrentXP(userData.xp);
    rankCard.setRequiredXP(userData.level * 10);
    rankCard.setProgressBar("#ffad00", "COLOR");
    rankCard.setUsername(interaction.member.username);
    rankCard.setDiscriminator(interaction.member.user.discriminator);
    rankCard.setBackground("IMAGE","https://cdn.discordapp.com/attachments/1096754012302364693/1096778705453461574/server_banner.png");
    let data = await rankCard.build();
    return interaction.createMessage("",{
        file: data,
        name: "rankcard.png"
    });
    /*
    return interaction.createMessage({
        embeds: [
            {
                title: `${interaction.member.username}'s level status`,
                description: `Level: ${userData.level.toString()}\nXP: ${userData.xp.toString()}/${(userData.level * 10).toString()}`,
                color: 16755968
            }
        ]
    });
    */
}