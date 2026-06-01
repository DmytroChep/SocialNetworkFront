import { createContext, type ReactNode, useContext, useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { ip } from "../../config/ip";
import { useUserContext } from "./user-context";

interface ISocketContext {
	socket: Socket | null;
	isConnected: boolean;
}

const SocketContext = createContext<ISocketContext | null>(null);
const socketUrl = `http://${ip}:8000`;

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

		const nextSocket = io(socketUrl, {
			auth: { token: `Bearer ${token}` },
			reconnection: true,
			transports: ["websocket"],
		});

		const handleConnect = () => setIsConnected(true);
		const handleDisconnect = () => setIsConnected(false);

		nextSocket.on("connect", handleConnect);
		nextSocket.on("disconnect", handleDisconnect);
		setSocket(nextSocket);

		return () => {
			nextSocket.off("connect", handleConnect);
			nextSocket.off("disconnect", handleDisconnect);
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
