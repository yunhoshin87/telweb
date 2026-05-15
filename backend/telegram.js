import { TelegramClient, Api } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import input from "input";

let client = null;

export async function connect() {
  const API_ID = parseInt(process.env.API_ID);
  const API_HASH = process.env.API_HASH;
  const sessionString = process.env.SESSION_DATA || ""; 
  
  client = new TelegramClient(new StringSession(sessionString), API_ID, API_HASH, {
    connectionRetries: 5,
  });

  await client.start({
    phoneNumber: async () => process.env.PHONE || "",
    password: async () => "", 
    phoneCode: async () => "",
    onError: (err) => console.error("[Telegram] Error:", err.message),
  });

  console.log("[Telegram] 연결 성공!");
  const currentSession = client.session.save();
  if (currentSession !== sessionString) {
    console.log("[System] 새로운 세션 문자열이 생성되었습니다. (Render SESSION_DATA 업데이트 필요)");
    console.log("-----------------------------------------");
    console.log(currentSession);
    console.log("-----------------------------------------");
  }
}

export async function getDialogs() {
  if (!client) return [];
  try {
    const dialogs = await client.getDialogs({});
    return dialogs.map(d => ({
      id: d.id.toString(),
      name: d.title || d.name || "Unknown",
      unread: d.unreadCount || 0,
    }));
  } catch (e) {
    console.error("Dialogs error:", e.message);
    return [];
  }
}

export async function getHistory(chatId, limit = 50) {
  if (!client) return [];
  try {
    const messages = await client.getMessages(chatId, { limit });
    return messages.map(m => ({
      chatId: chatId.toString(),
      msgId: m.id,
      sender: m.sender?.firstName || m.sender?.title || "Unknown",
      text: m.message || "",
      date: new Date(m.date * 1000).toISOString(),
      out: m.out,
    })).reverse();
  } catch (e) {
    console.error("History error:", e.message);
    return [];
  }
}

export function isConnected() {
  return client && client.connected;
}

export async function sendMessage(chatId, text) {
  if (!client) throw new Error("Not connected");
  const result = await client.sendMessage(chatId, { message: text });
  return { text: result.message };
}

export function onNewMessage(callback) {
  // 필요 시 추가 구현
}
