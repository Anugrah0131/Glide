import { useState, useEffect, useCallback, useRef } from "react";

export default function useMatchmaking({
  socket,
  socketReady,
  createPeerConnection,
  initiateCall,
  resetPeerConnection,
}) {
  const [status, setStatus] = useState("idle");
  const [roomId, setRoomId] = useState("");
  const [partner, setPartner] = useState(null);

  const reconnectTimeout = useRef(null);
  const currentRoomIdRef = useRef(null);

  const resetState = useCallback(() => {
    if (!socket) return;

    currentRoomIdRef.current = null;

    if (resetPeerConnection) {
      resetPeerConnection();
    }

    setStatus("idle");
    setRoomId("");
    setPartner(null);
  }, [socket, resetPeerConnection]);

  const reconnectToNewPartner = useCallback(() => {
    if (!socket) return;

    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
    }

    resetState();
    setStatus("waiting");

    reconnectTimeout.current = setTimeout(() => {
      if (currentRoomIdRef.current) return;
      socket.emit("find_match");
      reconnectTimeout.current = null;
    }, 600);
  }, [socket, resetState]);

  const handleMatchFound = useCallback(
    async ({ roomId: matchedRoomId, initiator, partner: matchedPartner }) => {
      console.log("MATCH FOUND PARTNER:", matchedPartner);
      setPartner(matchedPartner);

      currentRoomIdRef.current = matchedRoomId;
      setRoomId(matchedRoomId);
      setStatus("chatting");

      if (createPeerConnection) {
        createPeerConnection(matchedRoomId);
      }

      if (initiator && initiateCall) {
        await initiateCall(matchedRoomId);
      }
    },
    [createPeerConnection, initiateCall]
  );

  const handlePartnerLeft = useCallback(() => {
    reconnectToNewPartner();
  }, [reconnectToNewPartner]);

  const handleResetChat = useCallback(() => {
    reconnectToNewPartner();
  }, [reconnectToNewPartner]);

  // ✅ SOCKET LISTENERS FOR MATCHMAKING
  useEffect(() => {
    if (!socketReady || !socket) return;

    socket.on("match_found", handleMatchFound);
    socket.on("partner_left", handlePartnerLeft);
    socket.on("reset_chat", handleResetChat);

    return () => {
      socket.off("match_found", handleMatchFound);
      socket.off("partner_left", handlePartnerLeft);
      socket.off("reset_chat", handleResetChat);
    };
  }, [socketReady, socket, handleMatchFound, handlePartnerLeft, handleResetChat]);

  // ✅ PRESERVE EXISTING BEFOREUNLOAD LOGIC
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (socket && currentRoomIdRef.current) {
        socket.emit("leave_room", { roomId: currentRoomIdRef.current });
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [socket]);

  const findMatch = useCallback(() => {
    if (!socketReady || status !== "idle") return;
    resetState();
    setStatus("waiting");
    socket.emit("find_match");
  }, [socketReady, status, resetState, socket]);

  const skipChat = useCallback(() => {
    if (!roomId) {
      reconnectToNewPartner();
      return;
    }
    socket.emit("skip");
    reconnectToNewPartner();
  }, [roomId, reconnectToNewPartner, socket]);

  const stopChat = useCallback(() => {
    if (roomId) socket.emit("leave_room", { roomId });
    resetState();
  }, [roomId, resetState, socket]);

  return {
    status,
    roomId,
    partner,
    findMatch,
    skipChat,
    stopChat,
    reconnectToNewPartner,
    resetState,
  };
}
