import { COLORS } from "../../../../shared/constants";
import {StyleSheet} from "react-native";

export const styles = StyleSheet.create({
  modal: {
    justifyContent: 'center',
    margin: 16,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    maxHeight: '85%',
  },

  // Header
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 20,
    zIndex: 1,
  },
  closeIcon: {
    fontSize: 26,
    color: COLORS.darkBlue,
    lineHeight: 28,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.darkBlue,
    textAlign: 'center',
    marginBottom: 20,
  },

  // Search
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.fog,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
    height: 44,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.darkBlue,
  },

  // Selected count
  selectedCount: {
    fontSize: 13,
    color: COLORS.blue50,
    marginBottom: 8,
  },

  // Section list
  list: {
    maxHeight: 320,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.blue50,
    paddingVertical: 6,
    backgroundColor: '#fff',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  userName: {
    flex: 1,
    fontSize: 15,
    color: COLORS.darkBlue,
    marginLeft: 12,
  },

  // Checkbox
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: COLORS.blue20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.plum,
    borderColor: COLORS.plum,
  },
  checkmark: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },

  // Avatar
  avatar: {
    overflow: 'hidden',
  },
  avatarFallback: {
    backgroundColor: COLORS.plum,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: '700',
  },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
  },
  outlineButton: {
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: COLORS.blue20,
  },
  outlineButtonText: {
    fontSize: 15,
    color: COLORS.darkBlue,
    fontWeight: '500',
  },
  primaryButton: {
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 24,
    backgroundColor: COLORS.plum,
  },
  primaryButtonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '600',
  },

  // Step 2 – Name field
  fieldLabel: {
    fontSize: 13,
    color: COLORS.blue50,
    marginBottom: 6,
  },
  nameInput: {
    height: 48,
    borderWidth: 1.5,
    borderColor: COLORS.blue20,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    color: COLORS.darkBlue,
    marginBottom: 20,
  },

  // Step 2 – Group avatar
  groupAvatarWrapper: {
    alignItems: 'center',
    marginBottom: 14,
  },
  groupAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.plum,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  groupAvatarText: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '700',
  },

  // Step 2 – Photo actions
  photoActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 24,
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  photoButtonText: {
    fontSize: 14,
    color: COLORS.darkBlue,
    fontWeight: '500',
  },

  // Step 2 – Participants
  participantsLabel: {
    fontSize: 13,
    color: COLORS.blue50,
    marginBottom: 8,
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  participantName: {
    flex: 1,
    fontSize: 15,
    color: COLORS.darkBlue,
    marginLeft: 12,
  },
  trashIcon: {
    fontSize: 18,
    color: COLORS.blue50,
  },
});