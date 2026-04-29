import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  modalWrapper: {
    margin: 0,
    flex: 1,
  },
  container: {
    backgroundColor: '#E9E9F0',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    width: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
    position: 'absolute',
  },
  header: {
    alignItems: 'flex-end',
    paddingTop: 12,
    paddingBottom: 4,
    paddingRight: 4,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  iconContainer: {
    width: 24,
    alignItems: 'center',
  },
  text: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
    flexShrink: 1,
  },
  separator: {
    height: 1,
    backgroundColor: '#D1D1D6',
    marginVertical: 4,
  },
});