import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    cardContainer: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 16,
        paddingTop: 16,
        marginTop: 10,
        marginHorizontal: -16, 
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 16,
        fontFamily: "GTWalsheimPro-Medium",
        color: "#8E8E93",
        marginLeft: 8,
    },
    searchWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E5E5EA",
        borderRadius: 10,
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
        color: "#000000",
        fontFamily: "GTWalsheimPro-Regular", 
        paddingVertical: 0,
    },
    scrollPadding: {
        // Отступ снизу, чтобы при скролле нижние контакты не перекрывались таб-баром
        paddingBottom: 40, 
    },
    contactItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        gap: 14,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#F2F2F7",
    },
    contactName: {
        fontSize: 16,
        color: "#070A1C",
        fontFamily: "GTWalsheimPro-Medium", 
    },
    noResultsText: {
        textAlign: "center",
        color: "#8E8E93",
        marginTop: 24,
        fontFamily: "GTWalsheimPro-Regular", 
    },
});