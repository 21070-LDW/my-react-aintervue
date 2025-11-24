// components/FeedbackResult.jsx
import React from 'react';

const FeedbackResult = ({ feedback, recordedVideoUrl, onDownload, onRestart }) => {
  return (
    <div className="interview-container">
      <h2 className="interview-header">📊 면접 분석 결과</h2>
      
      {/* 총점 */}
      <div className="score-section">
        <div className="score-circle">
          <div className="score-number">{feedback.score}</div>
          <div className="score-label">점</div>
        </div>
        <div className="score-summary">{feedback.summary}</div>
      </div>

      {/* 강점 */}
      <div className="feedback-section">
        <h3 className="section-title">✨ 강점</h3>
        {feedback.strengths.map((strength, index) => (
          <div key={index} className="feedback-item">
            <span className="item-number">{index + 1}</span>
            <span className="item-text">{strength}</span>
          </div>
        ))}
      </div>

      {/* 개선점 */}
      <div className="feedback-section">
        <h3 className="section-title">💡 개선점</h3>
        {feedback.improvements.map((improvement, index) => (
          <div key={index} className="feedback-item">
            <span className="item-number">{index + 1}</span>
            <span className="item-text">{improvement}</span>
          </div>
        ))}
      </div>

      {/* 키워드 */}
      <div className="feedback-section">
        <h3 className="section-title">🔑 핵심 키워드</h3>
        <div className="keyword-container">
          {feedback.keywords.map((keyword, index) => (
            <span key={index} className="keyword">
              #{keyword}
            </span>
          ))}
        </div>
      </div>

      {/* 녹화 영상 */}
      {recordedVideoUrl && (
        <div className="feedback-section">
          <h3 className="section-title">🎥 면접 녹화 영상</h3>
          <video 
            src={recordedVideoUrl} 
            controls 
            className="recorded-video"
          />
          <button onClick={onDownload} className="download-button">
            📥 녹화 영상 다운로드
          </button>
        </div>
      )}

      {/* 재시작 버튼 */}
      <button onClick={onRestart} className="restart-button">
        🔄 새로운 면접 시작하기
      </button>
    </div>
  );
};

export default FeedbackResult;