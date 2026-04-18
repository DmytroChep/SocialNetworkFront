import { StyleSheet } from "react-native";
import { COLORS } from "../../constants/colors";

export const styles = StyleSheet.create({
	button: {
		height: 50,

		backgroundColor: COLORS.plum,

		alignItems: "center",
		justifyContent: "center",

		borderRadius: 1234,
		padding: 10,

		flexDirection: "row",
		gap: 10
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
	buttonSave: {
		backgroundColor: COLORS.plum50,
		borderWidth: 1,
		borderColor: COLORS.plum,
		height: 40
	}
});
