<<<<<<< HEAD
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
=======
import { io, Socket } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_API_BASE_URL;

let socket: Socket | null = null;

export function connectNotificationSocket() {
>>>>>>> d56a850 (Websocket integration)
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
<<<<<<< HEAD
    console.log("Connected to Cape notifications:", socket?.id);
  });

  socket.on("disconnect", (reason) => {
    console.log(
      "Disconnected from Cape notifications:",
      reason,
    );
=======
    console.log("Connected to Cape notifications");
  });

  socket.on("disconnect", () => {
    console.log("Disconnected from Cape notifications");
>>>>>>> d56a850 (Websocket integration)
  });

  socket.on("connect_error", (error) => {
    console.error(
      "Notification WebSocket error:",
      error.message,
    );
  });

  return socket;
}

<<<<<<< HEAD
export function getNotificationSocket(): Socket | null {
  return socket;
}

export function disconnectNotificationSocket(): void {
=======
export function getNotificationSocket() {
  return socket;
}

export function disconnectNotificationSocket() {
>>>>>>> d56a850 (Websocket integration)
  if (socket) {
    socket.disconnect();
    socket = null;
  }
<<<<<<< HEAD
}
=======
}
>>>>>>> d56a850 (Websocket integration)
