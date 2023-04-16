import dotenv from "dotenv";
dotenv.config();
import * as Eris from "eris";
import Fastify from "fastify";
import fs from "fs";
import path from "path";
import axios from "axios";

type UserData = {
    inventory: string[];
    money: number;
    dailyTime: number;
    searchTime: number;
}

const fastify = Fastify({
    logger: false
});
const port = 8080;
const commands = {};

export const client: Eris.Client = new Eris.Client(`Bot ${process.env.BOT_TOKEN}`);

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

function setupUsersData(userId: string) {
    var userData = getUserData(userId);
    if (userData == null) {
        setUserData(userId,{
            inventory: [],
            money: 0,
            dailyTime: Date.now(),
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
        setUserData(userId,userData);
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

client.on("ready",() => {
    console.log("Ready");
    initializeSlashCommands();
    client.editStatus("online",{
        name: "Half-Life",
        type: 0
    });
    setInterval(() => {
        client.editStatus("online",{
            name: "Half-Life",
            type: 0
        });
    },6000);
})

client.on("error",(err) => {
    console.error(err);
})

client.on("messageCreate",(message) => {
    if (message.author.bot) return;
    setupUsersData(message.author.id);
})

client.on("interactionCreate",async (interaction: Eris.Interaction) => {
    if (interaction instanceof Eris.CommandInteraction) {
        if (!interaction.member) return interaction.createMessage("You can only use this command in a guild!");
        setupUsersData(interaction.member.id);
        const command = commands[interaction.data.name];
        await interaction.defer();
        return command.execute(interaction);
    }
    if (interaction instanceof Eris.ComponentInteraction) {
        if (
            typeof(interaction.message.interaction) === "undefined"
        ) return;
        const command = commands[interaction.message.interaction.name];
        return command.execute(interaction);
    }
})

fastify.get("/",(request,reply) => {
    return "Webserver running";
})

fastify.listen({ port: port }, function (err, address) {
    if (err) {
      fastify.log.error(err);
      process.exit(1);
    }
    console.log(`Listening on address ${address}`);
})

client.connect();