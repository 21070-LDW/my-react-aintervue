// server.js
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// 미들웨어
app.use(cors());
app.use(express.json());

// 정적 파일 제공 (업로드된 영상 접근용)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer 설정 (파일 업로드)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/videos/');
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    cb(null, `interview_${timestamp}.webm`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB 제한
});

// 영상 업로드 엔드포인트
app.post('/api/upload-video', upload.single('video'), (req, res) => {
  console.log('📹 영상 업로드 받음');
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: '파일이 없습니다.' });
    }

    const filePath = `/uploads/videos/${req.file.filename}`;
    console.log(`✅ 영상 저장 완료: ${req.file.filename}`);
    console.log(`   크기: ${(req.file.size / 1024 / 1024).toFixed(2)}MB`);
    
    res.json({
      message: '영상이 성공적으로 저장되었습니다.',
      filename: req.file.filename,
      path: filePath,
      size: req.file.size,
      url: `http://localhost:${PORT}${filePath}`
    });
  } catch (error) {
    console.error('❌ 업로드 에러:', error);
    res.status(500).json({ 
      error: '파일 업로드 중 오류가 발생했습니다.',
      details: error.message 
    });
  }
});

// OpenAI API 호출 엔드포인트
app.post('/api/chat', async (req, res) => {
  console.log('📨 요청 받음');
  
  try {
    const { messages } = req.body;
    
    // API 키 확인
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ API 키가 없습니다!');
      return res.status(500).json({ 
        error: 'OpenAI API 키가 설정되지 않았습니다. .env 파일을 확인해주세요.' 
      });
    }
    
    console.log('🔑 API 키 확인: 있음 (앞 10자:', process.env.OPENAI_API_KEY.substring(0, 10) + '...)');

    // OpenAI API 호출
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: '당신은 전문적인 면접관입니다. 지원자의 답변을 분석하고 적절한 후속 질문을 해주세요. 면접은 총 5-6개의 질문으로 진행되며, 자기소개, 강점, 약점, 경험, 지원동기 등을 다뤄주세요. 답변은 한국어로 해주세요.'
          },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    console.log('📡 OpenAI 응답 상태:', response.status);

    const data = await response.json();
    console.log('📦 OpenAI 응답 데이터:', JSON.stringify(data, null, 2));

    // 응답 검증
    if (!response.ok) {
      console.error('❌ OpenAI API 오류:', data);
      return res.status(response.status).json({ 
        error: 'OpenAI API 오류',
        details: data.error?.message || '알 수 없는 오류'
      });
    }

    if (!data.choices || !data.choices[0]) {
      console.error('❌ 잘못된 응답 형식:', data);
      return res.status(500).json({ 
        error: '잘못된 응답 형식',
        details: 'OpenAI로부터 올바른 응답을 받지 못했습니다.'
      });
    }

    const aiMessage = data.choices[0].message.content;
    console.log('✅ AI 응답 생성 완료');
    
    res.json({ message: aiMessage });
    
  } catch (error) {
    console.error('❌ 서버 에러:', error);
    res.status(500).json({ 
      error: '서버 오류가 발생했습니다.',
      details: error.message 
    });
  }
});

// 면접 종료 및 피드백 생성 엔드포인트
app.post('/api/feedback', async (req, res) => {
  console.log('📊 피드백 요청 받음');
  
  try {
    const { messages } = req.body;
    
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ 
        error: 'OpenAI API 키가 설정되지 않았습니다.' 
      });
    }

    // 대화 내용을 텍스트로 정리
    const conversationText = messages
      .map(msg => `${msg.role === 'user' ? '지원자' : 'AI 면접관'}: ${msg.content}`)
      .join('\n');

    console.log('🔍 면접 분석 시작...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `당신은 전문 면접 평가 분석가입니다. 다음 면접 대화를 분석하여 JSON 형식으로 피드백을 제공해주세요.

응답 형식 (반드시 유효한 JSON으로만 응답):
{
  "score": 85,
  "strengths": ["강점1 설명 (50자 이내)", "강점2 설명 (50자 이내)"],
  "improvements": ["개선점1 설명 (50자 이내)", "개선점2 설명 (50자 이내)"],
  "keywords": ["키워드1", "키워드2", "키워드3", "키워드4", "키워드5"],
  "summary": "전반적인 면접 평가 요약 (100자 이내)"
}

평가 기준:
- score: 답변의 논리성, 일관성, 구체성, 적절성을 종합하여 100점 만점으로 평가
- strengths: 지원자의 두드러진 강점 2가지 (구체적으로)
- improvements: 개선이 필요한 부분 2가지 (건설적으로)
- keywords: 지원자가 자주 사용하거나 강조한 핵심 키워드 5개
- summary: 면접 전체에 대한 종합 평가

JSON 형식만 출력하고 다른 텍스트는 포함하지 마세요.`
          },
          {
            role: 'user',
            content: `다음 면접 대화를 분석해주세요:\n\n${conversationText}`
          }
        ],
        temperature: 0.5,
        max_tokens: 800
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ OpenAI API 오류:', data);
      return res.status(response.status).json({ 
        error: 'OpenAI API 오류',
        details: data.error?.message || '알 수 없는 오류'
      });
    }

    const feedbackText = data.choices[0].message.content.trim();
    console.log('📝 AI 응답:', feedbackText);

    // JSON 파싱 (```json ``` 제거)
    let feedback;
    try {
      const cleanedText = feedbackText.replace(/```json|```/g, '').trim();
      feedback = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('❌ JSON 파싱 오류:', parseError);
      return res.status(500).json({ 
        error: 'AI 응답 파싱 실패',
        details: feedbackText
      });
    }

    console.log('✅ 피드백 생성 완료');
    res.json(feedback);
    
  } catch (error) {
    console.error('❌ 서버 에러:', error);
    res.status(500).json({ 
      error: '서버 오류가 발생했습니다.',
      details: error.message 
    });
  }
});

// 서버 상태 확인 엔드포인트
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: '서버가 정상 작동 중입니다.',
    apiKeySet: !!process.env.OPENAI_API_KEY
  });
});

app.listen(PORT, () => {
  console.log(`✅ 서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`   http://localhost:${PORT}`);
  console.log(`🔑 API 키 상태: ${process.env.OPENAI_API_KEY ? '설정됨' : '❌ 설정 안 됨'}`);
});