import { Ionicons } from "@expo/vector-icons";
import { memo, useState, useMemo } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { COLORS } from "../../../shared/constants";
import { FONTS } from "../../../shared/constants/fonts";
import { DEFAULT_AVATAR_URL, getUserAvatar, getUserDisplayName, toMediaUrl, BACKEND_MEDIA_BASE, CLOUDINARY_BASE } from "../../../shared/lib/model-helpers";
import type { IChatMessage } from "../types/chat";

// ─── Pure helpers (outside component — never recreated) ────────────────────

const BoundedImage = memo(({ uri, style }: { uri: string; style: any }) => {
    const [failed, setFailed] = useState(false);
    if (failed) return null; // просто ховаємо якщо 404
    return (
        <Image
            source={{ uri }}
            style={style}
            onError={() => setFailed(true)}
        />
    );
}); 

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
    senderAvatar?: string;
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
        const [avatarIndex, setAvatarIndex] = useState(0);
        const rawAvatar = senderAvatar || DEFAULT_AVATAR_URL;
        const avatarCandidates = useMemo(() => {
            const c: string[] = [];
            if (!rawAvatar) return [DEFAULT_AVATAR_URL];
            // absolute URL first
            if (/^https?:\/\//i.test(rawAvatar)) c.push(rawAvatar);
            // if it contains /media/, try extracting public path for cloudinary
            try {
                const mediaIdx = rawAvatar.indexOf('/media/');
                if (mediaIdx !== -1) {
                    const publicPath = rawAvatar.slice(mediaIdx + '/media/'.length);
                    if (CLOUDINARY_BASE && publicPath) c.unshift(`${CLOUDINARY_BASE}/${publicPath}`);
                }
            } catch (e) {}
            // backend absolute
            if (rawAvatar.startsWith(BACKEND_MEDIA_BASE)) c.push(rawAvatar);
            // backend media path for non-absolute
            if (!rawAvatar.startsWith('http') && rawAvatar.length) c.push(`${BACKEND_MEDIA_BASE}/media/${rawAvatar}`);
            // cloudinary candidate for raw path
            if (CLOUDINARY_BASE && !rawAvatar.startsWith('http')) c.unshift(`${CLOUDINARY_BASE}/${rawAvatar}`);
            if (!c.includes(DEFAULT_AVATAR_URL)) c.push(DEFAULT_AVATAR_URL);
            return Array.from(new Set(c));
        }, [rawAvatar]);
        const avatarUri = (() => {
            const exts = [".png", ".jpg", ".jpeg", ".webp"];
            const base = avatarCandidates;
            const expanded: string[] = [];
            for (const item of base) {
                expanded.push(item);
                try {
                    const hasExt = /\.[a-z0-9]{2,5}($|\?)/i.test(item);
                    if (!hasExt) {
                        for (const e of exts) expanded.push(item + e);
                    }
                } catch (e) {}
            }
            const uniq = Array.from(new Set(expanded));
            return uniq[avatarIndex] || DEFAULT_AVATAR_URL;
        })();
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
                            source={{ uri: avatarUri }}
                            style={styles.messageAvatar}
                            onError={(e) => {
                                try { console.debug('[MessageItem Avatar] load error, src=', avatarUri, 'error=', e.nativeEvent?.error); } catch (err) {}
                                if (avatarIndex < avatarCandidates.length - 1) setAvatarIndex((i) => i + 1);
                            }}
                            onLoad={() => {
                                try { console.debug('[MessageItem Avatar] loaded', avatarUri); } catch (err) {}
                            }}
                        />
                    )}

                    <View style={[styles.bubble, isMe ? styles.myBubble : styles.otherBubble]}>
                        {!isMe && (
                            <Text style={styles.senderNameText}>{senderName}</Text>
                        )}

                        {(item.images?.length ?? 0) > 0 && (
                            <View style={styles.messageImagesGrid}>
                                {item.images?.map((image) => {
                        const resolvedUri = toMediaUrl(image.image, 'message', item.sender_id) || image.image;
    
    return (
        <BoundedImage
            key={image.id}
            uri={resolvedUri}
            style={styles.messageImage}
        />
    );
})} 
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
        <Text style={{ color: isReadByPeer ? COLORS.plum : "#8E8E93", fontSize: 12 }}>
            {isReadByPeer ? "✓✓" : "✓"}
        </Text>
    </View>
)}
                        </View>
                    </View>
                </View>
            </View>
        );
    },
    (prev, next) =>
    prev.item.id === next.item.id &&
    prev.item.text === next.item.text &&
    prev.isReadByPeer === next.isReadByPeer &&
    prev.isFirstUnread === next.isFirstUnread &&
    prev.isNewDay === next.isNewDay &&
    prev.senderAvatar === next.senderAvatar &&
    prev.senderName === next.senderName &&
    (prev.item.images?.length ?? 0) === (next.item.images?.length ?? 0) &&
    JSON.stringify(prev.item.images?.map(i => i.image)) === 
    JSON.stringify(next.item.images?.map(i => i.image)),
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