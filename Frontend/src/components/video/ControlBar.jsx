import React from "react";

export default function ControlBar({
  status,
  findMatch,
  skipChat,
  stopChat,
  toggleMic,
  toggleCamera,
  micEnabled,
  cameraEnabled,
  activeDrawer,
  toggleChat
}) {
  return (
    <div className="floating-control-wrap flex-center animate-slide-up" style={{ animationDelay: '0.4s' }}>
      <div className="floating-control-bar glass-premium premium-shadow">
        
        {/* Media Controls */}
        <div className="control-section flex-center" style={{ gap: '8px' }}>
          <button
            className={`control-circle-btn ${!micEnabled ? "muted" : ""}`}
            onClick={toggleMic}
            title={micEnabled ? "Mute Microphone" : "Unmute Microphone"}
          >
            {micEnabled ? "🎤" : "🔇"}
          </button>

          <button
            className={`control-circle-btn ${!cameraEnabled ? "muted" : ""}`}
            onClick={toggleCamera}
            title={cameraEnabled ? "Stop Camera" : "Start Camera"}
          >
            {cameraEnabled ? "📷" : "🚫"}
          </button>
        </div>

        <div className="control-divider"></div>

        {/* Action Controls */}
        <div className="control-section flex-center" style={{ gap: '12px' }}>
          {status === "chatting" ? (
            <>
              <button className="premium-btn skip-btn" onClick={skipChat}>
                <span className="btn-icon">⏭️</span>
                <span className="btn-label">Next</span>
              </button>
              
              <button className="premium-btn stop-btn" onClick={stopChat} style={{ 
                background: 'rgba(255,255,255,0.05)', 
                color: 'white', 
                padding: '12px 24px', 
                borderRadius: '16px', 
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                border: '1px solid rgba(255,255,255,0.1)',
                cursor: 'pointer'
              }}>
                <span className="btn-icon">⏹️</span>
                <span className="btn-label">Stop</span>
              </button>
            </>
          ) : (
            <button 
              className="premium-btn start-btn" 
              onClick={findMatch}
              disabled={status === "waiting"}
            >
              <span className="btn-icon" style={{ fontSize: '20px' }}>⚡</span>
              <span className="btn-label" style={{ letterSpacing: '0.5px' }}>
                {status === "waiting" ? "Searching..." : "Start Matching"}
              </span>
            </button>
          )}
        </div>

        <div className="control-divider"></div>

        {/* Interaction Controls */}
        <div className="control-section flex-center">
          <button 
            className={`control-circle-btn chat-toggle-btn ${activeDrawer === 'chat' ? "active" : ""}`}
            onClick={toggleChat}
            title="Toggle Chat"
          >
            💬
            {activeDrawer !== 'chat' && <span className="notification-dot"></span>}
          </button>
        </div>

      </div>
    </div>
  );
}