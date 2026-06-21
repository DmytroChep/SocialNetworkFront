import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { ICONS } from "../../shared/icons";
import { chatImageAssetToDataUri } from "../../shared/lib/image-upload";
import { toMediaUrl } from "../../shared/lib/model-helpers";
import { styles } from "./EditGroupModal.styles";

export interface GroupEditUser {
  id: string | number;
  name: string;
  avatar?: string;
  initials?: string;
  avatarColor?: string;
}

export interface EditGroupPayload {
  name: string;
  userIds: number[];
  avatar?: string | null;
}

interface EditGroupModalProps {
  visible: boolean;
  initialName: string;
  initialAvatar?: string | null;
  users: GroupEditUser[];
  selectedUserIds: number[];
  currentUserId?: number;
  isSubmitting?: boolean;
  errorText?: string | null;
  onClose: () => void;
  onSubmit: (payload: EditGroupPayload) => void;
}

const getInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "??";

export function EditGroupModal({
  visible,
  initialName,
  initialAvatar,
  users,
  selectedUserIds,
  currentUserId,
  isSubmitting = false,
  errorText,
  onClose,
  onSubmit,
}: EditGroupModalProps) {
  const [groupName, setGroupName] = useState(initialName);
  const [groupAvatar, setGroupAvatar] = useState<string | null>(
    initialAvatar ?? null,
  );
  const [avatarChanged, setAvatarChanged] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const selectedKey = selectedUserIds.join(",");

  useEffect(() => {
    if (!visible) return;

    setGroupName(initialName);
    setGroupAvatar(initialAvatar ?? null);
    setAvatarChanged(false);
    setSearch("");
    setSelectedIds(new Set(selectedUserIds.map((id) => String(id))));
  }, [visible, initialName, initialAvatar, selectedKey]);

  const dedupedUsers = useMemo(() => {
    const map = new Map<string, GroupEditUser>();

    users.forEach((item) => {
      const id = String(item.id);
      if (!id || Number(id) === currentUserId) return;
      map.set(id, item);
    });

    return Array.from(map.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [currentUserId, users]);

  const filteredUsers = useMemo(
    () =>
      dedupedUsers.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [dedupedUsers, search],
  );

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
      setAvatarChanged(true);
    } catch {
      // The modal keeps the current avatar if picking fails.
    }
  };

  const removeAvatar = () => {
    setGroupAvatar(null);
    setAvatarChanged(true);
  };

  const toggleUser = (userId: string | number) => {
    const id = String(userId);
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSubmit = () => {
    const name = groupName.trim();
    if (!name || selectedIds.size === 0 || isSubmitting) return;

    onSubmit({
      name,
      userIds: Array.from(selectedIds).map((id) => Number(id)),
      ...(avatarChanged ? { avatar: groupAvatar } : {}),
    });
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

              <Text style={styles.title}>Редагувати групу</Text>

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
                  <Image
                    source={{ uri: toMediaUrl(groupAvatar, 'avatar') || groupAvatar }}
                    style={styles.groupAvatarImage}
                  />
                ) : (
                  <View style={styles.groupAvatar}>
                    <Text style={styles.groupAvatarText}>{getInitials(groupName)}</Text>
                  </View>
                )}

                <View style={styles.photoButtonsRow}>
                  <TouchableOpacity onPress={pickImage} style={styles.photoButton}>
                    <Text style={styles.photoButtonText}>
                      {groupAvatar ? "Змінити фото" : "+ Додати фото"}
                    </Text>
                  </TouchableOpacity>
                  {groupAvatar && (
                    <TouchableOpacity onPress={removeAvatar} style={styles.photoButton}>
                      <Text style={styles.removePhotoText}>Прибрати</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <Text style={styles.label}>Учасники ({selectedIds.size})</Text>
              <View style={styles.searchContainer}>
                <ICONS.search width={16} height={16} color="#888" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Пошук"
                  value={search}
                  onChangeText={setSearch}
                  placeholderTextColor="#888"
                />
              </View>

              <FlatList
                data={filteredUsers}
                keyExtractor={(item) => String(item.id)}
                style={styles.usersList}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>Учасників не знайдено</Text>
                }
                renderItem={({ item }) => {
                  const isSelected = selectedIds.has(String(item.id));
                  const avatarUrl = toMediaUrl(item.avatar, 'avatar', item.id) || item.avatar;

                  return (
                    <TouchableOpacity
                      style={styles.userItem}
                      activeOpacity={0.7}
                      onPress={() => toggleUser(item.id)}
                    >
                      <View style={styles.userInfo}>
                        {avatarUrl ? (
                          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                        ) : (
                          <View
                            style={[
                              styles.avatar,
                              { backgroundColor: item.avatarColor || "#5C465A" },
                            ]}
                          >
                            <Text style={styles.avatarText}>
                              {item.initials || getInitials(item.name)}
                            </Text>
                          </View>
                        )}
                        <Text style={styles.userName} numberOfLines={1}>
                          {item.name}
                        </Text>
                      </View>

                      {isSelected ? (
                        <ICONS.checkbox width={24} height={24} color="#4A334A" />
                      ) : (
                        <ICONS.checkboxOutline width={20} height={20} color="#4A334A" />
                      )}
                    </TouchableOpacity>
                  );
                }}
              />

              {errorText && <Text style={styles.errorText}>{errorText}</Text>}

              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                  <Text style={styles.cancelButtonText}>Скасувати</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    (!groupName.trim() || selectedIds.size === 0 || isSubmitting) &&
                      styles.disabledButton,
                  ]}
                  onPress={handleSubmit}
                  disabled={!groupName.trim() || selectedIds.size === 0 || isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.saveButtonText}>Зберегти</Text>
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
