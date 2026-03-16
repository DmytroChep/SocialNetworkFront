import { StyleSheet } from "react-native";
import { COLORS } from "../../constants";
export const styles = StyleSheet.create({
	tabs: {
		flexDirection: "row",
		gap: 16,
		width: "100%",
		paddingHorizontal: 17,
	},
	tab: {
		color: COLORS.blue50,
		fontWeight: 500,
		letterSpacing: -0.66,
		fontSize: 18
	},
	choosedTab: {
		color: COLORS.darkBlue,
		fontWeight: 700,
		letterSpacing: -0.66,
		borderBottomColor: COLORS.plum,
		borderBottomWidth: 1,
		fontSize: 18
	},
	visible: {
		display: "flex"
	},
	hidden: {
		display: "none"
	},
	radioTabs: {
		paddingTop: 25
	}
});
