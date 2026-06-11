import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Chat, { type ChatPeer } from "../../modules/chats/chat/chat";
import { ContactsList } from "../../modules/chats/contactsList";
import { GroupChatsList } from "../../modules/chats/GroupChatsList";
import { CreateGroupChatModal } from "../../modules/chats/createGroupChat";
import { CreateGroupDetailsModal } from "../../modules/chats/CreateGroupDetailsModal";
import type { IChat } from "../../modules/chats/types/chat";
import type {
  IFriendshipProfile,
  IProfileFriend,
} from "../../modules/friends/types/Friendship.type";
import {
  useGetAllUsersQuery,
  useGetPersonalChatsQuery,
  useGetUserFriendshipsQuery,
} from "../../shared/api/baseApi";
import { COLORS } from "../../shared/constants";
import { FONTS } from "../../shared/constants/fonts";
import type { IUser } from "../../shared/context/types";
import { useSocketContext } from "../../shared/context/socket-context";
import { useUserContext } from "../../shared/context/user-context";
import { ICONS } from "../../shared/icons";
import {
  getUserAvatar,
  getUserDisplayName,
  toMediaUrl,
} from "../../shared/lib/model-helpers";
import { useGroupCreation, type ModalUser } from "../../shared/context/group-creation-context";

const DEFAULT_AVATAR = toMediaUrl("/media/avatars/default_avatar.png") || "";

interface ChatListItem extends ChatPeer {
  id: number;
  chatId: number;
  avatar: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
}

const getProfileUserId = (profile?: IFriendshipProfile) =>
  profile?.user?.id ?? profile?.user_id;

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

const profileToCardUser = (
  profile: IFriendshipProfile,
  fallbackUser?: IUser,
) => ({
  id: profile.user?.id ?? profile.user_id ?? fallbackUser?.id ?? 0,
  name: profileName(profile, fallbackUser),
  avatar:
    toMediaUrl(profile.avatar) || getUserAvatar(fallbackUser) || DEFAULT_AVATAR,
});

const getFriendProfile = (
  friendship: IProfileFriend,
  currentUserId?: number,
  currentProfileId?: number,
) => {
  if (friendship.from_profile_id === currentProfileId)
    return friendship.to_profile;
  if (friendship.to_profile_id === currentProfileId)
    return friendship.from_profile;
  if (getProfileUserId(friendship.from_profile) === currentUserId)
    return friendship.to_profile;
  return friendship.from_profile;
};

