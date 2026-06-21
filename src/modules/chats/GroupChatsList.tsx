import { useState } from "react";
import {
	FlatList,
	Text,
	TextInput,
	TouchableOpacity,
	View,
	Image,
} from "react-native";
import { styles } from "./group-chats-list.styles";
import { ICONS } from "../../shared/icons";
import type { IChatMember } from "./types/chat";
import type { GroupEditUser } from "./EditGroupModal";

interface GroupChatItem {
    id: number;
    chatId: number;
    name: string;
    avatar?: string;
    lastMessage?: string;
    time?: string;
    unreadCount?: number;
    adminId?: number | string | null;
    isAdmin?: boolean;
    users?: IChatMember[];
    editContacts?: GroupEditUser[];
}

interface GroupChatsListProps {
    chats?: GroupChatItem[];
    onChatPress?: (chat: GroupChatItem) => void;
}

export function GroupChatsList({ chats = [], onChatPress }: GroupChatsListProps) {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredChats = chats.filter((chat) =>
        chat.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    return (
        <View style={styles.cardContainer}>
            <View style={styles.searchWrapper}>
                <ICONS.search color="#8E8E93" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Пошук"
                    placeholderTextColor="#8E8E93"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            <FlatList
                data={filteredChats}
                keyExtractor={(item) => item.chatId.toString()}
                renderItem={({ item }) => {
                    return (
                        <TouchableOpacity
                            style={styles.chatItem}
                            onPress={() => onChatPress?.(item)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.avatarCircle}>
                                {item.avatar ? (
                                    <Image source={{ uri: item.avatar }} style={styles.avatarImage} />
                                ) : (
                                    <Text style={styles.avatarText}>{item.name.substring(0, 2).toUpperCase()}</Text>
                                )}
                            </View>

                            <View style={styles.content}>
                                <View style={styles.headerRow}>
                                    <Text style={styles.name}>{item.name}</Text>
                                    <Text style={styles.time}>{item.time}</Text>
                                </View>
                                <View style={styles.messageRow}>
                                    <Text style={styles.lastMsg} numberOfLines={1}>
                                        {item.lastMessage}
                                    </Text>
                                    {(item.unreadCount ?? 0) > 0 && (
                                        <View style={styles.unreadBadge}>
                                            <Text style={styles.unreadBadgeText}>
                                                {item.unreadCount}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        </TouchableOpacity>
                    );
                }}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}
