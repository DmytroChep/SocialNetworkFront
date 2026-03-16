import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Footer } from "../../shared/ui/Footer";
import { RadioTabs } from "../../shared/ui/RadioTab";
import { IRadioTab } from "../../shared/ui/RadioTab/radioTab.types";

export default function Friends() {
	const radioTabsArray: IRadioTab[] = [
		{ title: "Головна", content: <View></View> },
		{ title: "Запити", content: <View></View> },
		{ title: "Рекомендації", content: <View></View> },
		{ title: "Всі друзі", content: <View></View> },
	];
	return (
		<SafeAreaView style={{ flex: 1 }} edges={["left", "right"]}>
			<View style={{ flex: 1 }}>
				<RadioTabs radioTabsArray={radioTabsArray} />
			</View>
		</SafeAreaView>
	);
}
