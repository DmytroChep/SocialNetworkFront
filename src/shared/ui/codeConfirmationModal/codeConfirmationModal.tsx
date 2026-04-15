import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { CodeConfirmationModalProps } from "./codeConfirmationModal.types";
import { styles } from "./codeConfirmationModal.styles";
import { useRef, useState } from "react";
import { Button } from "../button";

export function CodeConfirmationModal(props: CodeConfirmationModalProps) {
	const { title } = props;
	const [code, setCode] = useState<string>("")
	
	const inputsRef = useRef<(TextInput | null)[]>([])

	const InputsArray = [1, 2, 3, 4, 5, 6].map((item, index) => (
	<TextInput
		key={index}
		ref={(element) => { inputsRef.current[index] = element; }}
		keyboardType="number-pad"
		placeholder="_"
		style={styles.input}
		maxLength={1}
		onChangeText={(text) => {
			if (text.length > 0 && index < 5) {
				inputsRef.current[index + 1]?.focus();
			} else if (text.length < 1 && index < 1) {
				inputsRef.current[index - 1]?.focus();
			}
		}}
	/>
	));

	return (
		<View style={styles.modal}>
			<Text style={styles.title}>{title}</Text>
			<Text style={styles.description}>Ми надіслали 6-значний код на вашу пошту {"\n"} (you@example.com). Введіть його нижче, щоб підтвердити акаунт</Text>
			<View style={styles.confirmCodeView}>
				<Text style={styles.codeTitle}>Код підтвердження</Text>
				<View style={styles.codeViewInputs}>
					{InputsArray.map((element) => {
						return element
					})}
				</View>
			</View>
			<View style={styles.buttonView}>
				<Button title={"Підтвердити"} style={styles.button}/>
				<Text>Назад</Text>
			</View>
		</View>

	);
}
