import { StyleSheet } from "react-native";
import { COLORS } from "../../constants";

const baseTabStyles = {paddingHorizontal: 8,
		paddingTop:8,
		paddingBottom: 4,
		alignItems: "center" as const,
		gap: 6,
		borderTopColor: COLORS.plum}

export const styles = StyleSheet.create({
	footer: {
		width: "100%",
		height: 72,
		paddingHorizontal: 17,
		paddingBottom: 17,
		justifyContent: "flex-start",
		alignItems: "center",
	},
	tabs: {
		flex: 1,
		flexDirection: "row",
		gap: 24,
	},
	tab: baseTabStyles,
	choosedTab: {
		borderTopWidth: 2,
		...baseTabStyles
	}
});
