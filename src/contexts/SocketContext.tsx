import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { io, type Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3001";

const SocketContext = createContext<Socket | null>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
  const socketRef = useRef<Socket | null>(null);

  if (!socketRef.current) {
    socketRef.current = io(SOCKET_URL, {
      autoConnect: false,
      transports: ["polling", "websocket"],
    });
  }

  useEffect(() => {
    const socket = socketRef.current!;
    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket(): Socket {
  const socket = useContext(SocketContext);
  if (!socket) {
    // During HMR, context may temporarily be null. Return a disconnected socket.
    const fallback = io(SOCKET_URL, { autoConnect: false });
    return fallback;
  }
  return socket;
}
