import { Text, TouchableOpacity } from "react-native";
import { ButtonProps } from "./button.types";
import { styles } from "./button.styles";
import { COLORS } from "../../constants";
import { ICONS } from "../../icons";

export function Button(props: ButtonProps) {
	const { title, style, titleStyle, disabled, iconLeft, iconRight, ...restProps } = props;

	return (
		<TouchableOpacity
			style={[styles.button, disabled && styles.disabled, style]}
			disabled={disabled}
			{...restProps}
		>
			{iconLeft ?  iconLeft : false}
			<Text
				style={[styles.text, disabled && styles.disabledText, titleStyle]}
			>
				{title}
			</Text>
			{iconRight ? iconRight : false}
		</TouchableOpacity>
	);
}

export function SaveButton(props: ButtonProps) {
	const { title, style, titleStyle, disabled, ...restProps } = props;

	return (
		<TouchableOpacity
			style={[styles.button, styles.buttonSave]}
			disabled={disabled}
			{...restProps}
		>
			<ICONS.edit />
			<Text
				style={{color: COLORS.plum}}
			>
				{title}
			</Text>
		</TouchableOpacity>
	);
}


Button.SaveButton = SaveButton