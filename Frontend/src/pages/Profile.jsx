import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="profile-container animate-fade-in">
      <div className="profile-card-premium glass-premium premium-shadow">
        <div className="profile-header-v3">
          <div className="profile-avatar-wrapper">
            <div className="avatar-glow"></div>
            <img src={user.avatar || "/default-avatar.png"} alt="User Avatar" className="profile-avatar-img" />
            <div className={`status-badge-v3 ${user.isGuest ? 'guest' : 'online'}`}>
              {user.isGuest ? 'Guest' : 'Online'}
            </div>
          </div>
          <h1 className="profile-name-v3">{user.username}</h1>
          <p className="profile-role-v3">
            {user.isGuest ? "Guest Explorer" : "Premium Member"}
          </p>
        </div>

        <div className="profile-stats-grid glass-dark">
          <div className="stat-box">
            <span className="stat-number">124</span>
            <span className="stat-label">Conversations</span>
          </div>
          <div className="stat-box">
            <span className="stat-number">4.9</span>
            <span className="stat-label">User Rating</span>
          </div>
          <div className="stat-box">
            <span className="stat-number">12</span>
            <span className="stat-label">Total Friends</span>
          </div>
        </div>

        <div className="profile-info-section">
          <div className="info-row glass-dark">
            <div className="info-label">
              <span className="info-icon">🆔</span>
              User ID
            </div>
            <div className="info-value">{user.userId}</div>
          </div>
          {!user.isGuest && (
            <div className="info-row glass-dark">
              <div className="info-label">
                <span className="info-icon">📧</span>
                Email
              </div>
              <div className="info-value">{user.email || "N/A"}</div>
            </div>
          )}
          <div className="info-row glass-dark">
            <div className="info-label">
              <span className="info-icon">📅</span>
              Joined
            </div>
            <div className="info-value">April 2026</div>
          </div>
        </div>

        <div className="profile-actions-v3">
          <button className="profile-btn primary">Edit Profile</button>
          <button className="profile-btn secondary" onClick={handleRefresh}>Reload</button>
          <button className="profile-btn danger" onClick={handleLogout}>
            {user.isGuest ? "Exit Guest" : "Sign Out"}
          </button>
        </div>
        
        {user.isGuest && (
          <div className="upgrade-banner-v3 glass-premium">
            <div className="upgrade-info">
              <h3>Unlock Premium Features</h3>
              <p>Save your history, add friends, and customize your profile.</p>
            </div>
            <button className="upgrade-action-btn" onClick={() => navigate("/register")}>
              Join Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}