import React from "react";

export default function MessageBubble({ msg, isSelf }) {
  const time = new Date(msg.timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <div className={`message-item ${isSelf ? "self" : "partner"}`}>
      {!isSelf && (
        <div className="message-avatar">
          <img 
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.senderName || "Stranger"}`} 
            alt="avatar" 
          />
        </div>
      )}
      
      <div className="message-bubble-content">
        <div className={`bubble-main ${isSelf ? "glass-premium" : "glass-dark"}`}>
          {msg.type === "audio" ? (
            <div className="voice-message-player">
              <span className="voice-icon">🔊</span>
              <div className="voice-wave">
                <span style={{ height: '12px', opacity: 0.5 }}></span>
                <span style={{ height: '20px' }}></span>
                <span style={{ height: '14px', opacity: 0.7 }}></span>
                <span style={{ height: '18px' }}></span>
              </div>
              <audio src={msg.audioUrl} controls className="hidden-audio" style={{ display: 'none' }} />
            </div>
          ) : (
            <p className="message-text">{msg.message}</p>
          )}
          
          <div className="bubble-metadata">
            <span className="message-time">{time}</span>
            {isSelf && (
              <span className={`status-ticks ${msg.status || 'sent'}`}>
                {msg.status === "delivered" || msg.status === "seen" ? "✓✓" : "✓"}
              </span>
            )}
          </div>
        </div>
      </div>

      {isSelf && (
        <div className="message-avatar">
          <img 
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.senderName || "You"}`} 
            alt="avatar" 
          />
        </div>
      )}
    </div>
  );
}


