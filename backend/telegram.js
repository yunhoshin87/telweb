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

  // 로그인이 필요한 경우에만 입력창을 띄웁니다.
  await client.start({
    phoneNumber: async () => process.env.PHONE || await input.text("전화번호(+82...): "),
    password: async () => await input.text("2단계 인증 비번(없으면 엔터): "),
    phoneCode: async () => await input.text("텔레그램에서 받은 인증번호: "),
    onError: (err) => {
      if (err.message !== "Code is empty") {
         console.error("[Telegram] Error:", err.message);
      }
    },
  });

  console.log("\n[Telegram] 연결 성공!");
  const currentSession = client.session.save();
  
  // 세션이 새로 생성되었거나 바뀐 경우 출력
  console.log("\n-----------------------------------------");
  console.log("새로운 SESSION_DATA (복사해서 Render에 넣으세요):");
  console.log(currentSession);
  console.log("-----------------------------------------\n");
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
  } catch (e) { return []; }
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
  } catch (e) { return []; }
}

export function isConnected() {
  return client && client.connected;
}

export async function sendMessage(chatId, text) {
  if (!client) throw new Error("Not connected");
  const result = await client.sendMessage(chatId, { message: text });
  return { text: result.message };
}

export function onNewMessage(callback) { }
