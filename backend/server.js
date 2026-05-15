import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { cors } from "hono/cors";
import * as tg from "./telegram.js";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootPath = join(__dirname, "..");

const app = new Hono();
app.use("*", cors());

const MASTER_PASSWORD = () => process.env.MASTER_PASSWORD || "admin123";
const AUTH_TOKEN = () => Buffer.from(MASTER_PASSWORD()).toString("base64");

// API 인증 미들웨어
app.use("/api/*", async (c, next) => {
  if (c.req.path === "/api/login") return await next();
  const authHeader = c.req.header("Authorization");
  if (!authHeader || authHeader !== `Bearer ${AUTH_TOKEN()}`) return c.json({ error: "Unauthorized" }, 401);
  await next();
});

// 로그인
app.post("/api/login", async (c) => {
  const { password } = await c.req.json();
  if (password === MASTER_PASSWORD()) return c.json({ token: AUTH_TOKEN() });
  return c.json({ error: "Invalid password" }, 401);
});

// [핵심] AI 기획자 커맨드 센터 엔드포인트
app.post("/api/ai/planner", async (c) => {
  try {
    const { command, activeChats } = await c.req.json();
    const chatsContext = activeChats.map(ch => `[ID: ${ch.id}, Name: ${ch.name}]`).join(", ");
    
    const prompt = `
      너는 사용자의 기획 비서이자 커맨드 센터야.
      현재 열려있는 채팅방 목록: ${chatsContext}
      
      사용자의 지시: "${command}"
      
      위 지시를 분석해서 다음 JSON 형식으로만 응답해:
      {
        "reply": "사용자에게 할 대답 (예: 알겠습니다. 모든 방에 공지하겠습니다.)",
        "actions": [
          { "chatId": "대상채팅ID", "targetName": "대상채팅이름", "text": "실제로 보낼 메시지 내용" }
        ]
      }
      * 지시가 특정 방에 전달하라는 것이라면 actions에 해당 방 정보를 넣어.
      * 지시가 모든 방에 전달하라는 것이라면 모든 activeChats를 actions에 넣어.
      * 그냥 대화라면 actions는 빈 배열로 둬.
    `;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    
    const data = await res.json();
    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    
    // JSON 부분만 추출 (가끔 AI가 마크다운을 섞을 수 있음)
    const jsonMatch = aiText.match(/\{[\s\S]*\}/);
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : { reply: "이해하지 못했습니다.", actions: [] };
    
    return c.json(result);
  } catch (e) { 
    console.error(e);
    return c.json({ reply: "오류가 발생했습니다: " + e.message, actions: [] }); 
  }
});

app.get("/api/dialogs", async (c) => c.json(await tg.getDialogs()));
app.get("/api/history/:chatId", async (c) => c.json(await tg.getHistory(c.req.param("chatId"))));
app.post("/api/send/:chatId", async (c) => {
  const { text } = await c.req.json();
  return c.json(await tg.sendMessage(c.req.param("chatId"), text));
});

// 정적 파일
app.use("/*", serveStatic({ 
  root: "./frontend",
  rewriteRequestPath: (path) => (path === "/" ? "/index.html" : path)
}));

async function startServer() {
  await tg.connect();
  const port = process.env.PORT || 10000;
  serve({ fetch: app.fetch, port: Number(port) }, (info) => {
    console.log(`[System] 서버 실행 중 (Port: ${info.port})`);
  });
}
startServer();
