import { config } from "dotenv";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, ".env") });

import { TelegramClient } from "@mtcute/node";
import { readFileSync } from "fs";

const tg = new TelegramClient({
  apiId: parseInt(process.env.API_ID),
  apiHash: process.env.API_HASH,
});

const saved = JSON.parse(readFileSync(join(__dirname, "session.json"), "utf-8"));
await tg.importSession(saved);
await tg.connect();
await tg.startUpdatesLoop();

console.log("✓ 연결됨 - 다른 기기/계정에서 이 계정으로 메시지를 보내주세요 (30초)...");

let updateCount = 0;
tg.onRawUpdate.add((raw) => {
  updateCount++;
  const tlType = raw?.update?._ || "unknown";
  console.log(`[${updateCount}] raw update: ${tlType}`);

  // 메시지 관련 update 타입들
  if (tlType.includes("NewMessage") || tlType.includes("Message")) {
    console.log("  → 메시지 업데이트 감지!");
  }
});

tg.onNewMessage.add((msg) => {
  console.log("\n✅ onNewMessage 발화!");
  console.log("  발신자:", msg.sender?.firstName || msg.sender?.title || "(나)");
  console.log("  내용:", msg.text);
  process.exit(0);
});

tg.onEditMessage.add((msg) => {
  console.log("[editMessage]", msg.text);
});

setTimeout(() => {
  console.log(`\n30초 종료 (총 ${updateCount}개 update 수신)`);
  process.exit(1);
}, 30000);
