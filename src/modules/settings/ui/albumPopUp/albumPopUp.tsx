import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';
import { ICONS } from '../../../../shared/icons';
import { styles } from './albumPopUp.styles';

interface albumPopUpProps {
  isVisible: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function AlbumPopUp ({ isVisible, onClose, onEdit, onDelete }: albumPopUpProps) {
  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      backdropOpacity={0}
      animationIn="zoomIn"
      animationOut="zoomOut"
      style={styles.modalCustom}
    >
      <View style={styles.container}>
        {/* Верхние точки */}
        <View style={styles.header}>
          <ICONS.dots />
        </View>

        {/* Инфо: Только вы видите */}
        <View style={styles.item}>
          <View style={styles.iconContainer}>
            <ICONS.eyeClosed />
          </View>
          <Text style={styles.text}>Цей альбом бачите тільки ви</Text>
        </View>

        {/* Кнопка: Редактировать */}
        <TouchableOpacity style={styles.item} onPress={onEdit}>
          <View style={styles.iconContainer}>
            <ICONS.edit />
          </View>
          <Text style={styles.text}>Редагувати альбом</Text>
        </TouchableOpacity>

        {/* Разделитель */}
        <View style={styles.separator} />

        {/* Кнопка: Удалить */}
        <TouchableOpacity style={styles.item} onPress={onDelete}>
          <View style={styles.iconContainer}>
            <ICONS.trash />
          </View>
          <Text style={styles.text}>Видалити альбом</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

