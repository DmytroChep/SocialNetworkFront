import { StyleSheet } from "react-native";
import { COLORS } from "../../shared/constants";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    width: "100%"
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  avatarSection: {
    alignItems: "center",
    paddingBottom: 8,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },
  handle: {
    fontSize: 14,
    color: "#7C7C7C",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 14,
    color: "#4F4F4F",
  },
  signatureText: {
    marginLeft: 32,
    marginTop: 4,
    fontWeight: "600",
    fontSize: 15,
  },
  signatureImg: {
    width: 150,
    height: 50,
    marginLeft: 20,
    marginTop: 8,
  },
  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 50,
  },
});