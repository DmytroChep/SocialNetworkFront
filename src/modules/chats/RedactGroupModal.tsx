import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { styles } from "./redactGroupModal.styles"; 
import { ICONS } from "../../shared/icons";
export interface User {
  id: string;
  name: string;
  initials: string;
  avatarColor?: string;
  avatar?: string;
}

interface RedactGroupModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (groupName: string, participants: User[]) => void;
  onAddParticipantPress?: () => void; 
  onChoosePhotoPress?: () => void;    
  initialGroupName: string;
  initialParticipants: User[];
}

export const RedactGroupModal: React.FC<RedactGroupModalProps> = ({
  visible,
  onClose,
  onSave,
  onAddParticipantPress,
  onAddPhotoPress,
  onChoosePhotoPress,
  initialGroupName,
  initialParticipants,
}) => {
  const [groupName, setGroupName] = useState(initialGroupName);
  const [participants, setParticipants] = useState<User[]>(initialParticipants);

  useEffect(() => {
    if (visible) {
      setGroupName(initialGroupName);
      setParticipants(initialParticipants);
    }
  }, [visible, initialGroupName, initialParticipants]);

  const getGroupInitials = (name: string) => {
    if (!name) return "NG";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleRemoveParticipant = (id: string) => {
    setParticipants((prev) => prev.filter((user) => user.id !== id));
  };

  const handleSave = () => {
    onSave(groupName, participants);
    onClose();
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
                <ICONS.cross width={20} height={20} color="#4A334A" />
              </TouchableOpacity>

              <Text style={styles.title}>Редагування групи</Text>

              <Text style={styles.inputLabel}>Назва</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Введіть назву групи"
                  value={groupName}
                  onChangeText={setGroupName}
                  placeholderTextColor="#888"
                />
              </View>

              <View style={styles.avatarSection}>
                <View style={[styles.groupAvatar, { backgroundColor: "#4A334A" }]}>
                  <Text style={styles.groupAvatarText}>{getGroupInitials(groupName)}</Text>
                </View>
                
                <View style={styles.photoActionsRow}>
                  <TouchableOpacity style={styles.photoActionBtn} onPress={onAddPhotoPress}>
                    <ICONS.plus width={16} height={16} color="#4A334A" style={styles.actionIcon} />
                    <Text style={styles.photoActionText}>Додайте фото</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.photoActionBtn} onPress={onChoosePhotoPress}>
                    {ICONS.image ? (
                      <ICONS.image width={16} height={16} color="#4A334A" style={styles.actionIcon} />
                    ) : (
                      <ICONS.plus width={16} height={16} color="#4A334A" style={styles.actionIcon} />
                    )}
                    <Text style={styles.photoActionText}>Оберіть фото</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.participantsBox}>
                <View style={styles.participantsHeader}>
                  <Text style={styles.participantsTitle}>Учасники</Text>
                  <TouchableOpacity style={styles.addParticipantBtn} onPress={onAddParticipantPress}>
                    <ICONS.plus width={14} height={14} color="#4A334A" style={styles.actionIcon} />
                    <Text style={styles.addParticipantText}>Додайте учасника</Text>
                  </TouchableOpacity>
                </View>

                <FlatList
                  data={participants}
                  keyExtractor={(item) => item.id}
                  style={styles.participantsList}
                  contentContainerStyle={{ paddingBottom: 4 }}
                  renderItem={({ item }) => (
                    <View style={styles.userItem}>
                      <View style={styles.userInfo}>
                        {item.avatar ? (
                          <Image source={{ uri: item.avatar }} style={styles.avatar} />
                        ) : (
                          <View style={[styles.avatar, { backgroundColor: item.avatarColor || "#5C465A" }]}>
                            <Text style={styles.avatarText}>{item.initials}</Text>
                          </View>
                        )}
                        <Text style={styles.userName} numberOfLines={1}>
                          {item.name}
                        </Text>
                      </View>

                      <TouchableOpacity 
                        onPress={() => handleRemoveParticipant(item.id)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        {ICONS.trash ? (
                          <ICONS.trash width={18} height={18} color="#111" />
                        ) : (
                          <Text style={{ fontSize: 16 }}>🗑️</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  )}
                />
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.backButton} onPress={onClose}>
                  <Text style={styles.backButtonText}>Назад</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.saveButton, !groupName.trim() && styles.disabledButton]} 
                  onPress={handleSave}
                  disabled={!groupName.trim()}
                >
                  <Text style={styles.saveButtonText}>Зберегти зміни</Text>
                </TouchableOpacity>
              </View>

            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};