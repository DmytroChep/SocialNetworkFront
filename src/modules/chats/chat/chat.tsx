import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import ChatPopUp from "./chatPopUp/chatPopUp";

import { FONTS } from "../../../shared/constants/fonts";
import {
    DEFAULT_AVATAR_URL,
    toMediaUrl,
} from "../../../shared/lib/model-helpers";
import { ICONS } from "../../../shared/icons";
import { COLORS } from "../../../shared/constants";

interface Message {
    id: string;
    text: string;
    time: string;
    isMe: boolean;
    senderName?: string;
    date: string;
}

export interface ChatPeer {
    id: number | string;
    name: string;
    avatar?: string;
    isGroup?: boolean;
}

interface ChatProps {
    peer?: ChatPeer;
    onBack?: () => void;
}

const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    const initials =
        parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : name.slice(0, 2);

    return initials.toUpperCase();
};

export default function Chat({ peer, onBack }: ChatProps) {
    const router = useRouter();
    const params = useLocalSearchParams<{
        name?: string;
        avatar?: string;
        id?: string;
    }>();
    
    const [messageText, setMessageText] = useState("");
    const [isMenuVisible, setIsMenuVisible] = useState(false);

    const activePeer = useMemo<ChatPeer>(
        () => ({
            id: peer?.id ?? params.id ?? "unknown",
            name: peer?.name || params.name || "Користувач",
            avatar: peer?.avatar || params.avatar,
            isGroup: peer?.isGroup,
        }),
        [params.avatar, params.id, params.name, peer],
    );
    const peerAvatar = toMediaUrl(activePeer.avatar) || DEFAULT_AVATAR_URL;

    const [messages, setMessages] = useState<Message[]>([
    { id: "1", text: "Чудово!", time: "10:30", date: "25 квітня 2025", isMe: false },
    { id: "2", text: "Привіт! Як справи ?", time: "10:30", date: "25 квітня 2025", isMe: false },
    { id: "3", text: "Привіт!", time: "10:01", date: "24 квітня 2025", isMe: true },
]);

    const handleSendMessage = () => {
        if (!messageText.trim()) return;

        const newMessage: Message = {
            id: Date.now().toString(),
            text: messageText.trim(),
            time: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            }),
            date: getCurrentFormattedDate(),
            isMe: true,
        };

        setMessages((prev) => [newMessage, ...prev]);
        setMessageText("");
    };

    const handleBack = () => {
        if (onBack) {
            onBack();
            return;
        }

        router.back();
    };

    const getCurrentFormattedDate = (): string => {
        return new Date().toLocaleDateString("uk-UA", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

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

                    <TouchableOpacity style={styles.moreButton} onPress={() => setIsMenuVisible(true)}>
                        <ICONS.dots />
                    </TouchableOpacity>
                </View>

                <FlatList
                    inverted
                    data={messages}
                    keyExtractor={(item) => item.id}
                    ListFooterComponent={() => (
                        <View style={styles.dateSeparatorContainer}>
                            <View style={styles.dateBadge}>
                                <Text style={styles.dateText}>25 квітня 2025</Text>
                            </View>
                        </View>
                    )}
                    renderItem={({ item, index }) => {
                        const showNewMessagesSeparator = index === 1;
                        const senderName = item.senderName || activePeer.name;

                        const nextMessage = messages[index + 1];
                        const showDateSeparator = !nextMessage || nextMessage.date !== item.date;

                        return (
                            <View>
                                {showDateSeparator && (
                                    <View style={styles.dateSeparatorContainer}>
                                        <View style={styles.dateBadge}>
                                            <Text style={styles.dateDateText}>{item.date}</Text>
                                        </View>
                                    </View>
                                )}

                                <View style={item.isMe ? styles.myMessageRow : styles.otherMessageRow}>
                                    {!item.isMe && (
                                        <Image
                                            source={{ uri: peerAvatar }}
                                            style={styles.messageAvatar}
                                        />
                                    )}

                                    <View
                                        style={[
                                            styles.bubble,
                                            item.isMe ? styles.myBubble : styles.otherBubble,
                                        ]}
                                    >
                                        {!item.isMe && (
                                            <Text style={styles.senderNameText}>{senderName}</Text>
                                        )}
                                        <Text style={styles.messageText}>{item.text}</Text>

                                        <View style={styles.timeContainer}>
                                            <Text style={styles.timeText}>{item.time}</Text>
                                            <Ionicons
                                                name="checkmark"
                                                size={14}
                                                color="#8E8E93"
                                                style={styles.checkIcon}
                                            />
                                        </View>
                                    </View>
                                </View>

                                {showNewMessagesSeparator && (
                                    <View style={styles.newMessagesLineContainer}>
                                        <View style={styles.line} />
                                        <Text style={styles.newMessagesText}>
                                            Нові повідомлення
                                        </Text>
                                        <View style={styles.line} />
                                    </View>
                                )}
                            </View>
                        );
                    }}
                    contentContainerStyle={styles.messagesListContent}
                    showsVerticalScrollIndicator={false}
                />

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

                    <TouchableOpacity style={styles.imageAttachmentButton}>
                        <ICONS.image />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.sendActionButton,
                            !messageText.trim() && styles.sendActionButtonDisabled,
                        ]}
                        onPress={handleSendMessage}
                        disabled={!messageText.trim()}
                    >
                        <ICONS.Send />
                    </TouchableOpacity>
                </View>
            </View>

            <ChatPopUp 
                isVisible={isMenuVisible}
                onClose={() => setIsMenuVisible(false)}
                onMediaPress={() => console.log("Media pressed")}
                onEditPress={() => console.log("Edit pressed")}
                onDeletePress={() => console.log("Delete pressed")}
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
    },
    dateSeparatorContainer: {
        alignItems: "center",
        marginVertical: 12,
    },
    dateBadge: {
        backgroundColor: "#F2F2F7",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    dateText: {
        fontSize: 12,
        fontFamily: FONTS["GTWalsheimPro-Regular"],
        color: "#8E8E93",
    },
    newMessagesLineContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 16,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: "#F2F2F7",
    },
    newMessagesText: {
        fontSize: 12,
        fontFamily: FONTS["GTWalsheimPro-Regular"],
        color: "#8E8E93",
        marginHorizontal: 10,
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
        backgroundColor: COLORS.plum,
    },
    dateSeparatorContainer: {
        alignItems: "center",
        marginVertical: 16,
    },
    dateBadge: {
        backgroundColor: "#F2F2F7",
        paddingHorizontal: 14,
        paddingVertical: 5,
        borderRadius: 10,
    },
    dateDateText: {
        fontSize: 12,
        color: "#8E8E93",         
        fontFamily: FONTS["GTWalsheimPro-Medium"],
});