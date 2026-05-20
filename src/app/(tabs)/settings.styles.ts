import { StyleSheet } from "react-native";
import { COLORS } from "../../shared/constants";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.plum50,
  },
  scrollContent: {
    paddingBottom: 40,
    gap: 24.5
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
    gap: 10,
    paddingBottom: 24
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 20,
  },
  signatureModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 20
  },
  signatureWrapper: {
    width: '100%',
    height: 400,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden'
  },
  closeBtn: {
    marginTop: 20,
    padding: 15,
    backgroundColor: COLORS.plum50,
    borderRadius: 8
  },
  drawButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.blue10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 100,
    alignItems: 'center'
  },
  signaturePreview: {
    width: '100%',
    height: 120,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10
  },
  checkboxRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 16 
  },
  checkboxLabel: { 
    marginLeft: 10, 
    fontSize: 15, 
    color: '#4A3749', 
    fontWeight: '500' 
  },
  signaturePreviewContainer: { 
    marginTop: 4 
  },
  dashedBox: {
    width: '100%',
    height: 100,
    borderWidth: 1,
    borderColor: '#C7C7CC',
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    overflow: 'hidden'
  },
  previewImage: { 
    width: '90%', 
    height: '85%', 
    resizeMode: 'contain' 
  },
  emptyText: { 
    color: '#8E8E93', 
    fontSize: 14 
  },
  editSignButton: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#4A3749',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignSelf: 'flex-start'
  },
  editSignText: { 
    color: '#4A3749', 
    fontWeight: '500',
    fontSize: 14
  },
  drawingContainer: { 
    marginTop: 4 
  },
  penIconOverlay: { 
    position: 'absolute', 
    top: 12, 
    left: 12, 
    zIndex: 10 
  },
  controlsRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginTop: 20 
  },
  colorPicker: { 
    flexDirection: 'row', 
    gap: 12 
  },
  colorCircle: { 
    width: 44, 
    height: 44, 
    borderRadius: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  actionButtons: { 
    flexDirection: 'row', 
    gap: 10 
  },
  clearBtn: { 
    paddingVertical: 12, 
    paddingHorizontal: 16, 
    borderRadius: 24, 
    borderWidth: 1, 
    borderColor: '#4A3749',
    minWidth: 100,
    alignItems: 'center'
  },
  saveBtn: { 
    paddingVertical: 12, 
    paddingHorizontal: 20, 
    borderRadius: 24, 
    backgroundColor: '#E2DDE6',
    minWidth: 110,
    alignItems: 'center'
  },
  clearBtnText: { 
    color: '#4A3749', 
    fontWeight: '600',
    fontSize: 14
  },
  saveBtnText: { 
    color: '#4A3749', 
    fontWeight: '600',
    fontSize: 14
  },
});