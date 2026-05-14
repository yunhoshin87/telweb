import { WebSocket } from "ws";

console.log("WebSocket 연결 중...");
const ws = new WebSocket("ws://localhost:8000/ws");

ws.on("open", () => {
  console.log("✓ WebSocket 연결 성공");
  console.log("텔레그램에서 아무 채팅에 메시지를 보내주세요...");
  setTimeout(() => {
    console.log("✗ 15초 동안 메시지 없음 - 실시간 수신 미작동");
    ws.close();
    process.exit(1);
  }, 15000);
});

ws.on("message", (data) => {
  const msg = JSON.parse(data.toString());
  console.log("\n✓ 실시간 메시지 수신 성공!");
  console.log(`  채팅: ${msg.chatId}`);
  console.log(`  보낸이: ${msg.sender || "(나)"}`);
  console.log(`  내용: ${msg.text}`);
  ws.close();
  process.exit(0);
});

ws.on("error", (e) => {
  console.error("✗ 연결 오류:", e.message);
  process.exit(1);
});
