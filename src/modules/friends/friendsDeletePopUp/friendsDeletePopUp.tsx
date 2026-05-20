import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';
import { styles } from './friendsDeletePopUp.styles';

interface DeleteFriendModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteFriendModal = ({ isVisible, onClose, onConfirm }: DeleteFriendModalProps) => {
  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      backdropOpacity={0.5}
      animationIn="zoomIn"
      animationOut="zoomOut"
      useNativeDriver
    >
      <View style={styles.container}>
        <Text style={styles.title}>
          Підтвердити дію
        </Text>
        
        <Text style={styles.message}>
          Ви дійсно хочете видалити користувача?
        </Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={styles.cancelBtn} 
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelBtnText}>
              Скасувати
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.confirmBtn} 
            onPress={onConfirm}
            activeOpacity={0.7}
          >
            <Text style={styles.confirmBtnText}>
              Підтвердити
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};