import React, { useState } from "react";
import { View, Text, TouchableOpacity, TouchableWithoutFeedback } from "react-native";
import Modal from 'react-native-modal';
import { styles } from "./threeDotsModal.styles";
import { ICONS } from "../../../../shared/icons";
import { EditPostModal } from "./editPostModal/editPostModal"; 

interface ThreeDotsModalProps {
    isVisible: boolean;
    onClose: () => void;
    onDelete: () => void;
    onUpdatePost: (data: any) => void;
    post: any;
    position?: { top: number; right: number };
}

export function ThreeDotsModal({ isVisible, onClose, onDelete, onUpdatePost, post, position }: ThreeDotsModalProps) {
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);

    const handleEditPress = () => {
        onClose();
        setTimeout(() => {
            setIsEditModalVisible(true);
        }, 300);
    };

    return (
        <>
            <Modal
                isVisible={isVisible}
                onBackdropPress={onClose}
                backdropOpacity={0}
                animationInTiming={1}
                animationOutTiming={1}
                style={{ margin: 0 }}
                useNativeDriver={true}
            >
                <TouchableWithoutFeedback onPress={onClose}>
                    <View style={styles.overlay}>
                        <View style={[styles.container, position ? { top: position.top, right: position.right } : { alignSelf: 'center', top: '30%' }]}>
                            <View style={styles.header}>
                                <ICONS.dots color="#666" />
                            </View>

                            <TouchableOpacity style={styles.option} onPress={handleEditPress}>
                                <ICONS.edit width={20} height={20} color="#000" />
                                <Text style={styles.optionText}>Редагувати допис</Text>
                            </TouchableOpacity>

                            <View style={styles.divider} />

                            <TouchableOpacity style={styles.option} onPress={() => { onClose(); onDelete(); }}>
                                <ICONS.trash width={20} height={20} color="#000" />
                                <Text style={styles.optionText}>Видалити публікацію</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            <EditPostModal 
                isVisible={isEditModalVisible} 
                onClose={() => setIsEditModalVisible(false)} 
                post={post} 
                onSubmitAction={onUpdatePost}
            />
        </>
    );
}