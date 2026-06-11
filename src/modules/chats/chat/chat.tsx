import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    StatusBar,
    Animated,
} from "react-native";
import {
    useCreatePersonalChatMutation,
    useDeleteGroupChatMutation,
    useLazyGetChatMessagesQuery,
    useMarkChatAsReadMutation,
    useUpdateGroupChatMutation,
    baseApi,
} from "../../../shared/api/baseApi";
import { useDispatch } from "react-redux";
import { COLORS } from "../../../shared/constants";
import { FONTS } from "../../../shared/constants/fonts";
import { useSocketContext } from "../../../shared/context/socket-context";
import { useUserContext } from "../../../shared/context/user-context";
import { ICONS } from "../../../shared/icons";
import {
    DEFAULT_AVATAR_URL,
    getUserAvatar,
    getUserDisplayName,
    toMediaUrl,
} from "../../../shared/lib/model-helpers";
import {
    CHAT_IMAGE_PICKER_OPTIONS,
    chatImageAssetsToDataUris,
} from "../../../shared/lib/image-upload";
import type { IChat, IChatMember, IChatMessage } from "../types/chat";
import { EditGroupModal, type GroupEditUser } from "../EditGroupModal";
import ChatPopUp from "./chatPopUp/chatPopUp";

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

const getInitials = (name: string) => {
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

const formatMessageTime = (value?: string) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleTimeString("uk-UA", {
        hour: "2-digit",
        minute: "2-digit",
    });
};

const mergeMessages = (messages: IChatMessage[]) => {
    const map = new Map<number, IChatMessage>();
    for (const message of messages) {
        map.set(message.id, message);
    }
    return Array.from(map.values()).sort((a, b) => {
        const byDate =
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        return byDate || b.id - a.id;
    });
};

const isSameDay = (dateStr1: string, dateStr2: string): boolean => {
    const d1 = new Date(dateStr1);
    const d2 = new Date(dateStr2);
    return (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
    );
};

