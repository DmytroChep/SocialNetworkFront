import { Tabs, usePathname } from "expo-router";
import { Pressable, StyleSheet, View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ICONS } from "../../shared/icons";
import { Header } from "../../shared/ui/Header";
import { COLORS } from "../../shared/constants";
import React, { useState, useMemo } from "react";
import { useUserContext } from "../../shared/context/user-context";

import { CreatePostModal } from "../../modules/my-publications/ui/plus/createPostModal";
import { CreateGroupChatModal } from "../../modules/chats/createGroupChat";
import { CreateGroupDetailsModal } from "../../modules/chats/CreateGroupDetailsModal";
import { useCreateGroupChatMutation, useGetUserFriendshipsQuery } from "../../shared/api/baseApi";
import { toMediaUrl, DEFAULT_AVATAR_URL } from "../../shared/lib/model-helpers";
import type { IFriendshipProfile, IProfileFriend } from "../../modules/friends/types/Friendship.type";
import type { IUser } from "../../shared/context/types";
import {
    GroupCreationProvider,
    useGroupCreation,
} from "../../shared/context/group-creation-context";

export const styles = StyleSheet.create({
    activeInner: {
        alignItems: "center",
        paddingTop: 6,
        paddingHorizontal: 4,
    },
    inactiveInner: {
        alignItems: "center",
        paddingTop: 9,
        paddingHorizontal: 4,
    },
    tabIndicator: {
        height: 3,
        borderRadius: 2,
        backgroundColor: COLORS.darkBlue,
        marginBottom: 6,
        width: 70
    },
    tabIconWrapper: {
        position: "relative",
        alignItems: "center"
    },
    tabBadge: {
        position: "absolute",
        top: -6,
        right: -8,
        backgroundColor: "#FF3B30",
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 4,
    },
    tabBadgeText: {
        color: "#FFF",
        fontSize: 11,
        fontFamily: "GTWalsheimPro-Medium",
    },
    footer: {
        height: 64,
        width: "auto",
    },
});

const TabButton = ({ route, children, badge = 0, ...props }: any) => {
    const pathname = usePathname();
    const isActive = pathname.includes(route);

    return (
        <Pressable
            {...props}
            style={{ alignItems: "center", justifyContent: "flex-start" }}
        >
            <View style={isActive ? styles.activeInner : styles.inactiveInner}>
                {isActive && <View style={styles.tabIndicator} />}

                <View style={styles.tabIconWrapper}>
                    {children}
                    {badge > 0 && (
                        <View style={styles.tabBadge}>
                            <Text style={styles.tabBadgeText}>{badge}</Text>
                        </View>
                    )}
                </View>
            </View>
        </Pressable>
    );
};

