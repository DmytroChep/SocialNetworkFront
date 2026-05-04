import React from "react";
import { Modal, View, Text, TouchableOpacity, TouchableWithoutFeedback } from "react-native";
import { styles } from "./threeDotsModal.styles";
import { ICONS } from "../../../../shared/icons";

interface ThreeDotsModalProps {
    isVisible: boolean;
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

export function ThreeDotsModal({ isVisible, onClose, onEdit, onDelete }: ThreeDotsModalProps) {
    return (
        <Modal visible={isVisible} transparent animationType="fade">
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <View style={styles.container}>
                        <View style={styles.header}>
                            <ICONS.dots color="#666" />
                        </View>

                        <TouchableOpacity style={styles.option} onPress={onEdit}>
                            <ICONS.edit width={20} height={20} color="#000" />
                            <Text style={styles.optionText}>Редагувати допис</Text>
                        </TouchableOpacity>

                        <View style={styles.divider} />

                        <TouchableOpacity style={styles.option} onPress={onDelete}>
                            <ICONS.trash width={20} height={20} color="#000" />
                            <Text style={styles.optionText}>Видалити публікацію</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}
