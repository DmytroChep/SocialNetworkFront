import { StyleSheet } from "react-native";
import { COLORS } from "../../../shared/constants";

export const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    container: {
        backgroundColor: "white",
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 25,
        height: 709,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#000",
    },
    closeIcon: {
        fontSize: 24,
        color: "#000",
    },
    tagContainer: {
        marginVertical: 15,
    },
    tagList: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    tag: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: COLORS.plum50,
        borderRadius: 10,
    },
    tagText: {
        color: "#666",
        fontSize: 14,
    },
    addCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#000",
        justifyContent: "center",
        alignItems: "center",
    },
    contentInputContainer: {
        borderWidth: 1,
        borderColor: "#E5E5E5",
        borderRadius: 15,
        padding: 15,
        minHeight: 150,
        marginVertical: 15,
    },
    contentInput: {
        fontSize: 16,
        lineHeight: 22,
    },
    linkRow: {
        flexDirection: "row",
        alignItems: "flex-end",
    },
    addCircleInline: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#000",
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 10,
        marginBottom: 12, 
    },
    plus: {
        fontSize: 18,
    },
    footer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 30,
    },
    mediaButtons: {
        flexDirection: "row",
        gap: 12,
    },
    publishBtn: {
        backgroundColor: COLORS.plum,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 25,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    publishBtnText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 16,
    },
});