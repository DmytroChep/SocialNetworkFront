import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    cardContainer: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 16,
        paddingTop: 10,
        marginTop: 10,
        // ВИПРАВЛЕНО: компенсуємо бічні відступи батьківського екрана,
        // щоб картка встала рівно на всю ширину (від краю до краю)
        marginHorizontal: -16, 
    },
    // cardHeader: {
    //     flexDirection: "row",
    //     alignItems: "center",
    //     marginBottom: 16,
    // },
    iconWrapper: {
        position: "relative",
        width: 24,
        height: 24,
        justifyContent: "center",
        alignItems: "center",
    },
    cardTitle: {
        fontSize: 16,
        fontFamily: "GTWalsheimPro-Medium",
        color: "#8E8E93",
        marginLeft: 8,
    },
    headerBadge: {
        position: "absolute",
        top: -4,
        right: -4,
        backgroundColor: "#FF3B30",
        borderRadius: 7,
        width: 14,
        height: 14,
        justifyContent: "center",
        alignItems: "center",
    },
    headerBadgeText: {
        color: "#FFFFFF",
        fontSize: 9,
        fontFamily: "GTWalsheimPro-Medium",
    },
    searchWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF", // ВИПРАВЛЕНО: тепер фон пошуку білий
        borderWidth: 1,             // Додано тонку рамку, щоб інпут виділявся на білому тлі
        borderColor: "#E5E5EA",     // Світло-сірий колір рамки за макетом
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 44,
        marginBottom: 16,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        fontFamily: "GTWalsheimPro-Regular",
        color: "#000000",
        paddingVertical: 0,
    },
    chatItem: {
        flexDirection: "row",
        paddingVertical: 12,
        paddingHorizontal: 10,
        alignItems: "center",
        borderRadius: 14,
        marginVertical: 2,
    },
    activeChatItem: {
        backgroundColor: "#EFEAF0",
    },
    avatarCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#503E50",
        justifyContent: "center",
        alignItems: "center",
    },
    avatarText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontFamily: "GTWalsheimPro-Medium",
    },
    avatarImage: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    content: {
        flex: 1,
        marginLeft: 12,
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 2,
    },
    name: {
        fontSize: 15,
        fontFamily: "GTWalsheimPro-Medium",
        color: "#1C1C1E",
    },
    time: {
        fontSize: 12,
        color: "#8E8E93",
        fontFamily: "GTWalsheimPro-Regular",
    },
    lastMsg: {
        fontSize: 14,
        color: "#8E8E93",
        fontFamily: "GTWalsheimPro-Regular",
        flex: 1,
        marginRight: 8,
    },
    messageRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    unreadBadge: {
        backgroundColor: "#4A314D",
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 5,
    },
    unreadBadgeText: {
        color: "#FFF",
        fontSize: 11,
        fontFamily: "GTWalsheimPro-Medium",
    },
});
