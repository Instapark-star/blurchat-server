import { Server, Socket } from "socket.io";
import { addUserToQueue, removeUserFromQueue } from "../services/matchmakingService";

// We store active matches here: socketId -> partnerSocketId
const activeMatches: Map<string, string> = new Map();

/**
 * Register all chat + matchmaking handlers for a connected socket
 */
export function registerChatHandlers(io: Server, socket: Socket) {
  console.log(`🟢 Socket connected: ${socket.id}`);

  /**
   * User requests matchmaking
   */
  socket.on("find_partner", () => {
    const partner = addUserToQueue(socket.id);

    if (partner) {
      // Save both users as matched
      activeMatches.set(socket.id, partner);
      activeMatches.set(partner, socket.id);

      // Notify both users
      io.to(socket.id).emit("partner_found", { partnerId: partner });
      io.to(partner).emit("partner_found", { partnerId: socket.id });

      console.log(`🤝 Match created: ${socket.id} <-> ${partner}`);
    } else {
      console.log(`⏳ ${socket.id} is waiting for a partner...`);
    }
  });

  /**
   * Relay messages between matched partners
   */
  socket.on("send_message", (message: string) => {
    const partnerId = activeMatches.get(socket.id);

    if (partnerId) {
      io.to(partnerId).emit("receive_message", {
        from: socket.id,
        message,
      });
      console.log(`💬 ${socket.id} -> ${partnerId}: ${message}`);
    } else {
      socket.emit("error_message", "⚠️ You are not connected to a partner.");
    }
  });

  /**
   * Handle disconnects
   */
  socket.on("disconnect", () => {
    console.log(`❌ Disconnected: ${socket.id}`);

    // Remove from queue if waiting
    removeUserFromQueue(socket.id);

    // Notify partner if matched
    const partnerId = activeMatches.get(socket.id);
    if (partnerId) {
      io.to(partnerId).emit("partner_disconnected");
      activeMatches.delete(partnerId);
      console.log(`🔴 Notified ${partnerId} that partner left.`);
    }

    activeMatches.delete(socket.id);
  });
}
