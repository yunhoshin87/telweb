import { config } from "dotenv";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, ".env") });

import { TelegramClient } from "@mtcute/node";
import { readFileSync } from "fs";

const tg = new TelegramClient({ apiId: parseInt(process.env.API_ID), apiHash: process.env.API_HASH });
const saved = JSON.parse(readFileSync(join(__dirname, "session.json"), "utf-8"));
await tg.importSession(saved);
await tg.connect();

// iterMessages 대신 사용할 메서드 찾기
let o = tg;
const all = new Set();
while (o) {
  Object.getOwnPropertyNames(o).forEach(k => all.add(k));
  o = Object.getPrototypeOf(o);
}
const historyMethods = [...all].filter(k => /history|message|iter/i.test(k)).sort();
console.log("history/message/iter 관련 메서드:\n" + historyMethods.join("\n"));
process.exit(0);
