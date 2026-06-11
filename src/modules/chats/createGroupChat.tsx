import React, { useState, useMemo } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SectionList,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from "react-native";
import { styles } from "./createGroupChat.styles"; 
import { ICONS } from "../../shared/icons";

export interface User {
  id: string;
  name: string;
  initials: string;
  avatarColor?: string;
  avatar?: string;
}

interface Contact {
  id: string | number;
  name: string;
  avatar?: string;
  avatarColor?: string;
}

interface SectionData {
  title: string;
  data: User[];
}

export interface CreateGroupChatModalProps {
  visible: boolean;
  onClose: () => void;
  onNext: (selectedUsers: User[]) => void;
  contacts?: Contact[];
  isLoading?: boolean;
  [key: string]: any;
}

const MOCK_FRIENDS: Contact[] = [
  { id: 1, name: "Андрій", avatarColor: "#4A334A" },
  { id: 2, name: "Антон", avatarColor: "#6B5369" },
  { id: 3, name: "Вася", avatarColor: "#8C6B88" },
  { id: 4, name: "Кирило", avatarColor: "#7A5C77" },
  { id: 5, name: "Серьожа", avatarColor: "#5C465A" },
  { id: 6, name: "Тимофій", avatarColor: "#5C465A" },
];

export const CreateGroupChatModal: React.FC<CreateGroupChatModalProps> = ({
  visible,
  onClose,
  onNext,
  contacts,
  isLoading = false,
}) => {
  const [search, setSearch] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const friendshipsData = (contacts && contacts.length > 0) ? contacts : MOCK_FRIENDS;

  const getInitials = (name: string) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const sections: SectionData[] = useMemo(() => {
    if (!friendshipsData) return [];

    let rawFriends: any[] = [];
    if (Array.isArray(friendshipsData)) {
      rawFriends = friendshipsData;
    }

    const filtered = rawFriends.filter((user) =>
      user?.name?.toLowerCase().includes(search.toLowerCase())
    );

    const groups: { [key: string]: User[] } = {};

    filtered.forEach((user) => {
      if (!user) return;
      const firstLetter = user.name ? user.name.charAt(0).toUpperCase() : "#";

      if (!groups[firstLetter]) {
        groups[firstLetter] = [];
      }

      groups[firstLetter].push({
        id: user.id.toString(),
        name: user.name,
        initials: getInitials(user.name),
        avatarColor: user.avatarColor || "#5C465A",
        avatar: (user as Contact).avatar,
      });
    });

    return Object.keys(groups)
      .sort()
      .map((letter) => ({
        title: letter,
        data: groups[letter].sort((a, b) => a.name.localeCompare(b.name)),
      }));
  }, [friendshipsData, search]);

  const toggleUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleNext = () => {
    const fullSelectedUsers: User[] = [];
    sections.forEach(section => {
      section.data.forEach(user => {
        if (selectedUsers.includes(user.id)) {
          fullSelectedUsers.push(user);
        }
      });
    });

    onNext(fullSelectedUsers);
    setSelectedUsers([]);
    setSearch("");
  };

  const handleClose = () => {
    setSelectedUsers([]);
    setSearch("");
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.modalContainer}
            >
              <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                <ICONS.cross width={20} height={20} color="#4A334A" />
              </TouchableOpacity>

              <Text style={styles.title}>Нова група</Text>

              <View style={styles.searchContainer}>
                <ICONS.search width={16} height={16} color="#888" style={styles.searchIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Пошук"
                  value={search}
                  onChangeText={setSearch}
                  placeholderTextColor="#888"
                />
              </View>

              <Text style={styles.selectedCount}>Вибрано: {selectedUsers.length}</Text>

              {isLoading ? (
                <View style={styles.loaderContainer}>
                  <ActivityIndicator size="large" color="#4A334A" />
                </View>
              ) : sections.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>Друзів не знайдено</Text>
                </View>
              ) : (
                <SectionList
                  sections={sections}
                  keyExtractor={(item) => item.id}
                  stickySectionHeadersEnabled={false}
                  renderSectionHeader={({ section: { title } }) => (
                    <>
                      <Text style={styles.sectionHeader}>{title}</Text>
                      <View style={styles.sectionSeparator} />
                    </>
                  )}
                  renderItem={({ item }) => {
                    const isSelected = selectedUsers.includes(item.id);
                    return (
                      <TouchableOpacity
                        style={styles.userItem}
                        activeOpacity={0.7}
                        onPress={() => toggleUser(item.id)}
                      >
                        <View style={styles.userInfo}>
                          {item.avatar ? (
                            <Image source={{ uri: item.avatar }} style={styles.avatar as any} />
                          ) : (
                            <View style={[styles.avatar, { backgroundColor: item.avatarColor }]}> 
                              <Text style={styles.avatarText}>{item.initials}</Text>
                            </View>
                          )}
                          <Text style={styles.userName}>{item.name}</Text>
                        </View>

                        {isSelected ? (
                          <ICONS.checkbox width={20} height={20} color="#4A334A" />
                        ) : (
                          <ICONS.checkboxOutline width={20} height={20} color="#4A334A"/>
                        )}
                      </TouchableOpacity>
                    );
                  }}
                  style={styles.list}
                  contentContainerStyle={{ paddingBottom: 10 }}
                />
              )}

              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
                  <Text style={styles.cancelButtonText}>Скасувати</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.nextButton, selectedUsers.length === 0 && styles.disabledButton]} 
                  onPress={handleNext}
                  disabled={selectedUsers.length === 0}
                >
                  <Text style={styles.nextButtonText}>Далі</Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
