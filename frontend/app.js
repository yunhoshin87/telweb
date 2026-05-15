let authToken = localStorage.getItem('authToken');
let currentChatId = null;

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    if (authToken) {
        showApp();
        loadDialogs();
    }
});

// 로그인 처리
document.getElementById('login-btn').addEventListener('click', async () => {
    const password = document.getElementById('password-input').value;
    try {
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
            loadDialogs();
        } else {
            alert('비밀번호가 틀렸습니다.');
        }
    } catch (e) { alert('로그인 중 오류 발생'); }
});

function showApp() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app-container').style.display = 'flex';
}

// 대화방 목록 불러오기
async function loadDialogs() {
    const res = await fetch('/api/dialogs', {
        headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const dialogs = await res.json();
    const list = document.getElementById('chat-list');
    list.innerHTML = '';

    dialogs.forEach(d => {
        const item = document.createElement('div');
        item.className = 'chat-item';
        const initial = d.name.charAt(0);
        item.innerHTML = `
            <div class="chat-avatar">${initial}</div>
            <div class="chat-info">
                <div class="chat-name">${d.name}</div>
                <div class="chat-last-msg">${d.unread > 0 ? `읽지 않은 메시지 ${d.unread}개` : '최근 대화 없음'}</div>
            </div>
        `;
        item.onclick = () => selectChat(d.id, d.name);
        list.appendChild(item);
    });
}

// 채팅 선택
async function selectChat(id, name) {
    currentChatId = id;
    document.getElementById('current-chat-name').innerText = name;
    
    // 활성화 표시
    document.querySelectorAll('.chat-item').forEach(el => el.classList.remove('active'));
    event.currentTarget.classList.add('active');

    loadHistory(id);
}

// 대화 내역 불러오기
async function loadHistory(chatId) {
    const res = await fetch(`/api/history/${chatId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const messages = await res.json();
    const area = document.getElementById('message-area');
    area.innerHTML = '';

    messages.forEach(m => {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${m.out ? 'sent' : 'received'}`;
        msgDiv.innerHTML = `
            ${!m.out ? `<div class="message-sender">${m.sender}</div>` : ''}
            <div class="message-text">${m.text}</div>
        `;
        area.appendChild(msgDiv);
    });
    area.scrollTop = area.scrollHeight;
}

// 메시지 전송
document.getElementById('send-btn').addEventListener('click', async () => {
    const input = document.getElementById('message-input');
    const text = input.value;
    if (!text || !currentChatId) return;

    try {
        await fetch(`/api/send/${currentChatId}`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ text })
        });
        input.value = '';
        loadHistory(currentChatId);
    } catch (e) { alert('전송 실패'); }
});

// AI 요약 버튼
document.getElementById('ai-summarize-btn').addEventListener('click', async () => {
    if (!currentChatId) return;
    const btn = document.getElementById('ai-summarize-btn');
    btn.innerText = 'AI 분석 중...';
    
    try {
        const res = await fetch('/api/ai/command', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ command: `${currentChatId}번 채팅의 최근 대화를 3줄로 요약해줘.` })
        });
        const data = await res.json();
        alert(`[AI 요약 리포트]\n\n${data.response}`);
    } catch (e) { alert('AI 요약 실패'); }
    finally { btn.innerText = 'AI 요약'; }
});
