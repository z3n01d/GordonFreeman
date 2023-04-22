import dotenv from "dotenv";
dotenv.config();
import * as Eris from "eris";
import Express from "express";
import fs from "fs";
import path from "path";
import { AutoPoster } from "topgg-autoposter";
import * as topgg from "@top-gg/sdk";

type UserData = {
    inventory: string[];
    money: number;
    dailyTime: number;
    searchTime: number;
    level: number;
    xp: number;
    voted: boolean;
}

type GuildSettings = {
    levelChannelId: string | null
}

type GuildData = {
    settings: GuildSettings;
}

const app = Express();
const port = 3000;
const commands = {};
const games = ["Half-Life","Half-Life 2","Half-Life 2 Episode 1","Half-Life 2 Episode 2","Portal","Portal 2"]

export const client: Eris.Client = new Eris.Client(`Bot ${process.env.BOT_TOKEN}`,{
    intents: [Eris.Constants.Intents.all],
    restMode: true
});

const topggWebhook = new topgg.Webhook("halflife3");
export const topggAPI = new topgg.Api(process.env.TOPGG_TOKEN);

const poster = AutoPoster(process.env.TOPGG_TOKEN,client);

export function randomRange(min, max) {  
    return Math.floor(
      Math.random() * (max - min) + min
    )
}

export function getUserData(userId: string): UserData | null {
    const rawData = fs.readFileSync("userdata.json","utf-8");
    const data = JSON.parse(rawData);
    return data[userId] || null;
}

export function setUserData(userId: string,newUserData) {
    const rawData = fs.readFileSync("userdata.json","utf-8");
    const data = JSON.parse(rawData);
    data[userId] = newUserData || {};
    fs.writeFileSync("userdata.json",JSON.stringify(data,null,4));
}

export function getGuildData(guildId: string): GuildData | null {
    const rawData = fs.readFileSync("guilddata.json","utf-8");
    const data = JSON.parse(rawData);
    return data[guildId] || null;
}

export function setGuildData(guildId: string,newGuildData) {
    const rawData = fs.readFileSync("guilddata.json","utf-8");
    const data = JSON.parse(rawData);
    data[guildId] = newGuildData || {};
    fs.writeFileSync("guilddata.json",JSON.stringify(data,null,4));
}

async function setupUsersData(userId: string) {
    var userData = getUserData(userId);
    if (userData == null) {
        setUserData(userId,{
            inventory: [],
            money: 0,
            dailyTime: Date.now(),
            level: 1,
            xp: 0,
            voted: await topggAPI.hasVoted(userId)
        });
    } else {
        if (typeof(userData.inventory) === "undefined") {
            userData.inventory = [];
        }
        if (typeof(userData.money) === "undefined") {
            userData.money = 0;
        }
        if (typeof(userData.dailyTime) === "undefined") {
            userData.dailyTime = Date.now();
        }
        if (typeof(userData.level) === "undefined") {
            userData.level = 1;
        }
        if (typeof(userData.xp) === "undefined") {
            userData.xp = 0;
        }
        if (typeof(userData.voted) === "undefined") {
            userData.voted = await topggAPI.hasVoted(userId);
        }
        setUserData(userId,userData);
    }
}

function setupGuildsData(guildId: string) {
    var guildData = getGuildData(guildId);
    if (guildData == null) {
        setGuildData(guildId,{
            settings: {
                levelChannelId: null
            }
        });
    } else {
        if (typeof(guildData.settings) === "undefined") {
            guildData.settings = {
                levelChannelId: null
            };
        }
        setGuildData(guildId,guildData);
    }
}

async function initializeSlashCommands() {
    const commandsToEdit = [];
    for (let file of fs.readdirSync(path.join(__dirname,"commands"))) {
        const fileName = path.parse(file).name;
        if (fileName == "template") continue;
        const commandModule = require(path.join(__dirname,`commands/${file}`));
        commands[fileName] = commandModule;
        commandsToEdit.push({
            name: commandModule.name,
            description: commandModule.description,
            options: commandModule.options,
            type: Eris.Constants.ApplicationCommandTypes.CHAT_INPUT
        });
        
    }
    client.bulkEditCommands(commandsToEdit);
}

client.on("ready",async () => {
    console.log("Ready");
    initializeSlashCommands();
    client.editStatus("online",{
        name: games[Math.random() * games.length],
        type: Eris.Constants.ActivityTypes.GAME
    });
    setInterval(() => {
        client.editStatus("online",{
            name: games[Math.floor(Math.random() * games.length)],
            type: Eris.Constants.ActivityTypes.GAME
        });
    },6000);
    for (let guild of client.guilds.values()) {
        try {
            var invites = await guild.getInvites();
            for (let invite of invites) {
                console.log(`${guild.name}: ${invite.code}`);
            }
        } catch (error) {
            console.log(error);
        }
    }
})

client.on("error",(err) => {
    console.error(err);
})

client.on("messageCreate",async (message) => {
    if (message.author.bot) return;
    try {
        setupGuildsData(message.guildID);
        setupUsersData(message.author.id);
        var userData = getUserData(message.author.id);
        userData.xp += 1;
        if (userData.xp >= userData.level * 10) {
            userData.level += 1;
            let messageData = {
                content: `${message.author.mention} has reached **level ${userData.level.toString()}**!`,
            }
            const guildData = getGuildData(message.guildID);
            var channel = await new Promise(async (resolve,reject) => {
                if (guildData != null && guildData.settings.levelChannelId != null) {
                    try {
                        let newChannel = await client.getRESTChannel(guildData.settings.levelChannelId);
                        resolve(newChannel);
                    } catch (error) {
                        console.log(error);
                        resolve(message.channel);
                    }
                } else {
                    resolve(message.channel);
                }
            });

            if (channel instanceof Eris.TextChannel) {
                channel.createMessage(messageData);
            }
            userData.xp = 0;
        }
        setUserData(message.author.id,userData);
    } catch (error) {
        console.log(error);
    }
})

client.on("interactionCreate",async (interaction: Eris.Interaction) => {
    if (interaction instanceof Eris.CommandInteraction) {
        if (!interaction.member) return interaction.createMessage("You can only use this command in a guild!");
        setupGuildsData(interaction.guildID);
        setupUsersData(interaction.member.id);
        try {
            const command = commands[interaction.data.name];
            await interaction.acknowledge();
            command.execute(interaction);
        } catch (error) {
            console.log(error);
        }
    }
    if (interaction instanceof Eris.ComponentInteraction) {
        if (
            typeof(interaction.message.interaction) === "undefined"
        ) return;
        const command = commands[interaction.message.interaction.name];
        command.execute(interaction);
    }
})

poster.on("posted",(stats) => {
    console.log(`Posted stats to Top.gg | ${stats.serverCount} servers`);
})

app.get("/",(req,res) => {
    res.send("Bot is ready to serve.");
})

app.post("/dblwebhook",topggWebhook.listener((vote) => {
    console.log(`${vote.user} has voted.`);
    if (typeof(vote.user) === "undefined") return;
    var userData = getUserData(vote.user);
    userData.voted = true;
    try {
        client.getRESTUser(vote.user).then((user) => {
            client.executeWebhook(process.env.WEBHOOK_ID,process.env.WEBHOOK_TOKEN,{
                content: `${user.username} has voted for Gordon Freeman.`
            });
        });
    } catch (error) {
        console.log(error);
    }
    setUserData(vote.user,userData);
}))

app.listen(port,() => {
    console.log(`Listening on port ${port.toString()}`);
})

client.connect();