import { Tabs, usePathname } from "expo-router";
import { Pressable, StyleSheet, View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ICONS } from "../../shared/icons";
import { Header } from "../../shared/ui/Header";
import { COLORS } from "../../shared/constants";
import React, { useState } from "react";
import { useUserContext } from "../../shared/context/user-context";
import { useGetUserFriendshipsQuery } from "../../shared/api/baseApi";
import { CreatePostModal } from "../../modules/my-publications/ui/plus/createPostModal";

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
        width: 36,
        height: 3,
        borderRadius: 2,
        backgroundColor: COLORS.darkBlue,
        marginBottom: 6,
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

    const { data: friendshipsResponse } = useGetUserFriendshipsQuery(currentUserId as number, {
        skip: !currentUserId,
    });

    const bottomUnreadCount = (friendshipsResponse?.friends || []).reduce((acc: number, _f: any, idx: number) => {
        return acc + ((idx + 1) % 3 === 0 ? 1 : 0);
    }, 0);

    return (
        <SafeAreaView
            edges={["bottom"]}
            style={{
                flex: 1,
                backgroundColor: "white",
                width: "100%",
            }}
        >
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
                        header: () => (
                            <Header
                                hiddenButtons={{ plus: true, settings: false, exit: true }}
                            />
                        ),
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

            <CreatePostModal 
                isVisible={isPostModalVisible} 
                onClose={() => setIsPostModalVisible(false)} 
            />
        </SafeAreaView>
    );
}