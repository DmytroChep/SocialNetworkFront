import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SectionList,
  StyleSheet,
  Image,
  ScrollView,
} from 'react-native';
import Modal from 'react-native-modal';
import * as ImagePicker from 'expo-image-picker';
import { styles } from './createGroupModal-styles';
import { COLORS } from '../../../../shared/constants';
import { FONTS } from '../../../../shared/constants/fonts';
import { IUser } from '../../../../shared/context/types';
import { useGetAllUsersQuery } from '../../../../shared/api/baseApi';
import { toMediaUrl } from '../../../../shared/lib/model-helpers';

const USERS_PER_PAGE = 50;


// ─── Types ───────────────────────────────────────────────────────────────────

interface CreateGroupPayload {
  groupName: string;
  groupPhoto: string | null;
  participants: IUser[];
}

interface AvatarProps {
  uri?: string;
  initials: string;
  size?: number;
}

interface StepSelectUsersProps {
  selectedUsers: IUser[];
  onToggle: (user: IUser) => void;
  onCancel: () => void;
  onNext: () => void;
}

interface StepGroupDetailsProps {
  selectedUsers: IUser[];
  onRemoveUser: (id: IUser['id']) => void;
  onBack: () => void;
  onCreate: (payload: Omit<CreateGroupPayload, 'participants'>) => void;
}

interface CreateGroupModalProps {
  isVisible: boolean;
  onClose: () => void;
  onCreate?: (payload: CreateGroupPayload) => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export const getInitials = (name = ''): string =>
  name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

// ─── Avatar ──────────────────────────────────────────────────────────────────

export const Avatar: React.FC<AvatarProps> = ({ uri, initials, size = 44 }) => {
  const circleStyle = { width: size, height: size, borderRadius: size / 2 };

  if (uri) {
    return <Image source={{ uri }} style={[styles.avatar, circleStyle]} />;
  }
  return (
    <View style={[styles.avatar, styles.avatarFallback, circleStyle]}>
      <Text style={[styles.avatarText, { fontSize: size * 0.36 }]}>{initials}</Text>
    </View>
  );
};

// ─── Step 1: Select participants ──────────────────────────────────────────────

export const StepSelectUsers: React.FC<StepSelectUsersProps> = ({
  selectedUsers,
  onToggle,
  onCancel,
  onNext,
}) => {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { data: users = [] } = useGetAllUsersQuery();

  const allSections = useMemo(() => {
    const query = search.toLowerCase();
    const filtered = users.filter((u: IUser) =>
      u.username.toLowerCase().includes(query)
    );
    const grouped = filtered.reduce<Record<string, IUser[]>>((acc, user) => {
      const letter = user.username[0].toUpperCase();
      if (!acc[letter]) acc[letter] = [];
      acc[letter].push(user);
      return acc;
    }, {});
    return Object.keys(grouped)
      .sort()
      .map(letter => ({ title: letter, data: grouped[letter] }));
  }, [users, search]);

  const sections = useMemo(() => {
    const start = (currentPage - 1) * USERS_PER_PAGE;
    let userCount = 0;
    let startIndex = -1;
    let endIndex = -1;

    // Find which sections to include based on pagination
    for (let i = 0; i < allSections.length; i++) {
      const sectionUsers = allSections[i].data.length;
      if (userCount + sectionUsers >= start && startIndex === -1) {
        startIndex = i;
      }
      userCount += sectionUsers;
      if (userCount >= start + USERS_PER_PAGE) {
        endIndex = i;
        break;
      }
    }

    if (endIndex === -1) {
      endIndex = allSections.length - 1;
    }

    return startIndex === -1 ? [] : allSections.slice(startIndex, endIndex + 1);
  }, [allSections, currentPage]);

  const totalUserCount = allSections.reduce((sum, section) => sum + section.data.length, 0);
  const hasMoreUsers = useMemo(
    () => totalUserCount > currentPage * USERS_PER_PAGE,
    [totalUserCount, currentPage],
  );

  const isSelected = useCallback(
    (user: IUser): boolean =>
      selectedUsers.some(u => u.id === user.id),
    [selectedUsers],
  );

  const handleSearchChange = useCallback((newText: string) => {
    setSearch(newText);
    setCurrentPage(1);
  }, []);

  const handleLoadMore = useCallback(() => {
    setCurrentPage((prev) => prev + 1);
  }, []);

  return (
    <>
      {/* Search */}
      <View style={styles.searchWrapper}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Пошук"
          placeholderTextColor={COLORS.blue50}
          value={search}
          onChangeText={handleSearchChange}
        />
      </View>

      {/* Selected count */}
      <Text style={styles.selectedCount}>Вибрано: {selectedUsers.length}</Text>

      {/* User list */}
      <SectionList
        sections={sections}
        keyExtractor={item => String(item.id)}
        style={styles.list}
        showsVerticalScrollIndicator
        removeClippedSubviews={true}
        maxToRenderPerBatch={15}
        updateCellsBatchingPeriod={50}
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionHeader}>{section.title}</Text>
        )}
            renderItem={({ item }) => {
          const selected = isSelected(item);
          return (
            <TouchableOpacity style={styles.userRow} onPress={() => onToggle(item)}>
              <Avatar uri={toMediaUrl(item.avatar, 'avatar', item.id)} initials={getInitials(item.username)} />
              <Text style={styles.userName}>{item.username}</Text>
              <View style={[styles.checkbox, selected && styles.checkboxChecked]}>
                {selected && <Text style={styles.checkmark}>✓</Text>}
              </View>
            </TouchableOpacity>
          );
        }}
        ListFooterComponent={
          hasMoreUsers ? (
            <TouchableOpacity
              style={createGroupStyles.loadMoreButton}
              onPress={handleLoadMore}
            >
              <Text style={createGroupStyles.loadMoreText}>Завантажити ще</Text>
            </TouchableOpacity>
          ) : null
        }
      />

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.outlineButton} onPress={onCancel}>
          <Text style={styles.outlineButtonText}>Скасувати</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.primaryButton, !selectedUsers.length && styles.primaryButtonDisabled]}
          onPress={onNext}
          disabled={!selectedUsers.length}
        >
          <Text style={styles.primaryButtonText}>Далі</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

