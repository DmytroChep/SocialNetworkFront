import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { styles } from "./avatar-field.styles";

interface AvatarFieldProps {
    value?: string;
    onChange: (uri: string) => void;
    disabled: boolean
}

export function AvatarField({ value, onChange, disabled }: AvatarFieldProps) {
    async function pickImage() {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            onChange(result.assets[0].uri);
        }
    }

    return (
        <TouchableOpacity onPress={!disabled ? pickImage : () => {}} style={styles.ContainerAvatar}>
            <View style={styles.AvatarView}>
                {value ? (
                    <Image 
                        source={{ uri: value }} 
                        style={styles.SelectedAvatar} 
                        resizeMode="cover"
                    />
                ) : (

                    <Image 
                        style={styles.DefaultAvatar} 
                        resizeMode="cover"
                    />

                )}
            </View>
            <Text style={styles.DefaultText}></Text>
        </TouchableOpacity>
    );
}