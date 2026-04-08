import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    paddingHorizontal: 24,
    paddingVertical: 32,
    position: "relative",
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  closeIconWrapper: {
    position: "absolute",
    top: 20,
    right: 20,
    padding: 10,
    zIndex: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1A1A1A",
    textAlign: "center",
    marginBottom: 28,
  },
  form: {
    width: "100%",
    gap: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 6,
  },
  helperText: {
    fontSize: 12,
    marginTop: 6,
    color: "#6B7280",
    lineHeight: 16,
  },
  greenText: {
    color: "#10B981",
  },
  buttonContainer: {
    width: "100%",
    alignItems: "flex-end",
    marginTop: 24,
  },
  submitButton: {
    backgroundColor: "#573C4D",
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 35,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});