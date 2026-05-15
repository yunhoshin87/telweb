let authToken = localStorage.getItem('authToken');
let allDialogs = [];
const activePanels = new Map(); // chatId -> Panel Name

document.addEventListener('DOMContentLoaded', () => {
    if (authToken) {
        showApp();
        loadInitialData();
    }
});

// 로그인 및 초기화 로직 (이전과 동일)
document.getElementById('login-btn').addEventListener('click', async () => {
    const password = document.getElementById('password-input').value;
    const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
    });
    if (res.ok) {
        const data = await res.json();
        authToken = data.token;
        localStorage.setItem('authToken', authToken);
        showApp();
        loadInitialData();
    } else { alert('비밀번호 오류'); }
});

function showApp() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app-container').style.display = 'flex';
}

async function loadInitialData() {
    const res = await fetch('/api/dialogs', {
        headers: { 'Authorization': `Bearer ${authToken}` }
    });
    allDialogs = await res.json();
    const selector = document.getElementById('chat-selector');
    selector.innerHTML = '<option value="">채팅방 선택...</option>';
    allDialogs.forEach(d => {
        const opt = document.createElement('option');
        opt.value = d.id;
        opt.innerText = d.name;
        selector.appendChild(opt);
    });
}

// 패널 추가
document.getElementById('add-panel-btn').addEventListener('click', () => {
    const chatId = document.getElementById('chat-selector').value;
    if (!chatId || activePanels.has(chatId)) return;
    const chat = allDialogs.find(d => d.id === chatId);
    createChatPanel(chatId, chat.name);
});

function createChatPanel(chatId, name) {
    document.getElementById('empty-state').style.display = 'none';
    activePanels.set(chatId, name);

    const panel = document.createElement('div');
    panel.className = 'chat-panel';
    panel.id = `panel-${chatId}`;
    panel.innerHTML = `
        <div class="panel-header">
            <div class="panel-title"><h3>${name}</h3></div>
            <button class="close-btn">&times;</button>
        </div>
        <div class="message-area" id="msg-area-${chatId}"></div>
        <div class="panel-footer">
            <input type="text" class="panel-input" id="input-${chatId}" placeholder="메시지 전송...">
            <button class="btn-primary" onclick="sendMessage('${chatId}')">전송</button>
        </div>
    `;

    panel.querySelector('.close-btn').onclick = () => {
        panel.remove();
        activePanels.delete(chatId);
        if (activePanels.size === 0) document.getElementById('empty-state').style.display = 'flex';
    };

    document.getElementById('panel-container').appendChild(panel);
    refreshMessages(chatId);
    
    // 10초마다 자동 갱신
    const itv = setInterval(() => {
        if (!activePanels.has(chatId)) return clearInterval(itv);
        refreshMessages(chatId);
    }, 10000);
}

async function refreshMessages(chatId) {
    const res = await fetch(`/api/history/${chatId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const messages = await res.json();
    const area = document.getElementById(`msg-area-${chatId}`);
    if (!area) return;
    area.innerHTML = '';
    messages.forEach(m => {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${m.out ? 'sent' : 'received'}`;
        msgDiv.innerText = m.text;
        area.appendChild(msgDiv);
    });
    area.scrollTop = area.scrollHeight;
}

async function sendMessage(chatId, text = null) {
    const input = document.getElementById(`input-${chatId}`);
    const msgText = text || input.value;
    if (!msgText) return;

    await fetch(`/api/send/${chatId}`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}` 
        },
        body: JSON.stringify({ text: msgText })
    });
    if (input) input.value = '';
    refreshMessages(chatId);
}

// --- [AI 기획자 봇 핵심 로직] ---

const plannerInput = document.getElementById('planner-input');
const plannerBtn = document.getElementById('planner-send-btn');
const plannerMessages = document.getElementById('planner-messages');

plannerBtn.onclick = async () => {
    const text = plannerInput.value;
    if (!text) return;

    // 1. 내 메시지 추가
    appendPlannerMessage('sent', text);
    plannerInput.value = '';

    // 2. AI 기획자에게 지시 전달
    try {
        const res = await fetch('/api/ai/planner', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}` 
            },
            body: JSON.stringify({ 
                command: text,
                activeChats: Array.from(activePanels.entries()).map(([id, name]) => ({ id, name }))
            })
        });
        const data = await res.json();
        
        // 3. AI 답변 추가
        appendPlannerMessage('received', data.reply);

        // 4. AI가 지시한 행동(메시지 대리 전송) 실행
        if (data.actions && data.actions.length > 0) {
            data.actions.forEach(action => {
                sendMessage(action.chatId, action.text);
                appendPlannerMessage('received', `✅ [${action.targetName}] 방에 메시지를 전달했습니다.`);
            });
        }
    } catch (e) {
        appendPlannerMessage('received', '⚠️ 지시를 처리하는 중 오류가 발생했습니다.');
    }
};

function appendPlannerMessage(type, text) {
    const div = document.createElement('div');
    div.className = `message ${type}`;
    div.innerText = text;
    plannerMessages.appendChild(div);
    plannerMessages.scrollTop = plannerMessages.scrollHeight;
}

plannerInput.onkeypress = (e) => { if (e.key === 'Enter') plannerBtn.click(); };
