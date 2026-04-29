import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';
import { ICONS } from '../../../../shared/icons';
import { styles } from './albumPopUp.styles';

interface albumPopUpProps {
  isVisible: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  position?: { top: number; right: number };
}

export function AlbumPopUp({ 
  isVisible, 
  onClose, 
  onEdit, 
  onDelete, 
  position 
}: albumPopUpProps) {
  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      backdropOpacity={0}
      animationInTiming={1}
      animationOutTiming={1}
      backdropTransitionInTiming={1}
      backdropTransitionOutTiming={1}
      style={styles.modalWrapper}
      useNativeDriver={true}
    >
      <View 
        style={[
          styles.container, 
          position ? { top: position.top, right: position.right } : { alignSelf: 'center', top: '30%' }
        ]}
      >
        <View style={styles.header}>
          <ICONS.dots />
        </View>

        <View style={styles.item}>
          <View style={styles.iconContainer}>
            <ICONS.eyeClosed />
          </View>
          <Text style={styles.text}>Цей альбом бачите тільки ви</Text>
        </View>

        <TouchableOpacity style={styles.item} onPress={onEdit}>
          <View style={styles.iconContainer}>
            <ICONS.edit />
          </View>
          <Text style={styles.text}>Редагувати альбом</Text>
        </TouchableOpacity>

        <View style={styles.separator} />

        <TouchableOpacity style={styles.item} onPress={onDelete}>
          <View style={styles.iconContainer}>
            <ICONS.trash />
          </View>
          <Text style={styles.text}>Видалити альбом</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}