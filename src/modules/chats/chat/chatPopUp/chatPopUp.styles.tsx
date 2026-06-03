import { StyleSheet } from "react-native";
import { FONTS } from "../../../../shared/constants/fonts";
import { COLORS } from "../../../../shared/constants";

export const styles = StyleSheet.create({
    modal: {
        margin: 0,
        justifyContent: "flex-start",
        alignItems: "flex-start",
    },
    menuContainer: {
        position: 'absolute',
        backgroundColor: COLORS.plum50,
        borderRadius: 12,
        minWidth: 220,
        paddingVertical: 8,
        paddingHorizontal: 12,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 8,
    },
    header: {
        alignItems: "flex-end",
        marginBottom: 6,
        width: "100%",
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 10,
    },
    menuText: {
        fontSize: 16,
        fontFamily: FONTS["GTWalsheimPro-Medium"],
        color: "#000000",
    },
    separator: {
        height: 1,
        backgroundColor: "#E2DEE4",
        marginVertical: 6,
        width: "100%",
    },
});