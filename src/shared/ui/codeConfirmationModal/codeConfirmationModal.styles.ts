import { StyleSheet } from "react-native";
import { COLORS } from "../../constants/colors";
import { FONTS } from "../../constants/fonts";

export const styles = StyleSheet.create({
	modal: {
		width: "100%",
		backgroundColor: "white",
		paddingVertical: 44,
		paddingHorizontal: 16,
		gap: 36,
		borderRadius: 20,
		alignItems: "center"
	},
	title: {
		fontFamily: FONTS["GTWalsheimPro-Regular"],
		fontSize: 24,
		
	},
	description: {
		fontSize: 14,
		textAlign: "center",

	},
	confirmCodeView: {
		gap: 6,
		width: "100%"
	},
	codeTitle: {
		fontSize: 16
	},
	codeViewInputs: {
		flexDirection: "row",
		justifyContent: "space-between"
	},
	input: {
		width: 40,
		height: 40,
		borderColor: COLORS.blue20,
		borderWidth: 1,
		backgroundColor: "white",
		borderRadius: 10,
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 15,
	},
	button:{
		width: "100%"
	},
	back: {
		color: COLORS.plum,
		fontSize: 16
	},
	buttonView: {
		width: "100%",
		gap: 16,
		alignItems: "center"
	}
});
