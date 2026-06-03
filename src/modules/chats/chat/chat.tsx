import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import {
	ActivityIndicator,
	FlatList,
	Image,
	KeyboardAvoidingView,
	Platform,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
	StatusBar,
} from "react-native";
import {
	useCreatePersonalChatMutation,
	useLazyGetChatMessagesQuery,
	useMarkChatAsReadMutation,
} from "../../../shared/api/baseApi";
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
import type { IChatMessage } from "../types/chat";
import ChatPopUp from "./chatPopUp/chatPopUp";

export interface ChatPeer {
	id: number | string;
	name: string;
	avatar?: string;
	chatId?: number;
	isGroup?: boolean;
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
	const { user } = useUserContext();
	const { socket, isConnected } = useSocketContext();
	
	const [messageText, setMessageText] = useState("");
	const [selectedImages, setSelectedImages] = useState<string[]>([]);
	const [isPickingImages, setIsPickingImages] = useState(false);
	const [isMenuVisible, setIsMenuVisible] = useState(false);
	const moreRef = useRef<any>(null);
	const [menuPosition, setMenuPosition] = useState<{ top: number; left?: number; right?: number } | null>(null);
	const [chatId, setChatId] = useState<number | null>(
		peer?.chatId ?? (isPositiveNumber(Number(params.chatId)) ? Number(params.chatId) : null),
	);
	const [messages, setMessages] = useState<IChatMessage[]>([]);
	const [nextCursor, setNextCursor] = useState<number | null>(null);
	const [hasMore, setHasMore] = useState(false);
	const [isInitialMessagesLoading, setIsInitialMessagesLoading] =
		useState(false);
	const [errorText, setErrorText] = useState<string | null>(null);

	const [createPersonalChat, { isLoading: isCreatingChat }] =
		useCreatePersonalChatMutation();
	const [loadMessagesPage, { isFetching: isFetchingMore }] =
		useLazyGetChatMessagesQuery();
	const [markChatAsRead] = useMarkChatAsReadMutation();

	const activePeer = useMemo<ChatPeer>(
		() => ({
			id: peer?.id ?? params.id ?? "unknown",
			chatId: peer?.chatId,
			name: peer?.name || params.name || "Користувач",
			avatar: peer?.avatar || params.avatar,
			isGroup: peer?.isGroup,
		}),
		[params.avatar, params.id, params.name, peer],
	);
	const peerAvatar = toMediaUrl(activePeer.avatar) || DEFAULT_AVATAR_URL;

	const markCurrentChatAsRead = useCallback(async () => {
		if (!chatId) return;

		try {
			await markChatAsRead(chatId).unwrap();
			socket?.emit("messages:read", { chatId });
		} catch {
			// The next chat list refetch will correct the badge if this request fails.
		}
	}, [chatId, markChatAsRead, socket]);

	useEffect(() => {
		const existingChatId = peer?.chatId ?? Number(params.chatId);
		if (isPositiveNumber(existingChatId)) {
			setChatId(existingChatId);
			return;
		}
		
		if (activePeer.isGroup) return;
		const participantId = Number(activePeer.id);
		if (!isPositiveNumber(participantId)) return;
		
		let isMounted = true;
		createPersonalChat({ participantId })
		.unwrap()
		.then((chat) => {
			if (!isMounted) return;
			setChatId(chat.id);
			setErrorText(null);
		})
		.catch(() => {
				if (!isMounted) return;
				setErrorText("Не вдалося відкрити чат");
			});

			return () => {
			isMounted = false;
		};
	}, [
		activePeer.id,
		activePeer.isGroup,
		createPersonalChat,
		params.chatId,
		peer?.chatId,
	]);
	
	

