import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useDispatch } from "react-redux";
import {
    baseApi,
    useCreatePersonalChatMutation,
    useDeleteGroupChatMutation,
    useGetChatMessagesQuery,
    useLazyGetChatMessagesQuery,
    useMarkChatAsReadMutation,
    useUpdateGroupChatMutation,
} from "../../../shared/api/baseApi";
import { COLORS } from "../../../shared/constants";
// removed unused import FONTS
import { useSocketContext } from "../../../shared/context/socket-context";
import { useUserContext } from "../../../shared/context/user-context";
import { ICONS } from "../../../shared/icons";
import {
    CHAT_IMAGE_PICKER_OPTIONS,
    chatImageAssetsToDataUris,
} from "../../../shared/lib/image-upload";
import {
    DEFAULT_AVATAR_URL,
    getUserAvatar,
    getUserDisplayName,
    toMediaUrl,
} from "../../../shared/lib/model-helpers";
import { EditGroupModal, type GroupEditUser } from "../EditGroupModal";
import type { IChat, IChatMember, IChatMessage } from "../types/chat";
import ChatPopUp from "./chatPopUp/chatPopUp";
import MessageItem, {
    formatMessageTime,
    isMessageUnread,
    isReadByPeerCheck,
    isSameDay,
} from "./MessageItem";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface ChatPeer {
    id: number | string;
    name: string;
    avatar?: string | null;
    chatId?: number;
    isGroup?: boolean;
    adminId?: number | string | null;
    isAdmin?: boolean;
    users?: IChatMember[];
    editContacts?: GroupEditUser[];
}

interface ChatProps {
    peer?: ChatPeer;
    onBack?: () => void;
}

type SocketAck<T> =
    | { status: "ok"; data?: T }
    | { status: "error"; message?: string };

// ─── Pure helpers (outside component — never recreated) ────────────────────

const normalizeMessage = (m: any): IChatMessage => ({
    ...m,
    id: Number(m.id),
    chat_id: Number(m.chat_id),
    sender_id: Number(m.sender_id),
    sender: m.sender ? { ...m.sender, id: Number(m.sender.id) } : m.sender,
    images: (m.images ?? []).map((img: any) => ({
        ...img,
        id: Number(img.id),
        message_id: img.message_id ? Number(img.message_id) : undefined,
    })),
});

const getInitials = (name: string): string => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    const initials =
        parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : name.slice(0, 2);
    return initials.toUpperCase();
};

const isPositiveNumber = (value: unknown): value is number => {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0;
};

