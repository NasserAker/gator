# Gator – RSS Feed CLI Aggregator

Gator is a command-line RSS feed aggregator built with **TypeScript**, **Node.js**, **PostgreSQL**, and **Drizzle ORM**.

It allows users to subscribe to RSS feeds, periodically fetch posts, store them in a database, and browse them directly from the terminal.

The project was built as part of the Boot.dev backend curriculum and focuses on building a CLI application with a database backend.

---

# Features

- Create and manage users
- Subscribe to RSS feeds
- Follow and unfollow feeds
- Periodically fetch posts from RSS feeds
- Store posts in a PostgreSQL database
- Prevent duplicate posts
- Browse the latest posts from followed feeds
- Fully terminal-based interface

---

# Requirements

Before running the program, make sure you have:

- **Node.js** (version 18 or newer)
- **PostgreSQL**
- **npm**
- **Git**

---

# Database Setup

You must have a running PostgreSQL database.

Example connection string:

```
postgres://postgres:postgres@localhost:5432/gator
```

Create a configuration file in your home directory:

```
~/.gatorconfig.json
```

Example configuration file:

```json
{
  "db_url": "postgres://postgres:postgres@localhost:5432/gator"
}
```

This file stores the database connection string and the current logged-in user.

---

# Run Database Migrations

Generate and apply database migrations:

```
npm run generate
npm run migrate
```

---

# Running the CLI

All commands are executed using:

```
npm run start <command>
```

Example:

```
npm run start register nasser
```

---

# Commands

## Register a User

```
npm run start register <username>
```

Example:

```
npm run start register nasser
```

---

## Login

```
npm run start login <username>
```

---

## Reset the Database

Deletes all users.

```
npm run start reset
```

---

## Add a Feed

Adds a new RSS feed.

```
npm run start addfeed "<feed name>" <rss url>
```

Example:

```
npm run start addfeed "HackerNews" https://hnrss.org/frontpage
```

---

## Follow a Feed

```
npm run start follow <feed url>
```

---

## Unfollow a Feed

```
npm run start unfollow <feed url>
```

---

## View Followed Feeds

```
npm run start following
```

---

## Run the Feed Aggregator

Fetches posts from RSS feeds at regular intervals.

```
npm run start agg <time_between_requests>
```

Example:

```
npm run start agg 10s
```

Supported time formats:

```
10s  → 10 seconds
5m   → 5 minutes
1h   → 1 hour
```

Stop the aggregator using **Ctrl + C**.

---

## Browse Posts

View the most recent posts from feeds you follow.

Default limit is **2 posts**.

```
npm run start browse
```

Specify a custom limit:

```
npm run start browse 10
```

---

# Example Workflow

```
npm run start register nasser
npm run start addfeed "HackerNews" https://hnrss.org/frontpage
npm run start agg 10s
```

After the aggregator runs, browse posts:

```
npm run start browse
```

---

# Tech Stack

- TypeScript
- Node.js
- PostgreSQL
- Drizzle ORM
- RSS XML parsing

---

# Project Structure

```
src/
  db/
    feeds.ts
    posts.ts
    users.ts
  commands.ts
  index.ts
  config.ts
```
