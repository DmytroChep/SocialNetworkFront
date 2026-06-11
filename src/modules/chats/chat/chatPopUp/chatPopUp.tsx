import React from "react";
import { View, Text, Pressable } from "react-native";
import Modal from 'react-native-modal';
import { ICONS } from "../../../../shared/icons";
import { styles } from "./chatPopUp.styles";

interface ChatPopUpProps {
    isVisible: boolean;
    onClose: () => void;
    onMediaPress?: () => void;
    onEditPress?: () => void;
    onDeletePress?: () => void;
    // position can be specified by left or right coordinate
    position?: { top: number; right?: number; left?: number };
    isGroup?: boolean;
    canManageGroup?: boolean;
}

export default function ChatPopUp({ isVisible, onClose, onMediaPress, onEditPress, onDeletePress, position, isGroup, canManageGroup }: ChatPopUpProps) {
    const showGroupManagement = Boolean(isGroup && canManageGroup);

    return (
        <Modal
            isVisible={isVisible}
            animationIn="fadeIn"
            animationOut="fadeOut"
            onBackdropPress={onClose}
            onBackButtonPress={onClose}
            backdropOpacity={0}
            style={styles.modal}
        >
            <View
                style={[
                    styles.menuContainer,
                    position
                        ? { top: position.top, ...(position.left !== undefined ? { left: position.left } : { right: position.right }) }
                        : { alignSelf: 'center', top: '30%' },
                ]}
            >
                {isGroup && (
                    <View style={styles.header}>
                        <ICONS.dots color="#666" />
                    </View>
                )}

                <Pressable
                    style={styles.menuItem}
                    onPress={() => {
                        onMediaPress?.();
                        onClose();
                    }}
                >
                    <ICONS.image />
                    <Text style={styles.menuText}>Медіа</Text>
                </Pressable>

                {showGroupManagement && (
                    <>
                        <Pressable
                            style={styles.menuItem}
                            onPress={() => {
                                onEditPress?.();
                                onClose();
                            }}
                        >
                            <ICONS.edit />
                            <Text style={styles.menuText}>Редагувати групу</Text>
                        </Pressable>

                        <View style={styles.separator} />

                        <Pressable
                            style={styles.menuItem}
                            onPress={() => {
                                onDeletePress?.();
                                onClose();
                            }}
                        >
                            <ICONS.trash />
                            <Text style={styles.menuText}>Видалити чат</Text>
                        </Pressable>
                    </>
                )}
            </View>
        </Modal>
    );
}
