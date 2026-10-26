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

// Bind to the container interface. Production host exposure remains restricted by
// Docker Compose to 127.0.0.1:3020; managed container hosts need this binding.
const listenHost = process.env.LISTEN_HOST ?? "0.0.0.0";
app.listen(config.port, listenHost, () => {
  console.log(`HermesTodo server listening on ${listenHost}:${config.port}`);
});
