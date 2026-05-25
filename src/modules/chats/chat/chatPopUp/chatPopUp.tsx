import React, { useState } from "react";
import { 
    View, 
    Text,
    Pressable 
} from "react-native";
import Modal from 'react-native-modal';
import { ICONS } from "../../../../shared/icons";
import { styles } from "./chatPopUp.styles";

interface ChatPopUpProps {
    isVisible: boolean;
    onClose: () => void;
    onMediaPress?: () => void;
    onEditPress?: () => void;
    onDeletePress?: () => void;
    position?: { top: number; right: number };
}

export default function ChatPopUp({ isVisible, onClose, onMediaPress, onEditPress, onDeletePress, position }: ChatPopUpProps) {
    return (
        <Modal
            isVisible={isVisible}
            animationIn="fadeIn"
            animationOut="fadeOut"
            onBackdropPress={onClose}
            onBackButtonPress={onClose}
            style={styles.modal}
        >
            <View style={[styles.menuContainer, position ? { top: position.top, right: position.right } : { alignSelf: 'center', top: '30%' }]}>
                <View style={styles.header}>
                    <ICONS.dots color="#666" />
                </View>

                <Pressable 
                    style={styles.menuItem} 
                    onPress={() => { onMediaPress?.(); onClose(); }}
                >
                    <ICONS.image />
                    <Text style={styles.menuText}>Медіа</Text>
                </Pressable>

                <Pressable 
                    style={styles.menuItem} 
                    onPress={() => { onEditPress?.(); onClose(); }}
                >
                    <ICONS.edit />
                    <Text style={styles.menuText}>Редагувати групу</Text>
                </Pressable>

                <View style={styles.separator} />

                <Pressable 
                    style={styles.menuItem} 
                    onPress={() => { onDeletePress?.(); onClose(); }}
                >
                    <ICONS.trash />
                    <Text style={styles.menuText}>Видалити чат</Text>
                </Pressable>
            </View>
        </Modal>
    );
}