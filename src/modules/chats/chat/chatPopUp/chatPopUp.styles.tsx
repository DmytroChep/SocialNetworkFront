import { StyleSheet } from "react-native";
import { FONTS } from "../../../../shared/constants/fonts";
import { COLORS } from "../../../../shared/constants";

export const styles = StyleSheet.create({
    modal: {
        margin: 16,
        justifyContent: "center",
        alignItems: "center",
    },
    menuContainer: {
        backgroundColor: COLORS.plum50,
        borderRadius: 20,
        width: 270,
        height: 170,
        paddingVertical: 10,
        overflow: "hidden",
    },
    header: {
        alignItems: "flex-end",
        marginBottom: 8,
        width: "100%",
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
        paddingVertical: 14,
    },
    menuText: {
        fontSize: 18,
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