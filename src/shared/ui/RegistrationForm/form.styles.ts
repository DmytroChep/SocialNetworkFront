import { StyleSheet } from "react-native"
import { FONTS } from "../../constants/fonts"
import { COLORS } from "../../constants"

export const styles = StyleSheet.create({
    container: {
        width: "100%",
        backgroundColor: "white",
        borderRadius: 20,
        gap: 24,
        alignItems: "center",
        paddingHorizontal: 16,
        paddingBottom: 44
    },
    formFields: {
        width: "100%",
        gap: 16,
        
    },
    header: {
        width: "100%",
        height: 79,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "flex-end",
        gap: 24
    },
    choosedTitle: {
        fontWeight: "700",
        fontFamily: FONTS["GTWalsheimPro-Regular"],
        fontSize: 24,
        color: COLORS.darkBlue,
        borderBottomColor: COLORS.darkBlue,
        borderBottomWidth: 2
    },
    title: {
        fontWeight: "700",
        fontFamily: FONTS["GTWalsheimPro-Regular"],
        fontSize: 24,
        color: COLORS.blue50
    },
    welcomeTitle: {
        fontSize: 24,
        fontFamily: FONTS["GTWalsheimPro-Regular"]
    },
    button: {
        width: "100%",
        
    }
})