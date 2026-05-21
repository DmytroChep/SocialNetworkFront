import React, { useState } from "react";
import { 
    View, 
    Text, 
    StyleSheet, 
    TextInput, 
    TouchableOpacity, 
    FlatList, 
    KeyboardAvoidingView, 
    Platform,
    Pressable
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// Імпорти з вашої архітектури проєкту (налаштуйте вкладеність крок назад за потреби)
import { ICONS } from "../../../shared/icons";
import { COLORS } from "../../../shared/constants";
import { FONTS } from "../../../shared/constants/fonts";

interface Message {
    id: string;
    text: string;
    time: string;
    isMe: boolean;
    senderName?: string;
}

export default function ChatScreen() {
    const router = useRouter();
    const { name } = useLocalSearchParams<{ name: string }>();
    const [messageText, setMessageText] = useState("");
    
    // Активний таб за замовчуванням для цього екрана
    const [choosedTab, setChoosedTab] = useState<string>("Групові чати");

    // Твій масив табів із рідними іконками
    const radioTabsArray = [
        { title: "Контакти", icon: <ICONS.people /> },
        { title: "Повідомлення", icon: <ICONS.chat /> },
        { title: "Групові чати", icon: <ICONS.chat /> },
    ];

    // Мокові дані повідомлень
    const [messages, setMessages] = useState<Message[]>([
        { id: "1", text: "Чудово!", time: "10:30", isMe: false, senderName: "Cameron Williamson" },
        { id: "2", text: "Привіт! Як справи ?", time: "10:30", isMe: false, senderName: "Wade Warren" },
        { id: "3", text: "Привіт!", time: "10:01", isMe: true },
    ]);

    const handleSendMessage = () => {
        if (!messageText.trim()) return;

        const newMessage: Message = {
            id: Date.now().toString(),
            text: messageText.trim(),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMe: true
        };

        setMessages((prev) => [newMessage, ...prev]);
        setMessageText("");
    };

    const handleTabPress = (title: string) => {
        setChoosedTab(title);
        if (title !== "Групові чати") {
            router.back(); // Повертаємось на головний список, якщо змінили вкладку
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={["left", "right"]}>
            <View style={styles.flexElement}>
                
                {/* ОРИГІНАЛЬНІ ТАБИ З ТВОГО КОМПОНЕНТА ЧАТІВ */}
                <View style={styles.tabs}>
                    {radioTabsArray.map((element) => (
                        <Pressable 
                            key={element.title}
                            style={choosedTab === element.title ? styles.choosedRadioTabs : styles.radioTabItem}
                            onPress={() => handleTabPress(element.title)}
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

                {/* ВНУТРІШНІЙ КОНТЕНТ ЧАТУ */}
                <KeyboardAvoidingView 
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                    keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
                    style={styles.chatFlexWrapper}
                >
                    {/* Біла картка чату з закругленням */}
                    <View style={styles.chatCard}>
                        
                        {/* Внутрішній хедер конкретного діалогу */}
                        <View style={styles.chatInnerHeader}>
                            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                                <Ionicons name="chevron-back" size={22} color="#8E8E93" />
                            </TouchableOpacity>
                            
                            <View style={styles.chatAvatar}>
                                <Text style={styles.chatAvatarText}>
                                    {name ? name.substring(0, 2).toUpperCase() : "NG"}
                                </Text>
                            </View>

                            <View style={styles.chatTitleWrapper}>
                                <Text style={styles.chatTitle}>{name || "New Group"}</Text>
                                <Text style={styles.chatSubtitle}>3 учасники, 1 в мережі</Text>
                            </View>

                            <TouchableOpacity style={styles.moreButton}>
                                <Ionicons name="ellipsis-vertical" size={20} color="#8E8E93" />
                            </TouchableOpacity>
                        </View>

                        {/* Стрічка повідомлень */}
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
                                const showNewMessagesSeparator = index === 0;

                                return (
                                    <View>
                                        <View style={item.isMe ? styles.myMessageRow : styles.otherMessageRow}>
                                            {!item.isMe && (
                                                <View style={styles.messageAvatar}>
                                                    <Text style={styles.messageAvatarText}>
                                                        {item.senderName?.substring(0, 1)}
                                                    </Text>
                                                </View>
                                            )}

                                            <View style={[styles.bubble, item.isMe ? styles.myBubble : styles.otherBubble]}>
                                                {!item.isMe && <Text style={styles.senderNameText}>{item.senderName}</Text>}
                                                <Text style={styles.messageText}>{item.text}</Text>
                                                
                                                <View style={styles.timeContainer}>
                                                    <Text style={styles.timeText}>{item.time}</Text>
                                                    <Ionicons name="checkmark" size={14} color="#8E8E93" style={styles.checkIcon} />
                                                </View>
                                            </View>
                                        </View>

                                        {showNewMessagesSeparator && (
                                            <View style={styles.newMessagesLineContainer}>
                                                <View style={styles.line} />
                                                <Text style={styles.newMessagesText}>Нові повідомлення</Text>
                                                <View style={styles.line} />
                                            </View>
                                        )}
                                    </View>
                                );
                            }}
                            contentContainerStyle={styles.messagesListContent}
                            showsVerticalScrollIndicator={false}
                        />

                        {/* Панель введення */}
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
                                <Ionicons name="image-outline" size={22} color="#503E50" />
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={[styles.sendActionButton, !messageText.trim() && styles.sendActionButtonDisabled]} 
                                onPress={handleSendMessage}
                                disabled={!messageText.trim()}
                            >
                                <Ionicons name="paper-plane" size={16} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    // СТИЛІ З ВАШОГО ФАЙЛУ ЧАТІВ
    container: {
        flex: 1, 
        backgroundColor: "white"
    },
    flexElement: {
        flex: 1
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

    // СТИЛІ ДЛЯ ПАНЕЛІ ТА КАРТКИ ЧАТУ
    chatFlexWrapper: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    chatCard: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        borderWidth: 1,
        borderColor: "#E5E5EA",
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
        paddingHorizontal: 16,
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
    },
    otherMessageRow: {
        flexDirection: "row",
        alignSelf: "flex-start",
        marginVertical: 6,
        maxWidth: "75%",
        alignItems: "flex-end",
    },
    messageAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#E5E5EA",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 8,
    },
    messageAvatarText: {
        fontSize: 12,
        color: "#1C1C1E",
        fontFamily: FONTS["GTWalsheimPro-Medium"],
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
        borderColor: "#E5E5EA",
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 12,
    },
    sendActionButton: {
        backgroundColor: "#503E50",
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 8,
    },
    sendActionButtonDisabled: {
        backgroundColor: "#E5E5EA",
    },
});