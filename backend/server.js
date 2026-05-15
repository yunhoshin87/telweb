import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { cors } from "hono/cors";
import * as tg from "./telegram.js";
import dotenv from "dotenv";

dotenv.config();

// 서버 시작 로그
console.log("[System] 서버 초기화 중...");

const app = new Hono();

app.use("*", cors());

const MASTER_PASSWORD = () => process.env.MASTER_PASSWORD || "admin123";
const AUTH_TOKEN = () => Buffer.from(MASTER_PASSWORD()).toString("base64");

app.use("/api/*", async (c, next) => {
  if (c.req.path === "/api/login") return await next();
  const authHeader = c.req.header("Authorization");
  if (!authHeader || authHeader !== `Bearer ${AUTH_TOKEN()}`) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  await next();
});

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

// 정적 파일 서비스
app.get("*", serveStatic({ root: "./" }));

async function startServer() {
  try {
    console.log("[Telegram] 연결 시도 중...");
    await tg.connect();
    console.log("[Telegram] 연결 성공!");
    
    const port = process.env.PORT || 10000; // Render 기본 포트 대응
    serve({ fetch: app.fetch, port: Number(port) }, (info) => {
      console.log(`[System] 서버 실행 완료! URL: http://localhost:${info.port}`);
    });
  } catch (e) {
    console.error("[Error] 서버 시작 중 치명적 오류 발생:");
    console.error(e);
    // 에러 발생 시 10초 후 재시도
    setTimeout(startServer, 10000);
  }
}

startServer();
