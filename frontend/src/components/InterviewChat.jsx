// InterviewChat.jsx - 완전판
import React, { useState, useEffect, useRef } from 'react';
import '../styles/InterviewChat.css';

const InterviewChat = () => {
  // 기본 상태
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState('checking');
  const [questionCount, setQuestionCount] = useState(1);
  const [isInterviewEnded, setIsInterviewEnded] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // 면접 설정 상태
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [userName, setUserName] = useState('');
  const [maxQuestions, setMaxQuestions] = useState(10);
  const [isPaused, setIsPaused] = useState(false);
  
  // 타이머 상태
  const [currentQuestionTime, setCurrentQuestionTime] = useState(0);
  const [questionTimes, setQuestionTimes] = useState([]);
  const timerIntervalRef = useRef(null);
  
  // 웹캠 상태
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState(null);
  const [webcamError, setWebcamError] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [serverVideoUrl, setServerVideoUrl] = useState(null);
  const [videoKey, setVideoKey] = useState(0);
  
  // 음성 인식 상태
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  
  // Refs
  const chatBoxRef = useRef(null);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const streamRef = useRef(null);
  const recognitionRef = useRef(null);

  // 웹캠 정리
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  // 음성 인식 초기화
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = 'ko-KR';
      recognition.continuous = false;
      recognition.interimResults = true;
      
      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = 0; i < event.results.length; i++) {
          const text = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += text;
          } else {
            interimTranscript += text;
          }
        }
        
        if (finalTranscript) {
          setInput(finalTranscript);
          setIsListening(false);
        } else {
          setInput(interimTranscript);
        }
      };
      
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      
      recognitionRef.current = recognition;
    } else {
      setSpeechSupported(false);
    }
  }, []);

  useEffect(() => {
    checkServerHealth();
  }, []);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  // 타이머 시작/정지
  useEffect(() => {
    if (isInterviewStarted && !isInterviewEnded && !isPaused && !isLoading) {
      timerIntervalRef.current = setInterval(() => {
        setCurrentQuestionTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isInterviewStarted, isInterviewEnded, isPaused, isLoading]);

  // 웹캠 시작
  const startWebcam = async () => {
    try {
      console.log('🎥 웹캠 시작 시도...');
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640, min: 320 }, 
          height: { ideal: 480, min: 240 },
          facingMode: 'user'
        }, 
        audio: true 
      });
      
      console.log('✅ 스트림 획득:', stream);
      streamRef.current = stream;
      setIsWebcamActive(true);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (videoRef.current) {
        const video = videoRef.current;
        
        if (video.srcObject) {
          video.srcObject.getTracks().forEach(track => track.stop());
        }
        
        video.srcObject = stream;
        video.muted = true;
        video.playsInline = true;
        video.autoplay = true;
        
        await new Promise((resolve) => {
          let resolved = false;
          
          const onLoadedMetadata = () => {
            if (resolved) return;
            resolved = true;
            console.log('📺 비디오 로드됨:', video.videoWidth, 'x', video.videoHeight);
            resolve();
          };
          
          const onCanPlay = () => {
            if (resolved) return;
            resolved = true;
            resolve();
          };
          
          video.addEventListener('loadedmetadata', onLoadedMetadata, { once: true });
          video.addEventListener('canplay', onCanPlay, { once: true });
          
          if (video.readyState >= 1) {
            onLoadedMetadata();
          }
          
          setTimeout(() => {
            if (!resolved) {
              resolved = true;
              resolve();
            }
          }, 10000);
        });
        
        try {
          await video.play();
          console.log('▶️ 재생 시작');
        } catch (playError) {
          console.warn('⚠️ 자동 재생 실패:', playError);
        }
      }
      
      setWebcamError(null);
      console.log('✅ 웹캠 설정 완료');
    } catch (error) {
      console.error('❌ 웹캠 오류:', error);
      setWebcamError(`웹캠 오류: ${error.message}`);
      setIsWebcamActive(false);
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsWebcamActive(false);
  };

  const startRecording = () => {
    if (!streamRef.current) {
      alert('먼저 웹캠을 시작해주세요.');
      return;
    }
    recordedChunksRef.current = [];
    const options = { mimeType: 'video/webm; codecs=vp9' };
    if (!MediaRecorder.isTypeSupported(options.mimeType)) options.mimeType = 'video/webm';

    try {
      const mediaRecorder = new MediaRecorder(streamRef.current, options);
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) recordedChunksRef.current.push(event.data);
      };
      
      mediaRecorder.onstop = async () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const localUrl = URL.createObjectURL(blob);
        setRecordedVideoUrl(localUrl);
        await uploadVideoToServer(blob);
      };
      
      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
    } catch (error) {
      alert('녹화를 시작할 수 없습니다.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const uploadVideoToServer = async (blob) => {
    try {
      setUploadStatus('업로드 중...');
      
      const formData = new FormData();
      const filename = `interview_${new Date().toISOString().slice(0, 10)}.webm`;
      formData.append('video', blob, filename);

      const response = await fetch('http://localhost:3001/api/upload-video', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('업로드 실패');

      const data = await response.json();
      console.log('✅ 서버에 저장됨:', data.filename);
      setServerVideoUrl(data.url);
      setUploadStatus('저장 완료!');
      
      setTimeout(() => setUploadStatus(''), 3000);
      
      return data;
    } catch (error) {
      console.error('업로드 오류:', error);
      setUploadStatus('저장 실패');
      setTimeout(() => setUploadStatus(''), 3000);
      return null;
    }
  };

  const downloadRecording = () => {
    if (!recordedVideoUrl) return;
    const a = document.createElement('a');
    a.href = recordedVideoUrl;
    a.download = `interview_${new Date().toISOString().slice(0, 10)}.webm`;
    a.click();
  };

  const toggleVoiceRecognition = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('음성 인식 오류:', error);
      }
    }
  };

  const checkServerHealth = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/health');
      setServerStatus(response.ok ? 'connected' : 'error');
    } catch (error) {
      setServerStatus('error');
    }
  };

  const callBackendAPI = async (conversationHistory) => {
    try {
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: conversationHistory })
      });
      if (!response.ok) throw new Error('서버 오류');
      const data = await response.json();
      return data.message;
    } catch (error) {
      return '죄송합니다. 서버와의 연결에 문제가 발생했습니다.';
    }
  };

  const requestFeedback = async (conversationHistory) => {
    try {
      setIsAnalyzing(true);
      if (isRecording) stopRecording();
      
      const response = await fetch('http://localhost:3001/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: conversationHistory })
      });
      if (!response.ok) throw new Error('피드백 요청 실패');
      
      const feedbackData = await response.json();
      setFeedback(feedbackData);
      setIsInterviewEnded(true);
    } catch (error) {
      alert('피드백 생성에 실패했습니다.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    // 현재 질문 시간 저장
    const timeForQuestion = currentQuestionTime;
    setQuestionTimes(prev => [...prev, timeForQuestion]);
    setCurrentQuestionTime(0); // 타이머 리셋

    const userMessage = { sender: 'User', text: input, id: Date.now() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    const conversationHistory = updatedMessages.map(msg => ({
      role: msg.sender === 'User' ? 'user' : 'assistant',
      content: msg.text
    }));

    if (questionCount >= maxQuestions) {
      const endMessage = { 
        sender: 'AI', 
        text: '면접이 종료되었습니다. 잠시만 기다려주시면 면접 분석 결과를 보여드리겠습니다...', 
        id: Date.now() + 1 
      };
      setMessages([...updatedMessages, endMessage]);
      setIsLoading(false);
      await requestFeedback(conversationHistory);
      return;
    }

    const aiResponse = await callBackendAPI(conversationHistory);
    const aiMessage = { sender: 'AI', text: aiResponse, id: Date.now() + 1 };
    setMessages([...updatedMessages, aiMessage]);
    setQuestionCount(questionCount + 1);
    setIsLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) handleSend();
  };

  const startInterview = () => {
    if (!userName.trim()) {
      alert('이름을 입력해주세요.');
      return;
    }
    
    const greeting = `안녕하세요 ${userName}님! AI 면접을 시작하겠습니다. 먼저 자기소개 부탁드립니다.`;
    setMessages([{ sender: 'AI', text: greeting, id: 1 }]);
    setIsInterviewStarted(true);
    setCurrentQuestionTime(0);
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAverageTime = () => {
    if (questionTimes.length === 0) return 0;
    const total = questionTimes.reduce((sum, time) => sum + time, 0);
    return Math.round(total / questionTimes.length);
  };

  const restartInterview = () => {
    setIsInterviewStarted(false);
    setMessages([]);
    setQuestionCount(1);
    setIsInterviewEnded(false);
    setFeedback(null);
    setInput('');
    setRecordedVideoUrl(null);
    setServerVideoUrl(null);
    setUploadStatus('');
    setUserName('');
    setMaxQuestions(10);
    setIsPaused(false);
    setCurrentQuestionTime(0);
    setQuestionTimes([]);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    stopWebcam();
  };

  // 서버 연결 실패
  if (serverStatus === 'error') {
    return (
      <div className="interview-container">
        <h2 className="interview-header">🤖 Aintervue</h2>
        <div className="error-box">
          <h3>⚠️ 서버 연결 실패</h3>
          <p>백엔드 서버가 실행되지 않았습니다.</p>
          <button onClick={checkServerHealth} className="restart-button">
            다시 연결하기
          </button>
        </div>
      </div>
    );
  }

  // 서버 확인 중
  if (serverStatus === 'checking') {
    return (
      <div className="interview-container">
        <h2 className="interview-header">🤖 Aintervue</h2>
        <div className="loading-box">
          <p>서버 연결 확인 중...</p>
        </div>
      </div>
    );
  }

  // 면접 시작 전 설정 화면
  if (!isInterviewStarted) {
    return (
      <div className="interview-container">
        <div className="setup-screen">
          <h2>🎯 Aintervue 면접 설정</h2>
          <div className="setup-form">
            <div className="form-group">
              <label htmlFor="userName">이름 *</label>
              <input
                id="userName"
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="홍길동"
                maxLength={20}
              />
              <small>면접관이 이름으로 호칭합니다</small>
            </div>
            
            <div className="form-group">
              <label>질문 개수 *</label>
              <div className="question-options">
                {[
                  { value: 5, label: '5개', desc: '빠른 면접', icon: '⚡' },
                  { value: 10, label: '10개', desc: '표준 면접', icon: '📝' },
                  { value: 15, label: '15개', desc: '심화 면접', icon: '📚' },
                  { value: 20, label: '20개', desc: '전문 면접', icon: '🎯' }
                ].map((option) => (
                  <div
                    key={option.value}
                    className={`question-option-card ${maxQuestions === option.value ? 'selected' : ''}`}
                    onClick={() => setMaxQuestions(option.value)}
                  >
                    <span className="option-icon">{option.icon}</span>
                    <span className="option-label">{option.label}</span>
                    <span className="option-desc">{option.desc}</span>
                  </div>
                ))}
              </div>
              <small>받고 싶은 질문의 총 개수를 선택하세요</small>
            </div>
          </div>
          
          <button 
            onClick={startInterview}
            className="start-button"
            disabled={!userName.trim()}
          >
            면접 시작하기 🚀
          </button>
          
          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', fontSize: '13px', color: '#666' }}>
            <p style={{ margin: '5px 0' }}>💡 <strong>팁:</strong></p>
            <p style={{ margin: '5px 0' }}>• 조용한 환경에서 진행하세요</p>
            <p style={{ margin: '5px 0' }}>• 웹캠과 마이크 권한을 허용해주세요</p>
            <p style={{ margin: '5px 0' }}>• 구체적이고 솔직하게 답변하세요</p>
          </div>
        </div>
      </div>
    );
  }

  // 분석 결과 화면
  if (isInterviewEnded && feedback) {
    return (
      <div className="interview-container">
        <h2 className="interview-header">📊 {userName}님의 면접 분석 결과</h2>
        
        <div className="score-section">
          <div className="score-circle">
            <div className="score-number">{feedback.score}</div>
            <div className="score-label">점</div>
          </div>
          <div className="score-summary">{feedback.summary}</div>
        </div>

        {questionTimes.length > 0 && (
          <div className="feedback-section">
            <h3 className="section-title">⏱️ 답변 시간 분석</h3>
            <div style={{ padding: '15px', backgroundColor: 'white', borderRadius: '8px' }}>
              <p style={{ marginBottom: '10px', fontSize: '16px' }}>
                <strong>평균 답변 시간:</strong> {formatTime(getAverageTime())}
              </p>
              <p style={{ fontSize: '14px', color: '#666' }}>
                총 {questionTimes.length}개 질문에 답변하셨습니다.
              </p>
              {getAverageTime() > 180 && (
                <p style={{ marginTop: '10px', color: '#dc3545', fontSize: '14px' }}>
                  💡 답변이 평균 3분 이상 소요되었습니다. 더 간결하게 답변하는 연습을 해보세요.
                </p>
              )}
              {getAverageTime() < 60 && (
                <p style={{ marginTop: '10px', color: '#ffc107', fontSize: '14px' }}>
                  💡 답변이 평균 1분 미만입니다. 더 구체적이고 상세한 답변을 해보세요.
                </p>
              )}
            </div>
          </div>
        )}

        <div className="feedback-section">
          <h3 className="section-title">✨ 강점</h3>
          {feedback.strengths.map((strength, index) => (
            <div key={index} className="feedback-item">
              <span className="item-number">{index + 1}</span>
              <span className="item-text">{strength}</span>
            </div>
          ))}
        </div>

        <div className="feedback-section">
          <h3 className="section-title">💡 개선점</h3>
          {feedback.improvements.map((improvement, index) => (
            <div key={index} className="feedback-item">
              <span className="item-number">{index + 1}</span>
              <span className="item-text">{improvement}</span>
            </div>
          ))}
        </div>

        <div className="feedback-section">
          <h3 className="section-title">🔑 핵심 키워드</h3>
          <div className="keyword-container">
            {feedback.keywords.map((keyword, index) => (
              <span key={index} className="keyword">#{keyword}</span>
            ))}
          </div>
        </div>

        {recordedVideoUrl && (
          <div className="feedback-section">
            <h3 className="section-title">🎥 면접 녹화 영상</h3>
            <video src={recordedVideoUrl} controls className="recorded-video" />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={downloadRecording} className="download-button">
                📥 로컬 다운로드
              </button>
              {serverVideoUrl && (
                <button 
                  onClick={() => window.open(serverVideoUrl, '_blank')} 
                  className="download-button"
                  style={{ backgroundColor: '#28a745' }}
                >
                  🌐 서버에서 보기
                </button>
              )}
            </div>
            {serverVideoUrl && (
              <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
                ✅ 서버에 저장됨: {serverVideoUrl.split('/').pop()}
              </p>
            )}
          </div>
        )}

        <button onClick={restartInterview} className="restart-button">
          🔄 새로운 면접 시작하기
        </button>
      </div>
    );
  }

  // 분석 중
  if (isAnalyzing) {
    return (
      <div className="interview-container">
        <h2 className="interview-header">🤖 Aintervue</h2>
        <div className="loading-box">
          <div className="loader"></div>
          <p style={{ marginTop: '20px', fontSize: '18px', fontWeight: '600' }}>
            면접 내용을 분석하고 있습니다...
          </p>
        </div>
      </div>
    );
  }

  // 메인 면접 화면
  return (
    <div className="interview-container">
      <div className="interview-header-bar">
        <h2 className="interview-header">🤖 Aintervue</h2>
        <div className="interview-progress-bar">
          <div className="status-badge">
            <span className="status-dot"></span>
            {userName}님
          </div>
          <div className="question-progress">
            질문 {questionCount} / {maxQuestions}
          </div>
          <div className="timer-display">
            ⏱️ {formatTime(currentQuestionTime)}
            {currentQuestionTime > 180 && (
              <span style={{ color: '#dc3545', marginLeft: '5px' }}>⚠️</span>
            )}
          </div>
          <button 
            onClick={togglePause}
            className="pause-button"
            title={isPaused ? "재개" : "일시정지"}
          >
            {isPaused ? '▶️' : '⏸️'}
          </button>
        </div>
      </div>

      {isPaused && (
        <div className="pause-overlay">
          <div className="pause-content">
            <h2>⏸️ 면접 일시정지</h2>
            <p>준비가 되면 ▶️ 버튼을 눌러 재개하세요</p>
            <button onClick={togglePause} className="resume-button">
              ▶️ 면접 재개하기
            </button>
          </div>
        </div>
      )}

      <div className="main-content">
        <div className="left-section">
          <div className="chat-box" ref={chatBoxRef}>
            {messages.map((msg) => (
              <div key={msg.id} className={`chat-message ${msg.sender === 'User' ? 'user' : 'ai'}`}>
                <strong>{msg.sender === 'User' ? '지원자' : 'AI 면접관'}:</strong> {msg.text}
              </div>
            ))}
            {isLoading && (
              <div className="chat-message ai">
                <strong>AI 면접관:</strong> <em>생각하는 중...</em>
              </div>
            )}
          </div>

          <div className="input-area">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isListening ? "듣고 있습니다... 말씀해주세요" : "답변을 입력하세요..."}
              className={`input-field ${isListening ? 'listening' : ''}`}
              disabled={isLoading}
            />
            {speechSupported && (
              <button
                onClick={toggleVoiceRecognition}
                className={`mic-button ${isListening ? 'listening' : 'idle'}`}
                disabled={isLoading}
              >
                {isListening ? '⏹️' : '🎤'}
              </button>
            )}
            <button onClick={handleSend} className="send-button" disabled={isLoading}>
              {isLoading ? '전송중...' : '전송'}
            </button>
          </div>

          <div className="interview-footer">
            <small style={{ color: '#666' }}>
              💡 팁: 🎥 웹캠을 켜고 녹화하면 면접 영상을 다운로드할 수 있습니다.
            </small>
            {isListening && (
              <div className="listening-indicator">
                <span>🔴</span> 음성을 실시간으로 인식하고 있습니다...
              </div>
            )}
          </div>
        </div>

        <div className="right-section">
          <div className="webcam-section">
            <div className="webcam-container">
              {isWebcamActive ? (
                <video 
                  key={videoKey}
                  ref={videoRef} 
                  autoPlay 
                  playsInline
                  muted
                  className="webcam-video"
                />
              ) : (
                <div className="webcam-placeholder">
                  <div className="webcam-icon">📹</div>
                  <p>웹캠이 꺼져 있습니다</p>
                  <small style={{ color: '#999', marginTop: '10px' }}>
                    웹캠을 시작하면 실시간 영상이 표시됩니다
                  </small>
                </div>
              )}
            </div>
            
            <div className="webcam-controls">
              {!isWebcamActive ? (
                <button onClick={startWebcam} className="webcam-button">
                  📹 웹캠 시작
                </button>
              ) : (
                <>
                  <button onClick={stopWebcam} className="webcam-button stop">
                    ⏹️ 웹캠 중지
                  </button>
                  <button 
                    onClick={() => {
                      setVideoKey(prev => prev + 1);
                      stopWebcam();
                      setTimeout(() => startWebcam(), 100);
                    }} 
                    className="webcam-button"
                    style={{ backgroundColor: '#ffc107' }}
                  >
                    🔄 재시작
                  </button>
                  {!isRecording ? (
                    <button onClick={startRecording} className="webcam-button recording">
                      🔴 녹화 시작
                    </button>
                  ) : (
                    <button onClick={stopRecording} className="webcam-button pause">
                      ⏸️ 녹화 중지
                    </button>
                  )}
                </>
              )}
            </div>
            
            {isWebcamActive && streamRef.current && (
              <div style={{ marginTop: '10px', padding: '8px', backgroundColor: '#e8f5e9', borderRadius: '6px', fontSize: '11px', textAlign: 'center' }}>
                ✅ {streamRef.current.getVideoTracks()[0]?.label || '웹캠 활성'}
              </div>
            )}
            
            {isRecording && (
              <div className="recording-indicator">
                <span className="recording-dot">●</span> 녹화 중...
              </div>
            )}
            
            {uploadStatus && (
              <div className="upload-status">
                {uploadStatus}
              </div>
            )}
            
            {webcamError && <div className="webcam-error">⚠️ {webcamError}</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewChat;