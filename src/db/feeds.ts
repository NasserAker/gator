import { config } from "node:process";
import { db } from "./index";
import { feed_follows, feeds, users } from "./schema";
import { getUser } from "./users";
import { readConfig } from "src/config";
import {and, eq, sql} from "drizzle-orm";

export type Feed = typeof feeds.$inferSelect;
export type User = typeof users.$inferSelect;

export async function createFeed(name: string, url: string, userId: string) {
    const [result] = await db.insert(feeds).values({ name: name, url: url, user_id: userId }).returning();
     const config = readConfig();
    printFeed(result, await getUser(config.currentUserName));
    return result;
}

export function printFeed(feed: Feed, user: User): void {
  console.log(`Feed ID: ${feed.id}`);
  console.log(`Created At: ${feed.createdAt}`);
  console.log(`Updated At: ${feed.updatedAt}`);
  console.log(`Name: ${feed.name}`);
  console.log(`URL: ${feed.url}`);
  console.log(`User: ${user.name}`);
}

export async function printAllFeeds(){
  const allFeeds = await db.select({feedName: feeds.name, feedURL: feeds.url, userName: users.name}).from(feeds).leftJoin(users, eq(feeds.user_id, users.id));
  allFeeds.forEach(feed => {
    console.log(`${feed.feedName} ${feed.feedURL} ${feed.userName}`);
  }); 
}




export async function createFeedFollow(userId: string, feedId: string) {
  const inserted = await db.insert(feed_follows).values({ user_id: userId, feed_id: feedId }).returning();
  const newFeedFollow = inserted[0];
    const result = await db
    .select({
      id: feed_follows.id,
      createdAt: feed_follows.createdAt,
      updatedAt: feed_follows.updatedAt,
      userId: feed_follows.user_id,
      feedId: feed_follows.feed_id,
      userName: users.name,
      feedName: feeds.name,
    })
    .from(feed_follows)
    .innerJoin(users, eq(feed_follows.user_id, users.id))
    .innerJoin(feeds, eq(feed_follows.feed_id, feeds.id))
    .where(eq(feed_follows.id, newFeedFollow.id));
  return newFeedFollow;
}

export async function getFeedIdByURL(url: string) {
  const feedId = await db.select({feedId: feeds.id}).from(feeds).where(eq(feeds.url, url));
  return feedId[0].feedId;
}


export async function getFeedFollowsForUser(userId: string) {
  const feedFollows = await db
    .select({
      id: feed_follows.id,
      createdAt: feed_follows.createdAt,
      updatedAt: feed_follows.updatedAt,
      userId: feed_follows.user_id,
      feedId: feed_follows.feed_id,
      userName: users.name,
      feedName: feeds.name,
    })
    .from(feed_follows)
    .innerJoin(users, eq(feed_follows.user_id, users.id))
    .innerJoin(feeds, eq(feed_follows.feed_id, feeds.id))
    .where(eq(feed_follows.user_id, userId));
  return feedFollows;
}


export async function deleteFeedFollow(url: string) {  
  const feedId = await getFeedIdByURL(url);
  await db.delete(feed_follows).where(and(eq(feed_follows.feed_id, feedId), eq(feed_follows.user_id, (await getUser(readConfig().currentUserName)).id)));
}


export async function markFeedFetched(feedId: string) {
  await db
    .update(feeds)
    .set({
      last_fetched_at: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(feeds.id, feedId));
}


export async function getNextFeedToFetch() {
  const result = await db 
    .select()
    .from(feeds)
    .orderBy(sql`${feeds.last_fetched_at} NULLS FIRST`)
    .limit(1);

  return result[0];
}
