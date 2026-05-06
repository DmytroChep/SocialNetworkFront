import React from "react";
import { View, Text, TouchableOpacity, TouchableWithoutFeedback } from "react-native";
import Modal from 'react-native-modal';
import { styles } from "./threeDotsModal.styles";
import { ICONS } from "../../../../shared/icons";

interface ThreeDotsModalProps {
    isVisible: boolean;
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => void;
    position?: { top: number; right: number };
}

export function ThreeDotsModal({ isVisible, onClose, onEdit, onDelete, position }: ThreeDotsModalProps) {
    return (
        <Modal isVisible={isVisible} backdropOpacity={0} animationInTiming={1} animationOutTiming={1} onBackdropPress={onClose} onBackButtonPress={onClose}>
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <View style={[styles.container, position ? { top: position.top, right: position.right } : { alignSelf: 'center', top: '30%' }]}>
                        <View style={styles.header}>
                            <ICONS.dots color="#666" />
                        </View>

                        <TouchableOpacity style={styles.option} onPress={onEdit}>
                            <ICONS.edit width={20} height={20} color="#000" />
                            <Text style={styles.optionText}>Редагувати допис</Text>
                        </TouchableOpacity>

                        <View style={styles.divider} />

                        <TouchableOpacity style={styles.option} onPress={() => onDelete?.()}>
                            <ICONS.trash width={20} height={20} color="#000" />
                            <Text style={styles.optionText}>Видалити публікацію</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}
