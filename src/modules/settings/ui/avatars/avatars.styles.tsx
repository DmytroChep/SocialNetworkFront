import { StyleSheet } from "react-native";
import { COLORS } from "../../../../shared/constants";
import { FONTS } from "../../../../shared/constants/fonts";

export const styles = StyleSheet.create({
    container: {
        width: "100%",
        gap: 16,
    },
    section: {
        width: "100%",
        padding: 16,
        backgroundColor: "white",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: COLORS.blue20,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    title: {
        fontSize: 16,
        fontWeight: "500",
        fontFamily: FONTS["GTWalsheimPro-Regular"],
        color: COLORS.darkBlue,
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: "500",
        fontFamily: FONTS["GTWalsheimPro-Regular"],
        color: COLORS.darkBlue,
    },
    avatarsScroll: {
        gap: 12,
    },
    avatarCard: {
        position: "relative",
        borderRadius: 10,
        overflow: "hidden",
        width: 200,
        height: 200,
    },
    avatarImage: {
        width: "100%",
        height: "100%",
    },
    cardActions: {
        position: "absolute",
        bottom: 8,
        right: 8,
        flexDirection: "row",
        gap: 8,
    },
    actionButton: {
        backgroundColor: "white",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
})