import { View, Image } from "react-native";
import { styles } from "./roundButton.module";
import { IMAGES } from "../../images";
import { IRoundButtonProps } from "./roundButton.types";

export function RoundButton(props: IRoundButtonProps) {
	const {icon} = props
	return (
		<View style={styles.button}>
			{icon}
        </View>
	);
}
