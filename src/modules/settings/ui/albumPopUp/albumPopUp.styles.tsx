import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  modalCustom: {
    justifyContent: 'center',
    margin: 20,
  },
  container: {
    backgroundColor: '#E9E9F0',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  iconContainer: {
    width: 32,
    alignItems: 'center',
    marginRight: 12,
  },
  text: {
    fontSize: 18,
    color: '#000',
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: '#D1D1D6',
    width: '100%',
  },
});