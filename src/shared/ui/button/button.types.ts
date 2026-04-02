import type { TextStyle, TouchableOpacityProps } from "react-native";

export interface ButtonProps extends TouchableOpacityProps {
	title?: string;
    titleStyle?: TextStyle
}
