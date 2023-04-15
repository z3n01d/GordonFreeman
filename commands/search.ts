import * as Eris from "eris";
import { randomRange, setUserData, getUserData } from "..";

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
        successChance: 5,
        failMessage: "You've been caught by the combine soldiers."
    },
    "kleiner": {
        rewards: [
            5,
            10
        ],
        successChance: 80,
        failMessage: "You found nothing but you at least found Lamarr!"
    },
    "novaprospekt": {
        rewards: [
            600,
            20
        ],
        successChance: 10,
        failMessage: "You've been caught by the combine soldiers."
    },
    "train": {
        rewards: [
            1,
            5
        ],
        successChance: 100,
        failMessage: "You found nothing, only some trash and cans."
    },
    "whiteforest": {
        rewards: [
            30,
            25
        ],
        successChance: 85,
        failMessage: "You have found nothing and you looked like a weirdo."
    }
}

export const name: string = "search";
export const description: string = "Search places in City-17 and maybe you will find something.";
export const options = [];
export async function execute(interaction: Eris.Interaction) {
    if (interaction instanceof Eris.CommandInteraction) {
        var userData = getUserData(interaction.member.id);
        if (
            typeof(userData.searchTime) !== "undefined" &&
            60000 - (Date.now() - userData.searchTime) > 0
            ) {
            return interaction.createMessage({
                content: "Hey! Wait a minute before searching again!",
                flags: 64
            });
        }
        userData.searchTime = Date.now();
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
        var userData = getUserData(interaction.member.id);
        const pickedPlace = interaction.data.custom_id;
        const pickedPlaceData = placesAwards[pickedPlace];
        var embed: Eris.EmbedOptions = {
            title: `You have searched ${places[pickedPlace]}`,
            color: 16755968
        }
        if (Math.random() < pickedPlaceData.successChance / 100) {
            const randomAward = pickedPlaceData.rewards[Math.floor(Math.random() * pickedPlaceData.rewards.length)];
            var randomAwardText = randomAward
            if (typeof(randomAward) === "number") {
                userData.money += randomAward;
                randomAwardText = `$${randomAward.toString()}`;
            }
            embed.description = `You have found ${randomAwardText}`;
        } else {
            embed.description = pickedPlaceData.failMessage;
        }
        setUserData(interaction.member.id,userData);
        return interaction.editParent({
            embeds: [embed],
            components: []
        });
    }
}