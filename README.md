# 🎯 Aintervue - AI 면접 연습 플랫폼

OpenAI GPT-3.5 Turbo를 활용한 인터랙티브 면접 연습 플랫폼입니다.
실시간 웹캠 녹화, 음성 인식, AI 피드백 분석 기능을 제공합니다.

---

## 📋 목차

- [주요 기능](#주요-기능)
- [기술 스택](#기술-스택)
- [설치 방법](#설치-방법)
- [환경 설정 (.env 파일)](#환경-설정-env-파일)
- [실행 방법](#실행-방법)
- [프로젝트 구조](#프로젝트-구조)

---

## ✨ 주요 기능

### 1. 면접 유형 선택
- **인성면접** 💬: 성격, 가치관, 협업 능력 평가
- **기술면접** 💻: 직무 관련 전문 지식과 문제 해결 능력 평가
- **영어면접** 🌍: 영어 의사소통 능력 평가
- **임원면접** 👔: 리더십, 비전, 조직 적합성 심층 평가

### 2. 직무별 맞춤 질문
- 일반 📋 / 개발자 👨‍💻 / 디자이너 🎨 / 마케터 📢 / 기획자 📊 / 영업 🤝

### 3. 실시간 녹화 & 분석
- 웹캠 녹화 및 서버 저장
- 음성 인식 (한국어)
- 답변 시간 추적
- AI 기반 피드백 (점수, 강점, 개선점, 키워드)

---

## 🛠️ 기술 스택

### Frontend
- React 19.2
- Web Speech API (음성 인식)
- MediaRecorder API (녹화)
- CSS3

### Backend
- Node.js + Express
- OpenAI GPT-3.5 Turbo
- Multer (파일 업로드)

---

## 📦 설치 방법

### 1. 저장소 클론
```bash
git clone https://github.com/21070-LDW/my-react-aintervue.git
cd my-react-aintervue
```

### 2. 프론트엔드 패키지 설치
```bash
cd frontend
npm install
```

### 3. 백엔드 패키지 설치
```bash
cd ../backend
npm install
```

---

## 🔑 환경 설정 (.env 파일)

### 1. OpenAI API 키 발급

1. **OpenAI 웹사이트 방문**
   👉 [https://platform.openai.com/](https://platform.openai.com/)

2. **계정 생성 또는 로그인**

3. **API Keys 페이지로 이동**
   👉 [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)

4. **"Create new secret key" 클릭**
   - Key 이름 입력 (예: `aintervue-key`)
   - 생성된 키를 **안전한 곳에 복사** (한 번만 표시됨!)

5. **결제 정보 등록** (필수)
   - Settings > Billing 메뉴에서 결제 수단 등록
   - 최소 $5 충전 권장

### 2. .env 파일 생성

백엔드 디렉토리에 `.env` 파일을 생성합니다:

```bash
cd backend
touch .env
```

### 3. API 키 등록

`.env` 파일을 열고 다음 내용을 입력합니다:

```env
# OpenAI API 키 (필수)
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# 서버 포트 (선택, 기본값: 3001)
PORT=3001
```

**⚠️ 주의사항:**
- `OPENAI_API_KEY=` 뒤에 발급받은 실제 API 키를 붙여넣으세요
- 따옴표 없이 입력합니다
- 절대 GitHub에 커밋하지 마세요! (`.gitignore`에 이미 포함됨)

### 4. .env 파일 예시

```env
OPENAI_API_KEY=sk-proj-abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJ
PORT=3001
```

---

## 🚀 실행 방법

### 1. 백엔드 서버 실행

**터미널 1:**
```bash
cd backend
npm start
```

또는 개발 모드 (nodemon):
```bash
npm run dev
```

서버가 정상 실행되면:
```
✅ 서버가 포트 3001에서 실행 중입니다.
   http://localhost:3001
🔑 API 키 상태: 설정됨
```

### 2. 프론트엔드 실행

**터미널 2:**
```bash
cd frontend
npm start
```

브라우저가 자동으로 열리며 `http://localhost:3000`에서 실행됩니다.

### 3. 면접 시작

1. 이름 입력
2. 면접 유형 선택 (인성/기술/영어/임원)
3. 지원 직무 선택
4. 질문 개수 선택 (5/10/15/20개)
5. **면접 시작하기** 🚀

---

## 📁 프로젝트 구조

```
my-react-aintervue/
├── frontend/                    # React 프론트엔드
│   ├── src/
│   │   ├── components/
│   │   │   └── InterviewChat.jsx  # 메인 컴포넌트
│   │   └── styles/
│   │       └── InterviewChat.css  # 스타일
│   └── package.json
│
├── backend/                     # Express 백엔드
│   ├── server.js               # API 서버
│   ├── .env                    # 환경 변수 (직접 생성 필요)
│   ├── uploads/videos/         # 녹화 영상 저장
│   └── package.json
│
└── README.md
```

---

## 🔒 보안 주의사항

### .env 파일 관리
- ✅ `.gitignore`에 `.env` 포함 (이미 설정됨)
- ❌ GitHub에 절대 업로드하지 마세요
- ❌ 타인과 API 키를 공유하지 마세요
- ✅ API 키가 노출되면 즉시 재발급하세요

### API 사용량 관리
- OpenAI 대시보드에서 사용량 모니터링
- Usage limits 설정 권장 ($10/월 등)
- 비정상 사용 감지 시 알림 설정

---

## 🐛 문제 해결

### 1. 서버 연결 실패
```
⚠️ 서버 연결 실패
백엔드 서버가 실행되지 않았습니다.
```

**해결 방법:**
- 백엔드 서버가 실행 중인지 확인
- 포트 3001이 사용 중인지 확인
- `.env` 파일에 API 키가 올바르게 설정되었는지 확인

### 2. OpenAI API 오류
```
❌ OpenAI API 키가 설정되지 않았습니다.
```

**해결 방법:**
- `backend/.env` 파일 존재 여부 확인
- API 키 형식 확인 (`sk-proj-`로 시작)
- OpenAI 계정에 결제 수단 등록 확인

### 3. 웹캠/마이크 권한 오류
```
웹캠 오류: NotAllowedError
```

**해결 방법:**
- 브라우저에서 카메라/마이크 권한 허용
- HTTPS 또는 localhost에서만 작동 (보안 정책)

---

## 📊 API 엔드포인트

| 메서드 | 경로 | 설명 |
|-------|------|------|
| GET | `/api/health` | 서버 상태 확인 |
| POST | `/api/chat` | AI 면접 질문 생성 |
| POST | `/api/feedback` | 면접 결과 분석 |
| POST | `/api/upload-video` | 녹화 영상 업로드 |

---

## 📝 라이선스

이 프로젝트는 개인 학습 및 연습용으로 제작되었습니다.

---

## 🙋‍♂️ 문의

문제가 발생하거나 질문이 있으시면 Issues에 등록해주세요.

**Happy Interviewing! 🎉**
