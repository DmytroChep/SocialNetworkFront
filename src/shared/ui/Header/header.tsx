import { View, Image } from "react-native";
import { styles } from "./header.module";
import { IMAGES } from "../../images";
import { RoundButton } from "../RoundButton";
import { ICONS } from "../../icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { IHeaderProps } from "./header.types";
import { useRouter } from "expo-router";
import { usePathname } from "expo-router";
import { useUserContext } from "../../context/user-context";

export function Header(props: IHeaderProps) {
	const { hiddenButtons, onPlusPress } = props;
	const router = useRouter();
	const pathname = usePathname();

	const userCotnext = useUserContext()

	return (
		<SafeAreaView edges={["top"]} style={hiddenButtons ? Object.values(hiddenButtons).includes(true) ?  styles.justifyContentSpaceBetween : styles.header :  styles.justifyContentSpaceBetween}>
			<Image style={styles.logo} source={IMAGES.worldItLogo} />
			<View style={hiddenButtons ? Object.values(hiddenButtons).includes(true) ? styles.buttonsView : styles.hidden : styles.buttonsView}>
				{hiddenButtons?.plus && (
                    <RoundButton 
                        icon={<ICONS.plus />} 
                        onPress={onPlusPress} 
                    />
                )}
				{hiddenButtons?.settings ? (
					<RoundButton
						greyBG={pathname === "/settings"}
						icon={
							<ICONS.settings
								onPress={() => {
									pathname === "/settings"
										? router.back()
										: router.navigate("/settings");
								}}
							/>
						}
					/>
				) : (
					false
				)}
				{hiddenButtons?.exit ? (
				<RoundButton 
					icon={<ICONS.exit />} 
					onPress={() => {
						userCotnext.logout();
						router.replace("/registration");
					}} 
				/>
				) : false}
			</View>
		</SafeAreaView>
	);
}
