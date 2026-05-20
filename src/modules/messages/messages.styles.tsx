import { StyleSheet } from "react-native";
import { FONTS } from "../../shared/constants/fonts";

export const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#FFF', 
        paddingHorizontal: 16, 
        paddingTop: 20 
    },
    title: { 
        fontSize: 22, 
        fontFamily: "GTWalsheimPro-Medium", 
        marginBottom: 20,
        color: '#1C1C1E'
    },
    chatItem: { 
        flexDirection: 'row', 
        paddingVertical: 14, 
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#F8F8F8'
    },
    avatarContainer: { 
        position: 'relative' 
    },
    avatar: { 
        width: 56, 
        height: 56, 
        borderRadius: 28, 
        backgroundColor: '#F0F0F0' 
    },
    onlineStatus: { 
        position: 'absolute', 
        bottom: 2, 
        right: 2, 
        width: 14, 
        height: 14, 
        borderRadius: 7, 
        backgroundColor: '#4CD964', 
        borderWidth: 2, 
        borderColor: '#FFF' 
    },
    content: { 
        flex: 1, 
        marginLeft: 15 
    },
    headerRow: { 
        flexDirection: 'row', 
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    name: { 
        fontSize: 16, 
        fontFamily: "GTWalsheimPro-Medium",
        color: '#1C1C1E'
    },
    time: { 
        fontSize: 12, 
        color: '#8E8E93',
        fontFamily: "GTWalsheimPro-Regular"
    },
    msgRow: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        marginTop: 4,
        alignItems: 'center'
    },
    lastMsg: { 
        fontSize: 14, 
        color: '#636366', 
        flex: 1,
        fontFamily: "GTWalsheimPro-Regular",
        marginRight: 8
    },
    badge: { 
        backgroundColor: '#4A314D', 
        minWidth: 20, 
        height: 20, 
        borderRadius: 10, 
        justifyContent: 'center', 
        alignItems: 'center',
        paddingHorizontal: 6
    },
    badgeText: { 
        color: '#FFF', 
        fontSize: 10, 
        fontFamily: "GTWalsheimPro-Medium"
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
});