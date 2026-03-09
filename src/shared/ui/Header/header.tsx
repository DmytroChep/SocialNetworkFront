import { View, Image } from "react-native";
import { styles } from "./header.module";
import { IMAGES } from "../../images";

export function Header(){
    return (
        <View style={styles.header}> 
            <Image source={IMAGES.worldItLogo} />   
        </View>
    )
}