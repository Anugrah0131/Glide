export default function handleOffer(socket, { roomId, offer } = {}) {
  try {
    if (!roomId || !offer || !socket.roomId || socket.roomId !== roomId) {
      console.warn("⚠️ Invalid offer payload or room mismatch from socket:", socket.id);
      return;
    }

    socket.to(roomId).emit("offer_created", {
      roomId,
      offer,
    });
  } catch (err) {
    console.error("Error in handleOffer:", err);
  }
}