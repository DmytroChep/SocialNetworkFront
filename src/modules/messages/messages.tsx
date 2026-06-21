import React, { useMemo } from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { toMediaUrl, getUserAvatar, DEFAULT_AVATAR_URL } from "../../shared/lib/model-helpers";
import { styles } from "./messages.styles";

const DEFAULT_AVATAR = DEFAULT_AVATAR_URL || "";

const getProfileUserId = (profile?: any) => profile?.user?.id ?? profile?.user_id;

const profileName = (profile: any, fallbackUser?: any) => {
    const fullName = [
        profile.user?.first_name ?? fallbackUser?.first_name,
        profile.user?.last_name ?? fallbackUser?.last_name,
    ].filter(Boolean).join(" ").trim();
    return profile.pseudonym || fallbackUser?.profile?.pseudonym || fullName || profile.user?.username || "Користувач";
};

const profileToCardUser = (profile: any, fallbackUser?: any) => ({
    id: profile.user?.id ?? profile.user_id ?? fallbackUser?.id ?? 0,
    name: profileName(profile, fallbackUser),
    avatar: toMediaUrl(profile.avatar, 'avatar', profile.user?.id ?? profile.user_id) || getUserAvatar(fallbackUser) || DEFAULT_AVATAR,
});

const getFriendProfile = (friendship: any, currentUserId?: number, currentProfileId?: number) => {
    if (friendship.from_profile_id === currentProfileId) return friendship.to_profile;
    if (friendship.to_profile_id === currentProfileId) return friendship.from_profile;
    if (getProfileUserId(friendship.from_profile) === currentUserId) return friendship.to_profile;
    return friendship.from_profile;
};

export default function MessageList({ friendships, users, currentUserId, currentProfileId }: any) {
    const usersById = useMemo(() => new Map(users.map((item: any) => [item.id, item])), [users]);

    const chatList = useMemo(() => {
        if (!friendships || !friendships.friends) return [];
        return friendships.friends.map((friendship: any) => {
            const friendProfile = getFriendProfile(friendship, currentUserId, currentProfileId);
            const cardUser = profileToCardUser(friendProfile, usersById.get(getProfileUserId(friendProfile) ?? 0));
            return {
                ...cardUser,
                lastMessage: "Привіт! Як справи?",
                time: "09:41",
                unreadCount: friendship.id % 3 === 0 ? 1 : 0,
            };
        });
    }, [friendships, usersById, currentUserId, currentProfileId]);

    return (
        <FlatList
            data={chatList}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
                <TouchableOpacity style={styles.chatItem}>
                    <View style={styles.avatarContainer}>
                        <Image source={{ uri: item.avatar }} style={styles.avatar} />
                        <View style={styles.onlineStatus} />
                    </View>
                    <View style={styles.content}>
                        <View style={styles.headerRow}>
                            <Text style={styles.name}>{item.name}</Text>
                            <Text style={styles.time}>{item.time}</Text>
                        </View>
                        <View style={styles.msgRow}>
                            <Text style={styles.lastMsg} numberOfLines={1}>{item.lastMessage}</Text>
                            
                            {item.unreadCount > 0 ? (
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>{item.unreadCount}</Text>
                                </View>
                            ) : (
                                <View style={styles.statusIcons}>
                                    <ICONS.tick size={16} color="#4A314D" />
                                    <ICONS.tick size={16} color="#4A314D" style={{ marginLeft: -8 }} />
                                </View>
                            )}
                        </View>
                    </View>
                </TouchableOpacity>
            )}
        />
    );
}