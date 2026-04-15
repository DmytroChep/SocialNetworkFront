import {
    createContext,
    type ReactNode,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { IUser } from "./types";
import { useMeQuery } from "../api/baseApi";

interface IUserContext {
    token: string | null;
    user: IUser | null;
    isLoading: boolean;
    setToken: (token: string | null) => void;
    logout: () => void;
}

interface IUserContextProviderProps {
    children: ReactNode;
}

export const UserContext = createContext<IUserContext | null>(null);

export function UserContextProvider(props: IUserContextProviderProps) {
    const { children } = props;

    const [token, setTokenState] = useState<string | null>(null);
    const [user, setUser] = useState<IUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        AsyncStorage.getItem("token").then((stored) => {
            setTokenState(stored);
            setIsLoading(false);
        });
    }, []);

    useEffect(() => {
        if (isLoading) return;
        if (token) {
            AsyncStorage.setItem("token", token);
        } else {
            AsyncStorage.removeItem("token");
        }
    }, [token, isLoading]);

    const setToken = useCallback((newToken: string | null) => {
        setTokenState(newToken);
        setUser(null);
    }, []);

    const logout = useCallback(() => {
        setTokenState(null);
        setUser(null);
    }, []);

    const { data: me, error } = useMeQuery(undefined, {
        skip: !token || isLoading,
    });

    useEffect(() => {
        if (me) setUser(me);
        if (error) logout();
    }, [me, error, logout]);

    return (
        <UserContext.Provider value={{ token, user, isLoading, setToken, logout }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUserContext() {
    const context = useContext(UserContext);
    if (!context) throw new Error("useUserContext must be used within UserContextProvider");
    return context;
}