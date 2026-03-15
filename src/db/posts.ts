import { db } from "./index";
import { feed_follows, feeds, posts } from "./schema";
import {eq , desc} from "drizzle-orm";



export async function createPost(title: string, url: string, description: string, published_at: Date, feed_id: string) {
  const [result] = await db.insert(posts).values({ title, url, description, published_at, feed_id }).returning();
  return result;
}


export async function getPostsForUser(user_id: string, limit: number) {
  const results = await db
    .select({
      title: posts.title,
      url: posts.url,
      description: posts.description,
      published_at: posts.published_at,
      feed_name: feeds.name,
    })
    .from(posts)
    .innerJoin(feeds, eq(posts.feed_id, feeds.id))
    .innerJoin(feed_follows, eq(feed_follows.feed_id, feeds.id))
    .where(eq(feed_follows.user_id, user_id))
    .orderBy(desc(posts.published_at))
    .limit(limit);

  return results;
}