import * as Eris from "eris";

const places = {
    "citadel": "Citadel",
    "kleiner": "Kleiner's lab",
    "novaprospekt": "Nova Prospekt",
    "train": "Train station",
    "whiteforest": "White Forest"
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
                    title: "Where do you want to search?"
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
        return interaction.createMessage("This is a response to a button");
    }
}