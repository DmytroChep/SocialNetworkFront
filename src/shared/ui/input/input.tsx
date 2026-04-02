import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { InputPasswordProps, InputProps } from "./input.types";
import { styles } from "./input.styles";
import { useState } from "react";
import { ICONS } from "../../icons";

export function Input(props: InputProps) {
	const {
		iconLeft,
		iconRight,
		label,
		labelStyle,
		inputContainerStyle,
		error,
		style,
		...restProps
	} = props;
	return (
		<View style={styles.inputWithLabel}>
			{label && <Text style={[styles.label, labelStyle]}>{label}</Text>}
			<View style={[styles.inputContainer, inputContainerStyle]}>
				{iconLeft}
				<TextInput style={[styles.input, style]} {...restProps} />
				{iconRight}
			</View>
			{error && (
				<View style={styles.errorContainer}>
					<Text style={styles.errorText}>{error}</Text>
				</View>
			)}
		</View>
	);
}

function Password (props: InputProps) {
	const [isPasswordHiden, setIsPasswordHide] = useState<boolean>(true)
	return(
		<Input {...props} iconRight={
			isPasswordHiden ? 
				<ICONS.eyeClosed onPress={() => {
					setIsPasswordHide(!isPasswordHiden)
				}}>
				</ICONS.eyeClosed>
			: 
				<ICONS.eye onPress={() => {
					setIsPasswordHide(!isPasswordHiden)
				}}>
				</ICONS.eye>
		}
		
		label={"Пароль"}
		secureTextEntry= {isPasswordHiden}
		placeholder={"Введи пароль"}>
		
	
		</Input>
		
	)
}

Input.Password = Password