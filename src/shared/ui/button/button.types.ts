import type { ReactNode } from "react";
import type { TextStyle, ViewStyle, TouchableOpacityProps } from "react-native";

export interface ButtonProps extends TouchableOpacityProps {
	title?: string;
    titleStyle?: TextStyle;
    iconLeft?: ReactNode,
    iconRight?: ReactNode,
}

