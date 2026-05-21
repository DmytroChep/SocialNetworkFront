import React, { useState, useMemo } from "react";
import { 
    View, 
    Text, 
    StyleSheet, 
    Pressable, 
    ActivityIndicator, 
    FlatList, 
    Image, 
    TouchableOpacity 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ICONS } from "../../shared/icons";
import { COLORS } from "../../shared/constants";
import { FONTS } from "../../shared/constants/fonts";
import { useGetUserFriendshipsQuery, useGetAllUsersQuery } from "../../shared/api/baseApi";
import { useUserContext } from "../../shared/context/user-context";
import { toMediaUrl, getUserAvatar } from "../../shared/lib/model-helpers";

// Підключаємо новий компонент групових чатів
import { GroupChatsList } from "../../modules/chats/GroupChatsList.tsx";

const DEFAULT_AVATAR = toMediaUrl("/media/avatars/default_avatar.png") || "";

const getProfileUserId = (profile?: any) => profile?.user?.id ?? profile?.user_id;

const profileName = (profile: any, fallbackUser?: any) => {
    const fullName = [
        profile.user?.first_name ?? fallbackUser?.first_name,
        profile.user?.last_name ?? fallbackUser?.last_name,
    ].filter(Boolean).join(" ").trim();

    return profile.pseudonym 
        || fallbackUser?.profile?.pseudonym 
        || fullName 
        || profile.user?.username 
        || fallbackUser?.username 
        || "Користувач";
};

const profileToCardUser = (profile: any, fallbackUser?: any) => ({
    id: profile.user?.id ?? profile.user_id ?? fallbackUser?.id ?? 0,
    name: profileName(profile, fallbackUser),
    avatar: toMediaUrl(profile.avatar) || getUserAvatar(fallbackUser) || DEFAULT_AVATAR,
});

const getFriendProfile = (friendship: any, currentUserId?: number, currentProfileId?: number) => {
    if (friendship.from_profile_id === currentProfileId) return friendship.to_profile;
    // Беремо логіку з гілки David: якщо поточний юзер є отримувачем, то друг - це відправник
    if (friendship.to_profile_id === currentProfileId) return friendship.from_profile;
    if (getProfileUserId(friendship.from_profile) === currentUserId) return friendship.to_profile;
    return friendship.from_profile;
};