const toNumberId = (value: unknown): number | null => {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const mergeMessages = (messages: IChatMessage[]): IChatMessage[] => {
    const normalized = messages.map(normalizeMessage);
    const map = new Map<number, IChatMessage>();
    for (const message of normalized) {
        map.set(message.id, message);
    }
    return Array.from(map.values()).sort((a, b) => {
        const byDate =
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        return byDate || b.id - a.id;
    });
};

// Stable keyExtractor outside component — never recreated
const keyExtractor = (item: IChatMessage) => item.id.toString();

// ─── Component ─────────────────────────────────────────────────────────────

export default function Chat({ peer, onBack }: ChatProps) {
    const router = useRouter();
    const params = useLocalSearchParams<{
        name?: string;
        avatar?: string;
        id?: string;
        chatId?: string;
    }>();
    const { user } = useUserContext();
    const { socket, isConnected } = useSocketContext();
    // Debug: uncomment if needed
    // console.log('Is Socket Connected:', isConnected);
    const dispatch = useDispatch();

    // ── State ──────────────────────────────────────────────────────────────

    const [messageText, setMessageText] = useState("");
    const [selectedImages, setSelectedImages] = useState<string[]>([]);
    const [isPickingImages, setIsPickingImages] = useState(false);
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [isEditGroupVisible, setIsEditGroupVisible] = useState(false);
    const [groupActionError, setGroupActionError] = useState<string | null>(null);
    const [groupOverride, setGroupOverride] = useState<Partial<ChatPeer>>({});
    const [menuPosition, setMenuPosition] = useState<{
        top: number;
        left?: number;
        right?: number;
    } | null>(null);
    const [chatId, setChatId] = useState<number | null>(
        peer?.chatId ??
            (isPositiveNumber(Number(params.chatId)) ? Number(params.chatId) : null),
    );
    const [messages, setMessages] = useState<IChatMessage[]>([]);
    const [isInitialMessagesLoading, setIsInitialMessagesLoading] = useState(false);
    const [errorText, setErrorText] = useState<string | null>(null);
    const [firstUnreadId, setFirstUnreadId] = useState<number | null>(null);
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    // ── Refs ───────────────────────────────────────────────────────────────

    const moreRef = useRef<any>(null);
    const isSendingRef = useRef(false);
    const isFetchingMoreRef = useRef(false);
    const flatListRef = useRef<FlatList<IChatMessage> | null>(null);
    const hasAutoscrolledRef = useRef(false);
    const scrollOffsetY = useRef(0);
    // Sync refs for stable callbacks — avoids stale closures without deps churn
    const nextCursorRef = useRef<number | null>(null);
    const hasMoreRef = useRef(false);
    const firstUnreadSetRef = useRef(false);
    const unreadDismissedRef = useRef(false);
    const handleNewMessageRef = useRef<((payload: any) => void) | null>(null);
    const handleMessagesReadRef = useRef<((payload: any) => void) | null>(null);
    const markCurrentChatAsReadRef = useRef<() => Promise<void>>(() => Promise.resolve());

    // ── RTK Query ─────────────────────────────────────────────────────────

    const [createPersonalChat, { isLoading: isCreatingChat }] =
        useCreatePersonalChatMutation();
    const [updateGroupChat, { isLoading: isUpdatingGroup }] =
        useUpdateGroupChatMutation();
    const [deleteGroupChat, { isLoading: isDeletingGroup }] =
        useDeleteGroupChatMutation();

    // Для початкового завантаження з кешу (підписується на кеш)
    const { data: initialMessagesData, isFetching: isInitialFetching } =
        useGetChatMessagesQuery(
            { chatId: chatId!, limit: 10 },
            { skip: !chatId }
        );

        // Коли дані з кешу прийшли — кладемо в messages
    useEffect(() => {
        if (!initialMessagesData) return;
        setMessages(mergeMessages(initialMessagesData.messages));
        nextCursorRef.current = initialMessagesData.nextCursor;
        hasMoreRef.current = initialMessagesData.hasMore;
    }, [initialMessagesData]);

    // Для пагінації і markChatAsRead (потрібен lazy)
    const [loadMessagesPage, { isFetching: isFetchingMore }] =
        useLazyGetChatMessagesQuery();

    const [markChatAsRead] = useMarkChatAsReadMutation();

    // ── Derived / memoized values ──────────────────────────────────────────

    const activePeer = useMemo<ChatPeer>(
        () => ({
            id: peer?.id ?? params.id ?? "unknown",
            chatId: peer?.chatId,
            name: peer?.name || params.name || "Користувач",
            avatar: peer?.avatar || params.avatar,
            isGroup: peer?.isGroup,
            adminId: peer?.adminId,
            isAdmin: peer?.isAdmin,
            users: peer?.users,
            editContacts: peer?.editContacts,
            ...groupOverride,
        }),
        [groupOverride, params.avatar, params.id, params.name, peer],
    );

    const peerAvatar = useMemo(
        () => toMediaUrl(activePeer.avatar) || DEFAULT_AVATAR_URL,
        [activePeer.avatar],
    );

    const isGroupAdmin = useMemo(
        () =>
            Boolean(
                activePeer.isGroup &&
                    (activePeer.isAdmin ||
                        (user?.id &&
                            toNumberId(activePeer.adminId) === Number(user.id))),
            ),
        [activePeer.isGroup, activePeer.isAdmin, activePeer.adminId, user?.id],
    );

    const groupEditUsers = useMemo<GroupEditUser[]>(() => {
        const map = new Map<string, GroupEditUser>();
        activePeer.editContacts?.forEach((contact) => {
            map.set(String(contact.id), contact);
        });
        activePeer.users?.forEach((member) => {
            const id = toNumberId(member.user_id);
            if (!id) return;
            const name =
                getUserDisplayName(member.user) ||
                member.user?.username ||
                "Користувач";
            map.set(String(id), { id, name, avatar: getUserAvatar(member.user) });
        });
        return Array.from(map.values());
    }, [activePeer.editContacts, activePeer.users]);

    const selectedGroupUserIds = useMemo(
        () =>
            (activePeer.users ?? [])
                .map((member) => toNumberId(member.user_id))
                .filter((id): id is number => Boolean(id && id !== user?.id)),
        [activePeer.users, user?.id],
    );

    const isSendDisabled =
        (!messageText.trim() && selectedImages.length === 0) || !isConnected;

    const isLoadingChat = isCreatingChat || isInitialMessagesLoading;

    // ── Helpers ────────────────────────────────────────────────────────────

    const scrollToBottom = useCallback((animated = true) => {
        const list = flatListRef.current as any;
        if (!list) return;
        const attempt = () => {
            try {
                if (typeof list.scrollToOffset === "function") {
                    list.scrollToOffset({ offset: 0, animated });
                    return;
                }
                if (typeof list.scrollToIndex === "function") {
                    list.scrollToIndex({ index: 0, animated });
                    return;
                }
                if (typeof list.scrollToEnd === "function") {
                    list.scrollToEnd({ animated });
                    return;
                }
            } catch (_) {}
        };
        requestAnimationFrame(attempt);
        setTimeout(attempt, 120);
    }, []);

    const applyUpdatedGroup = useCallback(
        (chat: IChat) => {
            setGroupOverride({
                id: chat.id,
                chatId: chat.id,
                name: chat.name || "Група",
                avatar: toMediaUrl(chat.avatar) || chat.avatar || null,
                isGroup: true,
                adminId: chat.admin_id,
                isAdmin: user?.id
                    ? toNumberId(chat.admin_id) === user.id
                    : false,
                users: chat.users,
                editContacts: peer?.editContacts,
            });
        },
        [peer?.editContacts, user?.id],
    );

    const handleBack = useCallback(() => {
        if (onBack) { onBack(); return; }
        router.back();
    }, [onBack, router]);

    // ── markChatAsRead ────────────────────────────────────────────────────

    const markCurrentChatAsRead = useCallback(async () => {
        if (!chatId) return;
        try {
            unreadDismissedRef.current = true;
            setFirstUnreadId(null);
            setMessages((current) =>
                current.map((m) =>
                    m.sender_id !== user?.id ? ({ ...m, is_read: true } as any) : m,
                ),
            );
            await markChatAsRead(chatId).unwrap();
            try {
                const page = await loadMessagesPage(
                    { chatId, limit: 10 },
                    true,
                ).unwrap();
                setMessages((current) =>
                    mergeMessages([...page.messages, ...current]),
                );
                nextCursorRef.current = page.nextCursor;
                hasMoreRef.current = page.hasMore;
                setErrorText(null);
            } catch (_) {}
            try {
                dispatch(
                    baseApi.util.invalidateTags([
                        { type: "Messages", id: chatId },
                        "Chats",
                    ] as any),
                );
            } catch (_) {}
            socket?.emit("messages:read", { chatId: Number(chatId) });
        } catch (_) {}
    }, [chatId, markChatAsRead, socket, user?.id, loadMessagesPage, dispatch]);

    // Keep ref in sync
    useEffect(() => {
        markCurrentChatAsReadRef.current = markCurrentChatAsRead;
    }, [markCurrentChatAsRead]);

    // ── Socket callbacks ───────────────────────────────────────────────────

    const handleNewMessageCallback = useCallback(
        (payload: any) => {
            // Support multiple payload shapes from backend:
            // { chatId, message } or { chat_id, message } or direct message object
            try {
                console.debug("Socket message payload:", payload);
            } catch (e) {}

            const incomingChatId =
                payload?.chatId ?? payload?.chat_id ?? payload?.message?.chatId ?? payload?.message?.chat_id ?? null;

            if (!chatId || Number(incomingChatId) !== Number(chatId)) return;

            const rawMessage = payload?.message ?? payload;
            if (!rawMessage) return;

            const msgSenderId = Number(rawMessage.sender_id ?? rawMessage.sender?.id);
            const currentUserId = Number(user?.id);
            if (msgSenderId === currentUserId) return; // own message arrives via ACK

            const message = normalizeMessage(rawMessage);

            // ensure images array exists
            if (!Array.isArray(message.images)) (message as any).images = [];

            if (Number(message.sender_id) !== Number(user?.id)) {
                (message as any).is_read = true;
            }

            setMessages((current) => {
                const filtered = current.filter(
                    (m) =>
                        !(
                            m.id < 0 &&
                            m.sender_id === message.sender_id &&
                            m.text === message.text
                        ),
                );
                return mergeMessages([message, ...filtered]);
            });

            setErrorText(null);
            scrollToBottom(true);
            markCurrentChatAsReadRef.current();
        },
        [chatId, user?.id, scrollToBottom],
    );

    const handleMessagesReadCallback = useCallback(
        (payload: {
            chatId: number | string;
            readerId?: string;
            messageIds?: number[];
            readAt?: string;
        }) => {
            if (!chatId || Number(payload.chatId) !== Number(chatId)) return;
            if (payload.readerId && Number(payload.readerId) !== user?.id) {
                setMessages((current) =>
                    current.map((m) =>
                        m.sender_id === user?.id
                            ? ({ ...m, is_read: true } as any)
                            : m,
                    ),
                );
            }
        },
        [chatId, user?.id],
    );

    // Keep handler refs in sync (stable socket listeners)
    useEffect(() => {
        handleNewMessageRef.current = handleNewMessageCallback;
    }, [handleNewMessageCallback]);

    useEffect(() => {
        handleMessagesReadRef.current = handleMessagesReadCallback;
    }, [handleMessagesReadCallback]);

    // ── Effects ────────────────────────────────────────────────────────────

    // Reset unread state when chatId changes
    useEffect(() => {
        unreadDismissedRef.current = false;
        firstUnreadSetRef.current = false;
        hasAutoscrolledRef.current = false;
        setFirstUnreadId(null);
    }, [chatId]);

    // Reset group override when peer changes
    useEffect(() => {
        setGroupOverride({});
        setGroupActionError(null);
        setIsEditGroupVisible(false);
    }, [peer?.chatId, params.chatId]);

    // Keyboard listeners
    useEffect(() => {
        const showWill = Keyboard.addListener("keyboardWillShow", (e) =>
            setKeyboardHeight(e.endCoordinates.height),
        );
        const hideWill = Keyboard.addListener("keyboardWillHide", () =>
            setKeyboardHeight(0),
        );
        const showDid = Keyboard.addListener("keyboardDidShow", (e) =>
            setKeyboardHeight(e.endCoordinates.height),
        );
        const hideDid = Keyboard.addListener("keyboardDidHide", () =>
            setKeyboardHeight(0),
        );
        return () => {
            showWill.remove();
            hideWill.remove();
            showDid.remove();
            hideDid.remove();
        };
    }, []);

    // Set firstUnreadId on initial messages load
    useEffect(() => {
        if (unreadDismissedRef.current || firstUnreadSetRef.current) return;
        if (messages.length === 0) return;
        const oldestUnread = [...messages]
            .reverse()
            .find((m) => isMessageUnread(m, user?.id));
        if (oldestUnread) {
            setFirstUnreadId(oldestUnread.id);
            firstUnreadSetRef.current = true;
        }
    }, [messages, user?.id]);

    // Auto-scroll & mark as read after finding first unread
    useEffect(() => {
        if (!firstUnreadId || messages.length === 0 || hasAutoscrolledRef.current)
            return;
        hasAutoscrolledRef.current = true;
        const t = setTimeout(() => {
            setTimeout(() => markCurrentChatAsReadRef.current(), 600);
        }, 120);
        return () => clearTimeout(t);
    }, [firstUnreadId, messages]);

    // Load initial messages when chatId changes
    useEffect(() => {
        setMessages([]);
        nextCursorRef.current = null;
        hasMoreRef.current = false;
        hasAutoscrolledRef.current = false;
        if (!chatId) return;

        let isMounted = true;
        setIsInitialMessagesLoading(true);
        let markReadTimeout: ReturnType<typeof setTimeout> | null = null;

        loadMessagesPage({ chatId, limit: 10 }, false   )
            .unwrap()
            .then((page) => {
                if (!isMounted) return;
                nextCursorRef.current = page.nextCursor;
                hasMoreRef.current = page.hasMore;
                setErrorText(null);
                setMessages((current) =>
                    mergeMessages([...page.messages, ...current]),
                );
                if (page.messages.some((m) => isMessageUnread(m, user?.id))) {
                    markReadTimeout = setTimeout(() => {
                        if (unreadDismissedRef.current) return;
                        markCurrentChatAsReadRef.current();
                    }, 800);
                }
            })
            .catch(() => {
                if (!isMounted) return;
                setErrorText("Не вдалося завантажити повідомлення");
            })
            .finally(() => {
                if (!isMounted) return;
                setIsInitialMessagesLoading(false);
            });

        return () => {
            isMounted = false;
            if (markReadTimeout) clearTimeout(markReadTimeout);
        };
    }, [chatId, loadMessagesPage, user?.id]);

    // Socket join/leave + stable listeners via ref
    useEffect(() => {
        if (!socket || !chatId) return;

        socket.emit(
            "chat:join",
            { chatId: Number(chatId) },
            (response?: SocketAck<void>) => {
                if (response?.status === "error") {
                    setErrorText(
                        response.message || "Не вдалося приєднатися до чату",
                    );
                }
            },
        );

        const listener1 = (payload: any) =>
            handleNewMessageRef.current?.(payload);
        const listener2 = (payload: any) =>
            handleMessagesReadRef.current?.(payload);

        socket.on("message:new", listener1);
        socket.on("messages:read", listener2);

        return () => {
            socket.emit("chat:leave", { chatId: Number(chatId) });
            socket.off("message:new", listener1);
            socket.off("messages:read", listener2);
        };
    }, [socket, chatId]);

    // ── Handlers ───────────────────────────────────────────────────────────

    // Stable: uses refs for cursor/hasMore — no dependency churn
    const handleLoadMore = useCallback(async () => {
        if (
            !chatId ||
            !hasMoreRef.current ||
            !nextCursorRef.current ||
            isFetchingMoreRef.current
        )
            return;
        isFetchingMoreRef.current = true;
        try {
            const page = await loadMessagesPage({
                chatId,
                limit: 10,
                cursorId: nextCursorRef.current,
            }).unwrap();
            setMessages((current) =>
                mergeMessages([...page.messages, ...current]),
            );
            nextCursorRef.current = page.nextCursor;
            hasMoreRef.current = page.hasMore;
        } catch {
            setErrorText("Не вдалося завантажити попередні повідомлення");
        } finally {
            isFetchingMoreRef.current = false;
        }
    }, [chatId, loadMessagesPage]);

    const handlePickImages = useCallback(async () => {
        if (!chatId || !isConnected || isPickingImages) {
            if (!isConnected) setErrorText("Немає з'єднання з чатом");
            return;
        }
        try {
            setIsPickingImages(true);
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsMultipleSelection: true,
                ...CHAT_IMAGE_PICKER_OPTIONS,
            });
            if (result.canceled) return;
            const images = await chatImageAssetsToDataUris(result.assets);
            if (images.length === 0) {
                setErrorText("Не вдалося прочитати зображення");
                return;
            }
            setSelectedImages((current) =>
                [...current, ...images].slice(0, 6),
            );
            setErrorText(null);
        } catch {
            setErrorText("Не вдалося вибрати зображення");
        } finally {
            setIsPickingImages(false);
        }
    }, [chatId, isConnected, isPickingImages]);

    const removeSelectedImage = useCallback((index: number) => {
        setSelectedImages((current) =>
            current.filter((_, i) => i !== index),
        );
    }, []);

    const handleSendMessage = useCallback(async () => {
        const text = messageText.trim();
        if (
            (!text && selectedImages.length === 0) ||
            !socket ||
            !isConnected ||
            isSendingRef.current
        )
            return;

        let activeChatId = chatId;

        if (!activeChatId) {
            const peerId = toNumberId(activePeer.id);
            if (!peerId) return;
            try {
                const newChat = await createPersonalChat({
                    participantId: peerId,
                }).unwrap();
                activeChatId = newChat.id;
                setChatId(newChat.id);
            } catch {
                setErrorText("Не вдалося створити чат");
                return;
            }
        }

        if (!activeChatId) return;

        isSendingRef.current = true;
        const tempId = -Date.now();
        const optimisticMessage: IChatMessage = {
            id: tempId,
            chat_id: activeChatId,
            sender_id: user!.id,
            text,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            sender: user as any,
            images: selectedImages.map((image, index) => ({
                id: -(index + 1),
                message_id: tempId,
                image,
            })),
        };

        const imagesToSend = selectedImages;
        setMessages((current) => mergeMessages([optimisticMessage, ...current]));
        setMessageText("");
        setSelectedImages([]);
        setErrorText(null);
        scrollToBottom(true);

        isSendingRef.current = false;

        const timeout = setTimeout(() => {
            setMessages((current) => {
                if (!current.some((m) => m.id === tempId)) return current;
                return current.filter((m) => m.id !== tempId);
            });
            // Restore input only if message was still in list (i.e. not confirmed)
            setMessages((current) => {
                const stillHadOptimistic = current.some((m) => m.id === tempId);
                if (stillHadOptimistic) {
                    setMessageText(text);
                    setSelectedImages(imagesToSend);
                    setErrorText("Не вдалося відправити повідомлення");
                }
                return current;
            });
        }, 15000);

        socket.emit(
            "message:send",
            { chatId: activeChatId, text, images: imagesToSend },
            (response?: SocketAck<IChatMessage>) => {
                clearTimeout(timeout);
                if (!response || response.status === "error") {
                    setMessages((current) =>
                        current.filter((m) => m.id !== tempId),
                    );
                    setMessageText(text);
                    setSelectedImages(imagesToSend);
                    setErrorText(
                        response?.message || "Не вдалося відправити повідомлення",
                    );
                    return;
                }
                if (response.data) {
                    const normalized = normalizeMessage(response.data);
                    setMessages((current) => {
                        const withoutOptimistic = current.filter(
                            (m) => m.id !== tempId,
                        );
                        return mergeMessages([normalized, ...withoutOptimistic]);
                    });
                }
            },
        );
    }, [
        messageText,
        selectedImages,
        socket,
        isConnected,
        chatId,
        activePeer.id,
        user,
        createPersonalChat,
        scrollToBottom,
    ]);

    const handleUpdateGroup = useCallback(
        async (payload: {
            name: string;
            userIds: number[];
            avatar?: string | null;
        }) => {
            if (!chatId || !isGroupAdmin) return;
            try {
                const updatedChat = await updateGroupChat({
                    chatId,
                    ...payload,
                }).unwrap();
                applyUpdatedGroup(updatedChat);
                setGroupActionError(null);
                setIsEditGroupVisible(false);
            } catch (error: any) {
                setGroupActionError(
                    (typeof error?.data === "string"
                        ? error.data
                        : error?.data?.message) || "Не вдалося оновити групу",
                );
            }
        },
        [chatId, isGroupAdmin, updateGroupChat, applyUpdatedGroup],
    );

    const handleDeleteGroup = useCallback(() => {
        if (!chatId || !isGroupAdmin || isDeletingGroup) return;
        Alert.alert(
            "Видалити групу?",
            "Груповий чат і всі його повідомлення будуть видалені.",
            [
                { text: "Скасувати", style: "cancel" },
                {
                    text: "Видалити",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteGroupChat(chatId).unwrap();
                            setGroupActionError(null);
                            handleBack();
                        } catch (error: any) {
                            setGroupActionError(
                                (typeof error?.data === "string"
                                    ? error.data
                                    : error?.data?.message) ||
                                    "Не вдалося видалити групу",
                            );
                        }
                    },
                },
            ],
        );
    }, [chatId, isGroupAdmin, isDeletingGroup, deleteGroupChat, handleBack]);

    const handleMorePress = useCallback(() => {
        moreRef.current?.measureInWindow(
            (x: number, y: number, w: number, h: number) => {
                const MENU_WIDTH = 220;
                const statusBarHeight =
                    Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0;
                const top = y + h + 8 - statusBarHeight;
                const left = Math.max(8, Math.round(x + w - MENU_WIDTH));
                setMenuPosition({ top, left });
                setIsMenuVisible(true);
            },
        );
    }, []);

    const handleCloseMenu = useCallback(() => {
        setIsMenuVisible(false);
        setMenuPosition(null);
    }, []);

    const handleEditPress = useCallback(
        () => setIsEditGroupVisible(true),
        [],
    );

    const handleCloseEdit = useCallback(
        () => setIsEditGroupVisible(false),
        [],
    );

    // ── renderItem (memoized, delegates to memo'd MessageItem) ─────────────

    const renderItem = useCallback(
        ({ item, index }: { item: IChatMessage; index: number }) => {
            console.log('sender:', JSON.stringify(item.sender));
            const resolvedSenderAvatar =
                item.sender?.avatar ||
                toMediaUrl(item.sender?.profile?.avatar, 'avatar', item.sender?.id) ||
                getUserAvatar(item.sender) ||
                DEFAULT_AVATAR_URL;
            try {
                console.debug('[Chat][renderItem] resolvedSenderAvatar=', resolvedSenderAvatar, 'item.sender.profile?.avatar=', item.sender?.profile?.avatar, 'chatAvatarParam=', item.chat_avatar || item.chatAvatar || null);
            } catch (e) {}
            const isMe = Number(item.sender_id) === Number(user?.id);
            const nextItem = messages[index + 1];
            const isNewDay =
                !nextItem ||
                !isSameDay(item.created_at, nextItem.created_at);

            return (
                <MessageItem
                    item={item}
                    isMe={isMe}
                    isFirstUnread={item.id === firstUnreadId}
                    isReadByPeer={isReadByPeerCheck(item, isMe)}
                    senderName={
                        getUserDisplayName(item.sender) || activePeer.name
                    }
                    senderAvatar={resolvedSenderAvatar}
                    isNewDay={isNewDay}
                    formattedDate={new Date(item.created_at).toLocaleDateString(
                        "uk-UA",
                        { day: "numeric", month: "long", year: "numeric" },
                    )}
                />
            );
        },
        [messages, user?.id, firstUnreadId, activePeer.name, peerAvatar],
    );

    

    // ── Render ─────────────────────────────────────────────────────────────

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 80}
            style={[
                styles.chatFlexWrapper,
                keyboardHeight > 0 && { paddingBottom: keyboardHeight },
            ]}
        >
            <View style={styles.chatCard}>
                {/* ── Header ── */}
                <View style={styles.chatInnerHeader}>
                    <TouchableOpacity
                        onPress={handleBack}
                        style={styles.backButton}
                    >
                        <ICONS.ArrowIcon/>
                    </TouchableOpacity>

                    <View style={styles.chatAvatar}>
                        {peerAvatar ? (
                            <Image
                                source={{ uri: peerAvatar }}
                                style={styles.chatAvatarImage}
                            />
                        ) : (
                            <Text style={styles.chatAvatarText}>
                                {getInitials(activePeer.name)}
                            </Text>
                        )}
                    </View>

                    <View style={styles.chatTitleWrapper}>
                        <Text style={styles.chatTitle} numberOfLines={1}>
                            {activePeer.name}
                        </Text>
                        <Text style={styles.chatSubtitle}>
                            {activePeer.isGroup ? "Груповий чат" : "Особистий чат"}
                        </Text>
                        {/* connection indicator removed */}
                    </View>

                    <View
                        ref={(el) => { moreRef.current = el; }}
                        collapsable={false}
                    >
                        <TouchableOpacity
                            style={styles.moreButton}
                            onPress={handleMorePress}
                        >
                            <ICONS.dots />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* ── Messages List ── */}
                <FlatList
                    ref={flatListRef as any}
                    inverted
                    data={messages}
                    keyExtractor={keyExtractor}
                    renderItem={renderItem}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.2}
                    keyboardShouldPersistTaps="handled"
                    maintainVisibleContentPosition={{ minIndexForVisible: 1 }}
                    removeClippedSubviews
                    maxToRenderPerBatch={10}
                    updateCellsBatchingPeriod={30}
                    windowSize={10}
                    initialNumToRender={20}
                    onScroll={(e) => {
                        scrollOffsetY.current =
                            e.nativeEvent.contentOffset.y;
                    }}
                    scrollEventThrottle={16}
                    ListFooterComponent={
                        isFetchingMore ? (
                            <View style={styles.historyLoader}>
                                <ActivityIndicator color={COLORS.plum} />
                            </View>
                        ) : null
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyMessages}>
                            {isLoadingChat ? (
                                <ActivityIndicator color={COLORS.plum} />
                            ) : (
                                <Text style={styles.emptyMessagesText}>
                                    Напишите перше повідомлення
                                </Text>
                            )}
                        </View>
                    }
                    contentContainerStyle={styles.messagesListContent}
                    showsVerticalScrollIndicator={false}
                />

                {/* ── Error ── */}
                {(errorText || groupActionError) && (
                    <Text style={styles.errorText}>
                        {errorText || groupActionError}
                    </Text>
                )}

                {/* ── Selected Images Preview ── */}
                {selectedImages.length > 0 && (
                    <View style={styles.selectedImagesRow}>
                        {selectedImages.map((image, index) => (
                            <View
                                key={`${image.slice(0, 48)}-${index}`}
                                style={styles.selectedImageWrapper}
                            >
                                <Image
                                    source={{ uri: image }}
                                    style={styles.selectedImage}
                                />
                                <TouchableOpacity
                                    style={styles.removeImageButton}
                                    onPress={() => removeSelectedImage(index)}
                                >
                                    <Text style={styles.removeImageText}>x</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}

                {/* ── Input Row ── */}
                <View style={styles.bottomInputRow}>
                    <View style={styles.inputFieldContainer}>
                        <TextInput
                            returnKeyType="send"
                            style={styles.textInput}
                            placeholder="Повідомлення"
                            placeholderTextColor="#8E8E93"
                            value={messageText}
                            onChangeText={setMessageText}
                            multiline
                        />
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.imageAttachmentButton,
                            (!chatId || !isConnected || isPickingImages) &&
                                styles.imageAttachmentButtonDisabled,
                        ]}
                        onPress={handlePickImages}
                        disabled={!chatId || !isConnected || isPickingImages}
                    >
                        <ICONS.image />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.sendActionButton,
                            isSendDisabled && styles.sendActionButtonDisabled,
                        ]}
                        onPress={handleSendMessage}
                        disabled={isSendDisabled}
                    >
                        <ICONS.Send />
                    </TouchableOpacity>
                </View>
            </View>

            {/* ── Modals ── */}
            <EditGroupModal
                visible={isEditGroupVisible}
                initialName={activePeer.name}
                initialAvatar={activePeer.avatar ?? null}
                users={groupEditUsers}
                selectedUserIds={selectedGroupUserIds}
                currentUserId={user?.id}
                isSubmitting={isUpdatingGroup}
                errorText={groupActionError}
                onClose={handleCloseEdit}
                onSubmit={handleUpdateGroup}
            />

            <ChatPopUp
                isVisible={isMenuVisible}
                onClose={handleCloseMenu}
                isGroup={Boolean(activePeer.isGroup)}
                canManageGroup={isGroupAdmin}
                onEditPress={handleEditPress}
                onDeletePress={handleDeleteGroup}
            />
        </KeyboardAvoidingView>
    );
}

