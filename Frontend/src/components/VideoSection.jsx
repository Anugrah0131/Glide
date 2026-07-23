import React from "react";

export default function VideoSection({
  localVideoRef,
  remoteVideoRef,
  status,
  partner,
  cameraEnabled
}) {
  const isIdle = status === "idle";
  const isWaiting = status === "waiting";
  const isChatting = status === "chatting";

  return (
    <section className={`vs-root ${status}`}>

      {/* ── IDLE STATE ─────────────────────────────── */}
      {isIdle && (
        <div className="vs-idle-screen animate-fade-in">
          <div className="vs-idle-orb">
            <div className="vs-idle-ring r1"></div>
            <div className="vs-idle-ring r2"></div>
            <div className="vs-idle-ring r3"></div>
            <div className="vs-idle-logo">G</div>
          </div>
          <h1 className="vs-idle-title">Glide Video Chat</h1>
          <p className="vs-idle-sub">Connect with strangers in real-time. Hit <strong>Start</strong> to begin.</p>
          <div className="vs-idle-badges">
            <span>✨ HD Quality</span>
            <span>🛡️ Anonymous</span>
            <span>⚡ Instant</span>
          </div>
        </div>
      )}

      {/* ── WAITING STATE ───────────────────────────── */}
      {isWaiting && (
        <div className="vs-waiting-screen animate-fade-in">
          <div className="vs-radar">
            <div className="vs-radar-ring rr1"></div>
            <div className="vs-radar-ring rr2"></div>
            <div className="vs-radar-ring rr3"></div>
            <div className="vs-radar-sweep"></div>
            <div className="vs-radar-dot"></div>
          </div>
          <h2 className="vs-waiting-title">Scanning the Globe</h2>
          <p className="vs-waiting-sub">Looking for someone interesting…</p>
          <div className="vs-waiting-ticker">
            <span className="vs-ticker-dot"></span>
            Matching in progress
          </div>
        </div>
      )}

      {/* ── CHATTING STATE — SPLIT LAYOUT ───────────── */}
      {isChatting && (
        <div className="vs-split animate-fade-in">

          {/* === LEFT: STRANGER SPOTLIGHT === */}
          <div className="vs-stranger-panel">
            {/* Cinematic top & bottom fade */}
            <div className="vs-cinema-bars"></div>

            {/* Corner neon border animation */}
            <div className="vs-neon-frame">
              <span className="nf-tl"></span>
              <span className="nf-tr"></span>
              <span className="nf-bl"></span>
              <span className="nf-br"></span>
            </div>

            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="vs-remote-feed"
            />

            {/* LIVE badge */}
            <div className="vs-live-badge">
              <span className="vs-pulse-dot"></span>
              LIVE
            </div>

            {/* Stranger identity */}
            <div className="vs-stranger-id">
              <div className="vs-stranger-avatar">
                {(partner?.username || "S").charAt(0).toUpperCase()}
              </div>
              <div className="vs-stranger-info">
                <span className="vs-stranger-name">{partner?.username || "Stranger"}</span>
                <span className="vs-stranger-status">● Connected</span>
              </div>
            </div>

            {/* Scanning effect line */}
            <div className="vs-scan-line"></div>
          </div>

          {/* === RIGHT: LOCAL CAMERA === */}
          <div className="vs-local-panel">
            <div className="vs-local-header">
              <span className="vs-local-label">You</span>
              {!cameraEnabled && <span className="vs-cam-off-badge">CAM OFF</span>}
            </div>

            <div className={`vs-local-video-wrap ${!cameraEnabled ? "cam-off" : ""}`}>
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="vs-local-feed"
              />
              {!cameraEnabled && (
                <div className="vs-cam-placeholder">
                  <span>📷</span>
                  <p>Camera Off</p>
                </div>
              )}
            </div>

            {/* Session stats */}
            <div className="vs-session-stats">
              <div className="vs-stat-item">
                <span className="vs-stat-icon">🔐</span>
                <span>Encrypted</span>
              </div>
              <div className="vs-stat-divider"></div>
              <div className="vs-stat-item">
                <span className="vs-stat-icon">⚡</span>
                <span>P2P Direct</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ── LOCAL PIP for idle/waiting (still show your cam) ── */}
      {!isChatting && (
        <div className={`vs-pip-corner ${!cameraEnabled ? "cam-off" : ""}`}>
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="vs-pip-feed"
          />
          {!cameraEnabled && (
            <div className="vs-pip-placeholder">📷</div>
          )}
          <span className="vs-pip-label">You</span>
        </div>
      )}

    </section>
  );
}