// ─── Step 2: Group details ────────────────────────────────────────────────────

export const StepGroupDetails: React.FC<StepGroupDetailsProps> = ({
  selectedUsers,
  onRemoveUser,
  onBack,
  onCreate,
}) => {
  const [groupName, setGroupName] = useState('');
  // ✅ Fix #2: explicit string | null — resolves SetStateAction<null> error
  const [groupPhoto, setGroupPhoto] = useState<string | null>(null);

  const pickFromGallery = useCallback(async (): Promise<void> => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) setGroupPhoto(result.assets[0].uri);
  }, []);

  const takePhoto = useCallback(async (): Promise<void> => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) setGroupPhoto(result.assets[0].uri);
  }, []);

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Group name input */}
      <Text style={styles.fieldLabel}>Назва</Text>
      <TextInput
        style={styles.nameInput}
        placeholder="Введіть назву"
        placeholderTextColor={COLORS.blue50}
        value={groupName}
        onChangeText={setGroupName}
      />

      {/* Group avatar */}
      <View style={styles.groupAvatarWrapper}>
        {groupPhoto ? (
          <Image source={{ uri: groupPhoto }} style={styles.groupAvatar} />
        ) : (
          <View style={styles.groupAvatar}>
            <Text style={styles.groupAvatarText}>NG</Text>
          </View>
        )}
      </View>

      {/* Photo actions */}
      <View style={styles.photoActions}>
        <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
          <Text style={styles.photoButtonText}>＋  Додайте фото</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.photoButton} onPress={pickFromGallery}>
          <Text style={styles.photoButtonText}>🖼  Оберіть фото</Text>
        </TouchableOpacity>
      </View>

      {/* Participants */}
      <Text style={styles.participantsLabel}>Учасники</Text>
        {selectedUsers.map(user => (
        <View key={user.id} style={styles.participantRow}>
          <Avatar uri={toMediaUrl(user.avatar, 'avatar', user.id)} initials={getInitials(user.username)} />
          <Text style={styles.participantName}>{user.username}</Text>
          <TouchableOpacity
            onPress={() => onRemoveUser(user.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.trashIcon}>🗑</Text>
          </TouchableOpacity>
        </View>
      ))}

      {/* Footer */}
      <View style={[styles.footer, { marginTop: 24 }]}>
        <TouchableOpacity style={styles.outlineButton} onPress={onBack}>
          <Text style={styles.outlineButtonText}>Назад</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.primaryButton, !groupName.trim() && styles.primaryButtonDisabled]}
          onPress={() => onCreate({ groupName, groupPhoto })}
          disabled={!groupName.trim()}
        >
          <Text style={styles.primaryButtonText}>Створити групу</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

// ─── Main Modal ───────────────────────────────────────────────────────────────

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  isVisible,
  onClose,
  onCreate,
}) => {
  const [step, setStep] = useState(1);
  // ✅ Fix #1: explicit User[] — resolves implicit 'any' on selectedUsers prop
  const [selectedUsers, setSelectedUsers] = useState<IUser[]>([]);

  const toggleUser = useCallback((user: IUser): void => {
    setSelectedUsers(prev =>
      prev.some(u => u.id === user.id)
        ? prev.filter(u => u.id !== user.id)
        : [...prev, user]
    );
  }, []);

  const removeUser = useCallback((userId: IUser['id']): void => {
    setSelectedUsers(prev => prev.filter(u => u.id !== userId));
  }, []);

  const handleClose = useCallback((): void => {
    setStep(1);
    setSelectedUsers([]);
    onClose();
  }, [onClose]);

  const handleCreate = useCallback((details: Omit<CreateGroupPayload, 'participants'>): void => {
    onCreate?.({ ...details, participants: selectedUsers });
    handleClose();
  }, [selectedUsers, onCreate, handleClose]);

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={handleClose}
      style={styles.modal}
      avoidKeyboard
      useNativeDriverForBackdrop
    >
      <View style={styles.container}>
        {/* Close button */}
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Text style={styles.closeIcon}>×</Text>
        </TouchableOpacity>

        {/* Title */}
        <Text style={styles.title}>Нова група</Text>

        {step === 1 ? (
          <StepSelectUsers
            selectedUsers={selectedUsers}
            onToggle={toggleUser}
            onCancel={handleClose}
            onNext={() => setStep(2)}
          />
        ) : (
          <StepGroupDetails
            selectedUsers={selectedUsers}
            onRemoveUser={removeUser}
            onBack={() => setStep(1)}
            onCreate={handleCreate}
          />
        )}
      </View>
    </Modal>
  );
};

const createGroupStyles = StyleSheet.create({
  loadMoreButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 12,
    backgroundColor: "#2E5266",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  loadMoreText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: FONTS["GTWalsheimPro-Medium"],
  },
});