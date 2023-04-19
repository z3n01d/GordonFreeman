import * as Eris from "eris";
import fetch from "node-fetch";

type Meme = {
    postLink: string;
    subreddit: string;
    title: string;
    url: string;
    nsfw: boolean;
    spoiler: boolean;
    author: string;
    ups: number;
    preview: string[];
};

export const name: string = "hlmeme";
export const description: string = "Get a random post from r/HalfLife subreddit";
export const options = [];
async function getPost() {
    
    let posts = (await (await fetch("https://www.reddit.com/r/HalfLife/.json")).json()).data.children;

    console.log(posts);
}
export async function execute(interaction: Eris.Interaction) {
    if (!(interaction instanceof Eris.CommandInteraction)) return;

    const memeData: Meme = await (await fetch("https://meme-api.com/gimme/halflife")).json();

    var embed: Eris.EmbedOptions = {
        title: memeData.title,
        image: {url: memeData.url},
        url: memeData.postLink,
        author: {name: memeData.author},
        footer: {
            text: memeData.ups.toString(),
            icon_url: "https://cdn3.emoji.gg/emojis/2180-yes.png"
        },
        color: 16755968
    }

    if (memeData.nsfw) {
        embed.image = null;
    }

    interaction.createMessage({embeds:[embed]});
}