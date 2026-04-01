import { StyleSheet } from "react-native";
export const styles = StyleSheet.create({
	header: {
		width: "100%",
		paddingHorizontal: 16,
		paddingVertical: 10, 
		justifyContent: "center",
		flexDirection: "row",
		gap: 58,
		alignItems: "center",
		paddingTop: 8,
		backgroundColor: "white"
	},
	logo: {
		height: 18,
		width: 145,
	},
	buttonsView: {
		gap: 11,
		flexDirection: "row",
	},
	hidden: {
		display: "none"
	},
	justifyContentSpaceBetween: {
		width: "100%",
		paddingHorizontal: 16,
		paddingVertical: 10, 
		justifyContent: "space-between",
		flexDirection: "row",
		alignItems: "center",
		paddingTop: 8,
		backgroundColor: "white"
	}
});
