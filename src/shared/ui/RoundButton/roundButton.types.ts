import type { ReactNode } from "react";
import type { TextStyle, ViewStyle, TouchableOpacityProps } from "react-native";

export interface IRoundButtonProps {
    icon: ReactNode;
    onPress?: () => void;
    greyBG?: boolean;
    style?: ViewStyle;
}