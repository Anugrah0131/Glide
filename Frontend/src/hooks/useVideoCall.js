import { useState, useCallback, useEffect } from "react";
import useWebRTC from "./useWebRTC";

export default function useVideoCall({
  socket,
  socketReady,
  roomId,
  reconnectToNewPartner,
}) {
  const {
    localVideoRef,
    remoteVideoRef,
    peerConnectionRef,
    createPeerConnection,
    initMedia,
    addIceCandidate,
    flushCandidateQueue,
    cleanupAll,
    mediaError,
    isMediaReady,
  } = useWebRTC(socket, reconnectToNewPartner);

  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);

  const toggleMic = useCallback(() => {
    const stream = localVideoRef.current?.srcObject;
    if (!stream) return;

    stream.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });

    setMicEnabled((prev) => !prev);
  }, [localVideoRef]);

  const toggleCamera = useCallback(() => {
    const stream = localVideoRef.current?.srcObject;
    if (!stream) return;

    stream.getVideoTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });

    setCameraEnabled((prev) => !prev);
  }, [localVideoRef]);

  const initiateCall = useCallback(
    async (targetRoomId) => {
      const activeRoomId = targetRoomId || roomId;
      if (!peerConnectionRef.current) return;

      try {
        const offer = await peerConnectionRef.current.createOffer();
        await peerConnectionRef.current.setLocalDescription(offer);

        if (socket) {
          socket.emit("create_offer", { roomId: activeRoomId, offer });
        }
      } catch (err) {
        console.error("Error creating offer:", err);
      }
    },
    [peerConnectionRef, socket, roomId]
  );

  const handleOffer = useCallback(
    async (data) => {
      if (!peerConnectionRef.current || !data?.offer) return;

      try {
        await peerConnectionRef.current.setRemoteDescription(
          new RTCSessionDescription(data.offer)
        );

        await flushCandidateQueue();

        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);

        if (socket) {
          socket.emit("create_answer", {
            roomId: data.roomId,
            answer,
          });
        }
      } catch (err) {
        console.error("Error handling offer:", err);
      }
    },
    [peerConnectionRef, socket, flushCandidateQueue]
  );

  const handleAnswer = useCallback(
    async (data) => {
      if (!peerConnectionRef.current || !data?.answer) return;

      try {
        await peerConnectionRef.current.setRemoteDescription(
          new RTCSessionDescription(data.answer)
        );

        await flushCandidateQueue();
      } catch (err) {
        console.error("Error handling answer:", err);
      }
    },
    [peerConnectionRef, flushCandidateQueue]
  );

  const handleIceCandidate = useCallback(
    async (data) => {
      if (!data?.candidate) return;

      try {
        const candidate = new RTCIceCandidate(data.candidate);
        await addIceCandidate(candidate);
      } catch (err) {
        console.error("Error handling ICE candidate:", err);
      }
    },
    [addIceCandidate]
  );

  const resetPeerConnection = useCallback(() => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    const video = remoteVideoRef.current;
    if (video) {
      video.pause();
      video.srcObject = null;
      video.removeAttribute("src");
      video.load();
      video.style.opacity = 0;
    }
  }, [peerConnectionRef, remoteVideoRef]);

  useEffect(() => {
    if (!socketReady || !socket) return;

    initMedia();

    socket.on("offer_created", handleOffer);
    socket.on("answer_created", handleAnswer);
    socket.on("ice_candidate", handleIceCandidate);

    return () => {
      cleanupAll();
      socket.off("offer_created", handleOffer);
      socket.off("answer_created", handleAnswer);
      socket.off("ice_candidate", handleIceCandidate);
    };
  }, [
    socketReady,
    socket,
    initMedia,
    cleanupAll,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
  ]);

  return {
    localVideoRef,
    remoteVideoRef,
    peerConnectionRef,
    mediaError,
    isMediaReady,
    micEnabled,
    cameraEnabled,
    toggleMic,
    toggleCamera,
    initMedia,
    createPeerConnection,
    initiateCall,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    resetPeerConnection,
    cleanupAll,
  };
}
