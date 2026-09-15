export function cleanupRoom(io, roomId) {
  if (!roomId) return;

  try {
    // Notify all users in the room that the partner left
    io.to(roomId).emit("partner_left");

    // Clear roomId for all sockets in this room to prevent stale states and ghost connections
    const clients = io.sockets.adapter.rooms.get(roomId);
    if (clients) {
      // Convert to Array to safely iterate while modifying room membership
      const clientArray = Array.from(clients);
      for (const clientId of clientArray) {
        const clientSocket = io.sockets.sockets.get(clientId);
        if (clientSocket) {
          try {
            clientSocket.leave(roomId);
            clientSocket.roomId = null;
          } catch (err) {
            console.error(`Error cleaning up socket ${clientId} in room ${roomId}:`, err);
          }
        }
      }
    }
  } catch (err) {
    console.error(`Error in cleanupRoom for room ${roomId}:`, err);
  }
}
