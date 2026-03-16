import { View } from "react-native";
import { styles } from "./roundButton.module";
import type { IRoundButtonProps } from "./roundButton.types";

export function RoundButton(props: IRoundButtonProps) {
	const {icon, greyBG} = props
	return (
		<View style={greyBG ? styles.greyButton : styles.button}>
			{icon}
        </View>
	);
}
