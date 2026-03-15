import {XMLParser} from "fast-xml-parser";

type RSSFeed = {
  channel: {
    title: string;
    link: string;
    description: string;
    item: RSSItem[];
  };
};

type RSSItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
};

export async function fetchFeed(feedURL: string){

    try{
        const feed = await fetch(feedURL,{
            headers: {
                "User-Agent": "gator"
            },
        });

        const xml = await feed.text();
        const parser = new XMLParser();
        const parsed = parser.parse(xml);

        if(!parsed.rss || !parsed.rss.channel){
             throw new Error("Invalid RSS feed");
        }

        const channel = parsed.rss.channel;


        const title = channel.title;
        const link = channel.link;
        const description = channel.description;


        if(!link || !title || !description){
            throw new Error("Invalid RSS feed metadata");
        }

          let items: any[] = [];

        if (Array.isArray(channel.item)) {
            items = channel.item;
        } else if (channel.item) {
            items = [channel.item];
        }

        const parsedItems = [];

        for (const item of items) {
            if (!item.title || !item.link || !item.description || !item.pubDate) {
            continue;
            }

            parsedItems.push({
            title: item.title,
            link: item.link,
            description: item.description,
            pubDate: item.pubDate,
            });
        }


        return {
            channel: {
            title: channel.title,
            link: channel.link,
            description: channel.description,
            item: parsedItems,
            },
        };

    }
    catch (err) {
        console.error(err);
        throw new Error("Failed to fetch or parse the RSS feed");
    }
}