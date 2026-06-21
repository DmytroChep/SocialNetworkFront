import { createContext, type ReactNode, useContext, useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { ip } from "../../config/ip";
import { useUserContext } from "./user-context";

interface ISocketContext {
	socket: Socket | null;
	isConnected: boolean;
}

const SocketContext = createContext<ISocketContext | null>(null);
const socketUrl = `${ip}`;

export function SocketContextProvider({ children }: { children: ReactNode }) {
	const { token } = useUserContext();
	const [socket, setSocket] = useState<Socket | null>(null);
	const [isConnected, setIsConnected] = useState(false);

	useEffect(() => {
		if (!token) {
			setSocket(null);
			setIsConnected(false);
			return;
		}

		// Debug: log token presence (do not log token value in production)
		console.debug("SocketContext: initializing socket, token present:", Boolean(token));

		const nextSocket = io(socketUrl, {
			auth: { token: `Bearer ${token}` },
			reconnection: true,
			// allow polling fallback in case websocket handshake fails
			transports: ["websocket", "polling"],
		});

		const handleConnect = () => setIsConnected(true);
		const handleDisconnect = () => setIsConnected(false);
		const handleConnectError = (err: any) => console.warn("SocketContext connect_error:", err?.message || err);

		nextSocket.on("connect", handleConnect);
		nextSocket.on("disconnect", handleDisconnect);
		nextSocket.on("connect_error", handleConnectError);
		setSocket(nextSocket);

		return () => {
			nextSocket.off("connect", handleConnect);
			nextSocket.off("disconnect", handleDisconnect);
			nextSocket.off("connect_error", handleConnectError);
			nextSocket.disconnect();
			setSocket(null);
			setIsConnected(false);
		};
	}, [token]);

	return (
		<SocketContext.Provider value={{ socket, isConnected }}>
			{children}
		</SocketContext.Provider>
	);
}

export function useSocketContext() {
	const context = useContext(SocketContext);
	if (!context) {
		throw new Error("useSocketContext must be used within SocketContextProvider");
	}

	return context;
}
