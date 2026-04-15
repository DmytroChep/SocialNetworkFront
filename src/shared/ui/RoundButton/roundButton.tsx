import { Pressable, View } from "react-native";
import { styles } from "./roundButton.module";
import type { IRoundButtonProps } from "./roundButton.types";

export function RoundButton(props: IRoundButtonProps) {
	const {icon, greyBG, onPress} = props
	return (
		<Pressable style={greyBG ? styles.greyButton : styles.button} onPress={onPress ? () => {onPress()} : () => {}}>
			{icon}

        </Pressable>
	);
}
