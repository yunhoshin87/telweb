import { createServer } from "http";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import express from "express";
import { WebSocketServer } from "ws";
import * as tg from "./telegram.js";
import dotenv from "dotenv";

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const MASTER_PASSWORD = process.env.MASTER_PASSWORD || "admin123";
const AUTH_TOKEN = Buffer.from(MASTER_PASSWORD).toString("base64"); // 간단한 인증 토큰 예시

const app = express();
app.use(express.json());

// CORS 및 인증 미들웨어
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  
  if (req.method === "OPTIONS") return res.sendStatus(204);

  // 로그인 API 제외하고는 토큰 확인
  if (req.path === "/login" || req.path === "/" || req.path.startsWith("/static")) {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${AUTH_TOKEN}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
});

app.use(express.static(join(__dirname, "../frontend")));

const server = createServer(app);
const wss = new WebSocketServer({ server });
const clients = new Set();

wss.on("connection", (ws) => {
  let authenticated = false;
  ws.on("message", (data) => {
    try {
      const msg = JSON.parse(data);
      if (msg.type === "auth" && msg.token === AUTH_TOKEN) {
        authenticated = true;
        clients.add(ws);
      }
    } catch {}
  });
  ws.on("close", () => clients.delete(ws));
});

function broadcast(data) {
  const payload = JSON.stringify(data);
  for (const ws of clients) {
    if (ws.readyState === 1) ws.send(payload);
  }
}

tg.onNewMessage((msg) => broadcast({ type: "message", ...msg }));

// ── API 엔드포인트 ────────────────────────────────────────────────
app.post("/login", (req, res) => {
  if (req.body.password === MASTER_PASSWORD) {
    res.json({ token: AUTH_TOKEN });
  } else {
    res.status(401).json({ error: "Invalid password" });
  }
});

app.post("/ai/command", async (req, res) => {
  try {
    const { command, history } = req.body;
    // Gemini API 호출 (여기서는 간단한 에코 혹은 실제 API 연동 가능)
    // 실제 배포 시에는 구글 ai-generativelanguage SDK를 사용하거나 fetch를 씁니다.
    const GEMINI_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_KEY) return res.json({ response: "AI가 설정되지 않았습니다. API 키를 등록해주세요." });

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `너는 텔레그램 통합 관리봇이야. 마스터의 명령에 따라 상황을 요약하거나 조언해줘. 명령: ${command}` }] }]
      })
    });
    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "AI가 대답을 거부했습니다.";
    res.json({ response: reply });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/dialogs", async (req, res) => {
  try { res.json(await tg.getDialogs()); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.get("/history/:chatId", async (req, res) => {
  try {
    const msgs = await tg.getHistory(Number(req.params.chatId));
    res.json(msgs);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/send/:chatId", async (req, res) => {
  try {
    const msg = await tg.sendMessage(Number(req.params.chatId), req.body.text);
    res.json(msg);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

const PORT = process.env.PORT || 8000;

// Cloudflare Worker 대응: fetch 핸들러 익스포트
export default {
  async fetch(request, env, ctx) {
    // 환경변수 주입 (Worker 환경)
    for (const key in env) {
      process.env[key] = env[key];
    }
    
    // 첫 요청 시 텔레그램 연결
    if (!tg.isConnected?.()) {
      await tg.connect();
    }
    
    // Express 앱 실행 (서버리스 모드)
    return app(request, env, ctx);
  }
};

// 로컬 환경 실행
if (process.env.NODE_ENV !== "production") {
  (async () => {
    await tg.connect();
    server.listen(PORT, () => console.log(`서버 실행: http://localhost:${PORT}`));
  })();
}

