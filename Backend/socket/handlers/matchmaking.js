import { cleanupRoom } from "../../utils/cleanupRoom.js";

export default function handleMatch(io, socket, waitingQueue) {
  try {
    console.log("🔎 Match request from:", socket.id, socket.user?.userId || "Guest");

    // Filter out disconnected or invalid sockets from queue
    for (let i = waitingQueue.length - 1; i >= 0; i--) {
      if (!waitingQueue[i].connected || !waitingQueue[i].user) {
        waitingQueue.splice(i, 1);
      }
    }

    // Prevent duplicate entries by socket ID
    if (waitingQueue.some(s => s.id === socket.id)) {
      return;
    }

    // Prevent duplicate entries by userId for authenticated non-guest users (multi-tab isolation)
    if (socket.user && !socket.user.isGuest && socket.user.userId) {
      const existingIndex = waitingQueue.findIndex(
        s => s.user && !s.user.isGuest && s.user.userId === socket.user.userId
      );
      if (existingIndex !== -1) {
        // Remove older socket from queue if same user joins from another tab
        waitingQueue.splice(existingIndex, 1);
      }
    }

    // If already in a room, securely clean up both peers to avoid ghost connections
    if (socket.roomId) {
      cleanupRoom(io, socket.roomId);
    }

    console.log("⏳ Waiting for partner:", socket.id);
    waitingQueue.push(socket);

    if (waitingQueue.length >= 2) {
      let u1Index = 0;
      let u2Index = 1;

      // Ensure user doesn't match with themselves (same userId across multiple tabs)
      if (
        socket.user &&
        !socket.user.isGuest &&
        waitingQueue[u1Index].user?.userId === waitingQueue[u2Index].user?.userId
      ) {
        if (waitingQueue.length > 2) {
          u2Index = 2;
        } else {
          // Only same user's tabs in queue, wait for another partner
          return;
        }
      }

      // Avoid matching immediate past partners if more than 2 users are waiting
      if (waitingQueue[u1Index].lastPartner === waitingQueue[u2Index].id) {
        if (waitingQueue.length > 2 && u2Index === 1) {
          u2Index = 2;
        }
      }

      const user1 = waitingQueue.splice(u1Index, 1)[0];
      const user2 = waitingQueue.splice(u2Index - 1, 1)[0];

      if (!user1 || !user2) return;

      user1.lastPartner = user2.id;
      user2.lastPartner = user1.id;

      const roomId = `${user1.id}#${user2.id}`;

      user1.join(roomId);
      user2.join(roomId);

      user1.roomId = roomId;
      user2.roomId = roomId;

      console.log("✅ Match found:", roomId);

      io.to(user1.id).emit("match_found", {
        roomId,
        initiator: true,
        partner: {
          username: user2.user?.username || "Stranger",
          avatar: user2.user?.avatar,
        },
      });

      io.to(user2.id).emit("match_found", {
        roomId,
        initiator: false,
        partner: {
          username: user1.user?.username || "Stranger",
          avatar: user1.user?.avatar,
        },
      });
    }
  } catch (err) {
    console.error("Error in handleMatch:", err);
  }
}