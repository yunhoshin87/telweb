// 현재 접속 호스트 기준으로 API URL 자동 결정 (로컬/외부 모두 동작)
const isLocal = location.hostname === "localhost" || location.hostname === "127.0.0.1";
const API = isLocal
  ? "http://localhost:8000"
  : `${location.protocol}//${location.hostname}/api`;
const WS_URL = isLocal
  ? "ws://localhost:8000/ws"
  : `${location.protocol === "https:" ? "wss" : "ws"}://${location.hostname}/ws`;

let allDialogs = [];
let openPanels = {};  // chatId (string) → { el, chatId, name, type }
let ws;

// ── WebSocket ────────────────────────────────────────────────────────
function connectWS() {
  ws = new WebSocket(WS_URL);
  ws.onopen    = () => setDot("connected");
  ws.onclose   = () => { setDot("disconnected"); setTimeout(connectWS, 3000); };
  ws.onerror   = () => setDot("error");
  ws.onmessage = (e) => {
    const data = JSON.parse(e.data);
    if (data.type === "message") {
      if (openPanels[data.chatId]) {
        appendBubble(data.chatId, data);
        clearUnreadBadge(data.chatId);
        fetch(`${API}/read/${data.chatId}`, { method: "POST" }).catch(() => {});
      } else {
        // 닫힌 패널 → 사이드바 뱃지 증가
        incrementUnreadBadge(data.chatId);
      }
    }
  };
}

function setDot(state) {
  const dot = document.getElementById("conn-dot");
  dot.className = `dot ${state}`;
  dot.title = { connected: "연결됨", disconnected: "연결 끊김", error: "오류" }[state];
}

// ── 다이얼로그 로드 ───────────────────────────────────────────────
async function loadDialogs() {
  try {
    const res = await fetch(`${API}/dialogs`);
    allDialogs = await res.json();
    renderDialogList(allDialogs);
  } catch {
    document.getElementById("dialog-list").innerHTML =
      '<div class="list-placeholder"><span>서버 연결 실패</span></div>';
  }
}

function renderDialogList(dialogs) {
  const list = document.getElementById("dialog-list");
  if (!dialogs.length) {
    list.innerHTML = '<div class="list-placeholder"><span>채팅 없음</span></div>';
    return;
  }
  list.innerHTML = dialogs.map(d => `
    <div class="dialog-item" data-id="${esc(d.id)}" data-type="${esc(d.type)}">
      <div class="avatar ${esc(d.type)}">${avatarLetter(d.name)}</div>
      <div class="dialog-info">
        <div class="dialog-name">${esc(d.name)}</div>
        <div class="dialog-type">${typeLabel(d.type)}</div>
      </div>
      ${d.unread > 0 ? `<div class="unread-badge">${d.unread > 99 ? "99+" : d.unread}</div>` : ""}
    </div>
  `).join("");

  list.querySelectorAll(".dialog-item").forEach(el => {
    el.addEventListener("click", () => {
      const id = el.dataset.id;
      const dialog = allDialogs.find(d => d.id === id);
      if (dialog) openPanel(dialog);
    });
  });
}

// ── 검색 ─────────────────────────────────────────────────────────
document.getElementById("search").addEventListener("input", (e) => {
  const q = e.target.value.trim().toLowerCase();
  renderDialogList(q ? allDialogs.filter(d => d.name.toLowerCase().includes(q)) : allDialogs);
});

// ── 패널 열기 ─────────────────────────────────────────────────────
async function openPanel(dialog) {
  if (openPanels[dialog.id]) {
    // 이미 열린 패널 — 포커스
    openPanels[dialog.id].el.querySelector(".msg-input").focus();
    return;
  }

  document.getElementById("empty-state")?.remove();

  const panel = buildPanel(dialog);
  document.getElementById("panels-wrap").appendChild(panel.el);
  openPanels[dialog.id] = panel;

  // 사이드바 active 표시
  document.querySelectorAll(".dialog-item").forEach(el => {
    el.classList.toggle("active", el.dataset.id === dialog.id);
  });

  // 히스토리 로드 + 읽음 처리
  try {
    const res = await fetch(`${API}/history/${dialog.id}?limit=50`);
    const msgs = await res.json();
    const msgsEl = panel.el.querySelector(".messages");
    msgs.forEach(m => appendBubble(dialog.id, m, false));
    msgsEl.scrollTop = msgsEl.scrollHeight;
  } catch {}

  clearUnreadBadge(dialog.id);
  fetch(`${API}/read/${dialog.id}`, { method: "POST" }).catch(() => {});
}

// ── 드래그앤드롭 ────────────────────────────────────────────────
let dragSrc = null;

function initDrag(el) {
  el.setAttribute("draggable", "true");

  el.addEventListener("dragstart", (e) => {
    dragSrc = el;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", el.dataset.chatId);
    setTimeout(() => el.classList.add("dragging"), 0);
  });

  el.addEventListener("dragend", () => {
    el.classList.remove("dragging");
    document.querySelectorAll(".chat-panel").forEach(p => p.classList.remove("drag-over"));
    dragSrc = null;
  });

  el.addEventListener("dragover", (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragSrc && dragSrc !== el) {
      document.querySelectorAll(".chat-panel").forEach(p => p.classList.remove("drag-over"));
      el.classList.add("drag-over");
    }
  });

  el.addEventListener("dragleave", () => el.classList.remove("drag-over"));

  el.addEventListener("drop", (e) => {
    e.preventDefault();
    el.classList.remove("drag-over");
    if (!dragSrc || dragSrc === el) return;

    const wrap = document.getElementById("panels-wrap");
    const panels = [...wrap.querySelectorAll(".chat-panel")];
    const srcIdx = panels.indexOf(dragSrc);
    const dstIdx = panels.indexOf(el);

    if (srcIdx < dstIdx) {
      wrap.insertBefore(dragSrc, el.nextSibling);
    } else {
      wrap.insertBefore(dragSrc, el);
    }
  });
}

