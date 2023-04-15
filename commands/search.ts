import * as Eris from "eris";
import { randomRange } from "..";

const places = {
    "citadel": "Citadel",
    "kleiner": "Kleiner's lab",
    "novaprospekt": "Nova Prospekt",
    "train": "Train station",
    "whiteforest": "White Forest"
}

const placesAwards = {
    "citadel": {
        rewards: [
            200,
            50
        ],
        successChance: 5
    },
    "kleiner": {
        rewards: [
            5,
            10
        ],
        successChance: 80
    },
    "novaprospekt": {
        rewards: [
            600,
            20
        ],
        successChance: 10
    },
    "train": {
        rewards: [
            1,
            5
        ],
        successChance: 100
    },
    "whiteforest": {
        rewards: [
            30,
            25
        ],
        successChance: 85
    }
}

export const name: string = "search";
export const description: string = "Search places in City-17 and maybe you will find something.";
export const options = [];
export async function execute(interaction: Eris.Interaction) {
    if (interaction instanceof Eris.CommandInteraction) {
        var placesClone = Object.keys(places);
        var place1 = placesClone[Math.floor(Math.random() * placesClone.length)];
        placesClone.splice(placesClone.indexOf(place1),1);
        var place2 = placesClone[Math.floor(Math.random() * placesClone.length)];
        placesClone.splice(placesClone.indexOf(place2),1);
        var place3 = placesClone[Math.floor(Math.random() * placesClone.length)];
        return interaction.createMessage({
            embeds: [
                {
                    title: "Where do you want to search?",
                    color: 16755968
                }
            ],
            components: [
                {
                    type: Eris.Constants.ComponentTypes.ACTION_ROW,
                    components: [
                        {
                            type: Eris.Constants.ComponentTypes.BUTTON,
                            label: places[place1],
                            style: Eris.Constants.ButtonStyles.PRIMARY,
                            custom_id: place1
                        },
                        {
                            type: Eris.Constants.ComponentTypes.BUTTON,
                            label: places[place2],
                            style: Eris.Constants.ButtonStyles.PRIMARY,
                            custom_id: place2
                        },
                        {
                            type: Eris.Constants.ComponentTypes.BUTTON,
                            label: places[place3],
                            style: Eris.Constants.ButtonStyles.PRIMARY,
                            custom_id: place3
                        }
                    ]
                }
            ]
        });
    }
    if (interaction instanceof Eris.ComponentInteraction) {
        if (interaction.member.id != interaction.message.interaction.member.id) return interaction.createMessage({
            content: "You can't pick where they search for others!",
            flags: 64
        });
        const pickedPlace = interaction.data.custom_id;
        const pickedPlaceData = placesAwards[pickedPlace];
        if (Math.random() < pickedPlaceData.successChance) {
            return interaction.message.edit({
                content: "Success"
            });
        } else {
            return interaction.message.edit({
                content: "Failed"
            });
        }
    }
}