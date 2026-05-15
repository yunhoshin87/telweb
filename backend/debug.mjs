import { config } from "dotenv";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, ".env") });

const API_ID = parseInt(process.env.API_ID);
const API_HASH = process.env.API_HASH;
const PHONE = process.env.PHONE;

console.log("API_ID:", API_ID);
console.log("PHONE:", PHONE);

const { TelegramClient } = await import("@mtcute/node");
import { createInterface } from "readline";

function prompt(q) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(r => rl.question(q, ans => { rl.close(); r(ans.trim()); }));
}

// MemoryStorage로 테스트 (세션 파일 없음)
const tg = new TelegramClient({
  apiId: API_ID,
  apiHash: API_HASH,
  // storage 미지정 → 메모리 사용
});

try {
  const me = await tg.start({
    phone: PHONE,
    code: () => prompt("인증코드: "),
    password: () => prompt("2FA 비밀번호: "),
  });
  console.log("로그인 성공:", me.displayName);
} catch(e) {
  console.error("에러:", e.text || e.message);
} finally {
  process.exit(0);
}
