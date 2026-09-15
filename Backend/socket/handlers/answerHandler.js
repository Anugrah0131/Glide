export default function handleAnswer(socket, { roomId, answer } = {}) {
  try {
    if (!roomId || !answer || !socket.roomId || socket.roomId !== roomId) {
      console.warn("⚠️ Invalid answer payload or room mismatch from socket:", socket.id);
      return;
    }

    socket.to(roomId).emit("answer_created", {
      roomId,
      answer,
    });
  } catch (err) {
    console.error("Error in handleAnswer:", err);
  }
}