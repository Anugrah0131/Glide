import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Messages() {
  useAuth();
  const navigate = useNavigate();

  const dummyMessages = [
    { id: 1, name: "Sarah Miller", lastMessage: "That was a great chat! Let's talk again.", time: "2m ago", unread: true, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" },
    { id: 2, name: "David Chen", lastMessage: "Sent you the link to the project.", time: "1h ago", unread: false, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David" },
    { id: 3, name: "Jessica Wong", lastMessage: "Haha, definitely! See you later.", time: "3h ago", unread: false, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica" },
    { id: 4, name: "Mike Ross", lastMessage: "Are you coming to the meet up?", time: "Yesterday", unread: false, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike" },
  ];

  return (
    <div className="messages-container animate-fade-in">
      <div className="messages-sidebar glass">
        <div className="sidebar-header">
          <h1>Direct Messages</h1>
          <div className="badge-count">3 New</div>
        </div>

        <div className="search-bar">
          <input type="text" placeholder="Search conversations..." className="glass" />
        </div>

        <div className="conversation-list">
          {dummyMessages.map((msg) => (
            <div key={msg.id} className={`conversation-item ${msg.unread ? 'unread' : ''}`}>
              <div className="avatar-wrapper">
                <img src={msg.avatar} alt={msg.name} className="convo-avatar" />
                <div className="status-indicator online"></div>
              </div>
              <div className="convo-details">
                <div className="convo-top">
                  <span className="convo-name">{msg.name}</span>
                  <span className="convo-time">{msg.time}</span>
                </div>
                <p className="convo-last-msg">{msg.lastMessage}</p>
              </div>
              {msg.unread && <div className="unread-dot"></div>}
            </div>
          ))}
        </div>
      </div>

      <div className="messages-view glass">
        <div className="empty-view">
          <div className="empty-visual">
            <div className="brand-logo" style={{ opacity: 0.2, transform: 'scale(1.5)' }}>G</div>
          </div>
          <h2>Your Conversations</h2>
          <p>Choose a contact from the sidebar to view your message history or start a new conversation.</p>
          <button className="auth-btn-primary" style={{ padding: '0 32px' }} onClick={() => navigate("/video")}>
            Start Video Chat
          </button>
        </div>
      </div>
    </div>
  );
}