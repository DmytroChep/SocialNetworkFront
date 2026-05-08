import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 30,
    backgroundColor: "#ffffff",
    gap: 8
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#000',
  },
  seeAll: {
    fontSize: 14,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#CDCED2', 
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#D1D1D6',
    borderWidth: 1,
    borderColor: '#CDCED2',
  },
  name: {
    fontSize: 20,
    marginBottom: 2,
  },
  handle: {
    fontSize: 14,
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryBtn: {
    backgroundColor: '#4A354A',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    minWidth: 135,
    alignItems: 'center',
  },
  outlineBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#4A354A',
    minWidth: 135,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  outlineBtnText: {
    color: '#4A354A',
    fontSize: 14,
  },
  blockFriends: {
    borderWidth: 1,
    borderColor: '#CDCED2',
    borderRadius: 16,
    width: "100%",
    paddingHorizontal: 16,
    marginTop: 8
  }
});
