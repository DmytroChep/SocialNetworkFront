import { View, Text, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ICONS } from "../../shared/icons";
import { COLORS } from "../../shared/constants";
import { useState } from "react";
import { FONTS } from "../../shared/constants/fonts";
import { Chat } from "../../modules/chats/chat/chat";

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    tabsContainer: {
        width: "100%",
        // paddingHorizontal: 16,
        justifyContent: "space-between",
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: COLORS.blue20,
    },
    tab: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        borderBottomWidth: 2,
        borderBottomColor: "transparent",
    },
    choosedTab: {
        borderBottomColor: COLORS.darkBlue,
    },
    tabText: {
        fontSize: 13,
        fontFamily: FONTS["GTWalsheimPro-Medium"],
        color: "black",
    },
    choosedTabText: {
        color: COLORS.darkBlue,
        fontWeight: "600",
    },
    contentContainer: {
        flex: 1,
        width: "100%",
        padding: 16,
    },
    visible: {
        flex: 1,
        width: "100%",
        display: "flex"
    },
    hidden: {
        display: "none"
    }
});

export default function Chats() {
    const radioTabsArray = [
        { 
            title: "Контакти", 
            icon: <ICONS.people />, 
            content: <Chat chat={{
                is_group: true, 
                name: "super chat", 
                avatar: "avatars/default_avatar.png", 
                users: [
                    { id: 1, name: "user", avatar: "/media/avatars/default_avatar.jpg" },
                    { id: 2, name: "user", avatar: "/media/avatars/default_avatar.jpg" }
                ], 
                message: [
                    { text: "hello", created_at: 123344433, sender: { id: 2, name: "user", avatar: "/media/avatars/default_avatar.jpg" } },
                    { text: "hello you too!", created_at: 1233444323, sender: { id: 2, name: "username", avatar: "/media/avatars/default_avatar.jpg" } }
                ]
            }} /> 
        },
        { title: "Повідомлення", icon: <ICONS.chat />, content: <View><Text style={{fontFamily: FONTS["GTWalsheimPro-Medium"]}}>Повідомлення</Text></View> },
        { title: "Групові чати", icon: <ICONS.chat />, content: <View><Text style={{fontFamily: FONTS["GTWalsheimPro-Medium"]}}>Групові чати</Text></View> },
    ];
    
    const [choosedTab, setChoosedTab] = useState<string>(radioTabsArray[0].title);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "white" }} edges={["left", "right"]}>
            <View style={styles.container}>
                
                {/* Рендерим ТАБЫ */}
                <View style={styles.tabsContainer}>
                    {radioTabsArray.map((element) => {
                        const isSelected = choosedTab === element.title;
                        return (
                            <Pressable 
                                key={element.title}
                                style={[styles.tab, isSelected && styles.choosedTab]}
                                onPress={() => setChoosedTab(element.title)}
                            >
                                {element.icon}
                                <Text style={[styles.tabText, isSelected && styles.choosedTabText]}>
                                    {element.title}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>
    
                {/* Рендерим КОНТЕНТ */}
                <View style={styles.contentContainer}>
                    {radioTabsArray.map((element) => {
                        return (
                            <View
                                key={element.title}
                                style={choosedTab === element.title ? styles.visible : styles.hidden}
                            >
                                {element.content}
                            </View>
                        );
                    })}
                </View>

            </View>
        </SafeAreaView>
    );
}	