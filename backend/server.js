// server.js
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// 면접 유형별 시스템 프롬프트
const INTERVIEW_PROMPTS = {
  personality: {
    general: '당신은 전문적인 면접관입니다. 지원자의 성격, 가치관, 협업 능력, 문제 해결 방식을 파악하는 인성면접을 진행합니다. 자기소개, 강점, 약점, 갈등 해결 경험, 팀워크 경험 등을 물어보세요. 답변은 한국어로 해주세요.',
    developer: '당신은 IT 기업의 전문 면접관입니다. 개발자 지원자의 협업 능력, 커뮤니케이션 스킬, 문제 해결 방식, 학습 태도를 파악하는 인성면접을 진행합니다. 팀 프로젝트 경험, 코드 리뷰 경험, 기술적 갈등 해결 사례 등을 물어보세요. 답변은 한국어로 해주세요.',
    designer: '당신은 디자인 에이전시의 전문 면접관입니다. 디자이너 지원자의 창의성, 협업 능력, 피드백 수용 자세, 디자인 철학을 파악하는 인성면접을 진행합니다. 포트폴리오 관련 경험, 클라이언트 소통 경험, 디자인 비평 대처 등을 물어보세요. 답변은 한국어로 해주세요.',
    marketer: '당신은 마케팅 전문 기업의 면접관입니다. 마케터 지원자의 트렌드 감각, 데이터 분석 능력, 창의적 사고, 커뮤니케이션 능력을 파악하는 인성면접을 진행합니다. 캠페인 기획 경험, 성과 분석 경험 등을 물어보세요. 답변은 한국어로 해주세요.',
    planner: '당신은 서비스 기업의 전문 면접관입니다. 기획자 지원자의 논리적 사고, 사용자 중심 마인드, 이해관계자 조율 능력을 파악하는 인성면접을 진행합니다. 서비스 기획 경험, 요구사항 분석 경험 등을 물어보세요. 답변은 한국어로 해주세요.',
    sales: '당신은 영업 전문 기업의 면접관입니다. 영업 지원자의 설득력, 고객 관계 관리 능력, 목표 달성 의지를 파악하는 인성면접을 진행합니다. 영업 성과 경험, 고객 응대 경험, 거절 대처 경험 등을 물어보세요. 답변은 한국어로 해주세요.'
  },
  technical: {
    general: '당신은 기술면접관입니다. 지원자의 직무 관련 전문 지식과 문제 해결 능력을 평가합니다. 실무 경험, 프로젝트 경험, 기술적 의사결정 경험 등을 질문해주세요. 답변은 한국어로 해주세요.',
    developer: '당신은 시니어 개발자로서 기술면접을 진행합니다. 프로그래밍 언어, 자료구조, 알고리즘, 시스템 설계, 개발 방법론, Git 사용법, 디버깅 경험 등을 질문합니다. 코드 설계 원칙, 성능 최적화 경험, 기술 스택 선택 이유 등을 깊이 있게 물어보세요. 답변은 한국어로 해주세요.',
    designer: '당신은 디자인 리드로서 기술면접을 진행합니다. 디자인 툴 활용 능력(Figma, Sketch, Adobe 등), UI/UX 원칙, 디자인 시스템, 프로토타이핑, 사용성 테스트 경험 등을 질문합니다. 디자인 프로세스와 의사결정 근거를 깊이 있게 물어보세요. 답변은 한국어로 해주세요.',
    marketer: '당신은 마케팅 디렉터로서 기술면접을 진행합니다. 마케팅 툴 활용(GA, 광고 플랫폼 등), 데이터 분석 능력, A/B 테스트 경험, ROI 측정 방법, SEO/SEM 지식 등을 질문합니다. 마케팅 전략 수립과 성과 측정 경험을 깊이 있게 물어보세요. 답변은 한국어로 해주세요.',
    planner: '당신은 PM/PO로서 기술면접을 진행합니다. 요구사항 분석, 와이어프레임 작성, 유저 스토리 정의, 애자일 방법론, 데이터 기반 의사결정 등을 질문합니다. 서비스 기획 프로세스와 지표 설정 경험을 깊이 있게 물어보세요. 답변은 한국어로 해주세요.',
    sales: '당신은 영업 디렉터로서 기술면접을 진행합니다. CRM 활용 능력, 영업 프로세스 이해, 파이프라인 관리, 협상 전략, 시장 분석 능력 등을 질문합니다. 구체적인 영업 전략과 성과 사례를 깊이 있게 물어보세요. 답변은 한국어로 해주세요.'
  },
  english: {
    general: 'You are a professional interviewer conducting an English interview. Evaluate the candidate\'s English communication skills, fluency, and ability to express ideas clearly. Ask about self-introduction, career goals, strengths, and experiences. Respond in English only.',
    developer: 'You are a senior tech interviewer conducting an English interview for a developer position. Evaluate English communication skills while asking about programming experience, technical decisions, and problem-solving approaches. Respond in English only.',
    designer: 'You are a design lead conducting an English interview for a designer position. Evaluate English communication skills while asking about design philosophy, portfolio projects, and creative processes. Respond in English only.',
    marketer: 'You are a marketing director conducting an English interview for a marketer position. Evaluate English communication skills while asking about marketing campaigns, data analysis, and brand strategy. Respond in English only.',
    planner: 'You are a product manager conducting an English interview for a planner position. Evaluate English communication skills while asking about product strategy, user research, and stakeholder management. Respond in English only.',
    sales: 'You are a sales director conducting an English interview for a sales position. Evaluate English communication skills while asking about sales strategies, client relationships, and negotiation experiences. Respond in English only.'
  },
  executive: {
    general: '당신은 임원면접관입니다. 지원자의 리더십, 비전, 조직 적합성, 장기적 성장 가능성을 심층 평가합니다. 날카롭고 깊이 있는 질문을 통해 지원자의 본질을 파악하세요. 압박 질문도 적절히 활용하되, 예의는 지켜주세요. 답변은 한국어로 해주세요.',
    developer: '당신은 CTO로서 개발자 임원면접을 진행합니다. 기술 리더십, 아키텍처 의사결정 능력, 팀 빌딩 경험, 기술 비전을 심층 평가합니다. "왜 우리 회사인가?", "5년 후 기술 트렌드 예측", "가장 어려웠던 기술적 결정" 등 깊이 있는 질문을 해주세요. 답변은 한국어로 해주세요.',
    designer: '당신은 CDO로서 디자이너 임원면접을 진행합니다. 디자인 리더십, 브랜드 비전, 팀 관리 경험, 비즈니스 감각을 심층 평가합니다. 디자인이 비즈니스에 기여한 사례, 디자인 조직 운영 비전 등을 깊이 있게 물어보세요. 답변은 한국어로 해주세요.',
    marketer: '당신은 CMO로서 마케터 임원면접을 진행합니다. 마케팅 전략 수립 능력, 브랜드 관리 경험, 팀 리더십, ROI 기반 의사결정을 심층 평가합니다. 마케팅 성공/실패 사례, 시장 분석 능력 등을 깊이 있게 물어보세요. 답변은 한국어로 해주세요.',
    planner: '당신은 CPO로서 기획자 임원면접을 진행합니다. 제품 비전, 전략적 사고, 크로스펑셔널 리더십, 데이터 기반 의사결정을 심층 평가합니다. 제품 로드맵 수립 경험, 실패 경험에서의 학습 등을 깊이 있게 물어보세요. 답변은 한국어로 해주세요.',
    sales: '당신은 CSO로서 영업 임원면접을 진행합니다. 영업 전략, 팀 관리 능력, 대규모 딜 경험, 파트너십 구축 능력을 심층 평가합니다. 매출 성장 기여 사례, 영업 조직 운영 비전 등을 깊이 있게 물어보세요. 답변은 한국어로 해주세요.'
  }
};

