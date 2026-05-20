import { StyleSheet } from "react-native";
import { COLORS } from "../../../../shared/constants";

export const styles = StyleSheet.create({
    overlay: {
        flex: 1,
    },
    container: {
        backgroundColor: COLORS.plum50,
        borderRadius: 20,
        width: 270,
        height: 130,
        paddingVertical: 10,
        overflow: "hidden",
    },
    header: {
        alignItems: "flex-end",
        paddingHorizontal: 10,
        paddingTop: 5,
    },
    option: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 10,
        gap: 12,
    },
    optionText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#000",
    },
    divider: {
        height: 1,
        backgroundColor: "#D1D1D6",
        marginHorizontal: 20,
    },
});