export default function TabsLayout() {
    const [isPostModalVisible, setIsPostModalVisible] = useState(false);
    const { user } = useUserContext();
    const currentUserId = user?.id;

    const ChatsHeader = () => {
        const { openStep1 } = useGroupCreation();
        return (
            <Header
                hiddenButtons={{ plus: true, settings: false, exit: true }}
                onPlusPress={() => openStep1()}
            />
        );
    };

    const GroupCreationModals = () => {
        const { step, contacts, selectedUsers, close, back, removeUser, openStep2 } = useGroupCreation();
        const [createGroupChat, { isLoading: isCreatingGroup }] = useCreateGroupChatMutation();
        const [createGroupError, setCreateGroupError] = useState<string | null>(null);

        const closeGroupCreation = () => {
            setCreateGroupError(null);
            close();
        };

        const backToParticipants = () => {
            setCreateGroupError(null);
            back();
        };

        const { data: friendshipsResponse, isLoading: isFriendshipsLoading } = useGetUserFriendshipsQuery(
            (user as any)?.id as number,
            { skip: !(user as any)?.id },
        );

        const currentUserId = (user as any)?.id;
        const currentProfileId = (user as any)?.profile?.id;

        const getProfileUserId = (profile?: IFriendshipProfile) => profile?.user?.id ?? profile?.user_id;

        const profileName = (profile: IFriendshipProfile, fallbackUser?: IUser) => {
            const fullName = [
                profile.user?.first_name ?? fallbackUser?.first_name,
                profile.user?.last_name ?? fallbackUser?.last_name,
            ]
                .filter(Boolean)
                .join(" ")
                .trim();

            return (
                profile.pseudonym ||
                fallbackUser?.profile?.pseudonym ||
                fullName ||
                profile.user?.username ||
                fallbackUser?.username ||
                "Користувач"
            );
        };

        const getFriendProfile = (
            friendship: IProfileFriend,
            currentUserId?: number,
            currentProfileId?: number,
        ) => {
            if (friendship.from_profile_id === currentProfileId) return friendship.to_profile;
            if (friendship.to_profile_id === currentProfileId) return friendship.from_profile;
            if (getProfileUserId(friendship.from_profile) === currentUserId) return friendship.to_profile;
            return friendship.from_profile;
        };

        const derivedFriends = (friendshipsResponse?.friends ?? []).map((friendship) => {
            const friendProfile = getFriendProfile(friendship, currentUserId, currentProfileId);

            return {
                id: friendProfile.user?.id ?? friendProfile.user_id,
                name: profileName(friendProfile),
                avatar: toMediaUrl(friendProfile.avatar, 'avatar', friendProfile.user?.id ?? friendProfile.user_id) || DEFAULT_AVATAR_URL,
                avatarColor: "#5C465A",
            };
        });

        const contactsToUse = contacts ?? derivedFriends;

        return (
            <>
                {React.createElement(CreateGroupChatModal as any, {
                    visible: step === 1,
                    contacts: contactsToUse,
                    isLoading: isFriendshipsLoading,
                    onClose: closeGroupCreation,
                    onNext: (users: any) => {
                        setCreateGroupError(null);
                        openStep2(users as any);
                    },
                })}

                <CreateGroupDetailsModal
                    visible={step === 2}
                    selectedUsers={selectedUsers}
                    onClose={closeGroupCreation}
                    onBack={backToParticipants}
                    onRemoveUser={removeUser}
                    isCreating={isCreatingGroup}
                    errorText={createGroupError}
                    onCreateGroup={async (groupName, participantsIds, avatar) => {
                        setCreateGroupError(null);
                        try {
                            await createGroupChat({
                                name: groupName,
                                userIds: participantsIds,
                                avatar,
                            }).unwrap();
                            closeGroupCreation();
                        } catch (error: any) {
                            setCreateGroupError(
                                (typeof error?.data === "string"
                                    ? error.data
                                    : error?.data?.message) ||
                                    "Не вдалося створити групу",
                            );
                        }
                    }}
                />
            </>
        );
    };

    return (
        <SafeAreaView
            edges={["bottom"]}
            style={{
                flex: 1,
                backgroundColor: "white",
                width: "100%",
            }}
        >
            <GroupCreationProvider>
            <Tabs
                screenOptions={{
                    header: () => (
                        <Header
                            hiddenButtons={{ settings: true, exit: true }}
                            onPlusPress={() => setIsPostModalVisible(true)}
                        />
                    ),
                    tabBarStyle: styles.footer,
                    tabBarLabelStyle: { color: COLORS.darkBlue, fontSize: 14 },
                }}
            >
                <Tabs.Screen
                    name="main"
                    options={{
                        title: "Головна",
                        header: () => (
                            <Header
                                hiddenButtons={{plus: true, settings: true, exit: true }}
                                onPlusPress={() => setIsPostModalVisible(true)}
                            />
                        ),
                        tabBarIcon: () => <ICONS.home />,
                        tabBarButton: (props) => <TabButton {...props} route="main" />,
                    }}
                />
                <Tabs.Screen
                    name="my-publications"
                    options={{
                        title: "Мої публікації",
                        header: () => (
                            <Header
                                hiddenButtons={{plus: true, settings: true, exit: true }}
                                onPlusPress={() => setIsPostModalVisible(true)}
                            />
                        ),
                        tabBarIcon: () => <ICONS.image />,
                        tabBarButton: (props) => (
                            <TabButton {...props} route="my-publications" />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="friends"
                    options={{
                        title: "Друзі",
                        header: () => (
                            <Header
                                hiddenButtons={{ plus: false, settings: true, exit: true }}
                            />
                        ),
                        tabBarIcon: () => <ICONS.people />,
                        tabBarButton: (props) => <TabButton {...props} route="friends" />,
                    }}
                />
                <Tabs.Screen
                    name="chats"
                    options={{
                        title: "Чати",
                        header: () => <ChatsHeader />,
                        tabBarIcon: () => <ICONS.chat />,
                        tabBarButton: (props) => <TabButton {...props} route="chats" />,
                    }}
                />
                
                {/* НОВИЙ ЕКРАН: Динамічний маршрут для окремого чату */}
                <Tabs.Screen
                    name="chat/[id]"
                    options={{
                        headerShown: false, // Хваємо стандартний Header, бо в чаті буде свій кастомний із кнопкою назад
                        tabBarItemStyle: { display: "none" }, // Приховуємо іконку з нижньої панелі табів
                    }}
                />

                <Tabs.Screen
                    name="settings"
                    options={{
                        header: () => (
                            <Header
                                hiddenButtons={{ plus: true, settings: true, exit: true }}
                            />
                        ),
                        tabBarItemStyle: { display: "none" },
                    }}
                />
                <Tabs.Screen
                    name="profile"
                    options={{
                        title: "Профіль",
                        header: () => (
                            <Header
                                hiddenButtons={{ plus: true, settings: false, exit: false }}
                                onPlusPress={() => setIsPostModalVisible(true)}
                            />
                        ),
                        tabBarItemStyle: { display: "none" },
                    }}
                />
            </Tabs>

            <GroupCreationModals />

            <CreatePostModal 
                isVisible={isPostModalVisible} 
                onClose={() => setIsPostModalVisible(false)} 
            />
            </GroupCreationProvider>
        </SafeAreaView>
    );
}
