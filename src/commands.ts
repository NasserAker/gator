import { config } from "node:process";
import { readConfig, setUser } from "./config";
import { createUser, getUser, getUsers, resetUsers } from "./db/users";
import { fetchFeed } from "./db/fetchFeed";
import { createFeed, createFeedFollow, deleteFeedFollow, getFeedFollowsForUser, getFeedIdByURL, getNextFeedToFetch, markFeedFetched, printAllFeeds, User } from "./db/feeds";
import { CommandHandler } from "./commandsConfig";
import { createPost, getPostsForUser } from "./db/posts";




type UserCommandHandler = (
  cmdName: string,
  user: User,
  ...args: string[]
) => Promise<void>;



type middlewareLoggedIn = (handler: UserCommandHandler) => CommandHandler;

export const middlewareLoggedIn: middlewareLoggedIn =
  (handler: UserCommandHandler): CommandHandler =>
  async (cmdName: string, ...args: string[]) => {
    const config = readConfig();

    if (!config.currentUserName) {
      throw new Error("You must be logged in");
    }

    const user = await getUser(config.currentUserName);

    if (!user) {
      throw new Error("User not found");
    }

    await handler(cmdName, user, ...args);
  };




export async function handlerLogin(cmdName: string, ...args: string[]){
    if (args.length !== 1) {
        throw new Error("Username is required for login command");
    }
    const userName = args[0];
    const user = await getUser(userName);
    if (!user) {
        throw new Error("User not found");
    }
    else {
        setUser(userName);
        console.log(`Logged in as ${userName}`);
    }
}


export async function handlerRegister(cmdName: string, ...args: string[]){
    if (args.length !== 1) {
        throw new Error("Username is required for register command");
    }
    const userName = args[0];
    await createUser(userName);
    console.log(`Registered as ${userName}`);
    setUser(userName);
}


export async function handlerReset(cmdName: string, ...args: string[]){
    await resetUsers();
    console.log("All users have been reset");
}


export async function handlerUsers(cmdName: string, ...args: string[]){
    const users = await getUsers();
    const config = readConfig();
    users.forEach(user => {
        
        if (user.name === config.currentUserName) {
            console.log(` - ${user.name} (current)`);
        }
        else{
            console.log(` - ${user.name}`);
        }
    });
}


// export async function handlerFetch(cmdName: string, ...args: string[]) {
//     const feedURL = "https://www.wagslane.dev/index.xml";
//     const feed = await fetchFeed(feedURL);

//     console.log(JSON.stringify(feed, null, 2));
// }

export async function addFeed(
  cmdName: string,
  user: User,
  ...args: string[]
) {
  if (args.length !== 2) {
    process.exit(1);
  }

  const feedName = args[0];
  const feedURL = args[1];

  await fetchFeed(feedURL);
  await createFeed(feedName, feedURL, user.id);
  await createFeedFollow(user.id, await getFeedIdByURL(feedURL));

  console.log(`Feed "${feedName}" created successfully by user ${user.name}`);
}


export async function printFeeds(cmdName: string, ...args: string[]) {
    await printAllFeeds();
}


export async function follow(
  cmdName: string,
  user: User,
  ...args: string[]
) {
  if (args.length !== 1) {
    throw new Error("Feed URL is required");
  }

  const url = args[0];

  await createFeedFollow(user.id, await getFeedIdByURL(url));

  console.log(`${user.name} is now following ${url}`);
}


export async function following(
  cmdName: string,
  user: User,
  ...args: string[]
) {
  const feedFollows = await getFeedFollowsForUser(user.id);

  feedFollows.forEach((feedFollow) => {
    console.log(feedFollow.feedName);
  });
}


export async function unfollow(
  cmdName: string,
  user: User,
  ...args: string[]
) {
  if (args.length !== 1) {
    throw new Error("Feed URL is required");
  }

  const url = args[0];

  await deleteFeedFollow(url);

  console.log(`${user.name} has unfollowed ${url}`);
}



export async function scrapeFeeds() {
  const feed = await getNextFeedToFetch();

  if (!feed) {
    console.log("No feeds to fetch");
    return;
  }

  await markFeedFetched(feed.id);

  const rss = await fetchFeed(feed.url);

for (const item of rss.channel.item) {
  const published = item.pubDate ? new Date(item.pubDate) : new Date();

  try {
    await createPost(
      item.title ?? "No title",
      item.link,
      item.description ?? "",
      published,
      feed.id
    );
  } catch (err) {
    console.log("Skipping duplicate post");
  }
}
}

function parseDuration(durationStr: string): number {
  const regex = /^(\d+)(ms|s|m|h)$/;
  const match = durationStr.match(regex);

  if (!match) {
    throw new Error("Invalid duration format");
  }

  const value = parseInt(match[1]);
  const unit = match[2];

  switch (unit) {
    case "ms":
      return value;
    case "s":
      return value * 1000;
    case "m":
      return value * 60 * 1000;
    case "h":
      return value * 60 * 60 * 1000;
    default:
      throw new Error("Invalid duration unit");
  }
}


function handleError(err: unknown) {
  console.error(err);
}

export async function handlerFetch(cmdName: string, ...args: string[]) {
  if (args.length !== 1) {
    throw new Error("Usage: agg <time_between_reqs>");
  }

  const durationStr = args[0];
  const timeBetweenRequests = parseDuration(durationStr);

  console.log(`Collecting feeds every ${durationStr}`);

  // run once immediately
  scrapeFeeds().catch(handleError);

  const interval = setInterval(() => {
    scrapeFeeds().catch(handleError);
  }, timeBetweenRequests);

  // wait until Ctrl+C
  await new Promise<void>((resolve) => {
    process.on("SIGINT", () => {
      console.log("Shutting down feed aggregator...");
      clearInterval(interval);
      resolve();
    });
  });
}

export async function browse(
  cmdName: string,
  user: User,
  ...args: string[]
) {
  const limit = args.length > 0 ? parseInt(args[0]) : 2;

  const posts = await getPostsForUser(user.id, limit);

  for (const post of posts) {
    console.log(`
      Title: ${post.title}
      URL: ${post.url}
      Description: ${post.description}
      Published: ${post.published_at}
      `);
  }
}