const isLocal = location.hostname === "localhost" || location.hostname === "127.0.0.1";
const API = isLocal ? "http://localhost:8000" : `${location.protocol}//${location.host}`;
const WS_URL = isLocal ? "ws://localhost:8000/ws" : `${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/ws`;

let allDialogs = [];
let openPanels = {};
let ws;
let authToken = localStorage.getItem("telweb_token");

// ── 로그인 관리 ───────────────────────────────────────────────────
const loginOverlay = document.getElementById("login-overlay");
const appContainer = document.getElementById("app-container");
const loginBtn = document.getElementById("login-btn");
const loginPass = document.getElementById("login-password");

if (authToken) {
  showApp();
}

loginBtn.onclick = async () => {
  const password = loginPass.value;
  try {
    const res = await fetch(`${API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });
    const data = await res.json();
    if (data.token) {
      authToken = data.token;
      localStorage.setItem("telweb_token", authToken);
      showApp();
    } else {
      alert("비밀번호가 틀렸습니다.");
    }
  } catch {
    alert("서버 연결 실패");
  }
};

function showApp() {
  loginOverlay.classList.add("hidden");
  appContainer.classList.remove("hidden");
  startApp();
}

function startApp() {
  connectWS();
  loadDialogs();
}

async function apiFetch(path, options = {}) {
  options.headers = {
    ...options.headers,
    "Authorization": `Bearer ${authToken}`
  };
  const res = await fetch(`${API}${path}`, options);
  if (res.status === 401) {
    localStorage.removeItem("telweb_token");
    location.reload();
  }
  return res;
}

// ── WebSocket ────────────────────────────────────────────────────────
function connectWS() {
  ws = new WebSocket(WS_URL);
  ws.onopen = () => {
    setDot("connected");
    // 연결 후 토큰 전송 (인증)
    ws.send(JSON.stringify({ type: "auth", token: authToken }));
  };
  ws.onclose = () => { setDot("disconnected"); setTimeout(connectWS, 3000); };
  ws.onmessage = (e) => {
    const data = JSON.parse(e.data);
    if (data.type === "message") {
      if (openPanels[data.chatId]) {
        appendBubble(data.chatId, data);
        apiFetch(`/read/${data.chatId}`, { method: "POST" });
      } else {
        incrementUnreadBadge(data.chatId);
      }
      // AI 마스터에게도 로그 전달
      appendAiLog(`[${data.sender}] ${data.text}`);
    }
  };
}

function setDot(state) {
  const dot = document.getElementById("conn-dot");
  if (dot) {
    dot.className = `dot ${state}`;
  }
}

// ── AI 마스터 컨트롤 ─────────────────────────────────────────────
const aiInput = document.getElementById("ai-input");
const aiSendBtn = document.getElementById("ai-send-btn");
const aiLog = document.getElementById("ai-log");

aiSendBtn.onclick = async () => {
  const text = aiInput.value.trim();
  if (!text) return;
  
  appendAiLog(`마스터: ${text}`, true);
  aiInput.value = "";
  
  try {
    const res = await apiFetch("/ai/command", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ command: text, history: [] })
    });
    const data = await res.json();
    appendAiLog(`AI: ${data.response}`);
  } catch {
    appendAiLog(`AI: 서버와 통신 중 오류가 발생했습니다.`);
  }
};

function appendAiLog(text, isMaster = false) {
  const group = document.createElement("div");
  group.className = `msg-group ${isMaster ? "out" : "in"}`;
  group.innerHTML = `<div class="bubble">${text}</div>`;
  aiLog.appendChild(group);
  aiLog.scrollTop = aiLog.scrollHeight;
}

// ── 기존 로직 (API Fetch 부분만 apiFetch로 교체) ──────────────────
async function loadDialogs() {
  try {
    const res = await apiFetch("/dialogs");
    allDialogs = await res.json();
    renderDialogList(allDialogs);
  } catch {
    document.getElementById("dialog-list").innerHTML = '<div class="list-placeholder"><span>연결 실패</span></div>';
  }
}

function renderDialogList(dialogs) {
  const list = document.getElementById("dialog-list");
  list.innerHTML = dialogs.map(d => `
    <div class="dialog-item" data-id="${d.id}" data-type="${d.type}">
      <div class="avatar">${d.name[0]}</div>
      <div class="dialog-info">
        <div class="dialog-name">${d.name}</div>
        <div class="dialog-type">${d.type}</div>
      </div>
    </div>
  `).join("");

  list.querySelectorAll(".dialog-item").forEach(el => {
    el.onclick = () => {
      const d = allDialogs.find(x => x.id === el.dataset.id);
      if (d) openPanel(d);
    };
  });
}

async function openPanel(dialog) {
  if (openPanels[dialog.id]) return;
  const panel = buildPanel(dialog);
  document.getElementById("panels-wrap").appendChild(panel.el);
  openPanels[dialog.id] = panel;

  const res = await apiFetch(`/history/${dialog.id}`);
  const msgs = await res.json();
  msgs.forEach(m => appendBubble(dialog.id, m));
}

function buildPanel(dialog) {
  const el = document.createElement("div");
  el.className = "chat-panel";
  el.innerHTML = `
    <div class="panel-header">
      <div class="panel-name">${dialog.name}</div>
      <button class="panel-close" onclick="this.closest('.chat-panel').remove(); delete openPanels['${dialog.id}'];">X</button>
    </div>
    <div class="messages"></div>
    <div class="input-area">
      <textarea class="msg-input" placeholder="메시지 입력..."></textarea>
      <button class="send-btn">보내기</button>
    </div>
  `;
  const input = el.querySelector(".msg-input");
  const sendBtn = el.querySelector(".send-btn");
  sendBtn.onclick = async () => {
    const text = input.value.trim();
    if (!text) return;
    input.value = "";
    await apiFetch(`/send/${dialog.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });
  };
  return { el };
}

function appendBubble(chatId, msg) {
  const p = openPanels[chatId];
  if (!p) return;
  const msgsEl = p.el.querySelector(".messages");
  const group = document.createElement("div");
  group.className = `msg-group ${msg.out ? "out" : "in"}`;
  group.innerHTML = `<div class="bubble">${msg.text}</div>`;
  msgsEl.appendChild(group);
  msgsEl.scrollTop = msgsEl.scrollHeight;
}

function incrementUnreadBadge(id) { /* 생략 - UI 개선 시 추가 가능 */ }
