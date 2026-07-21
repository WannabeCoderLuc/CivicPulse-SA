import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:3001";

let socket = null;

export function getSocket() {
  if (!socket) {
    console.log("INIT: Creating Socket.io connection to", SOCKET_URL);
    socket = io(SOCKET_URL, {
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socket.on("connect", () => {
      console.log(`SOCKET_CONNECTED: id=${socket.id}`);
      socket.emit("client:subscribe", { service: "CivicPulse SA Dashboard" });
    });

    socket.on("disconnect", (reason) => {
      console.log(`SOCKET_DISCONNECTED: reason=${reason}`);
    });

    socket.on("connect_error", (err) => {
      console.error(`ERR-SOCKET-001: Connection error. ${err.message}`);
    });

    socket.on("reconnect", (attempt) => {
      console.log(`SOCKET_RECONNECTED: attempt=${attempt}`);
    });

    socket.on("server:welcome", (data) => {
      console.log("SOCKET_WELCOME:", data.message);
    });
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    console.log("SOCKET_DISCONNECT: Manually disconnecting socket");
    socket.disconnect();
    socket = null;
  }
}

export function emitReportSubmitted(report) {
  console.log("ENTER: emitReportSubmitted", report.id);
  try {
    const s = getSocket();
    s.emit("client:reportSubmitted", report);
    console.log("SOCKET_EMIT_SENT: client:reportSubmitted");
  } catch (err) {
    console.error(`ERR-SOCKET-002: emitReportSubmitted failed. ${err.message}`);
  }
}

export function emitStatusUpdated(reportId, newStatus) {
  console.log(`ENTER: emitStatusUpdated reportId=${reportId} newStatus=${newStatus}`);
  try {
    const s = getSocket();
    s.emit("client:statusUpdated", { reportId, newStatus, timestamp: new Date().toISOString() });
    console.log("SOCKET_EMIT_SENT: client:statusUpdated");
  } catch (err) {
    console.error(`ERR-SOCKET-003: emitStatusUpdated failed. ${err.message}`);
  }
}
