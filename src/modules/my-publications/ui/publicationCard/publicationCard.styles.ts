import { StyleSheet, Dimensions } from 'react-native';
import { COLORS } from '../../../../shared/constants';

const { width } = Dimensions.get('window');
const CARD_PADDING = 16;
const GRID_GAP = 8;
const AVAILABLE_WIDTH = width - (CARD_PADDING * 2) - 32;

export const styles = StyleSheet.create({
    linksContainer: {
    marginTop: 6,
    gap: 4,
    marginBottom: 25
},
linkText: {
    color: COLORS.plum,
    fontSize: 13,
    textDecorationLine: 'underline',
},
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: CARD_PADDING,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarWrapper: {
        position: 'relative',
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F0F0F0',
    },
    statusDot: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#4CAF50',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    userName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1A1A1A',
        marginLeft: 12,
    },
    signature: {
        width: 100,
        height: 40,
        marginLeft: 12,
        marginTop: 10,
    
    },
    menuButton: {
        padding: 4,
        justifyContent: "center",
        alignItems: "center"
    },
    contentContainer: {
        marginBottom: 16,
    },
    description: {
        fontSize: 14,
        lineHeight: 20,
        color: '#1A1A1A',
        marginBottom: 8,
    },
    hashtagContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    hashtag: {
        fontSize: 14,
        color: '#666666',
        marginRight: 4,
    },
    gridContainer: {
        gap: GRID_GAP,
    },
    topRow: {
        flexDirection: 'row',
        gap: GRID_GAP,
    },
    bottomRow: {
        flexDirection: 'row',
        gap: GRID_GAP,
    },
    largeImage: {
        width: (AVAILABLE_WIDTH - GRID_GAP) / 2,
        height: 180,
        borderRadius: 16,
    },
    smallImage: {
        width: (AVAILABLE_WIDTH - (GRID_GAP * 2)) / 3,
        height: 120,
        borderRadius: 12,
    },
    footer: {
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        paddingTop: 12,
        gap: 8,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statText: {
        fontSize: 14,
        color: '#1A1A1A',
        fontWeight: '500',
    }
});