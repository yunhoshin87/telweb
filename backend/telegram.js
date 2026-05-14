import { TelegramClient } from "@mtcute/node";
import { createInterface } from "readline";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SESSION_FILE = join(__dirname, "session.json");

// env는 connect() 호출 시점에 읽음 (ESM 호이스팅 이슈 방지)
let tg;
let _newMessageCallback = null;

export function onNewMessage(fn) {
  _newMessageCallback = fn;
}

function prompt(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(question, (ans) => { rl.close(); resolve(ans.trim()); }));
}

function loadSession() {
  // 클라우드 환경: SESSION_DATA 환경변수 우선
  if (process.env.SESSION_DATA) {
    try {
      return JSON.parse(Buffer.from(process.env.SESSION_DATA, "base64").toString("utf-8"));
    } catch {}
  }
  try {
    if (existsSync(SESSION_FILE)) return JSON.parse(readFileSync(SESSION_FILE, "utf-8"));
  } catch {}
  return null;
}

function saveSession(session) {
  // 로컬에서만 파일 저장 (클라우드는 env var로 관리)
  if (!process.env.SESSION_DATA) {
    writeFileSync(SESSION_FILE, JSON.stringify(session), "utf-8");
  }
}

function serializeMessage(msg, fallbackChatId) {
  const sender = msg.sender;
  let senderName = "";
  if (sender) {
    senderName = sender.firstName !== undefined
      ? [sender.firstName, sender.lastName].filter(Boolean).join(" ")
      : (sender.title || sender.username || "");
  }
  const chatId = msg.chat?.id ?? msg.chatId ?? fallbackChatId;
  const date = msg.date instanceof Date
    ? msg.date.toISOString()
    : typeof msg.date === "number"
      ? new Date(msg.date * 1000).toISOString()
      : new Date().toISOString();
  return {
    chatId: chatId?.toString(),
    msgId: msg.id,
    sender: senderName.trim(),
    text: msg.text || "",
    date,
    out: msg.isOutgoing ?? false,
  };
}

function attachHandler() {
  tg.onNewMessage.add((msg) => {
    if (_newMessageCallback) _newMessageCallback(serializeMessage(msg));
  });
}

export async function connect() {
  // 이 시점엔 --env-file로 env가 이미 로드된 상태
  const API_ID = parseInt(process.env.API_ID);
  const API_HASH = process.env.API_HASH;
  const PHONE = process.env.PHONE;

  if (!API_ID || !API_HASH) throw new Error(".env 파일에 API_ID / API_HASH가 없습니다.");

  const saved = loadSession();
  if (saved) {
    tg = new TelegramClient({ apiId: API_ID, apiHash: API_HASH });
    try {
      await tg.importSession(saved);
      await tg.connect();
      await tg.startUpdatesLoop();
      const me = await tg.getMe();
      console.log("자동 로그인 성공:", me.displayName);
      attachHandler();
      return;
    } catch (e) {
      if (e instanceof TypeError) throw e;
      console.log("세션 만료, 재인증합니다...");
    }
  }

  tg = new TelegramClient({ apiId: API_ID, apiHash: API_HASH });
  const me = await tg.start({
    phone: PHONE,
    code: () => prompt("SMS 인증코드: "),
    password: () => prompt("2FA 비밀번호: "),
  });
  await tg.startUpdatesLoop();
  saveSession(await tg.exportSession());
  console.log("텔레그램 연결 완료:", me.displayName);
  attachHandler();
}

export async function getDialogs() {
  const result = [];
  for await (const dialog of tg.iterDialogs({ limit: 100 })) {
    const peer = dialog.peer;
    if (!peer) continue;

    const className = peer.constructor?.name || "";
    let type = "group";
    if (className === "User") type = "user";
    else if (className === "Channel" && peer.isBroadcast) type = "channel";
    else if (className === "Channel") type = "supergroup";

    const name = peer.displayName || peer.title || peer.firstName || "Unknown";

    result.push({
      id: peer.id?.toString(),
      name,
      type,
      unread: dialog.raw?.unreadCount ?? 0,
    });
  }
  return result;
}

export async function getHistory(chatId, limit = 50) {
  const messages = [];
  for await (const msg of tg.iterHistory(chatId, { limit })) {
    messages.push(serializeMessage(msg, chatId));
  }
  messages.reverse();
  return messages;
}

export async function sendMessage(chatId, text) {
  const msg = await tg.sendText(chatId, text);
  return serializeMessage(msg, chatId);
}
