import React, { useEffect, useState } from "react";
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
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { styles } from "./CreateGroupDetailsModal.styles";
import { ICONS } from "../../shared/icons";
import { chatImageAssetToDataUri } from "../../shared/lib/image-upload";

interface SelectedUser {
  id: string;
  name: string;
  avatar?: string;
}

interface CreateGroupDetailsModalProps {
  visible?: boolean;
  onClose: () => void;
  onBack: () => void;
  onCreateGroup: (groupName: string, participantsIds: number[], avatar?: string | null) => void;
  selectedUsers: SelectedUser[];
  onRemoveUser: (userId: string) => void;
  isCreating?: boolean;
  errorText?: string | null;
}

export function CreateGroupDetailsModal({
  visible = false,
  onClose,
  onBack,
  onCreateGroup,
  selectedUsers,
  onRemoveUser,
  isCreating = false,
  errorText,
}: CreateGroupDetailsModalProps) {
  const [groupName, setGroupName] = useState("");
  const [groupAvatar, setGroupAvatar] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) {
      setGroupName("");
      setGroupAvatar(null);
    }
  }, [visible]);

  const pickImage = async () => {
    try {
      const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!granted) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
      });

      if (result.canceled) return;

      const asset = result.assets?.[0];
      if (!asset) return;

      const dataUri = await chatImageAssetToDataUri(asset);
      setGroupAvatar(dataUri ?? asset.uri);
    } catch (e) {
      // ignore
    }
  };

  const displayUsers = selectedUsers;

  const getGroupInitials = (name: string) => {
    if (!name.trim()) return "NG";
    return name.trim().split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  };

  const getInitials = (name: string) => {
    if (!name) return "??";
    return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  };

  const handleCreate = () => {
    if (!groupName.trim() || displayUsers.length === 0 || isCreating) return;
    const ids = displayUsers.map((u) => Number(u.id));
    onCreateGroup(groupName.trim(), ids, groupAvatar);
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

              {errorText && <Text style={styles.errorText}>{errorText}</Text>}

              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.backButton} onPress={onBack}>
                  <Text style={styles.backButtonText}>Назад</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.createButton,
                    (!groupName.trim() || displayUsers.length === 0 || isCreating) && styles.disabledButton,
                  ]}
                  onPress={handleCreate}
                  disabled={!groupName.trim() || displayUsers.length === 0 || isCreating}
                >
                  {isCreating ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.createButtonText}>Створити групу</Text>
                  )}
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
