import { StyleSheet } from "react-native";
import { COLORS } from "../../shared/constants";

export const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: "#FFFFFF",
	},
	container: {
		flex: 1,
	},
	centered: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 24,
	},
	scrollContent: {
		paddingBottom: 20,
	},
	headerTop: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 20,
		paddingVertical: 10,
	},
	headerIcons: {
		flexDirection: "row",
		gap: 10,
	},
	iconCircle: {
		width: 40,
		height: 40,
		borderRadius: 20,
		borderWidth: 1,
		borderColor: "#E5E5EA",
		justifyContent: "center",
		alignItems: "center",
	},
	profileCard: {
		backgroundColor: "#FFFFFF",
		borderRadius: 20,
		marginHorizontal: 16,
		marginTop: 10,
		padding: 20,
		alignItems: "center",
		gap: 12,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.05,
		shadowRadius: 15,
		elevation: 3,
	},
	firstSectionProfileView: {
		alignItems: "center",
		gap: 8,
	},
	backBtn: {
		alignSelf: "flex-start",
		marginBottom: 10,
	},
	avatarContainer: {
		position: "relative",
		marginBottom: 15,
	},
	avatar: {
		width: 100,
		height: 100,
		borderRadius: 50,
	},
	onlineBadge: {
		position: "absolute",
		bottom: 5,
		right: 5,
		width: 18,
		height: 18,
		borderRadius: 9,
		backgroundColor: "#D1D1D6", // Світло-сірий як на фото
		borderWidth: 3,
		borderColor: "#FFFFFF",
	},
	userName: {
		fontSize: 22,
		fontWeight: "700",
		color: "#000",
	},
	userHandle: {
		fontSize: 14,
		color: "#8E8E93",
		marginTop: 4,
	},
	statsContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-around",
		width: "100%",
		// marginVertical: 20,
	},
	statItem: {
		alignItems: "center",
	},
	statNumber: {
		fontSize: 18,
		fontWeight: "700",
	},
	statLabel: {
		fontSize: 12,
		color: "#8E8E93",
		marginTop: 2,
	},
	statDivider: {
		width: 1,
		height: 30,
		backgroundColor: "#E5E5EA",
	},
	buttonGroup: {
		flexDirection: "row",
		gap: 12,
		width: "100%",
	},
	btnPrimary: {
		flex: 1,
		backgroundColor: COLORS.plum,
		borderRadius: 12345,
		paddingHorizontal: 1,
	},
	btnSecondary: {
		flex: 1,
		backgroundColor: "#FFFFFF",
		borderRadius: 12345,
		borderWidth: 1,
		borderColor: COLORS.plum,
	},
	btnTextWhite: { color: "#FFF", fontWeight: "600" },
	btnTextDark: { color: COLORS.plum, fontWeight: "600" },

	sectionContainer: {
		marginTop: 20,
		padding: 16,
		backgroundColor: "#FFF",
		borderRadius: 20,
		borderWidth: 1,
		borderColor: "#F2F2F7",
	},
	postsSection: {
		marginTop: 20,
		backgroundColor: "#FFF",
		gap: 9,
	},
	emptyText: {
		color: "#8E8E93",
		fontSize: 14,
		textAlign: "center",
		paddingVertical: 16,
	},
	sectionHeader: {
		marginHorizontal: 7,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 15,
	},
	sectionTitleRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "600",
	},
	linkText: {
		color: "#8E8E93",
		fontSize: 14,
	},
	albumItem: {
		marginBottom: 20,
	},
	albumName: {
		fontSize: 16,
		fontWeight: "700",
		marginBottom: 4,
	},
	albumMeta: {
		flexDirection: "row",
		gap: 10,
		marginBottom: 12,
	},
	albumTheme: {
		fontSize: 14,
		color: "#000",
	},
	albumYear: {
		fontSize: 14,
		color: COLORS.blue50, // Твій синій колір
	},
	albumCover: {
		width: "100%",
		height: 180,
		borderRadius: 15,
		backgroundColor: "#F2F2F7",
	},
});