function buildPanel(dialog) {
  const el = document.createElement("div");
  el.className = "chat-panel";
  el.dataset.chatId = dialog.id;

  el.innerHTML = `
    <div class="panel-header">
      <div class="panel-avatar avatar ${esc(dialog.type)}">${avatarLetter(dialog.name)}</div>
      <div class="panel-name">${esc(dialog.name)}</div>
      <button class="panel-close" title="닫기">
        <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
          <path d="M1 1l8 8M9 1l-8 8"/>
        </svg>
      </button>
    </div>
    <div class="messages"></div>
    <div class="input-area">
      <textarea class="msg-input" rows="1" placeholder="메시지 입력…"></textarea>
      <button class="send-btn" disabled title="전송">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
        </svg>
      </button>
    </div>
  `;

  const input   = el.querySelector(".msg-input");
  const sendBtn = el.querySelector(".send-btn");
  const closeBtn = el.querySelector(".panel-close");

  // 텍스트 입력 → 버튼 활성화, 자동 높이
  input.addEventListener("input", () => {
    input.style.height = "auto";
    input.style.height = Math.min(input.scrollHeight, 120) + "px";
    sendBtn.disabled = !input.value.trim();
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!sendBtn.disabled) doSend(dialog.id, input, sendBtn);
    }
  });

  sendBtn.addEventListener("click", () => doSend(dialog.id, input, sendBtn));
  closeBtn.addEventListener("click", () => closePanel(dialog.id));

  initDrag(el);

  return { el, chatId: dialog.id, name: dialog.name, type: dialog.type };
}

function closePanel(chatId) {
  const p = openPanels[chatId];
  if (!p) return;
  p.el.style.animation = "panel-in 0.2s reverse ease forwards";
  setTimeout(() => {
    p.el.remove();
    delete openPanels[chatId];

    document.querySelectorAll(".dialog-item").forEach(el => {
      if (el.dataset.id === chatId) el.classList.remove("active");
    });

    if (!Object.keys(openPanels).length) {
      const wrap = document.getElementById("panels-wrap");
      wrap.innerHTML = `
        <div id="empty-state">
          <div class="empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <h2>채팅을 선택하세요</h2>
          <p>왼쪽 목록에서 채팅을 클릭하면<br/>새 패널이 열립니다.</p>
        </div>`;
    }
  }, 200);
}

// ── 메시지 전송 ───────────────────────────────────────────────────
async function doSend(chatId, input, btn) {
  const text = input.value.trim();
  if (!text) return;
  input.value = "";
  input.style.height = "auto";
  btn.disabled = true;

  try {
    await fetch(`${API}/send/${chatId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
  } catch {
    console.error("전송 실패");
  }
}

// ── 말풍선 추가 ───────────────────────────────────────────────────
function appendBubble(chatId, msg, autoScroll = true) {
  const p = openPanels[chatId];
  if (!p) return;

  const msgsEl = p.el.querySelector(".messages");
  const group = document.createElement("div");
  group.className = `msg-group ${msg.out ? "out" : "in"}`;

  const time = msg.date
    ? new Date(msg.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

  group.innerHTML = `
    ${!msg.out && msg.sender ? `<div class="msg-sender">${esc(msg.sender)}</div>` : ""}
    <div class="bubble">${esc(msg.text)}</div>
    <div class="bubble-time">${time}</div>
  `;

  msgsEl.appendChild(group);
  if (autoScroll) msgsEl.scrollTop = msgsEl.scrollHeight;
}

// ── 뱃지 관리 ────────────────────────────────────────────────────
function clearUnreadBadge(chatId) {
  const item = document.querySelector(`.dialog-item[data-id="${chatId}"]`);
  if (!item) return;
  item.querySelector(".unread-badge")?.remove();
  // allDialogs 캐시도 초기화
  const d = allDialogs.find(x => x.id === chatId);
  if (d) d.unread = 0;
}

function incrementUnreadBadge(chatId) {
  const item = document.querySelector(`.dialog-item[data-id="${chatId}"]`);
  if (!item) return;
  let badge = item.querySelector(".unread-badge");
  if (!badge) {
    badge = document.createElement("div");
    badge.className = "unread-badge";
    item.appendChild(badge);
  }
  const cur = parseInt(badge.textContent) || 0;
  badge.textContent = cur + 1 > 99 ? "99+" : cur + 1;
}

// ── 유틸 ─────────────────────────────────────────────────────────
function esc(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function avatarLetter(name) {
  return (name || "?").trim()[0].toUpperCase();
}

function typeLabel(type) {
  return { user: "개인", group: "그룹", supergroup: "슈퍼그룹", channel: "채널" }[type] || type;
}

// ── 시작 ─────────────────────────────────────────────────────────
(async () => {
  connectWS();
  await loadDialogs();
})();
