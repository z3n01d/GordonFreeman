import dotenv from "dotenv";
dotenv.config();
import * as Eris from "eris";
import express from "express";
import fs from "fs";
import path from "path";

type UserData = {
    inventory: string[];
    money: number;
}

const app = express();
const port = 3000;
const commands = {};

export const client: Eris.Client = new Eris.Client(process.env.BOT_TOKEN);

function getUserData(userId: string): UserData | undefined {
    const rawData = fs.readFileSync("userdata.json","utf-8");
    const data = JSON.parse(rawData);
    return data[userId];
}

function setUserData(userId: string,newUserData) {
    const rawData = fs.readFileSync("userdata.json","utf-8");
    const data = JSON.parse(rawData);
    data[userId] = newUserData || {};
    fs.writeFileSync("userdata.json",JSON.stringify(data));
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
})

client.on("error",(err) => {
    console.error(err);
})

client.on("messageCreate",(message) => {
    if (message.author.bot) return;
    console.log(typeof(getUserData(message.author.id)));
    if (typeof(getUserData(message.author.id)) != "undefined") {
        console.log("Setting data");
        setUserData(message.author.id,{});
    }
})

client.on("interactionCreate",async (interaction: Eris.Interaction) => {
    if (interaction instanceof Eris.CommandInteraction) {
        const command = commands[interaction.data.name];
        await interaction.defer();
        if (interaction.user) {
            setUserData(interaction.user.id,{});
        }
        return command.execute(interaction);
    }
})

app.get("/",(req,res) => {
    res.send("Webserver running");
})

app.listen(port,() => {
    console.log(`App listening on port ${port.toString()}`);
})

client.connect();