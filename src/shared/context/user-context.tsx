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

    const [isStorageLoading, setIsStorageLoading] = useState(true);

    useEffect(() => {
        AsyncStorage.getItem("token").then((stored) => {
            setTokenState(stored);
            setIsStorageLoading(false);
        });
    }, []);

    const setToken = useCallback((newToken: string | null) => {
        setTokenState(newToken);
        setUser(null);

        if (newToken) {
            AsyncStorage.setItem("token", newToken);
        } else {
            AsyncStorage.removeItem("token");
        }
    }, []);

    const logout = useCallback(() => {
        setTokenState(null);
        setUser(null);
        AsyncStorage.removeItem("token");
    }, []);

    const {
        data: me,
        error,
        isLoading: isMeLoading,
    } = useMeQuery(undefined, {
        skip: !token || isStorageLoading,
    });

    useEffect(() => {
        if (me) {
            setUser(me);
        }

        if (error) {
            logout();
        }
    }, [me, error]);

    const isLoading =
        isStorageLoading || (!!token && isMeLoading);

    return (
        <UserContext.Provider
            value={{
                token,
                user,
                isLoading,
                setToken,
                logout,
            }}
        >
            {children}
        </UserContext.Provider>
    );
}
export function useUserContext() {
    const context = useContext(UserContext);
    if (!context) throw new Error("useUserContext must be used within UserContextProvider");
    return context;
}