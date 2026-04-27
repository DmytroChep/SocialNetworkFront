import { StyleSheet, } from 'react-native';
import { COLORS } from '../../../../shared/constants';

export const styles = StyleSheet.create({
    modalBottom: {
        justifyContent: 'flex-end',
        margin: 0,
    },
    container: {
        backgroundColor: 'white',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 34,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 20,
        color: '#000',
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#8E8E93',
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        width: '100%',
        height: 52,
        backgroundColor: '#F2F2F7',
        borderRadius: 16,
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#000',
    },
    actions: {
        flexDirection: 'row',
        marginTop: 24,
        gap: 12,
    },
    cancelBtn: {
        flex: 1,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 16,
        backgroundColor: '#F2F2F7',
    },
    cancelText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
    },
    saveBtn: {
        flex: 2,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 16,
        backgroundColor: COLORS.blue50 || '#007AFF',
    },
    saveText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
});