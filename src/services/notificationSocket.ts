import { io, type Socket } from "socket.io-client";

export interface NotificationPayload {
  _id?: string;
  userId?: string;
  type?: string;
  title: string;
  message: string;
  invoiceId?: string;
  paymentReference?: string;
  metadata?: Record<string, unknown>;
  isRead?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL;

let socket: Socket | null = null;

export function connectNotificationSocket(): Socket | null {
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
    console.log("Connected to Cape notifications:", socket?.id);
  });

  socket.on("disconnect", (reason) => {
    console.log(
      "Disconnected from Cape notifications:",
      reason,
    );
  });

  socket.on("connect_error", (error) => {
    console.error(
      "Notification WebSocket error:",
      error.message,
    );
  });

  return socket;
}

export function getNotificationSocket(): Socket | null {
  return socket;
}

export function disconnectNotificationSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
