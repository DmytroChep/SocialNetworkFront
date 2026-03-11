import { View, Image } from "react-native";
import { styles } from "./header.module";
import { IMAGES } from "../../images";
import { RoundButton } from "../RoundButton";
import { ICONS } from "../../icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { IHeaderProps } from "./header.types";

export function Header(props: IHeaderProps) {
	const {hiddenButtons} = props
	return (
		<SafeAreaView edges={["top"]} style={styles.header}>
			<Image style={styles.logo} source={IMAGES.worldItLogo} />
			<View style={styles.buttonsView}>
				{hiddenButtons?.plus ? <RoundButton icon={<ICONS.plus />} /> : false}
				{hiddenButtons?.settings ? <RoundButton icon={<ICONS.settings />} /> : false}
				{hiddenButtons?.exit ? <RoundButton icon={<ICONS.exit />} /> : false}
			
				{/* <RoundButton icon={<ICONS.settings />} />
				<RoundButton icon={<ICONS.exit />} /> */}
			</View>
		</SafeAreaView>
	);
}
