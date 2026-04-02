import { Text, TouchableOpacity } from "react-native";
import { ButtonProps } from "./button.types";
import { styles } from "./button.styles";

export function Button(props: ButtonProps) {
	const { title, style, titleStyle, disabled, ...restProps } = props;

	return (
		<TouchableOpacity
			style={[styles.button, disabled && styles.disabled, style]}
			disabled={disabled}
			{...restProps}
		>
			<Text
				style={[styles.text, disabled && styles.disabledText, titleStyle]}
			>
				{title}
			</Text>
		</TouchableOpacity>
	);
}