export default function Chats() {
    const { user } = useUserContext();
    const currentUserId = user?.id;
    const currentProfileId = user?.profile?.id;

    const { data: friendshipsResponse, isLoading: isFriendshipsLoading } = 
        useGetUserFriendshipsQuery(currentUserId as number, { skip: !currentUserId });
    
    const { data: users = [], isLoading: isUsersLoading } = useGetAllUsersQuery();

    const [choosedTab, setChoosedTab] = useState<string>("Повідомлення");

    const usersById = useMemo(() => new Map(users.map((item) => [item.id, item])), [users]);

    const friendsList = useMemo(() => {
        if (!friendshipsResponse?.friends) return [];

        return friendshipsResponse.friends.map((friendship: any) => {
            const friendProfile = getFriendProfile(friendship, currentUserId, currentProfileId);
            return profileToCardUser(friendProfile, usersById.get(getProfileUserId(friendProfile) ?? 0));
        });
    }, [friendshipsResponse, usersById, currentUserId, currentProfileId]);

    const chatList = useMemo(() => {
        return friendsList.map((friend, index) => ({
            ...friend,
            lastMessage: "Привіт! Як справи?",
            time: "09:41",
            unreadCount: (index + 1) % 3 === 0 ? 1 : 0, 
        }));
    }, [friendsList]);

    const radioTabsArray = [
        { title: "Контакти", icon: <ICONS.people /> },
        { title: "Повідомлення", icon: <ICONS.chat /> },
        { title: "Групові чати", icon: <ICONS.chat /> },
    ];

    if (isFriendshipsLoading || isUsersLoading) {
        return <ActivityIndicator style={styles.loader} color={COLORS.darkBlue} />;
    }

    return (
        <SafeAreaView style={styles.container} edges={["left", "right"]}>
            <View style={styles.flexElement}>
                
                <View style={styles.tabs}>
                    {radioTabsArray.map((element) => (
                        <Pressable 
                            key={element.title}
                            style={choosedTab === element.title ? styles.choosedRadioTabs : styles.radioTabItem}
                            onPress={() => setChoosedTab(element.title)}
                        >
                            {element.icon}
                            <Text style={{ 
                                fontSize: 13, 
                                fontFamily: choosedTab === element.title ? FONTS["GTWalsheimPro-Medium"] : FONTS["GTWalsheimPro-Regular"] 
                            }}>
                                {element.title}
                            </Text>
                        </Pressable>
                    ))}
                </View>

                <View style={styles.contentContainer}>
                    
                    {choosedTab === "Контакти" && (
                        <FlatList
                            data={friendsList}
                            keyExtractor={(item) => item.id.toString()}
                            showsVerticalScrollIndicator={false}
                            renderItem={({ item }) => (
                                <TouchableOpacity style={styles.contactItem}>
                                    <View style={styles.avatarContainer}>
                                        <Image source={{ uri: item.avatar }} style={styles.avatar} />
                                        <View style={styles.onlineStatus} />
                                    </View>
                                    <View style={styles.content}>
                                        <Text style={styles.name}>{item.name}</Text>
                                        <Text style={styles.statusText}>У мережі</Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                        />
                    )}

                    {choosedTab === "Повідомлення" && (
                        <FlatList
                            data={chatList}
                            keyExtractor={(item) => item.id.toString()}
                            showsVerticalScrollIndicator={false}
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
                                            {item.unreadCount > 0 && (
                                                <View style={styles.badge}>
                                                    <Text style={styles.badgeText}>{item.unreadCount}</Text>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            )}
                        />
                    )}

                    {choosedTab === "Групові чати" && (
                        <GroupChatsList friends={friendsList} />
                    )}

                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1, 
        backgroundColor: "white"
    },
    flexElement: {
        flex: 1
    },
    loader: {
        flex: 1, 
        justifyContent: 'center'
    },
    tabs: {
        width: "100%",
        paddingHorizontal: 16,
        justifyContent: "space-between",
        flexDirection: "row",
    },
    radioTabItem: {
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        paddingVertical: 8,
        flex: 1
    },
    choosedRadioTabs: {
        alignItems: "center",
        paddingVertical: 8,
        justifyContent: "center",
        gap: 6,
        borderTopColor: COLORS.darkBlue,
        borderTopWidth: 2,
        flex: 1
    },
    contentContainer: {
        flex: 1, 
        paddingHorizontal: 16
    },
    chatItem: { 
        flexDirection: 'row', 
        paddingVertical: 14, 
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#F8F8F8'
    },
    contactItem: {
        flexDirection: 'row', 
        paddingVertical: 12, 
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#F8F8F8'
    },
    avatarContainer: { 
        position: 'relative' 
    },
    avatar: { 
        width: 56, 
        height: 56, 
        borderRadius: 28, 
        backgroundColor: '#EEE' 
    },
    onlineStatus: { 
        position: 'absolute', 
        bottom: 2, 
        right: 2, 
        width: 14, 
        height: 14, 
        borderRadius: 7, 
        backgroundColor: '#4CD964', 
        borderWidth: 2, 
        borderColor: '#FFF' 
    },
    content: { 
        flex: 1, 
        marginLeft: 15 
    },
    headerRow: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
    },
    name: { 
        fontSize: 16, 
        fontFamily: FONTS["GTWalsheimPro-Medium"], 
        color: '#1C1C1E' 
    },
    time: { 
        fontSize: 12, 
        color: '#8E8E93', 
        fontFamily: FONTS["GTWalsheimPro-Regular"] 
    },
    statusText: {
        fontSize: 13, 
        color: '#8E8E93', 
        marginTop: 2,
        fontFamily: FONTS["GTWalsheimPro-Regular"]
    },
    msgRow: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        marginTop: 4, 
        alignItems: 'center' 
    },
    lastMsg: { 
        fontSize: 14, 
        color: '#636366', 
        flex: 1, 
        fontFamily: FONTS["GTWalsheimPro-Regular"] 
    },
    badge: { 
        backgroundColor: '#4A314D', 
        minWidth: 20, 
        height: 20, 
        borderRadius: 10, 
        justifyContent: 'center', 
        alignItems: 'center', 
        paddingHorizontal: 6 
    },
    badgeText: { 
        color: '#FFF', 
        fontSize: 10, 
        fontFamily: FONTS["GTWalsheimPro-Medium"] 
    },
    centeredContent: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center' 
    }
});