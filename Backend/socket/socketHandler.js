import handleMatch from "./handlers/matchmaking.js";
import handleOffer from "./handlers/offerHandler.js";
import handleAnswer from "./handlers/answerHandler.js";
import handleIce from "./handlers/iceHandler.js";
import handleMessage from "./handlers/messageHandler.js";
import handleSkip from "./handlers/skipHandler.js";
import { cleanupRoom } from "../utils/cleanupRoom.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import User from "../models/User.js";

let waitingQueue = [];

export default function socketHandler(io) {

  io.on("connection", (socket) => {

    console.log("🟢 New socket connected:", socket.id);

    // Authentication Timeout: disconnect unauthenticated sockets after 15 seconds
    const authTimeout = setTimeout(() => {
      if (!socket.user) {
        console.log("⏰ Auth timeout: disconnecting unauthenticated socket", socket.id);
        try {
          socket.disconnect(true);
        } catch (err) {
          console.error("Error disconnecting socket on auth timeout:", err);
        }
      }
    }, 15000);

    // 1. user:join
    socket.on("user:join", async (data = {}) => {
      try {
        const { token, userId, username, isGuest } = data;

        let userData = null;

        if (token) {
          const decoded = verifyToken(token);

          if (!decoded) {
            console.log("❌ Invalid token - disconnecting");
            clearTimeout(authTimeout);
            return socket.disconnect(true);
          }

          userData = {
            userId: decoded.userId,
            username: username || "Authenticated User",
            isGuest: false,
          };

          // Update DB status to online
          try {
            await User.findByIdAndUpdate(decoded.userId, { status: "online" });
          } catch (dbErr) {
            console.error("Failed to set user online status:", dbErr);
          }

        } else {
          // Guest User
          userData = {
            userId: userId || `guest_${socket.id}`,
            username: username || "Guest",
            isGuest: true,
          };
        }

        socket.user = userData;
        clearTimeout(authTimeout);
        console.log("✅ User authenticated:", socket.user);

        // Notify client of successful join
        socket.emit("user_profile", socket.user);

      } catch (err) {
        console.error("Auth error in socket:", err);
        clearTimeout(authTimeout);
        socket.disconnect(true);
      }
    });

    // ⚠️ BLOCK actions until auth is ready
    const requireAuth = (callback) => {
      return (...args) => {
        if (!socket.user) {
          console.log("⛔ Action blocked: user not authenticated");
          return;
        }
        callback(...args);
      };
    };

    // 2. find_match
    socket.on("find_match", requireAuth(() => {
      waitingQueue = waitingQueue.filter(s => s && s.connected && s.user);
      handleMatch(io, socket, waitingQueue);
    }));

    // 3. create_offer
    socket.on("create_offer", requireAuth((data = {}) => {
      if (!data.roomId || !data.offer) {
        console.warn("⚠️ Rejected malformed create_offer payload from", socket.id);
        return;
      }
      handleOffer(socket, data);
    }));

    // 4. create_answer
    socket.on("create_answer", requireAuth((data = {}) => {
      if (!data.roomId || !data.answer) {
        console.warn("⚠️ Rejected malformed create_answer payload from", socket.id);
        return;
      }
      handleAnswer(socket, data);
    }));

    // 5. ice_candidate
    socket.on("ice_candidate", requireAuth((data = {}) => {
      if (!data.roomId || !data.candidate) {
        console.warn("⚠️ Rejected malformed ice_candidate payload from", socket.id);
        return;
      }
      handleIce(socket, data);
    }));

    // 6. send_message
    socket.on("send_message", requireAuth((data = {}) => {
      if (!data.roomId || !data.message) {
        console.warn("⚠️ Rejected malformed send_message payload from", socket.id);
        return;
      }
      handleMessage(io, socket, data);
    }));

    // 7. typing
    socket.on("typing", requireAuth((data = {}) => {
      if (!data.roomId) return;
      const targetRoom = socket.roomId;
      if (!targetRoom || targetRoom !== data.roomId) return;
      socket.to(targetRoom).emit("partner_typing", { username: socket.user?.username || "Stranger" });
    }));

    // 8. stop_typing
    socket.on("stop_typing", requireAuth((data = {}) => {
      if (!data.roomId) return;
      const targetRoom = socket.roomId;
      if (!targetRoom || targetRoom !== data.roomId) return;
      socket.to(targetRoom).emit("partner_stop_typing");
    }));

    // 9. message_delivered
    socket.on("message_delivered", requireAuth((data = {}) => {
      if (!data.roomId || !data.msgId) return;
      const targetRoom = socket.roomId;
      if (!targetRoom || targetRoom !== data.roomId) return;
      socket.to(targetRoom).emit("update_message_status", { msgId: data.msgId, status: "delivered" });
    }));

    // 10. message_seen
    socket.on("message_seen", requireAuth((data = {}) => {
      if (!data.roomId || !data.msgId) return;
      const targetRoom = socket.roomId;
      if (!targetRoom || targetRoom !== data.roomId) return;
      socket.to(targetRoom).emit("update_message_status", { msgId: data.msgId, status: "seen" });
    }));

    // 11. skip
    socket.on("skip", requireAuth(() => {
      const queueIndex = waitingQueue.findIndex(s => s.id === socket.id);
      if (queueIndex !== -1) waitingQueue.splice(queueIndex, 1);

      handleSkip(io, socket);
    }));

    // 12. leave_room
    socket.on("leave_room", requireAuth(() => {
      const queueIndex = waitingQueue.findIndex(s => s.id === socket.id);
      if (queueIndex !== -1) waitingQueue.splice(queueIndex, 1);

      if (socket.roomId) {
        cleanupRoom(io, socket.roomId);
      }
      socket.roomId = null;
    }));

    // 13. disconnect
    socket.on("disconnect", async () => {
      clearTimeout(authTimeout);
      console.log("🔴 Disconnected:", socket.id, socket.user?.userId);

      // remove from queue
      waitingQueue = waitingQueue.filter((s) => s && s.id !== socket.id);

      // cleanup room
      if (socket.roomId) {
        cleanupRoom(io, socket.roomId);
      }
      
      // Update DB status
      if (socket.user && !socket.user.isGuest && socket.user.userId) {
        try {
          await User.findByIdAndUpdate(socket.user.userId, { status: "offline", lastLogin: Date.now() });
        } catch (err) {
          console.error("Failed to update status on disconnect:", err);
        }
      }
    });

  });

}