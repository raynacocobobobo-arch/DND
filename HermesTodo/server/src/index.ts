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

// systemd/Node runs behind the local reverse proxy: bind loopback by default.
// Container deployments explicitly set LISTEN_HOST=0.0.0.0 in Dockerfile.
const listenHost = process.env.LISTEN_HOST ?? "127.0.0.1";
app.listen(config.port, listenHost, () => {
  console.log(`HermesTodo server listening on ${listenHost}:${config.port}`);
});
