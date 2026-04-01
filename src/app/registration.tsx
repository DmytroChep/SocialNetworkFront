import { Link, Redirect } from "expo-router";
import { View } from "react-native";
import { COLORS } from "../shared/constants";

export default function Registration() {
    return (
        <View style={{width: "100%", height: "100%", backgroundColor: COLORS.plum50, paddingTop: 39, alignItems: "center", justifyContent: "center", paddingHorizontal: 16}}>
            
            <Link href={"/main"}>main</Link>
        </View>
    )
}
