import { Server } from "socket.io";
import { server } from "./index";
import { handleSocketConnection } from "./services/socketService";
import { logger } from "./utils/logger";

const PORT = process.env.PORT || 8000;

const io = new Server(server, {
  cors: {
    origin: "*", // Adjust this in production
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  handleSocketConnection(io, socket);
});

server.listen(PORT, () => {
  logger.success(`🚀 Server running on http://localhost:${PORT}`);
});
