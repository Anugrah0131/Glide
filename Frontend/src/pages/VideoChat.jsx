import React, { useState, useEffect, useCallback, useRef } from "react";
import { connectSocket } from "../hooks/useSocket";
import useVideoCall from "../hooks/useVideoCall";
import useMatchmaking from "../hooks/useMatchmaking";
import ControlBar from "../components/video/ControlBar";
import VideoSection from "../components/video/VideoSection";
import ChatPanel from "../components/chat/ChatPanel";
import HeaderBar from "../components/layout/HeaderBar";
import RightPanelDrawer from "../components/layout/RightPanelDrawer";
import { useAuth } from "../hooks/useAuth";
import useChat from "../hooks/useChat";

export default function VideoChat() {

  const { user } = useAuth();

  useEffect(() => {
    document.title = "Glide | Live Video Chat";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Instantly connect with random people via video chat on Glide.");
    }
  }, []);

  const [socket, setSocket] = useState(null);
  const [socketReady, setSocketReady] = useState(false);

  // Drawer State
  const [activeDrawer, setActiveDrawer] = useState(null); // null, 'chat', 'participants'

  const reconnectToNewPartnerRef = useRef(null);

  const handleReconnectTrigger = useCallback(() => {
    if (reconnectToNewPartnerRef.current) {
      reconnectToNewPartnerRef.current();
    }
  }, []);

  const {
    localVideoRef,
    remoteVideoRef,
    mediaError,
    micEnabled,
    cameraEnabled,
    toggleMic,
    toggleCamera,
    createPeerConnection,
    initiateCall,
    resetPeerConnection,
  } = useVideoCall({
    socket,
    socketReady,
    reconnectToNewPartner: handleReconnectTrigger,
  });

  const {
    status,
    roomId,
    partner,
    findMatch,
    skipChat,
    stopChat,
    reconnectToNewPartner,
  } = useMatchmaking({
    socket,
    socketReady,
    createPeerConnection,
    initiateCall,
    resetPeerConnection,
  });

  useEffect(() => {
    reconnectToNewPartnerRef.current = reconnectToNewPartner;
  }, [reconnectToNewPartner]);

  const {
    message,
    setMessage,
    messages,
    isPartnerTyping,
    sendMessage,
    sendVoiceMessage,
    onTyping,
  } = useChat({ socket, roomId });

  // ✅ CONNECT SOCKET PROPERLY
  useEffect(() => {
    if (!user) {
      console.log("⛔ No user yet");
      return;
    }

    console.log("👤 User:", user);

    const s = connectSocket(user);
    if (!s) return;

    // 🔥 WAIT FOR REAL CONNECTION
    const handleConnect = () => {
      console.log("🟢 Socket connected:", s.id);
      setSocket(s);
      setSocketReady(true);
    };

    const handleError = (err) => {
      console.error("❌ Socket error:", err);
    };

    s.on("connect", handleConnect);
    s.on("connect_error", handleError);

    return () => {
      s.off("connect", handleConnect);
      s.off("connect_error", handleError);
    };

  }, [user]);

  return (
    <div className={`immersive-layout ${status}`}>
      <HeaderBar user={user} partner={partner} status={status} />

      <div className="layout-glow-top"></div>
      <div className="layout-glow-bottom"></div>

      <main className="immersive-main">
        <div className={`video-area-wrapper ${activeDrawer ? "drawer-open" : ""}`}>
          <VideoSection 
            localVideoRef={localVideoRef}
            remoteVideoRef={remoteVideoRef}
            status={status}
            user={user}
            partner={partner}
            cameraEnabled={cameraEnabled}
          />
          
          <div className="controls-overlay">
            <ControlBar 
              status={status}
              findMatch={findMatch}
              skipChat={skipChat}
              stopChat={stopChat}
              toggleMic={toggleMic}
              toggleCamera={toggleCamera}
              micEnabled={micEnabled}
              cameraEnabled={cameraEnabled}
              activeDrawer={activeDrawer}
              toggleChat={() => setActiveDrawer(prev => prev === 'chat' ? null : 'chat')}
            />
          </div>
        </div>

        <RightPanelDrawer 
          isOpen={!!activeDrawer} 
          onClose={() => setActiveDrawer(null)}
          title={activeDrawer === 'chat' ? "Live Chat" : "Participants"}
        >
          {activeDrawer === 'chat' && (
            <ChatPanel 
              messages={messages}
              message={message}
              setMessage={setMessage}
              sendMessage={sendMessage}
              isPartnerTyping={isPartnerTyping}
              partnerUsername={partner?.username || "Stranger"}
              onTyping={onTyping}
              sendVoiceMessage={sendVoiceMessage}
            />
          )}
        </RightPanelDrawer>
      </main>

      {mediaError && (
        <div className="error-overlay glass-dark flex-center animate-fade-in">
          <div className="auth-card-v2 glass premium-shadow" style={{ textAlign: 'center', maxWidth: '440px' }}>
            <div className="brand-logo" style={{ background: 'var(--accent)', marginBottom: '32px' }}>!</div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'white', marginBottom: '16px' }}>
              Media Access Required
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '32px', lineHeight: 1.6 }}>
              {mediaError}
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="auth-btn-primary"
              style={{ width: '100%' }}
            >
              Retry Access
            </button>
          </div>
        </div>
      )}
    </div>
  );
}