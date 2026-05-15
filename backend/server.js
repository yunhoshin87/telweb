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
// 프로젝트 루트 경로 (backend의 상위 폴더)
const rootPath = join(__dirname, "..");

console.log("[System] 서버 초기화 중... (Root:", rootPath, ")");

const app = new Hono();

app.use("*", cors());

const MASTER_PASSWORD = () => process.env.MASTER_PASSWORD || "admin123";
const AUTH_TOKEN = () => Buffer.from(MASTER_PASSWORD()).toString("base64");

// API 인증
app.use("/api/*", async (c, next) => {
  if (c.req.path === "/api/login") return await next();
  const authHeader = c.req.header("Authorization");
  if (!authHeader || authHeader !== `Bearer ${AUTH_TOKEN()}`) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  await next();
});

// API 엔드포인트들
app.post("/api/login", async (c) => {
  const { password } = await c.req.json();
  if (password === MASTER_PASSWORD()) return c.json({ token: AUTH_TOKEN() });
  return c.json({ error: "Invalid password" }, 401);
});

app.post("/api/ai/command", async (c) => {
  try {
    const { command } = await c.req.json();
    const GEMINI_KEY = process.env.GEMINI_API_KEY;
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: `너는 텔레그램 통합 관리봇이야. 명령: ${command}` }] }] })
    });
    const data = await response.json();
    return c.json({ response: data.candidates?.[0]?.content?.parts?.[0]?.text || "AI 응답 오류" });
  } catch (e) { return c.json({ error: e.message }, 500); }
});

app.get("/api/dialogs", async (c) => {
  try { return c.json(await tg.getDialogs()); }
  catch (e) { return c.json({ error: e.message }, 500); }
});

app.get("/api/history/:chatId", async (c) => {
  try { return c.json(await tg.getHistory(c.req.param("chatId"))); }
  catch (e) { return c.json({ error: e.message }, 500); }
});

app.post("/api/send/:chatId", async (c) => {
  try {
    const { text } = await c.req.json();
    return c.json(await tg.sendMessage(c.req.param("chatId"), text));
  } catch (e) { return c.json({ error: e.message }, 500); }
});

// 정적 파일 서비스 (절대 경로 사용)
app.use("/*", serveStatic({ 
  root: "./",
  rewriteRequestPath: (path) => (path === "/" ? "/index.html" : path)
}));

async function startServer() {
  try {
    console.log("[Telegram] 연결 시도 중...");
    await tg.connect();
    
    const port = process.env.PORT || 10000;
    serve({ fetch: app.fetch, port: Number(port) }, (info) => {
      console.log(`[System] 서버 실행 완료! 포트: ${info.port}`);
    });
  } catch (e) {
    console.error("[Error] 서버 시작 중 오류:", e.message);
    setTimeout(startServer, 10000);
  }
}

startServer();
