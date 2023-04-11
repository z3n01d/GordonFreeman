import * as Eris from "eris";
import { client } from "..";
import path from "path";
import fs from "fs";

export const name: string = "song";
export const description: string = "Group of commands for song playing";
export const options = [
    {
        type: Eris.Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
        name: "play",
        description: "Plays a song",
        options: [
            {
                type: Eris.Constants.ApplicationCommandOptionTypes.STRING,
                name: "game",
                description: "From what Half-Life game do you want the song to be?",
                required: true,
                choices: [
                    {
                        name: "Half-Life 1",
                        value: "hl"
                    },
                    {
                        name: "Half-Life 2",
                        value: "hl2"
                    },
                    {
                        name: "Episode 1",
                        value: "episodic"
                    },
                    {
                        name: "Episode 2",
                        value: "episode2"
                    },
                    {
                        name: "Portal 2",
                        value: "portal2"
                    }
                ]
            },
            {
                type: Eris.Constants.ApplicationCommandOptionTypes.STRING,
                name: "songname",
                description: "A song name you want me to search for.",
                required: true,
            }
        ]
    },
    {
        type: Eris.Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
        name: "stop",
        description: "Stops a currently playing song."
    },
    {
        type: Eris.Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
        name: "pause",
        description: "Pauses a currently playing song."
    },
    {
        type: Eris.Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
        name: "resume",
        description: "Resumes a currently playing song."
    }
];
async function playSong(interaction: Eris.CommandInteraction) {
    let voiceConnection = await client.joinVoiceChannel(interaction.member.voiceState.channelID);
    const files = fs.readdirSync(path.join(__dirname,"..","music",interaction.data.options[0]["options"][0].value))
    voiceConnection.stopPlaying()
    var songName = null
    for (let file of files) {
        const fileName = path.parse(file).name.replaceAll("_"," ");
        if (fileName.toLowerCase().includes(interaction.data.options[0]["options"][1].value.toLowerCase())) {
            voiceConnection.play(path.join(__dirname,"..","music",interaction.data.options[0]["options"][0].value,file));
            if (interaction.data.options[0]["options"][0].value == "portal2") {
                songName = fileName.substring(13);
            } else {
                songName = fileName.substring(3);
            }
            break;
        }
    }
    if (!voiceConnection.playing) return playSong(interaction);
    return songName
}
export async function execute(interaction: Eris.CommandInteraction) {
    if (!(interaction instanceof Eris.CommandInteraction)) return;
    if (!interaction.member) return interaction.createMessage("You can only use this command in guilds!");
    try {
        if (interaction.data.options[0].name == "play") {
            if (!interaction.member.voiceState.channelID) return interaction.createMessage({
                content: "You have to be in a voice channel to play music.",
                flags: 64
            });
            if (client.voiceConnections.has(interaction.member.voiceState.channelID) == false) {
                try {
                    const songName = await playSong(interaction);
                    if (songName) {
                        return interaction.createMessage(`:musical_note: Playing **${songName}**`);
                    } else {
                        return interaction.createMessage(`:x: Could not find song called **${interaction.data.options[0]["options"][1].value}**`);
                    }
                } catch (err) {
                    console.log(err)
                }
            }
        }

        if (interaction.data.options[0].name == "stop") {
            for (let voiceConnection of client.voiceConnections.values()) {
                if (voiceConnection.id != interaction.guildID) continue;
                await client.leaveVoiceChannel(voiceConnection.channelID);
            }
            return interaction.createMessage(":leftwards_arrow_with_hook: Disconnected out of voice channel.");
        }
        if (interaction.data.options[0].name == "pause") {
            for (let voiceConnection of client.voiceConnections.values()) {
                if (voiceConnection.id != interaction.guildID) continue;
                voiceConnection.pause();
            }
            interaction.defer();
        }
        if (interaction.data.options[0].name == "resume") {
            for (let voiceConnection of client.voiceConnections.values()) {
                if (voiceConnection.id != interaction.guildID) continue;
                voiceConnection.resume();
            }
            interaction.defer();
        }
    } catch (err) {
        console.log(err);
    }
}