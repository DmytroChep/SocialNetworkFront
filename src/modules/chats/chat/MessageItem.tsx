import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { COLORS } from "../../../shared/constants";
import { FONTS } from "../../../shared/constants/fonts";
import { getUserAvatar, getUserDisplayName, toMediaUrl } from "../../../shared/lib/model-helpers";
import type { IChatMessage } from "../types/chat";

// ─── Pure helpers (outside component — never recreated) ────────────────────

export const formatMessageTime = (value?: string): string => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" });
};

export const isSameDay = (dateStr1: string, dateStr2: string): boolean => {
    const d1 = new Date(dateStr1);
    const d2 = new Date(dateStr2);
    return (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
    );
};

export const isMessageUnread = (
    m: IChatMessage | undefined | null,
    userId?: number,
): boolean => {
    if (!m || !userId) return false;
    if (m.sender_id === userId) return false;
    if ("is_read" in m) return !Boolean((m as any).is_read);
    if ("isRead" in m) return !Boolean((m as any).isRead);
    if ("read_at" in m) return !Boolean((m as any).read_at);
    if ("readAt" in m) return !Boolean((m as any).readAt);
    return false;
};

export const isReadByPeerCheck = (item: IChatMessage, isMe: boolean): boolean => {
    if (!isMe) return false;
    return (
        ("is_read" in item && Boolean((item as any).is_read)) ||
        ("isRead" in item && Boolean((item as any).isRead)) ||
        ("read_at" in item && Boolean((item as any).read_at)) ||
        ("readAt" in item && Boolean((item as any).readAt))
    );
};

// ─── Types ─────────────────────────────────────────────────────────────────

export interface MessageItemProps {
    item: IChatMessage;
    isMe: boolean;
    isFirstUnread: boolean;
    isReadByPeer: boolean;
    senderName: string;
    senderAvatar: string;
    isNewDay: boolean;
    formattedDate: string;
}

// ─── Component ─────────────────────────────────────────────────────────────

const MessageItem = memo(
    ({
        item,
        isMe,
        isFirstUnread,
        isReadByPeer,
        senderName,
        senderAvatar,
        isNewDay,
        formattedDate,
    }: MessageItemProps) => {
        return (
            <View>
                {isNewDay && (
                    <View style={styles.dateSeparatorContainer}>
                        <Text style={styles.dateSeparatorText}>{formattedDate}</Text>
                    </View>
                )}

                {isFirstUnread && (
                    <View style={styles.unreadDividerContainer}>
                        <View style={styles.unreadDividerLine} />
                        <Text style={styles.unreadDividerText}>Нові повідомлення</Text>
                        <View style={styles.unreadDividerLine} />
                    </View>
                )}

                <View style={isMe ? styles.myMessageRow : styles.otherMessageRow}>
                    {!isMe && (
                        <Image
                            source={{ uri: senderAvatar }}
                            style={styles.messageAvatar}
                        />
                    )}

                    <View style={[styles.bubble, isMe ? styles.myBubble : styles.otherBubble]}>
                        {!isMe && (
                            <Text style={styles.senderNameText}>{senderName}</Text>
                        )}

                        {(item.images?.length ?? 0) > 0 && (
                            <View style={styles.messageImagesGrid}>
                                {item.images?.map((image) => (
                                    <Image
                                        key={image.id}
                                        source={{ uri: toMediaUrl(image.image) || image.image }}
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
                                <View style={styles.checkRow}>
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
                                            style={styles.checkIconSecond}
                                        />
                                    )}
                                </View>
                            )}
                        </View>
                    </View>
                </View>
            </View>
        );
    },
    // Custom comparator — re-render only when something actually changed
    (prev, next) =>
        prev.item.id === next.item.id &&
        prev.item.text === next.item.text &&
        prev.isReadByPeer === next.isReadByPeer &&
        prev.isFirstUnread === next.isFirstUnread &&
        prev.isNewDay === next.isNewDay &&
        (prev.item.images?.length ?? 0) === (next.item.images?.length ?? 0),
);

MessageItem.displayName = "MessageItem";

export default MessageItem;

// ─── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
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
    checkRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    checkIcon: {
        marginLeft: 4,
    },
    checkIconSecond: {
        marginLeft: -6,
    },
});