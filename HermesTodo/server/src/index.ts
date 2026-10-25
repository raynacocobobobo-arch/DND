import { createApp } from "./app";
import { createArkClient } from "./ai/arkClient";
import { loadConfig } from "./config";
import { createDatabase } from "./db/database";

const config = loadConfig();
const db = createDatabase(config.databasePath);
const aiPlanner = createArkClient({
  apiKey: config.arkApiKey,
  endpoint: config.arkEndpoint,
  model: config.arkModel
});
const app = createApp({ db, config, aiPlanner, staticDirectory: "dist/client" });

app.listen(config.port, "127.0.0.1", () => {
  console.log(`HermesTodo server listening on 127.0.0.1:${config.port}`);
});
