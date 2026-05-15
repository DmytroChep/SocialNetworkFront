import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
    backgroundColor: "#ffffff",
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#000',
  },
  seeAll: {
    fontSize: 14,
  },
  blockFriends: {
    borderWidth: 1,
    borderColor: '#CDCED2',
    borderRadius: 16,
    width: "100%",
    paddingHorizontal: 16,
    paddingBottom: 4,
    marginTop: 12,
    backgroundColor: '#FFFFFF',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F2F2F7',
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  profileButton: {
    alignItems: 'center',
    width: '100%',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 10,
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
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  name: {
    fontSize: 20,
    marginBottom: 2,
    color: '#070A1C',
    textAlign: 'center',
  },
  handle: {
    fontSize: 14,
    marginBottom: 15,
    color: '#070A1C',
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryBtn: {
    backgroundColor: '#4A354A',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    minWidth: 130,
    alignItems: 'center',
  },
  disabledBtn: {
    opacity: 0.6,
  },
  outlineBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4A354A',
    minWidth: 130,
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
  emptyText: {
    color: '#6B6D7A',
    fontSize: 14,
    paddingVertical: 16,
    textAlign: 'center',
  }
});
