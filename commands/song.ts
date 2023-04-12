import * as Eris from "eris";
import { client, octokit_client } from "..";
import * as octokit from "octokit";
import fetch from "node-fetch";
import path from "path";
//import fs from "fs";

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
        name: "exit",
        description: "Makes bot leave a voice channel it's currently in."
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
    const headers = {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`
    } 
    const repoContent = await (await fetch(`https://api.github.com/repos/RealJace/GordonFreemanBotMusic/contents/${interaction.data.options[0]["options"][0].value}`,{method: "GET",headers: headers})).json();

    if ("message" in repoContent) {
        return false;
    }

    let voiceConnection = await client.joinVoiceChannel(interaction.member.voiceState.channelID);
    voiceConnection.stopPlaying();
    var songName = null;
    if (voiceConnection.playing) {
        return true;
    }
    for (let file of repoContent) {
        const fileName = path.parse(file.name).name.replaceAll("_"," ");
        if (fileName.toLowerCase().includes(interaction.data.options[0]["options"][1].value.toLowerCase())) {
            voiceConnection.play(`https://cdn.jsdelivr.net/gh/RealJace/GordonFreemanBotMusic@main/${interaction.data.options[0]["options"][0].value}/${file.name.replaceAll(" ","%20")}`);
            if (interaction.data.options[0]["options"][0].value == "portal2") {
                songName = fileName.substring(13);
            } else {
                songName = fileName.substring(3);
            }
            break;
        }
    }
    if (!voiceConnection.playing) return playSong(interaction);
    return songName;
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
                    } else if (songName == false) {
                        return interaction.createMessage("Ratelimit exceeded.");
                    } else if (songName == true) {
                        return interaction.createMessage("A song is already playing, please use stop command or wait for song to finish.");
                    } else {
                        return interaction.createMessage(`:x: Could not find song called **${interaction.data.options[0]["options"][1].value}**`);
                    }
                } catch (err) {
                    console.log(err)
                    return interaction.createMessage("An error has occured.")
                }
            }
        }

        if (interaction.data.options[0].name == "exit") {
            for (let voiceConnection of client.voiceConnections.values()) {
                if (voiceConnection.id != interaction.guildID) continue;
                await client.leaveVoiceChannel(voiceConnection.channelID);
            }
            return interaction.createMessage(":leftwards_arrow_with_hook: Disconnected out of voice channel.");
        }
        if (interaction.data.options[0].name == "stop") {
            for (let voiceConnection of client.voiceConnections.values()) {
                if (voiceConnection.id != interaction.guildID) continue;
                await voiceConnection.stopPlaying();
            }
            interaction.defer();
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