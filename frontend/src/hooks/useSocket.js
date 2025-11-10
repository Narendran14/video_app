import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

export default function useSocket({ token, onConnect, onProgress, onResult }) {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!token) return;

    const socket = io(import.meta.env.VITE_SOCKET_URL || "http://127.0.0.1:5000", {
      auth: { token },
      transports: ["websocket"]
    });

    socketRef.current = socket;

    socket.on("connect", () => { if (onConnect) onConnect(socket.id); });
    socket.on("processing_progress", (data) => { if (onProgress) onProgress(data); });
    socket.on("analysis_result", (data) => { if (onResult) onResult(data); });

    return () => socket.disconnect();
  }, [token]);

  return socketRef;
}
