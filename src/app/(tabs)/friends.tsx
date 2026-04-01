import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RadioTabs } from "../../shared/ui/RadioTab";
import { IRadioTab } from "../../shared/ui/RadioTab/radioTab.types";
import { FONTS } from "../../shared/constants/fonts";

export default function Friends() {
	const radioTabsArray: IRadioTab[] = [
		{ title: "Головна", content: <View><Text style={{fontFamily: FONTS["GTWalsheimPro-Medium"]}}>Головна</Text></View> },
		{ title: "Запити", content: <View><Text style={{fontFamily: FONTS["GTWalsheimPro-Medium"]}}>Запити</Text></View> },
		{ title: "Рекомендації", content: <View><Text style={{fontFamily: FONTS["GTWalsheimPro-Medium"]}}>Рекомендації</Text></View> },
		{ title: "Всі друзі", content: <View><Text style={{fontFamily: FONTS["GTWalsheimPro-Medium"]}}>Всі друзі</Text></View> },
	];
	return (
		<SafeAreaView style={{ flex: 1 }} edges={["left", "right"]}>
			<View style={{ flex: 1 }}>
				<RadioTabs radioTabsArray={radioTabsArray} />
			</View>
		</SafeAreaView>
	);
}
