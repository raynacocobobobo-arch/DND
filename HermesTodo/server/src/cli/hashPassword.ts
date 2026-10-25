import { once } from "node:events";

import { hashPassword } from "../auth/password";

process.stdin.setEncoding("utf8");
let input = "";
process.stdin.on("data", (chunk: string) => {
  input += chunk;
});

await once(process.stdin, "end");
const password = input.replace(/[\r\n]+$/, "");
if (!password) {
  console.error("Pass the password on standard input.");
  process.exitCode = 1;
} else {
  console.log(await hashPassword(password));
}
