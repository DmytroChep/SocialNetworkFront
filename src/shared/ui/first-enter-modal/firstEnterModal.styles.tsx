import { StyleSheet, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

export const styles = StyleSheet.create({
  overlay: {
    // Чтобы серый фон был на весь экран:
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: height,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000, // Чтобы точно было поверх всего
  },
  modalContainer: {
    width: '90%', // Немного отступаем от краев экрана
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: 'center', // Центрируем всё содержимое
    position: 'relative',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 5,
    zIndex: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 25,
    marginTop: 10,
  },
  form: {
    width: '100%',
    gap: 15,
    marginBottom: 30,
  },
  inputGroup: {
    width: '100%',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 15,
    padding: 15,
    fontSize: 16,
    color: '#000',
  },
  helperText: {
    fontSize: 12,
    marginTop: 8,
    color: '#6B7280',
    lineHeight: 16,
  },
  greenText: {
    color: '#10B981',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#573C4D',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 50,
    minWidth: 180,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
});