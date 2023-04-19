import * as Eris from "eris";
import { client } from "..";
import fetch from "node-fetch";
import path from "path";
//import fs from "fs";

function sleep(time) {
    return new Promise(resolve => setTimeout(resolve, time));
} 

const gameNames = {
    "hl": "Half-Life 1",
    "opposingforce": "Opposing force",
    "hl2": "Half-Life 2",
    "episodic": "Episode 1",
    "episode2": "Episode 2",
    "portal": "Portal",
    "portal2": "Portal 2"
}

const gamesOption = {
    type: Eris.Constants.ApplicationCommandOptionTypes.STRING,
    name: "game",
    description: "From what Half-Life/Portal game do you want the song to be?",
    required: true,
    choices: [
        {
            name: "Half-Life 1",
            value: "hl"
        },
        {
            name: "Opposing force",
            value: "opposingforce"
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
            name: "Portal",
            value: "portal"
        },
        {
            name: "Portal 2",
            value: "portal2"
        }
    ]
}

export const name: string = "song";
export const description: string = "Group of commands for song playing";
export const options = [
    {
        type: Eris.Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
        name: "play",
        description: "Plays a song",
        options: [
            gamesOption,
            {
                type: Eris.Constants.ApplicationCommandOptionTypes.STRING,
                name: "songname",
                description: "A song name you want me to search for.",
                required: true,
            },
            {
                type: Eris.Constants.ApplicationCommandOptionTypes.NUMBER,
                name: "volume",
                description: "What volume you want the song to be played in (max is 2)",
                min_value: 0,
                max_value: 2,
                required: false,
            }
        ]
    },
    {
        type: Eris.Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
        name: "list",
        description: "Lists music from a game you want.",
        options: [
            gamesOption
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

    let voiceConnection = client.voiceConnections.get(interaction.member.voiceState.channelID);

    if (typeof(voiceConnection) === "undefined") {
        voiceConnection = await client.joinVoiceChannel(interaction.member.voiceState.channelID);
    }

    await new Promise((resolve,reject) => {
        if (voiceConnection.ready) {
            resolve(true);
        }
    })
    if (voiceConnection.playing) {
        voiceConnection.stopPlaying();
    }
    await new Promise((resolve,reject) => {
        if (!voiceConnection.playing) {
            resolve(true);
        }
    });
    var songName = null;
    for (let file of repoContent) {
        const fileName = path.parse(file.name).name.replaceAll("_"," ");
        if (fileName.toLowerCase().includes(interaction.data.options[0]["options"][1].value.toLowerCase())) {
            var volume = 1.0;
            if (!(typeof(interaction.data.options[0]["options"][2]) === "undefined")) {
                volume = Math.min(Math.max(interaction.data.options[0]["options"][2].value,0.1),2.0);
            }
            voiceConnection.setVolume(volume);
            while (!voiceConnection.playing) {
                voiceConnection.play(`https://cdn.jsdelivr.net/gh/RealJace/GordonFreemanBotMusic@main/${interaction.data.options[0]["options"][0].value}/${file.name.replaceAll(" ","%20")}`);
                await sleep(0.1);
            }
            if (interaction.data.options[0]["options"][0].value == "portal2") {
                songName = fileName.substring(13);
            } else {
                songName = fileName.substring(3);
            }
            break;
        }
    }
    return songName;
}
export async function execute(interaction: Eris.Interaction) {
    if (!(interaction instanceof Eris.CommandInteraction)) return;
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
                        interaction.createMessage(`:musical_note: Playing **${songName}**`);
                    } else if (songName == false) {
                        interaction.createMessage("Ratelimit exceeded.");
                    } else if (songName == true) {
                        interaction.createMessage("A song is already playing, please use stop command or wait for song to finish.");
                    } else {
                        interaction.createMessage(`:x: Could not find song called **${interaction.data.options[0]["options"][1].value}**`);
                    }
                } catch (err) {
                    console.log(err)
                    interaction.createMessage("An error has occured.")
                }
            }
        }
        if (interaction.data.options[0].name == "list") {
            const headers = {
                Authorization: `Bearer ${process.env.GITHUB_TOKEN}`
            } 
            const repoContent = await (await fetch(`https://api.github.com/repos/RealJace/GordonFreemanBotMusic/contents/${interaction.data.options[0]["options"][0].value}`,{method: "GET",headers: headers})).json();

            if ("message" in repoContent) {
                return interaction.createMessage("Ratelimit exceeded.");
            }

            var songText = "";
            var songNumber = 1;
            for (let file of repoContent) {
                const fileName = path.parse(file.name).name.replaceAll("_"," ");
                if (interaction.data.options[0]["options"][0].value == "portal2") {
                    songText += `**${songNumber.toString()}.** ` + fileName.substring(13) + "\n";
                } else {
                    songText += `**${songNumber.toString()}.** ` + fileName.substring(3) + "\n";
                }
                songNumber += 1;
            }

            interaction.createMessage({
                embeds: [
                    {
                        title: `${gameNames[interaction.data.options[0]["options"][0].value]} soundtrack list : `,
                        description: songText,
                        color: 16755968
                    }
                ]
            })
        }
        if (interaction.data.options[0].name == "exit") {
            for (let voiceConnection of client.voiceConnections.values()) {
                if (voiceConnection.id != interaction.guildID) continue;
                await client.leaveVoiceChannel(voiceConnection.channelID);
            }
            interaction.createMessage(":leftwards_arrow_with_hook: Disconnected out of voice channel.");
        }
        if (interaction.data.options[0].name == "stop") {
            for (let voiceConnection of client.voiceConnections.values()) {
                if (voiceConnection.id != interaction.guildID) continue;
                await voiceConnection.stopPlaying();
            }
            interaction.createMessage("Sucessfully stopped currently-playing song.");
        }
        if (interaction.data.options[0].name == "pause") {
            for (let voiceConnection of client.voiceConnections.values()) {
                if (voiceConnection.id != interaction.guildID) continue;
                voiceConnection.pause();
            }
            interaction.createMessage("Sucessfully paused currently-playing song.");
        }
        if (interaction.data.options[0].name == "resume") {
            for (let voiceConnection of client.voiceConnections.values()) {
                if (voiceConnection.id != interaction.guildID) continue;
                voiceConnection.resume();
            }
            interaction.createMessage("Sucessfully resumed currently-paused song.");
        }
    } catch (err) {
        console.log(err);
    }
}