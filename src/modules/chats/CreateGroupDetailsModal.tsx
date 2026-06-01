import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { styles } from "./CreateGroupDetailsModal.styles";
import { ICONS } from "../../shared/icons";

const MOCK_SELECTED = [
  { id: "1", name: "Тимофій", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200" },
  { id: "2", name: "Кирило", avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=200" },
  { id: "3", name: "Вася", avatar: "" },
];

interface SelectedUser {
  id: string;
  name: string;
  avatar?: string;
}

interface CreateGroupDetailsModalProps {
  visible?: boolean;
  onClose: () => void;
  onBack: () => void;
  onCreateGroup: (groupName: string, participantsIds: number[]) => void;
  selectedUsers: SelectedUser[];
  onRemoveUser: (userId: string) => void;
}

export function CreateGroupDetailsModal({
  visible = false,
  onClose,
  onBack,
  onCreateGroup,
  selectedUsers,
  onRemoveUser,
}: CreateGroupDetailsModalProps) {
  const [groupName, setGroupName] = useState("");
  const [groupAvatar, setGroupAvatar] = useState<string | null>(null);

  const pickImage = async () => {
    try {
      const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!granted) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
      });

      const asAny = result as any;
      const uri = asAny?.uri ?? (asAny?.assets && asAny.assets[0] && asAny.assets[0].uri);
      if (uri) setGroupAvatar(uri);
    } catch (e) {
      // ignore
    }
  };

  const displayUsers = selectedUsers.length > 0 ? selectedUsers : MOCK_SELECTED;

  const getGroupInitials = (name: string) => {
    if (!name.trim()) return "NG";
    return name.trim().split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  };

  const getInitials = (name: string) => {
    if (!name) return "??";
    return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  };

  const handleCreate = () => {
    if (!groupName.trim()) return;
    const ids = displayUsers.map((u) => Number(u.id));
    onCreateGroup(groupName, ids);
    setGroupName("");
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.modalContainer}
            >
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <ICONS.cross />
              </TouchableOpacity>

              <Text style={styles.title}>Нова група</Text>

              <Text style={styles.label}>Назва</Text>
              <TextInput
                style={styles.input}
                placeholder="Введіть назву"
                value={groupName}
                onChangeText={setGroupName}
                placeholderTextColor="#888"
              />

              <View style={styles.avatarSection}>
                {groupAvatar ? (
                  <Image source={{ uri: groupAvatar }} style={styles.groupAvatarImage as any} />
                ) : (
                  <View style={styles.groupAvatar}>
                    <Text style={styles.groupAvatarText}>{getGroupInitials(groupName)}</Text>
                  </View>
                )}

                <View style={styles.photoButtonsRow}>
                  <TouchableOpacity style={styles.photoButton} activeOpacity={0.7} onPress={pickImage}>
                    <Text style={styles.photoButtonText}>{groupAvatar ? "Змінити фото" : "+ Додати фото"}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.label}>Учасники ({displayUsers.length})</Text>
              <ScrollView style={styles.participantsList} showsVerticalScrollIndicator={true}>
                {displayUsers.map((item) => (
                  <View key={item.id} style={styles.participantItem}>
                    <View style={styles.participantInfo}>
                      {item.avatar ? (
                        <Image source={{ uri: item.avatar }} style={styles.avatar as any} />
                      ) : (
                        <View style={[styles.avatar, { backgroundColor: "#5C465A", justifyContent: 'center', alignItems: 'center' }]}> 
                          <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
                        </View>
                      )}
                      <Text style={styles.userName} numberOfLines={1}>
                        {item.name}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => onRemoveUser(item.id)}
                    >
                      <ICONS.trash />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>

              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.backButton} onPress={onBack}>
                  <Text style={styles.backButtonText}>Назад</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.createButton,
                    (!groupName.trim() || displayUsers.length === 0) && styles.disabledButton,
                  ]}
                  onPress={handleCreate}
                  disabled={!groupName.trim() || displayUsers.length === 0}
                >
                  <Text style={styles.createButtonText}>Створити групу</Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
