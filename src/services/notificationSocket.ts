import { io, Socket } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_API_BASE_URL;

let socket: Socket | null = null;

export function connectNotificationSocket() {
  const token = localStorage.getItem("token");

  if (!token) {
    console.warn("No authentication token found.");
    return null;
  }

  if (socket?.connected) {
    return socket;
  }

  socket = io(`${SOCKET_URL}/notifications`, {
    auth: {
      token,
    },
    transports: ["websocket"],
  });

  socket.on("connect", () => {
    console.log("Connected to Cape notifications");
  });

  socket.on("disconnect", () => {
    console.log("Disconnected from Cape notifications");
  });

  socket.on("connect_error", (error) => {
    console.error(
      "Notification WebSocket error:",
      error.message,
    );
  });

  return socket;
}

export function getNotificationSocket() {
  return socket;
}

export function disconnectNotificationSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}