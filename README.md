# TelWeb

여러 텔레그램 채팅을 한 화면에서 보고 답장할 수 있는 웹 대시보드.

## 시작하기

### 1. Telegram API 키 발급
1. https://my.telegram.org 접속 → 로그인
2. "API development tools" 클릭
3. `api_id` / `api_hash` 복사

### 2. 백엔드 설정

```bash
cd backend
cp .env.example .env
# .env 파일에 API_ID, API_HASH, PHONE 입력

pip install -r requirements.txt
python -m uvicorn main:app --reload
```

처음 실행 시 전화번호로 인증 코드가 전송됩니다. 터미널에 입력하면 세션 파일이 생성되어 이후 자동 로그인됩니다.

### 3. 프론트엔드 실행

`frontend/index.html` 을 브라우저에서 바로 열거나, 간단한 HTTP 서버 사용:

```bash
cd frontend
python -m http.server 3000
# http://localhost:3000 접속
```

## 사용법

1. 상단 드롭다운에서 채팅 선택
2. `+ 패널 추가` 클릭 → 채팅 패널이 화면에 추가됨
3. 패널을 여러 개 추가하면 나란히 표시됨
4. 각 패널 하단에서 메시지 입력 및 전송 가능
