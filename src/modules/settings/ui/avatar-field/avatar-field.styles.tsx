import React from "react";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    ContainerAvatar: {
        alignItems: "center",
        gap: 10,
    },
    AvatarView: {
        width: 90,
        height: 90,
        borderRadius: 50,
        backgroundColor: "#EAEAEA",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
    },
    SelectedAvatar: {
        width: "100%",
        height: "100%",
    },
    DefaultAvatar: {
        width: "100%",
        height: "100%",
        position: "absolute",
    },
    DefaultText: {
        fontSize: 16,
        fontWeight: "500",
        color: "#000",
    }
});