import { cleanupRoom } from "../../utils/cleanupRoom.js";

export default function handleSkip(io, socket) {
  try {
    console.log("⏭ Skip by:", socket.id);

    if (socket.roomId) {
      cleanupRoom(io, socket.roomId);
    }
  } catch (err) {
    console.error("Error in handleSkip:", err);
  }
}