export default function Chat({ peer, onBack }: ChatProps) {
    const router = useRouter();
    const params = useLocalSearchParams<{
        name?: string;
        avatar?: string;
        id?: string;
        chatId?: string;
    }>();
    const { user, token } = useUserContext();
    const { socket, isConnected } = useSocketContext();

    const [messageText, setMessageText] = useState("");
    const [selectedImages, setSelectedImages] = useState<string[]>([]);
    const [isPickingImages, setIsPickingImages] = useState(false);
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [isEditGroupVisible, setIsEditGroupVisible] = useState(false);
    const [groupActionError, setGroupActionError] = useState<string | null>(null);
    const [groupOverride, setGroupOverride] = useState<Partial<ChatPeer>>({});
    const moreRef = useRef<any>(null);
    const [menuPosition, setMenuPosition] = useState<{
        top: number;
        left?: number;
        right?: number;
    } | null>(null);
    const [chatId, setChatId] = useState<number | null>(
        peer?.chatId ??
            (isPositiveNumber(Number(params.chatId))
                ? Number(params.chatId)
                : null),
    );
    const [messages, setMessages] = useState<IChatMessage[]>([]);
    const [nextCursor, setNextCursor] = useState<number | null>(null);
    const [hasMore, setHasMore] = useState(false);
    const [isInitialMessagesLoading, setIsInitialMessagesLoading] =
        useState(false);
    const [errorText, setErrorText] = useState<string | null>(null);

    const [createPersonalChat, { isLoading: isCreatingChat }] =
        useCreatePersonalChatMutation();
    const [updateGroupChat, { isLoading: isUpdatingGroup }] =
        useUpdateGroupChatMutation();
    const [deleteGroupChat, { isLoading: isDeletingGroup }] =
        useDeleteGroupChatMutation();
    const [loadMessagesPage, { isFetching: isFetchingMore }] =
        useLazyGetChatMessagesQuery();
    const [markChatAsRead] = useMarkChatAsReadMutation();
    const dispatch = useDispatch();

    const isSendingRef = useRef(false);
    const flatListRef = useRef<FlatList<IChatMessage> | null>(null);
    const hasAutoscrolledRef = useRef(false);
    const scrollOffsetY = useRef(0);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const markReadFallbackRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const firstUnreadSetRef = useRef(false);
    const suppressTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [firstUnreadId, setFirstUnreadId] = useState<number | null>(null);
    const unreadDismissedRef = useRef(false);

    const isMessageUnread = (m: IChatMessage | undefined | null) => {
    if (!m) return false;
    if (m.sender_id === user?.id) return false;
    console.log('[UNREAD CHECK]', m.id, JSON.stringify({
        is_read: (m as any).is_read,
        isRead: (m as any).isRead,
        read_at: (m as any).read_at,
        readAt: (m as any).readAt,
    }));
    if ("is_read" in m) return !Boolean((m as any).is_read);
    if ("isRead" in m) return !Boolean((m as any).isRead);
    if ("read_at" in m) return !Boolean((m as any).read_at);
    if ("readAt" in m) return !Boolean((m as any).readAt);
    return false;
};
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
    const peerAvatar = toMediaUrl(activePeer.avatar) || DEFAULT_AVATAR_URL;
    const isGroupAdmin = Boolean(
        activePeer.isGroup &&
            (activePeer.isAdmin ||
                (user?.id && toNumberId(activePeer.adminId) === user.id)),
    );

    const groupEditUsers = useMemo<GroupEditUser[]>(() => {
        const map = new Map<string, GroupEditUser>();
        activePeer.editContacts?.forEach((contact) => {
            map.set(String(contact.id), contact);
        });
        activePeer.users?.forEach((member) => {
            const id = toNumberId(member.user_id);
            if (!id) return;
            const name = getUserDisplayName(member.user) || member.user?.username || "Користувач";
            map.set(String(id), {
                id,
                name,
                avatar: getUserAvatar(member.user),
            });
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

    const applyUpdatedGroup = useCallback((chat: IChat) => {
        setGroupOverride({
            id: chat.id,
            chatId: chat.id,
            name: chat.name || "Група",
            avatar: toMediaUrl(chat.avatar) || chat.avatar || null,
            isGroup: true,
            adminId: chat.admin_id,
            isAdmin: user?.id ? toNumberId(chat.admin_id) === user.id : false,
            users: chat.users,
            editContacts: peer?.editContacts,
        });
    }, [peer?.editContacts, user?.id]);

    useEffect(() => {
        setGroupOverride({});
        setGroupActionError(null);
        setIsEditGroupVisible(false);
    }, [peer?.chatId, params.chatId]);

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
            const page = await loadMessagesPage({ chatId, limit: 30 }, false).unwrap();
            setMessages((current) => mergeMessages([...page.messages, ...current]));
            setNextCursor(page.nextCursor);
            setHasMore(page.hasMore);
            setErrorText(null);
        } catch (e) {}
        try {
            dispatch(baseApi.util.invalidateTags([{ type: 'Messages', id: chatId }, 'Chats'] as any));
        } catch (e) {}
        socket?.emit("messages:read", { chatId });
    } catch {}
}, [chatId, markChatAsRead, socket, user?.id, loadMessagesPage, dispatch]);


const markCurrentChatAsReadRef = useRef(markCurrentChatAsRead);
useEffect(() => {
    markCurrentChatAsReadRef.current = markCurrentChatAsRead;
}, [markCurrentChatAsRead]);

useEffect(() => {
    console.log('[CHATID EFFECT] chatId changed:', chatId);
    unreadDismissedRef.current = false;
    firstUnreadSetRef.current = false;
    hasAutoscrolledRef.current = false;
    setFirstUnreadId(null);
}, [chatId]);
useEffect(() => {
    console.log('[MESSAGES EFFECT] messages.length:', messages.length, 
        'dismissed:', unreadDismissedRef.current, 
        'firstUnreadSet:', firstUnreadSetRef.current);
    if (unreadDismissedRef.current || firstUnreadSetRef.current) return;
    if (messages.length === 0) return;
    const oldestUnread = [...messages].reverse().find((m) => isMessageUnread(m));
    console.log('[MESSAGES EFFECT] oldestUnread:', oldestUnread?.id ?? null);
    if (oldestUnread) {
        setFirstUnreadId(oldestUnread.id);
        firstUnreadSetRef.current = true;
    }
}, [messages]);

useEffect(() => {
    if (!firstUnreadId || messages.length === 0 || hasAutoscrolledRef.current) return;
    hasAutoscrolledRef.current = true;
    const t = setTimeout(() => {
        setTimeout(() => {
            markCurrentChatAsReadRef.current();
        }, 600);
    }, 120);
    return () => clearTimeout(t);
}, [firstUnreadId, messages]);

useEffect(() => {
    setMessages([]);
    setNextCursor(null);
    setHasMore(false);
    hasAutoscrolledRef.current = false;
    if (!chatId) return;
    let isMounted = true;
    setIsInitialMessagesLoading(true);
    let markReadTimeout: ReturnType<typeof setTimeout> | null = null;
    loadMessagesPage({ chatId, limit: 30 }, false)
        .unwrap()
        .then((page) => {
            if (!isMounted) return;
            setNextCursor(page.nextCursor);
            setHasMore(page.hasMore);
            setErrorText(null);
            setMessages((current) => mergeMessages([...page.messages, ...current]));
            
            // ← СЮДИ
            console.log('[LOAD] page.messages count:', page.messages.length);
            console.log('[LOAD] has unread:', page.messages.some((m) => isMessageUnread(m)));
            console.log('[LOAD] sample message:', JSON.stringify(page.messages[0]));
            console.log('[LOAD] full message fields:', Object.keys(page.messages[0]));
            
            if (page.messages.some((m) => isMessageUnread(m))) {
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

useEffect(() => {
    if (!socket || !chatId) return;

    const handleNewMessage = (payload: { chatId: number | string; message: IChatMessage }) => {
        if (Number(payload.chatId) !== chatId) return;
        setMessages((current) => {
            const filtered = current.filter(
                (m) => !(m.id < 0 && m.sender_id === payload.message.sender_id && m.text === payload.message.text)
            );
            return mergeMessages([payload.message, ...filtered]);
        });
        setErrorText(null);
        if (payload.message.sender_id !== user?.id) {
            markCurrentChatAsReadRef.current();
        }
    };

    const handleMessagesRead = (payload: { 
    chatId: number | string; 
    readerId?: string;
    messageIds?: number[]; 
    readAt?: string 
}) => {
    if (Number(payload.chatId) !== chatId) return;
    // Якщо читає хтось інший — позначаємо наші повідомлення як прочитані
    if (payload.readerId && Number(payload.readerId) !== user?.id) {
        setMessages((current) =>
            current.map((m) => {
                if (m.sender_id === user?.id) {
                    return { ...m, is_read: true } as any;
                }
                return m;
            })
        );
    }
};

    socket.emit("chat:join", { chatId }, (response?: SocketAck<void>) => {
        if (response?.status === "error") {
            setErrorText(response.message || "Не вдалося приєднатися до чату");
        }
    });

    socket.on("message:new", handleNewMessage);
    socket.on("messages:read", handleMessagesRead);

    return () => {
        socket.emit("chat:leave", { chatId });
        socket.off("message:new", handleNewMessage);
        socket.off("messages:read", handleMessagesRead);
    };
}, [socket, chatId, user?.id]);
    const handleLoadMore = useCallback(async () => {
        if (!chatId || !hasMore || !nextCursor || isFetchingMore) return;
        try {
            const page = await loadMessagesPage({
                chatId,
                limit: 30,
                cursorId: nextCursor,
            }).unwrap();
            setMessages((current) => mergeMessages([...page.messages, ...current]));
            setNextCursor(page.nextCursor);
            setHasMore(page.hasMore);
        } catch {
            setErrorText("Не вдалося завантажити попередні повідомлення");
        }
    }, [chatId, hasMore, isFetchingMore, loadMessagesPage, nextCursor]);

    useEffect(() => {
        const showSubscription = Keyboard.addListener('keyboardWillShow', (e) => {
            setKeyboardHeight(e.endCoordinates.height);
        });
        const hideSubscription = Keyboard.addListener('keyboardWillHide', () => {
            setKeyboardHeight(0);
        });
        const showSubscriptionAndroid = Keyboard.addListener('keyboardDidShow', (e) => {
            setKeyboardHeight(e.endCoordinates.height);
        });
        const hideSubscriptionAndroid = Keyboard.addListener('keyboardDidHide', () => {
            setKeyboardHeight(0);
        });
        return () => {
            showSubscription.remove();
            hideSubscription.remove();
            showSubscriptionAndroid.remove();
            hideSubscriptionAndroid.remove();
        };
    }, []);

    const handlePickImages = async () => {
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
            setSelectedImages((current) => [...current, ...images].slice(0, 6));
            setErrorText(null);
        } catch {
            setErrorText("Не вдалося вибрати зображення");
        } finally {
            setIsPickingImages(false);
        }
    };

    const removeSelectedImage = (index: number) => {
        setSelectedImages((current) =>
            current.filter((_, imageIndex) => imageIndex !== index),
        );
    };

    const handleSendMessage = () => {
    const text = messageText.trim();
    if (
        (!text && selectedImages.length === 0) ||
        !chatId ||
        !socket ||
        !isConnected ||
        isSendingRef.current
    ) {
        return;
    }

    isSendingRef.current = true;
    const tempId = -Date.now();
    const optimisticMessage: IChatMessage = {
        id: tempId,
        chat_id: chatId,
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

    isSendingRef.current = false; // ← ОДРАЗУ після setMessages, не чекаємо ack

   const timeout = setTimeout(() => {
    setMessages((current) => {
        const stillExists = current.some((message) => message.id === tempId);
        if (!stillExists) return current; // вже замінилось реальним — нічого не робимо
        return current.filter((message) => message.id !== tempId);
    });
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
        { chatId, text, images: imagesToSend },
        (response?: SocketAck<IChatMessage>) => {
            console.log('[SEND ACK received at]', Date.now(), 'response:', response?.status);
            clearTimeout(timeout);
            if (!response || response.status === "error") {
                setMessages((current) =>
                    current.filter((message) => message.id !== tempId),
                );
                setMessageText(text);
                setSelectedImages(imagesToSend);
                setErrorText(
                    response?.message || "Не вдалося відправити повідомлення",
                );
                return;
            }
            if (response.data) {
                setMessages((current) => {
                    const withoutOptimistic = current.filter(
                        (message) => message.id !== tempId,
                    );
                    return mergeMessages([response.data!, ...withoutOptimistic]);
                });
            }
        },
    );
};

    const handleBack = () => {
        if (onBack) {
            onBack();
            return;
        }
        router.back();
    };

    const handleUpdateGroup = async (payload: {
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
                    : error?.data?.message) ||
                    "Не вдалося оновити групу",
            );
        }
    };

    const handleDeleteGroup = () => {
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
    };

    const isLoadingChat = isCreatingChat || isInitialMessagesLoading;
    const isSendDisabled =
        (!messageText.trim() && selectedImages.length === 0) ||
        !chatId ||
        !isConnected;

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 80}
            style={[styles.chatFlexWrapper, keyboardHeight > 0 && { paddingBottom: keyboardHeight }]}
        >
            <View style={styles.chatCard}>
                <View style={styles.chatInnerHeader}>
                    <TouchableOpacity
                        onPress={handleBack}
                        style={styles.backButton}
                    >
                        <Ionicons
                            name="chevron-back"
                            size={22}
                            color="#8E8E93"
                        />
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
                    </View>

                    <View
                        ref={(el) => {
                            moreRef.current = el;
                        }}
                        collapsable={false}
                    >
                        <TouchableOpacity
                            style={styles.moreButton}
                            onPress={() => {
                                moreRef.current?.measureInWindow(
                                    (
                                        x: number,
                                        y: number,
                                        w: number,
                                        h: number,
                                    ) => {
                                        const MENU_WIDTH = 220;
                                        const statusBarHeight =
                                            Platform.OS === "android"
                                                ? StatusBar.currentHeight || 0
                                                : 0;
                                        const top =
                                            y + h + 8 - statusBarHeight;
                                        const left = Math.max(
                                            8,
                                            Math.round(x + w - MENU_WIDTH),
                                        );
                                        setMenuPosition({ top, left });
                                        setIsMenuVisible(true);
                                    },
                                );
                            }}
                        >
                            <ICONS.dots />
                        </TouchableOpacity>
                    </View>
                </View>

                <FlatList
                    maintainVisibleContentPosition={{ minIndexForVisible: 1 }}
                    ref={flatListRef as any}
                    inverted
                    data={messages}
                    keyExtractor={(item) => item.id.toString()}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.2}
                    keyboardShouldPersistTaps="handled"
                    onScroll={(e) => {
                        scrollOffsetY.current = e.nativeEvent.contentOffset.y;
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
                    renderItem={({ item, index }) => {
                        const isMe = item.sender_id === user?.id;
                        const senderName =
                            getUserDisplayName(item.sender) || activePeer.name;
                        const senderAvatar =
                            getUserAvatar(item.sender) || peerAvatar;
                        const nextItem = messages[index + 1];
                        const isNewDay =
                            !nextItem ||
                            !isSameDay(item.created_at, nextItem.created_at);
                        const formattedDate = new Date(
                            item.created_at,
                        ).toLocaleDateString("uk-UA", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                        });
                        const isFirstUnread = item.id === firstUnreadId;
                        const isReadByPeer =
                            isMe &&
                            (("is_read" in item && Boolean((item as any).is_read)) ||
                                ("isRead" in item && Boolean((item as any).isRead)) ||
                                ("read_at" in item && Boolean((item as any).read_at)) ||
                                ("readAt" in item && Boolean((item as any).readAt)));
                        return (
                            <View>
                                {isNewDay && (
                                    <View style={styles.dateSeparatorContainer}>
                                        <Text style={styles.dateSeparatorText}>
                                            {formattedDate}
                                        </Text>
                                    </View>
                                )}
                                {isFirstUnread && (
                                    <View style={additionalStyles.unreadDividerContainer}>
                                        <View style={additionalStyles.unreadDividerLine} />
                                        <Text style={additionalStyles.unreadDividerText}>
                                            Нові повідомлення
                                        </Text>
                                        <View style={additionalStyles.unreadDividerLine} />
                                    </View>
                                )}
                                <View
                                    style={
                                        isMe
                                            ? styles.myMessageRow
                                            : styles.otherMessageRow
                                    }
                                >
                                    {!isMe && (
                                        <Image
                                            source={{ uri: senderAvatar }}
                                            style={styles.messageAvatar}
                                        />
                                    )}
                                    <View
                                        style={[
                                            styles.bubble,
                                            isMe
                                                ? styles.myBubble
                                                : styles.otherBubble,
                                        ]}
                                    >
                                        {!isMe && (
                                            <Text style={styles.senderNameText}>
                                                {senderName}
                                            </Text>
                                        )}
                                        {(item.images?.length ?? 0) > 0 && (
                                            <View
                                                style={styles.messageImagesGrid}
                                            >
                                                {item.images?.map((image) => (
                                                    <Image
                                                        key={image.id}
                                                        source={{
                                                            uri:
                                                                toMediaUrl(
                                                                    image.image,
                                                                ) ||
                                                                image.image,
                                                        }}
                                                        style={
                                                            styles.messageImage
                                                        }
                                                    />
                                                ))}
                                            </View>
                                        )}
                                        {Boolean(item.text) && (
                                            <Text style={styles.messageText}>
                                                {item.text}
                                            </Text>
                                        )}
                                        <View style={styles.timeContainer}>
                                            <Text style={styles.timeText}>
                                                {formatMessageTime(
                                                    item.created_at,
                                                )}
                                            </Text>
                                            {isMe && (
                                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                                    <Ionicons
                                                        name="checkmark"
                                                        size={14}
                                                        color={isReadByPeer ? COLORS.plum : "#8E8E93"}
                                                        style={styles.checkIcon}
                                                    />
                                                    {isReadByPeer && (
                                                        <Ionicons
                                                            name="checkmark"
                                                            size={14}
                                                            color={COLORS.plum}
                                                            style={[styles.checkIcon, { marginLeft: -6 }]}
                                                        />
                                                    )}
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                </View>
                            </View>
                        );
                    }}
                    contentContainerStyle={styles.messagesListContent}
                    showsVerticalScrollIndicator={false}
                />

                {(errorText || groupActionError) && (
                    <Text style={styles.errorText}>
                        {errorText || groupActionError}
                    </Text>
                )}

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
                                    <Text style={styles.removeImageText}>
                                        x
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}

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

            <ChatPopUp
                isVisible={isMenuVisible}
                onClose={() => {
                    setIsMenuVisible(false);
                    setMenuPosition(null);
                }}
            />
        </KeyboardAvoidingView>
    );
}

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
        fontFamily: FONTS["GTWalsheimPro-Medium"],
    },
    chatTitleWrapper: {
        flex: 1,
        marginLeft: 12,
    },
    chatTitle: {
        fontSize: 16,
        fontFamily: FONTS["GTWalsheimPro-Medium"],
        color: "#1C1C1E",
    },
    chatSubtitle: {
        fontSize: 12,
        fontFamily: FONTS["GTWalsheimPro-Regular"],
        color: "#8E8E93",
        marginTop: 2,
    },
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
        fontFamily: FONTS["GTWalsheimPro-Regular"],
        color: "#8E8E93",
    },
    myMessageRow: {
        flexDirection: "row",
        alignSelf: "flex-end",
        marginVertical: 6,
        maxWidth: "75%",
        marginRight: 16,
    },
    otherMessageRow: {
        flexDirection: "row",
        alignSelf: "flex-start",
        marginVertical: 6,
        maxWidth: "75%",
        alignItems: "flex-end",
        marginLeft: 16,
    },
    messageAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#E5E5EA",
        marginRight: 8,
    },
    bubble: {
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
    },
    messageImagesGrid: {
        gap: 6,
        marginBottom: 6,
    },
    messageImage: {
        width: 180,
        height: 130,
        borderRadius: 8,
        backgroundColor: "#E5E5EA",
    },
    myBubble: {
        backgroundColor: "#E5E5EA",
        borderBottomRightRadius: 2,
    },
    otherBubble: {
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E5E5EA",
        borderBottomLeftRadius: 2,
    },
    senderNameText: {
        fontSize: 11,
        fontFamily: FONTS["GTWalsheimPro-Medium"],
        color: "#8E8E93",
        marginBottom: 3,
    },
    messageText: {
        fontSize: 14,
        fontFamily: FONTS["GTWalsheimPro-Regular"],
        color: "#1C1C1E",
        lineHeight: 18,
    },
    timeContainer: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-end",
        marginTop: 4,
    },
    timeText: {
        fontSize: 10,
        color: "#8E8E93",
        fontFamily: FONTS["GTWalsheimPro-Regular"],
    },
    checkIcon: {
        marginLeft: 4,
    },
    errorText: {
        paddingHorizontal: 16,
        paddingBottom: 8,
        color: "#FF3B30",
        fontSize: 12,
        fontFamily: FONTS["GTWalsheimPro-Regular"],
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
        fontFamily: FONTS["GTWalsheimPro-Medium"],
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
        fontFamily: "GTWalsheimPro-Regular",
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
    dateSeparatorContainer: {
        alignItems: "center",
        marginVertical: 12,
    },
    dateSeparatorText: {
        fontSize: 12,
        fontFamily: FONTS["GTWalsheimPro-Medium"],
        color: "#8E8E93",
        backgroundColor: "#F2F2F7",
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 10,
        overflow: "hidden",
    },
    unreadDividerContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 16,
        paddingHorizontal: 16,
    },
    unreadDividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: "#E5E5EA",
    },
    unreadDividerText: {
        marginHorizontal: 12,
        fontSize: 13,
        color: "#8E8E93",
        fontWeight: "500",
    },
    unreadBar: {
        position: "absolute",
        bottom: 70,
        left: 16,
        right: 16,
        zIndex: 100,
    },
    unreadPill: {
        position: 'absolute',
        right: 16,
        bottom: 120,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: '#E5E5EA',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 4,
        elevation: 3,
    },
    unreadPillText: {
        fontSize: 13,
        color: COLORS.plum,
        fontFamily: FONTS['GTWalsheimPro-Medium'],
    },
    unreadBarInner: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
        borderWidth: 1,
        borderColor: "#E5E5EA",
    },
    unreadBarText: {
        fontSize: 14,
        fontFamily: FONTS["GTWalsheimPro-Medium"],
        color: COLORS.plum,
        marginRight: 8,
    },
});

const additionalStyles = StyleSheet.create({
    unreadDividerContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 16,
        paddingHorizontal: 16,
    },
    unreadDividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: "#E5E5EA",
    },
    unreadDividerText: {
        marginHorizontal: 12,
        fontSize: 13,
        color: "#8E8E93",
        fontWeight: "500",
    },
});