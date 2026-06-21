import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { styles } from "./avatar-field.styles";
import { toMediaUrl } from "../../../../shared/lib/model-helpers";
import {
	imageAssetToDataUri,
	LOW_QUALITY_IMAGE_PICKER_OPTIONS,
} from "../../../../shared/lib/image-upload";

interface AvatarFieldProps {
	value?: string;
	onChange: (uri: string) => void;
	disabled: boolean;
}

export function AvatarField({ value, onChange, disabled }: AvatarFieldProps) {
	const finalValue = toMediaUrl(value, 'avatar');
	async function pickImage() {
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ["images"],
			allowsEditing: true,
			aspect: [1, 1],
			...LOW_QUALITY_IMAGE_PICKER_OPTIONS,
		});

		if (!result.canceled) {
			onChange(imageAssetToDataUri(result.assets[0]) || result.assets[0].uri);
		}
	}

	return (
		<TouchableOpacity
			onPress={!disabled ? pickImage : () => {}}
			style={styles.ContainerAvatar}
		>
			<View style={styles.AvatarView}>
				{value ? (
					<Image
						source={{ uri: finalValue }}
						style={styles.SelectedAvatar}
						resizeMode="cover"
					/>
				) : (
					<Image style={styles.DefaultAvatar} resizeMode="cover" />
				)}
			</View>
			<Text style={styles.DefaultText}></Text>
		</TouchableOpacity>
	);
}
