import { io, Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL;

let socket: Socket | null = null;

export interface NotificationPayload {
  _id?: string;
  userId?: string;
  type?: string;
  title?: string;
  message?: string;
  invoiceId?: string;
  paymentReference?: string;
  metadata?: Record<string, any>;
  isRead?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export function connectNotificationSocket(
  onNotification?: (notification: NotificationPayload) => void,
) {
  const token = localStorage.getItem("token");

  if (!token) {
    console.warn(
      "No authentication token found. Notification socket not connected.",
    );

    return null;
  }

  // Already connected
  if (socket?.connected) {
    if (onNotification) {
      socket.off("notification");
      socket.on("notification", onNotification);
    }

    return socket;
  }

  socket = io(`${SOCKET_URL}/notifications`, {
    auth: {
      token,
    },
    transports: ["websocket"],
  });

  socket.on("connect", () => {
    console.log(
      "Connected to Cape notifications:",
      socket?.id,
    );
  });

  socket.on("notification", (notification: NotificationPayload) => {
    console.log(
      "New Cape notification:",
      notification,
    );

    if (onNotification) {
      onNotification(notification);
    }
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

export function getNotificationSocket() {
  return socket;
}

export function disconnectNotificationSocket() {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}