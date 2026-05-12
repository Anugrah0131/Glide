import React from "react";
import { Link } from "react-router-dom";

export default function HeaderBar({ user, partner, status }) {
  return (
    <header className="premium-header-bar glass-premium smooth-transition">
      <div className="header-left">
        <Link to="/video" className="header-logo">
          <div className="logo-icon-small">G</div>
          <span className="logo-text-small">GLIDE</span>
        </Link>
      </div>

      <div className="header-center">
        {status === "chatting" ? (
          <div className="connection-status chatting animate-fade-in">
            <span className="pulse-dot" style={{ background: '#22c55e' }}></span>
            <span className="status-label chatting-text">
              Connected with <strong>{partner?.username || "Stranger"}</strong>
            </span>
          </div>
        ) : status === "waiting" ? (
          <div className="connection-status waiting animate-fade-in">
            <div className="loader-dots"><span></span><span></span><span></span></div>
            <span className="status-label waiting-text">
              Looking for a match...
            </span>
          </div>
        ) : (
          <div className="connection-status idle animate-fade-in">
            <span className="status-label idle-text">
              System Ready
            </span>
          </div>
        )}
      </div>

      <div className="header-right">
        {user && (
          <Link to="/profile" className="header-user-v2 glass-premium">
            <div className="header-info">
              <span className="user-name">{user.username}</span>
              <span className="user-role">{user.isGuest ? 'Guest' : 'Pro'}</span>
            </div>
            <img src={user.avatar || "/default-avatar.png"} alt="avatar" className="header-avatar" />
          </Link>
        )}
      </div>
    </header>
  );
}


