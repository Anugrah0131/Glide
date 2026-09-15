import { useState, useEffect, useRef, useCallback } from "react";

export default function useChat({ socket, roomId }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);

  const typingTimeoutRef = useRef(null);
  const localTypingTimeoutRef = useRef(null);
  const roomIdRef = useRef(roomId);

  const [prevRoomId, setPrevRoomId] = useState(roomId);
  if (roomId !== prevRoomId) {
    setPrevRoomId(roomId);
    if (!roomId) {
      setMessages([]);
      setMessage("");
      setIsPartnerTyping(false);
    }
  }

  useEffect(() => {
    roomIdRef.current = roomId;
    if (!roomId) {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (localTypingTimeoutRef.current) clearTimeout(localTypingTimeoutRef.current);
    }
  }, [roomId]);

  const handleMessage = useCallback((data) => {
    setMessages((prev) => [
      ...prev,
      { ...data, isSelf: data.senderId === socket?.id }
    ]);

    // Auto-emit delivered status
    if (socket && data.senderId !== socket.id && roomIdRef.current) {
      socket.emit("message_delivered", {
        roomId: roomIdRef.current,
        msgId: data.id,
      });
    }
  }, [socket]);

  const handleStatusUpdate = useCallback(({ msgId, status }) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, status } : m))
    );
  }, []);

  const handlePartnerTyping = useCallback(() => {
    setIsPartnerTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsPartnerTyping(false);
    }, 3000);
  }, []);

  const handlePartnerStopTyping = useCallback(() => {
    setIsPartnerTyping(false);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  }, []);

  const onTyping = useCallback(() => {
    if (!socket || !roomId) return;

    if (!localTypingTimeoutRef.current) {
      socket.emit("typing", { roomId });
    }

    if (localTypingTimeoutRef.current) {
      clearTimeout(localTypingTimeoutRef.current);
    }

    localTypingTimeoutRef.current = setTimeout(() => {
      if (socket && roomId) {
        socket.emit("stop_typing", { roomId });
      }
      localTypingTimeoutRef.current = null;
    }, 2000);
  }, [socket, roomId]);

  const sendMessage = useCallback(() => {
    if (!socket || !roomId || !message.trim()) return;

    socket.emit("send_message", { roomId, message });
    socket.emit("stop_typing", { roomId });

    if (localTypingTimeoutRef.current) {
      clearTimeout(localTypingTimeoutRef.current);
      localTypingTimeoutRef.current = null;
    }

    setMessage("");
  }, [socket, roomId, message]);

  const sendVoiceMessage = useCallback((audioUrl) => {
    if (!socket || !roomId || !audioUrl) return;

    socket.emit("send_message", {
      roomId,
      message: "Voice Message",
      type: "audio",
      audioUrl,
    });
  }, [socket, roomId]);

  useEffect(() => {
    if (!socket) return;

    socket.on("receive_message", handleMessage);
    socket.on("partner_typing", handlePartnerTyping);
    socket.on("partner_stop_typing", handlePartnerStopTyping);
    socket.on("update_message_status", handleStatusUpdate);

    return () => {
      socket.off("receive_message", handleMessage);
      socket.off("partner_typing", handlePartnerTyping);
      socket.off("partner_stop_typing", handlePartnerStopTyping);
      socket.off("update_message_status", handleStatusUpdate);

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (localTypingTimeoutRef.current) clearTimeout(localTypingTimeoutRef.current);
    };
  }, [socket, handleMessage, handlePartnerTyping, handlePartnerStopTyping, handleStatusUpdate]);

  return {
    message,
    setMessage,
    messages,
    isPartnerTyping,
    sendMessage,
    sendVoiceMessage,
    onTyping,
  };
}
