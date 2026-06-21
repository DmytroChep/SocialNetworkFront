import { Link, Redirect } from "expo-router";
import { View } from "react-native";
import { COLORS } from "../shared/constants";
import { LoginForm } from "../shared/ui/LoginForm";
import { ip } from "../config/ip";

export default function Login() {
        console.log(ip)

    return (
        <View style={{flex: 1, backgroundColor: COLORS.plum50, paddingTop: 39, alignItems: "center", paddingHorizontal: 16,  justifyContent: "center"}}>
            <LoginForm />
        </View>
    )
}
