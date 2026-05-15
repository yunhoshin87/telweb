let authToken = localStorage.getItem('authToken');
let allDialogs = [];
const activePanels = new Set();

document.addEventListener('DOMContentLoaded', () => {
    if (authToken) {
        showApp();
        loadInitialData();
    }
});

// 로그인
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
    } else {
        alert('비밀번호가 올바르지 않습니다.');
    }
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

// 패널 추가 버튼
document.getElementById('add-panel-btn').addEventListener('click', () => {
    const chatId = document.getElementById('chat-selector').value;
    if (!chatId) return alert('채팅방을 선택해주세요.');
    if (activePanels.has(chatId)) return alert('이미 추가된 채팅방입니다.');
    
    const chat = allDialogs.find(d => d.id === chatId);
    createChatPanel(chatId, chat.name);
});

function createChatPanel(chatId, name) {
    document.getElementById('empty-state').style.display = 'none';
    activePanels.add(chatId);

    const panel = document.createElement('div');
    panel.className = 'chat-panel';
    panel.id = `panel-${chatId}`;
    panel.innerHTML = `
        <div class="panel-header">
            <div class="panel-title">
                <h3>${name}</h3>
            </div>
            <div style="display: flex; gap: 8px;">
                <button class="ai-mini-btn" title="AI 요약">✨</button>
                <button class="close-btn">&times;</button>
            </div>
        </div>
        <div class="message-area" id="msg-area-${chatId}">
            <div class="loading">메시지 불러오는 중...</div>
        </div>
        <div class="panel-footer">
            <input type="text" class="panel-input" placeholder="메시지 입력..." id="input-${chatId}">
            <button class="btn-primary send-mini-btn">전송</button>
        </div>
    `;

    // 닫기 버튼
    panel.querySelector('.close-btn').onclick = () => {
        panel.remove();
        activePanels.delete(chatId);
        if (activePanels.size === 0) document.getElementById('empty-state').style.display = 'flex';
    };

    // 전송 버튼
    const input = panel.querySelector('.panel-input');
    const sendBtn = panel.querySelector('.send-mini-btn');
    const doSend = async () => {
        const text = input.value;
        if (!text) return;
        await fetch(`/api/send/${chatId}`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}` 
            },
            body: JSON.stringify({ text })
        });
        input.value = '';
        refreshMessages(chatId);
    };
    sendBtn.onclick = doSend;
    input.onkeypress = (e) => { if (e.key === 'Enter') doSend(); };

    // AI 요약 버튼
    panel.querySelector('.ai-mini-btn').onclick = async () => {
        const btn = panel.querySelector('.ai-mini-btn');
        btn.innerText = '⌛';
        const res = await fetch('/api/ai/command', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ command: `${chatId}번 채팅의 최근 대화를 3줄로 요약해줘.` })
        });
        const data = await res.json();
        alert(`[${name} AI 요약]\n\n${data.response}`);
        btn.innerText = '✨';
    };

    document.getElementById('panel-container').appendChild(panel);
    refreshMessages(chatId);
    
    // 자동 갱신 (10초마다)
    const interval = setInterval(() => {
        if (!activePanels.has(chatId)) return clearInterval(interval);
        refreshMessages(chatId);
    }, 10000);
}

async function refreshMessages(chatId) {
    const res = await fetch(`/api/history/${chatId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const messages = await res.json();
    const area = document.getElementById(`msg-area-${chatId}`);
    area.innerHTML = '';
    messages.forEach(m => {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${m.out ? 'sent' : 'received'}`;
        msgDiv.innerText = m.text;
        area.appendChild(msgDiv);
    });
    area.scrollTop = area.scrollHeight;
}

document.getElementById('logout-btn').onclick = () => {
    localStorage.removeItem('authToken');
    location.reload();
};
