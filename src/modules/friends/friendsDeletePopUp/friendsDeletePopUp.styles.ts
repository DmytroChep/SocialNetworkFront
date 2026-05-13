import { StyleSheet } from 'react-native';
import { FONTS } from "../../../shared/constants/fonts";

export const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  title: {
    fontSize: 24,
    color: '#070A1C',
    fontFamily: FONTS["GTWalsheimPro-Medium"],
    marginBottom: 20,
    textAlign: 'center',
  },
  message: {
    fontSize: 18,
    color: '#070A1C',
    fontFamily: FONTS["GTWalsheimPro-Regular"],
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    justifyContent: 'center',
  },
  cancelBtn: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#4A354A',
    minWidth: 140,
    alignItems: 'center',
  },
  confirmBtn: {
    backgroundColor: '#543C52',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 24,
    minWidth: 140,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#4A354A',
    fontSize: 16,
    fontFamily: FONTS["GTWalsheimPro-Medium"],
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: FONTS["GTWalsheimPro-Medium"],
  },
});