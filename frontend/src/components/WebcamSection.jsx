// components/WebcamSection.jsx
import React from 'react';

const WebcamSection = ({ 
  isWebcamActive, 
  isRecording, 
  webcamError,
  videoRef,
  onStartWebcam,
  onStopWebcam,
  onStartRecording,
  onStopRecording
}) => {
  return (
    <div className="webcam-section">
      <div className="webcam-container">
        {isWebcamActive ? (
          <video 
            ref={videoRef} 
            autoPlay 
            muted 
            className="webcam-video"
          />
        ) : (
          <div className="webcam-placeholder">
            <div className="webcam-icon">📹</div>
            <p>웹캠이 꺼져 있습니다</p>
          </div>
        )}
      </div>
      
      <div className="webcam-controls">
        {!isWebcamActive ? (
          <button onClick={onStartWebcam} className="webcam-button">
            📹 웹캠 시작
          </button>
        ) : (
          <>
            <button 
              onClick={onStopWebcam} 
              className="webcam-button stop"
            >
              ⏹️ 웹캠 중지
            </button>
            {!isRecording ? (
              <button 
                onClick={onStartRecording} 
                className="webcam-button recording"
              >
                🔴 녹화 시작
              </button>
            ) : (
              <button 
                onClick={onStopRecording} 
                className="webcam-button pause"
              >
                ⏸️ 녹화 중지
              </button>
            )}
          </>
        )}
      </div>
      
      {isRecording && (
        <div className="recording-indicator">
          <span className="recording-dot">●</span> 녹화 중...
        </div>
      )}
      
      {webcamError && (
        <div className="webcam-error">
          ⚠️ {webcamError}
        </div>
      )}
    </div>
  );
};

export default WebcamSection;