import { io, Socket } from "socket.io-client";

export interface RealtimeNotification {
  _id: string;
  userId: string;
  type:
    | "invoice_scheduled_sent"
    | "invoice_reminder_sent"
    | "invoice_paid"
    | "invoice_overdue"
    | "invoice_due_today"
    | "payment_failed";

  title: string;
  message: string;

  invoiceId?: string;
  paymentReference?: string;

  metadata?: Record<string, unknown>;

  isRead: boolean;
  createdAt: string;
  updatedAt?: string;
}

type NotificationCallback = (
  notification: RealtimeNotification,
) => void;

class NotificationSocketService {
  private socket: Socket | null = null;

  private notificationListeners = new Set<NotificationCallback>();

  private connectedListeners = new Set<() => void>();

  private disconnectedListeners = new Set<() => void>();

  /**
   * Connect to the NestJS notification WebSocket.
   */
  connect(userId: string) {
    if (!userId) {
      console.warn(
        "NotificationSocket: Cannot connect without a userId.",
      );
      return;
    }

    // Don't create another connection if one already exists
    if (this.socket?.connected) {
      return;
    }

    const apiUrl =
      import.meta.env.VITE_API_BASE_URL;

    this.socket = io(apiUrl, {
      transports: ["websocket"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    this.socket.on("connect", () => {
      console.log(
        "🔌 Notification WebSocket connected:",
        this.socket?.id,
      );

      /**
       * Tell the backend which user's notification room
       * this socket should join.
       */
      this.socket?.emit("joinNotifications", {
        userId,
      });

      this.connectedListeners.forEach((callback) => {
        callback();
      });
    });

    this.socket.on("notification", (notification) => {
      console.log(
        "🔔 New notification:",
        notification,
      );

      this.notificationListeners.forEach((callback) => {
        callback(notification);
      });
    });

    this.socket.on("disconnect", (reason) => {
      console.log(
        "🔌 Notification WebSocket disconnected:",
        reason,
      );

      this.disconnectedListeners.forEach((callback) => {
        callback();
      });
    });

    this.socket.on("connect_error", (error) => {
      console.error(
        "Notification WebSocket connection error:",
        error.message,
      );
    });
  }

  /**
   * Subscribe to new notifications.
   */
  onNotification(callback: NotificationCallback) {
    this.notificationListeners.add(callback);

    return () => {
      this.notificationListeners.delete(callback);
    };
  }

  /**
   * Listen for successful connections.
   */
  onConnect(callback: () => void) {
    this.connectedListeners.add(callback);

    return () => {
      this.connectedListeners.delete(callback);
    };
  }

  /**
   * Listen for disconnects.
   */
  onDisconnect(callback: () => void) {
    this.disconnectedListeners.add(callback);

    return () => {
      this.disconnectedListeners.delete(callback);
    };
  }

  /**
   * Disconnect the socket.
   *
   * Call this when the user logs out.
   */
  disconnect() {
    if (!this.socket) {
      return;
    }

    console.log(
      "🔌 Closing notification WebSocket",
    );

    this.socket.removeAllListeners();
    this.socket.disconnect();

    this.socket = null;
  }

  /**
   * Check whether the socket is connected.
   */
  isConnected() {
    return this.socket?.connected ?? false;
  }
}

export const notificationSocket =
  new NotificationSocketService();