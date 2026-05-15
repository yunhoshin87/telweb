import { TelegramClient } from "@mtcute/node";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SESSION_FILE = "session.json";

let client = null;
let _newMessageCallback = null;

export function onNewMessage(fn) {
  _newMessageCallback = fn;
}

function loadSession() {
  // 1순위: 환경변수 SESSION_DATA
  if (process.env.SESSION_DATA) {
    try {
      const decoded = Buffer.from(process.env.SESSION_DATA, "base64").toString("utf-8");
      return JSON.parse(decoded);
    } catch (e) { console.error("Session parse error:", e.message); }
  }
  // 2순위: 로컬 파일
  if (existsSync(SESSION_FILE)) {
    try {
      return JSON.parse(readFileSync(SESSION_FILE, "utf-8"));
    } catch (e) { console.error("File session error:", e.message); }
  }
  return null;
}

function saveSession(session) {
  try {
    writeFileSync(SESSION_FILE, JSON.stringify(session), "utf-8");
  } catch (e) { console.error("Session save error:", e.message); }
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
  const date = msg.date instanceof Date ? msg.date.toISOString() : new Date().toISOString();
  return {
    chatId: chatId?.toString(),
    msgId: msg.id,
    sender: senderName.trim(),
    text: msg.text || "",
    date,
    out: msg.isOutgoing ?? false,
  };
}

export async function connect() {
  const API_ID = parseInt(process.env.API_ID);
  const API_HASH = process.env.API_HASH;
  if (!API_ID || !API_HASH) throw new Error("API_ID / API_HASH 환경변수가 없습니다.");

  client = new TelegramClient({ apiId: API_ID, apiHash: API_HASH });

  const saved = loadSession();
  if (saved) {
    try {
      await client.importSession(saved);
      await client.connect();
      await client.startUpdatesLoop();
      
      client.onNewMessage.add((msg) => {
        if (_newMessageCallback) _newMessageCallback(serializeMessage(msg));
      });
      console.log("텔레그램 연결 성공!");
      return;
    } catch (e) { console.log("세션 연결 실패:", e.message); }
  }
  throw new Error("세션 정보가 없습니다. 로컬에서 로그인 후 배포해 주세요.");
}

export async function getDialogs() {
  const result = [];
  if (!client) return [];
  for await (const dialog of client.iterDialogs({ limit: 100 })) {
    const peer = dialog.peer;
    if (!peer) continue;
    result.push({
      id: peer.id?.toString(),
      name: peer.displayName || peer.title || "Unknown",
      type: "chat",
      unread: dialog.raw?.unreadCount ?? 0,
    });
  }
  return result;
}

export async function getHistory(chatId, limit = 50) {
  const messages = [];
  if (!client) return [];
  for await (const msg of client.iterHistory(chatId, { limit })) {
    messages.push(serializeMessage(msg, chatId));
  }
  messages.reverse();
  return messages;
}

export function isConnected() {
  return client && client.isConnected();
}

export async function sendMessage(chatId, text) {
  if (!client) throw new Error("Telegram not connected");
  const msg = await client.sendText(chatId, text);
  return serializeMessage(msg, chatId);
}
