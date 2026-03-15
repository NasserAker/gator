import { readConfig, setUser } from "./config";
import * as cmd from "./commands";
import * as cmdCon from "./commandsConfig";
import process from "node:process";
import { middlewareLoggedIn } from "./commands";


async function main() {

  const registry: cmdCon.CommandsRegistry = {};
  cmdCon.registerCommand(registry, "login", cmd.handlerLogin);
  cmdCon.registerCommand(registry, "register", cmd.handlerRegister);
  cmdCon.registerCommand(registry, "reset", cmd.handlerReset);
  cmdCon.registerCommand(registry, "users", cmd.handlerUsers);
  cmdCon.registerCommand(registry, "agg", cmd.handlerFetch);
  cmdCon.registerCommand(registry, "addfeed", middlewareLoggedIn(cmd.addFeed));
  cmdCon.registerCommand(registry, "feeds", cmd.printFeeds);
  cmdCon.registerCommand(registry, "follow", middlewareLoggedIn(cmd.follow));
  cmdCon.registerCommand(registry, "following", middlewareLoggedIn(cmd.following));
  cmdCon.registerCommand(registry, "unfollow", middlewareLoggedIn(cmd.unfollow));
  cmdCon.registerCommand(registry, "browse", middlewareLoggedIn(cmd.browse));

  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("No command provided");
    process.exit(1);
  }
  if(args[0] === "reset") {
    await cmdCon.runCommand(registry, "reset");
    process.exit(0);
  }
  if (args.length === 1 && (args[0] === "register" || args[0] === "login")) {
    console.error("Username is required");
    process.exit(1);
  }

  await cmdCon.runCommand(registry, args[0], ...args.slice(1));

  process.exit(0);
}

main();