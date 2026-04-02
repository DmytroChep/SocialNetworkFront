import { ReactNode } from "react";
import { TextInputProps, TextStyle, ViewStyle } from "react-native";

export interface InputProps extends TextInputProps {
    iconLeft?: ReactNode,
    iconRight?: ReactNode,
    label?: string,
    labelStyle?: TextStyle,
    inputContainerStyle?: ViewStyle,
    error?: string | null
}

export type InputPasswordProps = Omit<InputProps, "iconRight" | "iconLeft">