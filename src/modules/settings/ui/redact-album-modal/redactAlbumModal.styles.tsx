import { StyleSheet } from 'react-native';
import { COLORS } from '../../../../shared/constants';

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    maxHeight: '80%',
    borderRadius: 24,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
  },
  closeIcon: {
    fontSize: 20,
    color: '#000000',
    fontWeight: '600',
  },
  formFields: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#9CA3AF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownList: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    overflow: 'hidden',
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  dropdownText: {
    fontSize: 16,
    color: '#000000',
  },
  placeholder: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  chevron: {
    fontSize: 18,
    color: '#6B7280',
  },
  errorText: {
    color: COLORS?.lightRed || '#FF4D4F',
    fontSize: 12,
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 12,
    marginTop: 10,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#4A354A',
  },
  cancelText: {
    color: '#4A354A',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    minWidth: 120,
    backgroundColor: '#4A354A',
  },
    dropdownContainer: {
    borderRadius: 12,
    marginTop: 4,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    },
    dropdownItemText: {
    fontSize: 16,
    color: '#1C1C1E',
    },
});