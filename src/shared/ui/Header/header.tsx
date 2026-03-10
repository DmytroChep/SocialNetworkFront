import { View, Image } from "react-native";
import { styles } from "./header.module";
import { IMAGES } from "../../images";
import { RoundButton } from "../RoundButton";
import { ICONS } from "../../icons";

export function Header() {
	return (
		<View style={styles.header}>
			<Image style={styles.logo} source={IMAGES.worldItLogo} />
            <View style={styles.buttonsView}>
                <RoundButton icon={<ICONS.plus />} />
                 <RoundButton icon={<ICONS.settings />} />
                  <RoundButton icon={<ICONS.exit />} />
            </View>
        </View>
	);
}
