const url = process.argv[2] ?? "http://127.0.0.1:3020/api/health";
const response = await fetch(url, { signal: AbortSignal.timeout(5_000) });
if (!response.ok) throw new Error(`Health check failed with HTTP ${response.status}`);
const body = await response.json();
if (body.status !== "ok") throw new Error("Health check returned an unexpected response");
console.log(`${url}: ok`);