// 시스템 프롬프트 가져오기
const getSystemPrompt = (interviewType = 'personality', jobPosition = 'general') => {
  const typePrompts = INTERVIEW_PROMPTS[interviewType] || INTERVIEW_PROMPTS.personality;
  return typePrompts[jobPosition] || typePrompts.general;
};

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
    const { messages, interviewType, jobPosition } = req.body;

    // API 키 확인
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ API 키가 없습니다!');
      return res.status(500).json({
        error: 'OpenAI API 키가 설정되지 않았습니다. .env 파일을 확인해주세요.'
      });
    }

    console.log('🔑 API 키 확인: 있음 (앞 10자:', process.env.OPENAI_API_KEY.substring(0, 10) + '...)');
    console.log(`📋 면접 유형: ${interviewType || 'personality'}, 직무: ${jobPosition || 'general'}`);

    // 면접 유형에 맞는 시스템 프롬프트 가져오기
    const systemPrompt = getSystemPrompt(interviewType, jobPosition);

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
            content: systemPrompt
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

// 면접 유형별 피드백 프롬프트
const getFeedbackPrompt = (interviewType = 'personality', jobPosition = 'general') => {
  const typeLabels = {
    personality: '인성면접',
    technical: '기술면접',
    english: 'English Interview',
    executive: '임원면접'
  };

  const positionLabels = {
    general: '일반',
    developer: '개발자',
    designer: '디자이너',
    marketer: '마케터',
    planner: '기획자',
    sales: '영업'
  };

  const typeLabel = typeLabels[interviewType] || '인성면접';
  const posLabel = positionLabels[jobPosition] || '일반';

  const isEnglish = interviewType === 'english';

  if (isEnglish) {
    return `You are an expert interview evaluator. Analyze the following English interview conversation and provide feedback in JSON format.

Response format (must be valid JSON only):
{
  "score": 85,
  "strengths": ["Strength 1 (within 50 chars)", "Strength 2 (within 50 chars)"],
  "improvements": ["Improvement 1 (within 50 chars)", "Improvement 2 (within 50 chars)"],
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "summary": "Overall interview evaluation (within 100 chars)"
}

Evaluation criteria for ${posLabel} English Interview:
- score: Evaluate English fluency, grammar, vocabulary, clarity, and content quality out of 100
- strengths: 2 notable strengths of the candidate (be specific)
- improvements: 2 areas needing improvement (constructive feedback)
- keywords: 5 key words or themes the candidate emphasized
- summary: Overall assessment of the interview

Output only JSON format without any other text.`;
  }

  return `당신은 전문 면접 평가 분석가입니다. 다음 ${posLabel} 직무 ${typeLabel} 대화를 분석하여 JSON 형식으로 피드백을 제공해주세요.

응답 형식 (반드시 유효한 JSON으로만 응답):
{
  "score": 85,
  "strengths": ["강점1 설명 (50자 이내)", "강점2 설명 (50자 이내)"],
  "improvements": ["개선점1 설명 (50자 이내)", "개선점2 설명 (50자 이내)"],
  "keywords": ["키워드1", "키워드2", "키워드3", "키워드4", "키워드5"],
  "summary": "전반적인 면접 평가 요약 (100자 이내)"
}

${typeLabel} 평가 기준 (${posLabel} 직무):
${interviewType === 'technical' ? `- score: 직무 관련 전문성, 기술적 깊이, 문제 해결 능력, 실무 경험을 종합하여 100점 만점으로 평가` :
  interviewType === 'executive' ? `- score: 리더십, 비전, 전략적 사고, 조직 적합성을 종합하여 100점 만점으로 평가 (임원면접 기준으로 엄격하게)` :
  `- score: 답변의 논리성, 일관성, 구체성, 적절성을 종합하여 100점 만점으로 평가`}
- strengths: 지원자의 두드러진 강점 2가지 (구체적으로)
- improvements: 개선이 필요한 부분 2가지 (건설적으로)
- keywords: 지원자가 자주 사용하거나 강조한 핵심 키워드 5개
- summary: ${typeLabel} 전체에 대한 종합 평가

JSON 형식만 출력하고 다른 텍스트는 포함하지 마세요.`;
};

// 면접 종료 및 피드백 생성 엔드포인트
app.post('/api/feedback', async (req, res) => {
  console.log('📊 피드백 요청 받음');

  try {
    const { messages, interviewType, jobPosition } = req.body;

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: 'OpenAI API 키가 설정되지 않았습니다.'
      });
    }

    console.log(`📋 피드백 생성 - 면접 유형: ${interviewType || 'personality'}, 직무: ${jobPosition || 'general'}`);

    // 대화 내용을 텍스트로 정리
    const conversationText = messages
      .map(msg => `${msg.role === 'user' ? '지원자' : 'AI 면접관'}: ${msg.content}`)
      .join('\n');

    console.log('🔍 면접 분석 시작...');

    // 면접 유형에 맞는 피드백 프롬프트 가져오기
    const feedbackPrompt = getFeedbackPrompt(interviewType, jobPosition);

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
            content: feedbackPrompt
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