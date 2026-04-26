import React from "react";
import { StyleSheet } from "react-native";
import { COLORS } from "../../../../shared/constants";

export const styles = StyleSheet.create({
    albums: {
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        backgroundColor: "white",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: COLORS.blue20,
        gap: 16
    },
    albumsExists: {
        padding: 16,
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        backgroundColor: "white",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: COLORS.blue20,
        gap: 16
    },
    albumsText: {
        fontSize: 16
    },
    albumsParentView: {
        width: "100%"
    },
    header: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    },
    iconsheaderView: {
        flexDirection: "row",
        gap: 24,
        alignItems: "center"
    },
    topic: {
        width: "100%",
        flexDirection: "row",
        gap: 16
    },
    hr: {
        width: "100%",
        height: 1,
        borderWidth: 1,
        borderColor: COLORS.blue20
    },
    photo: {
        width: "100%",
        gap: 16
    },
    avatarsView: {
        flexWrap: "wrap"
    },
    addPhoto: {
        width: 162,
        height: 162,
        justifyContent: "center",
        alignItems: "center",
        borderStyle: "dashed",
        borderRadius: 10,
        borderWidth: 1,
    }
});