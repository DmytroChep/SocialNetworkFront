
import { StyleSheet } from "react-native";
import { COLORS } from "../../constants";

export const styles = StyleSheet.create({
	label: {
		fontSize: 16,
		fontWeight: 400,
	},
	inputContainer: {
		gap: 10,
		paddingHorizontal: 10,
		backgroundColor: "white",
		flexDirection: "row",
		alignItems: "center",
		borderColor: COLORS.blue20,
		borderWidth: 1,
		borderRadius: 10
	},
	input: {
		flex: 1,
		fontSize: 16,
	},
	errorContainer: {
		flexDirection: "row",
	},
	errorText: {
		color: COLORS.lightRed,
		fontSize: 16,
	},
	inputWithLabel: {
		gap: 6,

	}
});
