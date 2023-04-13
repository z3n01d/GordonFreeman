import dotenv from "dotenv";
dotenv.config();
import * as Eris from "eris";
import { Octokit, App } from "octokit";
import express from "express";
import fs from "fs";
import path from "path";

declare function require(name:string);

const Monitor = require("ping-monitor");

const app = express();
const port = 3000;
const commands = {};

const monitor = new Monitor({
    address: "https://gordonfreeman.realjace.repl.co",
    title: "Gordon Freeman",
    interval: 2,
    protocol: "http",
    config: {
        intervalUnits: 'minutes' // seconds, milliseconds, minutes {default}, hours
    },
    httpOptions: {
        path: '/',
        method: 'get',
        query: {
          id: 3
        }
    },
    expect: {
        statusCode: 200
    }
});

export const client: Eris.Client = new Eris.Client(process.env.BOT_TOKEN);
export const octokit_client = new Octokit({
    auth: process.env.GITHUB_TOKEN
});

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

client.on("interactionCreate",async (interaction: Eris.Interaction) => {
    if (interaction instanceof Eris.CommandInteraction) {
        const command = commands[interaction.data.name];
        await interaction.defer();
        return command.execute(interaction);
    }
})

app.get("/",(req,res) => {
    res.send("Webserver running");
})

app.listen(port,() => {
    console.log(`App listening on port ${port.toString()}`);
})

monitor.on("up",() => {
    console.log("Pinged!");
})

client.connect();