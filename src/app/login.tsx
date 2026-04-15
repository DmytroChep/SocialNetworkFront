import { Link, Redirect } from "expo-router";
import { View } from "react-native";
import { COLORS } from "../shared/constants";
import { LoginForm } from "../shared/ui/LoginForm";

export default function Login() {
    return (
        <View style={{flex: 1, backgroundColor: COLORS.plum50, paddingTop: 39, alignItems: "center", paddingHorizontal: 16,  justifyContent: "center"}}>
            <LoginForm />
        </View>
    )
}
