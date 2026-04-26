import { StyleSheet } from "react-native";
import { COLORS } from "../../constants";

export const styles = StyleSheet.create({
	button: {
		padding: 11,
		borderColor: COLORS.darkBlue,
		borderRadius: 1234,
		borderWidth: 1,
		backgroundColor: "white",
		width: 44,
		height: 44,
		alignItems: "center",
		justifyContent: "center"
	},
	greyButton: {
		padding: 11,
		borderColor: COLORS.darkBlue,
		borderRadius: 1234,
		borderWidth: 1,
		backgroundColor: COLORS.plum50,
		width: 44,
		height: 44,
		alignItems: "center",
		justifyContent: "center"
	},
});
