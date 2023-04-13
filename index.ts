import dotenv from "dotenv";
dotenv.config();
import * as Eris from "eris";
import express from "express";
import fs from "fs";
import path from "path";
import Database from "better-sqlite3";

const database = new Database("main.db");
database.pragma("journal_mode = WAL");

database.prepare("CREATE TABLE IF NOT EXISTS users(id TEXT)").run();

const app = express();
const port = 3000;
const commands = {};

export const client: Eris.Client = new Eris.Client(process.env.BOT_TOKEN);

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
        database.prepare(`UPDATE users SET id=${interaction.user.id}`).run();

        console.log(database.prepare("SELECT * FROM users").get());

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

client.connect();