	useEffect(() => {
		setMessages([]);
		setNextCursor(null);
		setHasMore(false);

		if (!chatId) return;

		let isMounted = true;
		setIsInitialMessagesLoading(true);

		loadMessagesPage({ chatId, limit: 30 }, false)
			.unwrap()
			.then((page) => {
				if (!isMounted) return;
				setMessages(mergeMessages(page.messages));
				setNextCursor(page.nextCursor);
				setHasMore(page.hasMore);
				setErrorText(null);
				markCurrentChatAsRead();
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
		};
	}, [chatId, loadMessagesPage, markCurrentChatAsRead]);

	useEffect(() => {
		if (!socket || !chatId) return;

		const handleNewMessage = (payload: {
			chatId: number;
			message: IChatMessage;
		}) => {
			if (payload.chatId !== chatId) return;
			setMessages((current) => mergeMessages([payload.message, ...current]));
			setErrorText(null);
			if (payload.message.sender_id !== user?.id) {
				markCurrentChatAsRead();
			}
		};

		socket.emit(
			"chat:join",
			{ chatId },
			(response?: SocketAck<void>) => {
				if (response?.status === "error") {
					setErrorText(response.message || "Не вдалося приєднатися до чату");
				}
			},
		);
		socket.on("message:new", handleNewMessage);

		return () => {
			socket.emit("chat:leave", { chatId });
			socket.off("message:new", handleNewMessage);
		};
	}, [socket, chatId, markCurrentChatAsRead, user?.id]);

	const handleLoadMore = useCallback(async () => {
		if (!chatId || !hasMore || !nextCursor || isFetchingMore) return;

		try {
			const page = await loadMessagesPage({
				chatId,
				limit: 30,
				cursorId: nextCursor,
			}).unwrap();

			setMessages((current) => mergeMessages([...current, ...page.messages]));
			setNextCursor(page.nextCursor);
			setHasMore(page.hasMore);
		} catch {
			setErrorText("Не вдалося завантажити попередні повідомлення");
		}
	}, [chatId, hasMore, isFetchingMore, loadMessagesPage, nextCursor]);

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
		if ((!text && selectedImages.length === 0) || !chatId || !socket || !isConnected) {
			if (text || selectedImages.length > 0) setErrorText("Немає з'єднання з чатом");
			return;
		}

		const imagesToSend = selectedImages;
		setMessageText("");
		setSelectedImages([]);
		let isSettled = false;
		const ackTimeout = setTimeout(() => {
			if (isSettled) return;
			isSettled = true;
			setMessageText(text);
			setSelectedImages(imagesToSend);
			setErrorText("Не вдалося відправити повідомлення");
		}, 15000);

		socket.emit(
			"message:send",
			{ chatId, text, images: imagesToSend },
			(response?: SocketAck<IChatMessage>) => {
				if (isSettled) return;
				isSettled = true;
				clearTimeout(ackTimeout);
				if (!response || response.status === "error") {
					setMessageText(text);
					setSelectedImages(imagesToSend);
					setErrorText(response?.message || "Не вдалося відправити повідомлення");
					return;
				}

				if (response.data) {
					setMessages((current) => mergeMessages([response.data!, ...current]));
				}
				setErrorText(null);
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

	const isLoadingChat = isCreatingChat || isInitialMessagesLoading;
	const isSendDisabled =
		(!messageText.trim() && selectedImages.length === 0) ||
		!chatId ||
		!isConnected;

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : undefined}
			keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
			style={styles.chatFlexWrapper}
		>
			<View style={styles.chatCard}>
				<View style={styles.chatInnerHeader}>
					<TouchableOpacity onPress={handleBack} style={styles.backButton}>
						<Ionicons name="chevron-back" size={22} color="#8E8E93" />
					</TouchableOpacity>

					<View style={styles.chatAvatar}>
						{peerAvatar ? (
							<Image source={{ uri: peerAvatar }} style={styles.chatAvatarImage} />
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
						<Text style={styles.chatSubtitle}>Особистий чат</Text>
					</View>

					<View ref={(el) => { moreRef.current = el; }} collapsable={false}>
						<TouchableOpacity
							style={styles.moreButton}
							onPress={() => {
								moreRef.current?.measureInWindow((x: number, y: number, w: number, h: number) => {
									const MENU_WIDTH = 220;
									const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;
									const top = y + h + 8 - statusBarHeight;
									const left = Math.max(8, Math.round(x + w - MENU_WIDTH));
									setMenuPosition({ top, left });
									setIsMenuVisible(true);
								});
							}}
						>
							<ICONS.dots />
						</TouchableOpacity>
					</View>
				</View>

				<FlatList
                    inverted
                    data={messages}
                    keyExtractor={(item) => item.id.toString()}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.2}
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
                        const senderName = getUserDisplayName(item.sender) || activePeer.name;
                        const senderAvatar = getUserAvatar(item.sender) || peerAvatar;
                        
                        // Так как список inverted, предыдущее по времени сообщение 
                        // находится на индекс ПЛЮС один (ниже на экране)
                        const nextItem = messages[index + 1];
                        
                        // Если следующего сообщения нет (это самый конец истории/начало чата)
                        // или день создания отличается — значит, это начало нового дня
                        const isNewDay = !nextItem || !isSameDay(item.created_at, nextItem.created_at);

                        const formattedDate = new Date(item.created_at).toLocaleDateString("uk-UA", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                        });

                        return (
                            <View>
                                {/* Показываем плашку даты, если это начало нового дня */}
                                {isNewDay && (
                                    <View style={styles.dateSeparatorContainer}>
                                        <Text style={styles.dateSeparatorText}>
                                            {formattedDate}
                                        </Text>
                                    </View>
                                )}

                                <View style={isMe ? styles.myMessageRow : styles.otherMessageRow}>
                                    {!isMe && (
                                        <Image
                                            source={{ uri: senderAvatar }}
                                            style={styles.messageAvatar}
                                        />
                                    )}

                                    <View
                                        style={[
                                            styles.bubble,
                                            isMe ? styles.myBubble : styles.otherBubble,
                                        ]}
                                    >
                                        {!isMe && (
                                            <Text style={styles.senderNameText}>{senderName}</Text>
                                        )}
                                        {(item.images?.length ?? 0) > 0 && (
                                            <View style={styles.messageImagesGrid}>
                                                {item.images?.map((image) => (
                                                    <Image
                                                        key={image.id}
                                                        source={{
                                                            uri: toMediaUrl(image.image) || image.image,
                                                        }}
                                                        style={styles.messageImage}
                                                    />
                                                ))}
                                            </View>
                                        )}
                                        {Boolean(item.text) && (
                                            <Text style={styles.messageText}>{item.text}</Text>
                                        )}

                                        <View style={styles.timeContainer}>
                                            <Text style={styles.timeText}>
                                                {formatMessageTime(item.created_at)}
                                            </Text>
                                            {isMe && (
                                                <Ionicons
                                                    name="checkmark"
                                                    size={14}
                                                    color="#8E8E93"
                                                    style={styles.checkIcon}
                                                />
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

				{errorText && <Text style={styles.errorText}>{errorText}</Text>}

				{selectedImages.length > 0 && (
					<View style={styles.selectedImagesRow}>
						{selectedImages.map((image, index) => (
							<View key={`${image.slice(0, 48)}-${index}`} style={styles.selectedImageWrapper}>
								<Image source={{ uri: image }} style={styles.selectedImage} />
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

				<View style={styles.bottomInputRow}>
					<View style={styles.inputFieldContainer}>
						<TextInput
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
				onClose={() => { setIsMenuVisible(false); setMenuPosition(null); }}
				onMediaPress={() => console.log("Media pressed")}
				onEditPress={() => console.log("Edit pressed")}
				onDeletePress={() => console.log("Delete pressed")}
				position={menuPosition ?? undefined}
				isGroup={!!activePeer.isGroup}
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
});