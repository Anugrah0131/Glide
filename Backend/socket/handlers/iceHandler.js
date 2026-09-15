export default function handleIce(socket, { roomId, candidate } = {}) {
  try {
    if (!roomId || !candidate || !socket.roomId || socket.roomId !== roomId) {
      console.warn("⚠️ Invalid ICE candidate payload or room mismatch from socket:", socket.id);
      return;
    }

    socket.to(roomId).emit("ice_candidate", {
      candidate,
    });
  } catch (err) {
    console.error("Error in handleIce:", err);
  }
}