const formatChatTime = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("uk-UA", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getChatPeerUser = (chat: IChat, currentUserId?: number) => {
  return chat.users.find((member) => member.user_id !== currentUserId)?.user;
};

const chatToListItem = (
  chat: IChat,
  currentUserId?: number,
): ChatListItem | null => {
  const peer = getChatPeerUser(chat, currentUserId);
  if (!peer) return null;
  const imagesCount = chat.lastMessage?.images?.length ?? 0;
  return {
    id: peer.id,
    chatId: chat.id,
    name: chat.name || getUserDisplayName(peer) || "Користувач",
    avatar: toMediaUrl(chat.avatar) || getUserAvatar(peer) || DEFAULT_AVATAR,
    lastMessage:
      chat.lastMessage?.text ||
      (imagesCount > 0 ? "Фото" : "Немає повідомлень"),
    time: formatChatTime(chat.lastMessage?.created_at),
    unreadCount: chat.unreadCount ?? 0,
  };
};

export default function Chats() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    userId?: string;
    name?: string;
    avatar?: string;
  }>();

  const { user, token } = useUserContext();
  const { socket } = useSocketContext();
  const currentUserId = user?.id;
  const currentProfileId = user?.profile?.id;
  const { openStep1 } = useGroupCreation();

  const { data: friendshipsResponse, error: friendshipsError, isLoading: isFriendshipsLoading } =
    useGetUserFriendshipsQuery(currentUserId as number, {
      skip: !currentUserId,
    });

  const { data: users = [], isLoading: isUsersLoading } = useGetAllUsersQuery();

  const {
    data: chatsResponse,
    error: chatsError,
    isLoading: isChatsLoading,
    refetch: refetchChats,
  } = useGetPersonalChatsQuery(
    { take: 50 },
    {
      skip: !currentUserId,
    },
  );

  const [choosedTab, setChoosedTab] = useState<string>("Контакти");
  const [activeChat, setActiveChat] = useState<ChatPeer | null>(null);

  useEffect(() => {
    if (!socket) return;
    const handleChatUpdated = () => refetchChats();
    socket.on("chat:updated", handleChatUpdated);
    return () => {
      socket.off("chat:updated", handleChatUpdated);
    };
  }, [socket, refetchChats]);

  const usersById = useMemo(
    () => new Map(users.map((item) => [item.id, item])),
    [users],
  );

  const friendsList = useMemo(() => {
    if (!friendshipsResponse?.friends) return [];
    return friendshipsResponse.friends.map((friendship) => {
      const friendProfile = getFriendProfile(
        friendship,
        currentUserId,
        currentProfileId,
      );
      return profileToCardUser(
        friendProfile,
        usersById.get(getProfileUserId(friendProfile) ?? 0),
      );
    });
  }, [friendshipsResponse, usersById, currentUserId, currentProfileId]);

  const chatList = useMemo(
    () =>
      (chatsResponse?.chats ?? [])
        .filter((chat) => !chat.is_group)
        .map((chat) => chatToListItem(chat, currentUserId))
        .filter(Boolean) as ChatListItem[],
    [chatsResponse?.chats, currentUserId],
  );

  const groupEditContacts = useMemo(
    () =>
      friendsList.map((friend) => ({
        id: friend.id,
        name: friend.name,
        avatar: friend.avatar,
      })),
    [friendsList],
  );

  const groupChatItems = useMemo(() => {
    return (chatsResponse?.chats ?? [])
      .filter((chat) => chat.is_group)
      .map((chat) => ({
        id: chat.id,
        chatId: chat.id,
        name: chat.name || "Група",
        avatar: toMediaUrl(chat.avatar) || DEFAULT_AVATAR,
        adminId: chat.admin_id,
        isAdmin: Number(chat.admin_id) === currentUserId,
        users: chat.users,
        editContacts: groupEditContacts,
        lastMessage:
          chat.lastMessage?.text ||
          (chat.lastMessage?.images?.length ? "Фото" : "Немає повідомлень"),
        time: formatChatTime(chat.lastMessage?.created_at),
        unreadCount: chat.unreadCount ?? 0,
      }));
  }, [chatsResponse?.chats, currentUserId, groupEditContacts]);

  useEffect(() => {
    try {
      console.log("DEBUG Chats:", {
        currentUserId,
        isChatsLoading,
        chatsCount: chatsResponse?.chats?.length ?? 0,
        chatsResponse,
        chatsError,
        friendshipsCount: friendshipsResponse?.friends?.length ?? 0,
        friendshipsError,
        usersCount: users?.length ?? 0,
        socketId: socket?.id,
        tokenPresent: Boolean(token),
      });
    } catch (e) {
      // ignore
    }
  }, [currentUserId, isChatsLoading, chatsResponse, friendshipsResponse, users, socket, token]);

  const selectedUserId = Number(params.userId);

  useEffect(() => {
    if (!selectedUserId) return;
    const existingFriend = friendsList.find(
      (friend) => friend.id === selectedUserId,
    );
    const existingChat = chatList.find((chat) => chat.id === selectedUserId);
    setChoosedTab("Повідомлення");
    setActiveChat({
      id: selectedUserId,
      chatId: existingChat?.chatId,
      name:
        existingChat?.name ||
        existingFriend?.name ||
        params.name ||
        "Користувач",
      avatar:
        existingChat?.avatar ||
        existingFriend?.avatar ||
        params.avatar ||
        DEFAULT_AVATAR,
    });
  }, [chatList, friendsList, params.avatar, params.name, selectedUserId]);

  const openChat = (peer: ChatPeer) => {
    setChoosedTab(peer.isGroup ? "Групові чати" : "Повідомлення");
    setActiveChat(peer);
  };

  const closeChat = () => {
    setActiveChat(null);
    if (params.userId) {
      router.replace("/chats");
    }
    refetchChats();
  };

  const openTab = (title: string) => {
    setChoosedTab(title);
    setActiveChat(null);
    if (params.userId) {
      router.replace("/chats");
    }
  };

  const radioTabsArray = [
    { title: "Контакти", icon: <ICONS.people /> },
    { title: "Повідомлення", icon: <ICONS.chat /> },
    { title: "Групові чати", icon: <ICONS.chat /> },
  ];

  const unreadCount = chatList.reduce((sum, chat) => sum + chat.unreadCount, 0);
  const groupUnreadCount = groupChatItems.reduce(
    (sum, chat) => sum + (chat.unreadCount ?? 0),
    0,
  );

  if (isFriendshipsLoading || isUsersLoading || isChatsLoading) {
    return <ActivityIndicator style={styles.loader} color={COLORS.darkBlue} />;
  }

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <View style={styles.tabs}>
        {radioTabsArray.map((element) => {
          const isActive = choosedTab === element.title;
          return (
            <Pressable
              key={element.title}
              style={isActive ? styles.choosedRadioTabs : styles.radioTabItem}
              onPress={() => openTab(element.title)}
            >
              {isActive && <View style={styles.tabIndicator} />}
              <View style={styles.tabIconWrapper}>
                {element.icon}
                {element.title === "Повідомлення" && unreadCount > 0 && (
                  <View style={styles.tabBadge}>
                    <Text style={styles.tabBadgeText}>{unreadCount}</Text>
                  </View>
                )}
                {element.title === "Групові чати" && groupUnreadCount > 0 && (
                  <View style={styles.tabBadge}>
                    <Text style={styles.tabBadgeText}>{groupUnreadCount}</Text>
                  </View>
                )}
              </View>
              <Text
                style={{
                  fontSize: 13,
                  fontFamily: isActive
                    ? FONTS["GTWalsheimPro-Medium"]
                    : FONTS["GTWalsheimPro-Regular"],
                  color: isActive ? COLORS.darkBlue : "#8E8E93",
                }}
              >
                {element.title}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.flexElement}>
        <View style={styles.contentContainer}>
          {activeChat && (
            <View style={{ marginHorizontal: -16, flex: 1 }}>
              <Chat peer={activeChat} onBack={closeChat} />
            </View>
          )}

          {!activeChat && choosedTab === "Контакти" && (
            <ContactsList contacts={friendsList} onContactPress={openChat} />
          )}

          {!activeChat && choosedTab === "Повідомлення" && (
            <FlatList
              data={chatList}
              keyExtractor={(item) => item.chatId.toString()}
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionHeaderLeft}>
                    <View style={{ position: "relative" }}>
                      <ICONS.chat />
                      {unreadCount > 0 && (
                        <View style={styles.tabBadge}>
                          <Text style={styles.tabBadgeText}>{unreadCount}</Text>
                        </View>
                      )}
                    </View>

                    <Text style={styles.sectionHeaderText}>Повідомлення</Text>
                  </View>
                </View>
              }
              ListEmptyComponent={
                <Text style={styles.emptyText}>Поки немає діалогів</Text>
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.chatItem}
                  onPress={() => openChat(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.avatarContainer}>
                    <Image source={{ uri: item.avatar }} style={styles.avatar} />
                    <View style={styles.onlineStatus} />
                  </View>
                  <View style={styles.content}>
                    <View style={styles.headerRow}>
                      <Text style={styles.name} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={styles.time}>{item.time}</Text>
                    </View>
                    <View style={styles.msgRow}>
                      <Text style={styles.lastMsg} numberOfLines={1}>
                        {item.lastMessage}
                      </Text>
                      {item.unreadCount > 0 && (
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>
                            {item.unreadCount}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}

          {!activeChat && choosedTab === "Групові чати" && (
            <View style={{ flex: 1 }}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionHeaderLeft}>
                  <View style={{ position: "relative" }}>
                    <ICONS.chat />
                    {groupUnreadCount > 0 && (
                      <View style={styles.tabBadge}>
                        <Text style={styles.tabBadgeText}>{groupUnreadCount}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.sectionHeaderText}>Групові чати</Text>
                </View>
              </View>
              <GroupChatsList
                chats={groupChatItems}
                onChatPress={(item) =>
                  openChat({
                    id: item.chatId,
                    chatId: item.chatId,
                    name: item.name,
                    avatar: item.avatar,
                    isGroup: true,
                    adminId: item.adminId,
                    isAdmin: item.isAdmin,
                    users: item.users,
                    editContacts: item.editContacts,
                  })
                }
              />
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "white",
  },
  flexElement: {
    flex: 1,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderColor: COLORS.plum50,
    borderWidth: 1,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
  },
  tabs: {
    width: "100%",
    justifyContent: "space-between",
    flexDirection: "row",
    paddingHorizontal: 16,
  },
  radioTabItem: {
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    paddingTop: 6,
    flex: 1,
  },
  choosedRadioTabs: {
    alignItems: "center",
    paddingVertical: 8,
    justifyContent: "center",
    gap: 6,
    paddingTop: 6,
    flex: 1,
  },
  tabIndicator: {
    height: 3,
    borderRadius: 2,
    backgroundColor: COLORS.darkBlue,
    marginBottom: 6,
    alignSelf: "stretch",
  },
  tabIconWrapper: {
    position: "relative",
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
    fontFamily: FONTS["GTWalsheimPro-Medium"],
  },
  contentContainer: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 14,
    paddingBottom: 6,
  },
  sectionHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionHeaderText: {
    fontSize: 17,
    fontFamily: FONTS["GTWalsheimPro-Medium"],
    color: "#1C1C1E",
  },
  sectionBadge: {
    backgroundColor: "#FF3B30",
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 5,
  },
  sectionBadgeText: {
    color: "#FFF",
    fontSize: 11,
    fontFamily: FONTS["GTWalsheimPro-Medium"],
  },
  chatItem: {
    flexDirection: "row",
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
    backgroundColor: "#FFFFFF",
  },
  contactItem: {
    flexDirection: "row",
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F8F8F8",
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#E5E5EA",
  },
  onlineStatus: {
    position: "absolute",
    bottom: 1,
    right: 1,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: "#34C759",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 3,
  },
  name: {
    fontSize: 15,
    fontFamily: FONTS["GTWalsheimPro-Medium"],
    color: "#1C1C1E",
    flex: 1,
    marginRight: 8,
  },
  time: {
    fontSize: 12,
    color: "#8E8E93",
    fontFamily: FONTS["GTWalsheimPro-Regular"],
    flexShrink: 0,
  },
  msgRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lastMsg: {
    fontSize: 13,
    color: "#8E8E93",
    flex: 1,
    fontFamily: FONTS["GTWalsheimPro-Regular"],
    marginRight: 6,
  },
  badge: {
    backgroundColor: "#4A314D",
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 5,
  },
  badgeText: {
    color: "#FFF",
    fontSize: 11,
    fontFamily: FONTS["GTWalsheimPro-Medium"],
  },
  emptyText: {
    textAlign: "center",
    marginTop: 24,
    fontSize: 14,
    fontFamily: FONTS["GTWalsheimPro-Regular"],
    color: "#8E8E93",
  },
  createGroupTriggerText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontFamily: FONTS["GTWalsheimPro-Medium"],
  },
  centeredContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  statusText: {
    fontSize: 13,
    color: "#8E8E93",
    fontFamily: FONTS["GTWalsheimPro-Regular"],
  },
});
