import { StyleSheet } from "react-native";
import { COLORS } from "../../constants/colors";

export const styles = StyleSheet.create({
	button: {
		width: 200,
		height: 50,

		backgroundColor: COLORS.plum,

		alignItems: "center",
		justifyContent: "center",

		borderRadius: 1234,
	},
	text: {
		fontSize: 16,
		color: "white",
	},
	disabled: {
		borderColor: COLORS.plum,
		borderWidth: 2,
		backgroundColor: "transparent",
	},
	disabledText: {
		color: COLORS.plum,
	},
});
