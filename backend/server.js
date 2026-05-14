import { createServer } from "http";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import express from "express";
import { WebSocketServer } from "ws";
import * as tg from "./telegram.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// 프론트엔드 정적 파일 서빙 (배포 시 한 URL로 접속)
app.use(express.static(join(__dirname, "../frontend")));

const server = createServer(app);
const wss = new WebSocketServer({ server });
const clients = new Set();

wss.on("connection", (ws) => {
  clients.add(ws);
  ws.on("close", () => clients.delete(ws));
});

function broadcast(data) {
  const payload = JSON.stringify(data);
  for (const ws of clients) {
    if (ws.readyState === 1) ws.send(payload);
  }
}

tg.onNewMessage((msg) => broadcast({ type: "message", ...msg }));

app.get("/dialogs", async (req, res) => {
  try { res.json(await tg.getDialogs()); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.get("/history/:chatId", async (req, res) => {
  try {
    const msgs = await tg.getHistory(Number(req.params.chatId), parseInt(req.query.limit) || 50);
    res.json(msgs);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/read/:chatId", async (req, res) => {
  try {
    await tg.readHistory(Number(req.params.chatId));
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/send/:chatId", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ error: "empty text" });
    const msg = await tg.sendMessage(Number(req.params.chatId), text.trim());
    res.json(msg);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

const PORT = process.env.PORT || 8000;

(async () => {
  console.log("텔레그램 로그인 중...");
  await tg.connect();
  server.listen(PORT, () => console.log(`서버 실행 중: http://localhost:${PORT}`));
})();
