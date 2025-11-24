# 🎯 Aintervue

AI 기반 면접 연습 플랫폼

## 📖 소개

**Aintervue**는 OpenAI GPT를 활용한 실시간 AI 면접 시뮬레이션 플랫폼입니다. 웹캠 녹화, 음성 인식, AI 피드백 분석 등 실제 면접과 유사한 환경을 제공합니다.

### ✨ 주요 기능

- 🤖 **AI 면접관**: GPT-3.5 기반 자연스러운 질문 생성
- 🎤 **음성 인식**: 실시간 STT (Speech-to-Text)
- 📹 **웹캠 녹화**: 면접 영상 자동 저장
- 📊 **AI 피드백**: 면접 후 상세한 분석 제공
- 🎯 **개인화**: 이름과 질문 개수 커스터마이징
- 💾 **자동 저장**: 서버에 녹화 영상 자동 업로드

## 🚀 시작하기

### 사전 요구사항

- Node.js v14 이상
- OpenAI API 키
- 웹캠 및 마이크

### 설치

#### 1. 백엔드 설정

```bash
# 프로젝트 클론
git clone <repository-url>
cd aintervue

# 백엔드 의존성 설치
cd backend
npm install

# 환경 변수 설정
echo "OPENAI_API_KEY=your_api_key_here" > .env
echo "PORT=3001" >> .env

# 업로드 폴더 생성
mkdir -p uploads/videos

# 서버 실행
npm start
```

#### 2. 프론트엔드 설정

```bash
# 프론트엔드 의존성 설치
cd ../frontend
npm install

# 개발 서버 실행
npm start
```

## 📁 프로젝트 구조

```
aintervue/
├── backend/
│   ├── server.js              # Express 서버
│   ├── .env                   # 환경 변수
│   ├── package.json
│   └── uploads/
│       └── videos/            # 녹화 영상 저장
├── frontend/
│   └── src/
│       ├── components/
│       │   └── InterviewChat.jsx
│       └── styles/
│           └── InterviewChat.css
└── README.md
```

## 🛠️ 기술 스택

### Frontend
- React 18
- Web Speech API (음성 인식)
- WebRTC MediaRecorder API (웹캠 녹화)
- CSS3 (Flexbox, Grid)

### Backend
- Node.js
- Express.js
- OpenAI GPT-3.5 Turbo
- Multer (파일 업로드)
- CORS

## 📖 사용 방법

### 1. 면접 설정
- 이름 입력 (최대 20자)
- 질문 개수 선택 (5, 10, 15, 20개)
- "면접 시작하기" 클릭

### 2. 면접 진행
- 웹캠 시작 (선택사항)
- 녹화 시작 (선택사항)
- 텍스트 입력 또는 음성 인식으로 답변
- AI의 질문에 순차적으로 응답

### 3. 결과 확인
- 총점 (100점 만점)
- 강점 2가지
- 개선점 2가지
- 핵심 키워드 5개
- 녹화 영상 다운로드

## 🔌 API 엔드포인트

### POST /api/chat
면접 질문 생성
```json
{
  "messages": [
    { "role": "user", "content": "자기소개..." }
  ]
}
```

### POST /api/feedback
면접 피드백 분석
```json
{
  "messages": [...]
}
```

### POST /api/upload-video
녹화 영상 업로드
- FormData: `video` (Blob)
- 최대 크기: 100MB

### GET /api/health
서버 상태 확인

## ⚙️ 환경 변수

```env
OPENAI_API_KEY=sk-...        # OpenAI API 키 (필수)
PORT=3001                    # 서버 포트 (기본값: 3001)
```

## 🎨 커스터마이징

### 질문 개수 변경
`InterviewChat.jsx`:
```javascript
const [maxQuestions, setMaxQuestions] = useState(10);
```

### 웹캠 크기 조정
`InterviewChat.css`:
```css
.webcam-container {
  height: 450px; /* 원하는 크기 */
}
```

### 레이아웃 비율 변경
`InterviewChat.css`:
```css
.left-section { flex: 4; }  /* 채팅 40% */
.right-section { flex: 6; } /* 웹캠 60% */
```

## 🐛 문제 해결

### 웹캠이 검은 화면으로 보임
- 브라우저 권한 확인
- 다른 앱에서 웹캠 사용 중인지 확인
- "🔄 재시작" 버튼 클릭

### 음성 인식이 작동하지 않음
- Chrome 또는 Edge 브라우저 사용
- 마이크 권한 허용
- HTTPS 환경 권장

### 서버 연결 실패
```bash
cd backend
npm start
```
서버가 `http://localhost:3001`에서 실행 중인지 확인

## 📝 라이센스

..

## 👨‍💻 개발자

[Lee Dongwon]

## 🤝 기여

Pull Request는 언제나 환영합니다!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📧 문의

- 이메일: gfde1324@ajou.ac.kr
- 이슈: [GitHub Issues](your-repo-url/issues)

---

**Aintervue** - AI로 준비하는 완벽한 면접 🎯