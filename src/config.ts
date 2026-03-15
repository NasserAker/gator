import fs from "fs";
import os from "os";
import path from "path";

export type Config = {
  dbUrl: string;
  currentUserName: string;
};

function getConfigFilePath(): string {
  const home = os.homedir();
  return path.join(home, ".gatorconfig.json");
}

function writeConfig(cfg: Config): void {
    const configPath = getConfigFilePath();

    const json = {
      dburl: cfg.dbUrl,
      current_user_name: cfg.currentUserName,
    };

    fs.writeFileSync(configPath, JSON.stringify(json, null, 2));
}

function validateConfig(rawConfig: any): Config {
    if (typeof rawConfig.db_url !== "string") {
      throw new Error("Invalid config: db_url must be a string");
    }
    if (typeof rawConfig.current_user_name !== "string") {
      throw new Error("Invalid config: current_user_name must be a string");
    }
    return {
      dbUrl: rawConfig.db_url,
      currentUserName: rawConfig.current_user_name,
    };
    
}
    



export function setUser(userName: string): void {
  const config = readConfig();

  config.currentUserName = userName;

  const configPath = getConfigFilePath();

  const json = {
    db_url: config.dbUrl,
    current_user_name: config.currentUserName,
  };

  fs.writeFileSync(configPath, JSON.stringify(json, null, 2));
}




export function readConfig(): Config {
  const configPath = getConfigFilePath();

  const data = fs.readFileSync(configPath, "utf8");
  const parsed = JSON.parse(data);

  return {
    dbUrl: parsed.db_url,
    currentUserName: parsed.current_user_name,
  };
}