// ─── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    chatFlexWrapper: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    chatCard: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        overflow: "hidden",
    },
    chatInnerHeader: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderColor: "#F2F2F7",
    },
    backButton: {
        marginRight: 8,
        padding: 2,
    },
    chatAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#503E50",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
    },
    chatAvatarImage: {
        width: "100%",
        height: "100%",
        borderRadius: 20,
    },
    chatAvatarText: {
        color: "#FFFFFF",
        fontSize: 14,
        // fontFamily: "GTWalsheimPro-Medium",
    },
    chatTitleWrapper: {
        flex: 1,
        marginLeft: 12,
    },
    chatTitle: {
        fontSize: 16,
        // fontFamily: "GTWalsheimPro-Medium",
        color: "#1C1C1E",
    },
    chatSubtitle: {
        fontSize: 12,
        // fontFamily: "GTWalsheimPro-Regular",
        color: "#8E8E93",
        marginTop: 2,
    },
    /* connection indicator styles removed */
    moreButton: {
        padding: 4,
    },
    messagesListContent: {
        paddingVertical: 16,
        flexGrow: 1,
    },
    historyLoader: {
        paddingVertical: 12,
        alignItems: "center",
    },
    emptyMessages: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 24,
    },
    emptyMessagesText: {
        fontSize: 14,
        // fontFamily: "GTWalsheimPro-Regular",
        color: "#8E8E93",
    },
    errorText: {
        paddingHorizontal: 16,
        paddingBottom: 8,
        color: "#FF3B30",
        fontSize: 12,
        // fontFamily: "GTWalsheimPro-Regular",
    },
    selectedImagesRow: {
        flexDirection: "row",
        gap: 8,
        paddingHorizontal: 16,
        paddingBottom: 8,
        flexWrap: "wrap",
    },
    selectedImageWrapper: {
        position: "relative",
        width: 56,
        height: 56,
    },
    selectedImage: {
        width: 56,
        height: 56,
        borderRadius: 8,
        backgroundColor: "#E5E5EA",
    },
    removeImageButton: {
        position: "absolute",
        top: -6,
        right: -6,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: "#1C1C1E",
        alignItems: "center",
        justifyContent: "center",
    },
    removeImageText: {
        color: "#FFFFFF",
        fontSize: 12,
        // fontFamily: "GTWalsheimPro-Medium",
        lineHeight: 14,
    },
    bottomInputRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderColor: "#F2F2F7",
        backgroundColor: "#FFFFFF",
    },
    inputFieldContainer: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E5E5EA",
        borderRadius: 12,
        minHeight: 44,
        justifyContent: "center",
        paddingHorizontal: 14,
    },
    textInput: {
        fontSize: 14,
        // fontFamily: "GTWalsheimPro-Regular",
        color: "#1C1C1E",
        paddingVertical: 6,
        maxHeight: 80,
    },
    imageAttachmentButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: COLORS.plum,
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 12,
    },
    imageAttachmentButtonDisabled: {
        opacity: 0.5,
    },
    sendActionButton: {
        backgroundColor: COLORS.plum,
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 8,
    },
    sendActionButtonDisabled: {
        opacity: 0.5,
    },
});