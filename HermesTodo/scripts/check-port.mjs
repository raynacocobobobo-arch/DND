import net from "node:net";

const ports = process.argv.slice(2).length ? process.argv.slice(2).map(Number) : [3020, 8443];

async function portIsFree(port) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once("error", (error) => {
      if (error.code === "EADDRINUSE") resolve(false);
      else reject(error);
    });
    server.once("listening", () => server.close(() => resolve(true)));
    server.listen(port, "127.0.0.1");
  });
}

let failed = false;
for (const port of ports) {
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error(`Invalid port: ${port}`);
  const free = await portIsFree(port);
  console.log(`${port}: ${free ? "free" : "in use"}`);
  failed ||= !free;
}
if (failed) process.exitCode = 1;
