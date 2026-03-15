import { db } from "./index";
import { users } from "./schema";
import {eq} from "drizzle-orm";

export async function createUser(name: string) {
  const [result] = await db.insert(users).values({ name: name }).returning();
  return result;
}

export async function getUser(name: string) {
  const [result] = await db.select().from(users).where(eq(users.name, name));
  return result;
}


export async function resetUsers() {
  await db.delete(users);
}

export async function getUsers() {
  const usersList = await db.select({ name: users.name }).from(users);
  return usersList;
}